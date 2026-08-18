import { prisma } from "./db";
import { sendApprovalInvite } from "./mail";
import { REQUEST_STATUS, TASK_STATUS } from "./labels";
import { displayName } from "./tokens";

export async function userOwnsRequest(userId: string, requestId: string) {
  const request = await prisma.approvalRequest.findFirst({
    where: { id: requestId, createdById: userId },
    select: { id: true },
  });
  return Boolean(request);
}

export async function requestAccessByToken(token: string) {
  return prisma.approvalTask.findUnique({
    where: { accessToken: token },
    include: {
      stage: {
        include: {
          request: { include: { createdBy: true } },
        },
      },
    },
  });
}

export async function notifyPendingInvites(requestId: string, resend = false) {
  const request = await prisma.approvalRequest.findUnique({
    where: { id: requestId },
    include: {
      createdBy: true,
      stages: { include: { tasks: true } },
    },
  });
  if (!request) return;

  const pending = request.stages
    .flatMap((stage) => stage.tasks.map((task) => ({ ...task, stageName: stage.name })))
    .filter((task) => task.status === TASK_STATUS.PENDING && (resend || !task.invitedAt));

  for (const task of pending) {
    await sendApprovalInvite({
      requestId,
      requestTitle: request.title,
      senderName: request.createdBy.name,
      toEmail: task.email,
      toName: displayName(task.name, task.email),
      accessToken: task.accessToken,
      stageName: task.stageName,
    });
    await prisma.approvalTask.update({
      where: { id: task.id },
      data: { invitedAt: new Date() },
    });
  }
}

export async function sendRequestFlow(requestId: string, actorId: string) {
  const request = await prisma.approvalRequest.findUnique({
    where: { id: requestId },
    include: {
      createdBy: true,
      stages: { include: { tasks: true }, orderBy: { order: "asc" } },
    },
  });

  if (!request) throw new Error("La solicitud no existe.");
  if (request.createdById !== actorId) throw new Error("Solo el autor puede enviar el flujo.");
  if (request.status !== REQUEST_STATUS.DRAFT) throw new Error("Solo se pueden enviar borradores.");
  if (request.stages.length === 0) throw new Error("Agrega al menos una etapa.");
  if (request.stages.some((stage) => stage.tasks.length === 0)) {
    throw new Error("Cada etapa necesita al menos un aprobador.");
  }

  const first = request.stages[0];

  await prisma.$transaction(async (tx) => {
    await tx.approvalRequest.update({
      where: { id: requestId },
      data: {
        status: REQUEST_STATUS.IN_PROGRESS,
        currentStage: first.order,
        sentAt: new Date(),
      },
    });

    await tx.approvalTask.updateMany({
      where: { stage: { requestId } },
      data: { status: TASK_STATUS.WAITING, invitedAt: null },
    });

    await tx.approvalTask.updateMany({
      where: { stageId: first.id },
      data: { status: TASK_STATUS.PENDING },
    });

    await tx.auditEvent.create({
      data: {
        requestId,
        actorId,
        actorEmail: request.createdBy.email,
        actorName: request.createdBy.name,
        action: "SENT",
        detail: `Se envió el enlace a la etapa ${first.order}: ${first.name}.`,
      },
    });
  });

  await notifyPendingInvites(requestId);
}

export async function decideByToken(
  token: string,
  decision: "APPROVED" | "REJECTED",
  comment: string,
) {
  const task = await prisma.approvalTask.findUnique({
    where: { accessToken: token },
    include: {
      stage: {
        include: {
          request: true,
          tasks: true,
        },
      },
    },
  });

  if (!task) throw new Error("El enlace no es válido.");
  if (task.status === TASK_STATUS.WAITING) {
    throw new Error("Todavía no es tu turno. Te llegará un correo cuando corresponda.");
  }
  if (task.status !== TASK_STATUS.PENDING) throw new Error("Esta revisión ya no está pendiente.");
  if (task.stage.request.status !== REQUEST_STATUS.IN_PROGRESS) {
    throw new Error("El flujo ya no está en curso.");
  }
  if (decision === "REJECTED" && !comment.trim()) {
    throw new Error("El rechazo requiere un comentario.");
  }

  const requestId = task.stage.requestId;
  const stageId = task.stageId;
  const actorName = displayName(task.name, task.email);

  await prisma.$transaction(async (tx) => {
    await tx.approvalTask.update({
      where: { id: task.id },
      data: {
        status: decision,
        comment: comment.trim(),
        actedAt: new Date(),
      },
    });

    await tx.auditEvent.create({
      data: {
        requestId,
        actorEmail: task.email,
        actorName,
        action: decision,
        detail: comment.trim() || `Etapa ${task.stage.order}: ${task.stage.name}`,
      },
    });

    if (decision === "REJECTED") {
      await tx.approvalTask.updateMany({
        where: {
          stage: { requestId },
          status: { in: [TASK_STATUS.PENDING, TASK_STATUS.WAITING] },
        },
        data: { status: TASK_STATUS.SKIPPED },
      });

      await tx.approvalRequest.update({
        where: { id: requestId },
        data: {
          status: REQUEST_STATUS.REJECTED,
          completedAt: new Date(),
        },
      });
      return;
    }

    const stage = await tx.approvalStage.findUnique({
      where: { id: stageId },
      include: { tasks: true },
    });
    if (!stage) return;

    const stageComplete =
      stage.mode === "ANY"
        ? stage.tasks.some((item) => item.status === TASK_STATUS.APPROVED)
        : stage.tasks.every((item) => item.status === TASK_STATUS.APPROVED);

    if (!stageComplete) return;

    if (stage.mode === "ANY") {
      await tx.approvalTask.updateMany({
        where: {
          stageId,
          status: { in: [TASK_STATUS.PENDING, TASK_STATUS.WAITING] },
        },
        data: { status: TASK_STATUS.SKIPPED },
      });
    }

    const next = await tx.approvalStage.findFirst({
      where: { requestId, order: { gt: stage.order } },
      orderBy: { order: "asc" },
    });

    if (!next) {
      await tx.approvalRequest.update({
        where: { id: requestId },
        data: {
          status: REQUEST_STATUS.APPROVED,
          completedAt: new Date(),
        },
      });
      await tx.auditEvent.create({
        data: {
          requestId,
          actorEmail: task.email,
          actorName,
          action: "COMPLETED",
          detail: "Todas las etapas requeridas fueron aprobadas.",
        },
      });
      return;
    }

    await tx.approvalRequest.update({
      where: { id: requestId },
      data: { currentStage: next.order },
    });
    await tx.approvalTask.updateMany({
      where: { stageId: next.id },
      data: { status: TASK_STATUS.PENDING },
    });
    await tx.auditEvent.create({
      data: {
        requestId,
        actorEmail: task.email,
        actorName,
        action: "STAGE_ADVANCED",
        detail: `Avanzó a la etapa ${next.order}: ${next.name}.`,
      },
    });
  });

  await notifyPendingInvites(requestId);
}

export async function cancelRequestFlow(requestId: string, actorId: string) {
  const request = await prisma.approvalRequest.findUnique({
    where: { id: requestId },
    include: { createdBy: true },
  });

  if (!request) throw new Error("La solicitud no existe.");
  if (request.createdById !== actorId) throw new Error("Solo el autor puede cancelar.");
  if (request.status !== REQUEST_STATUS.IN_PROGRESS && request.status !== REQUEST_STATUS.DRAFT) {
    throw new Error("Esta solicitud ya no se puede cancelar.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.approvalTask.updateMany({
      where: {
        stage: { requestId },
        status: { in: [TASK_STATUS.PENDING, TASK_STATUS.WAITING] },
      },
      data: { status: TASK_STATUS.SKIPPED },
    });
    await tx.approvalRequest.update({
      where: { id: requestId },
      data: {
        status: REQUEST_STATUS.CANCELLED,
        completedAt: new Date(),
      },
    });
    await tx.auditEvent.create({
      data: {
        requestId,
        actorId,
        actorEmail: request.createdBy.email,
        actorName: request.createdBy.name,
        action: "CANCELLED",
        detail: "El autor detuvo el flujo.",
      },
    });
  });
}
