"use server";

import { randomUUID } from "crypto";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createAccessToken, isValidEmail, normalizeEmail } from "@/lib/tokens";
import { saveRequestFile } from "@/lib/files";
import { cancelRequestFlow, decideByToken, notifyPendingInvites, sendRequestFlow } from "@/lib/workflow";
import { canCreateRequests } from "@/lib/roles";

type RecipientInput = { name: string; email: string };
type StageInput = { name: string; mode: "ALL" | "ANY"; recipients: RecipientInput[] };

function parseStages(raw: string): StageInput[] {
  const parsed = JSON.parse(raw) as StageInput[];
  if (!Array.isArray(parsed)) return [];
  return parsed.map((stage, index) => {
    const seen = new Set<string>();
    const recipients: RecipientInput[] = [];
    for (const recipient of stage.recipients || []) {
      const email = normalizeEmail(String(recipient.email || ""));
      if (!email || seen.has(email)) continue;
      seen.add(email);
      recipients.push({ email, name: String(recipient.name || "").trim() });
    }
    return {
      name: String(stage.name || `Etapa ${index + 1}`).trim() || `Etapa ${index + 1}`,
      mode: stage.mode === "ANY" ? "ANY" : "ALL",
      recipients,
    };
  });
}

async function saveUpload(file: File | null) {
  if (!file || file.size === 0) return null;
  if (file.size > 12 * 1024 * 1024) {
    throw new Error("El archivo no puede superar 12 MB.");
  }

  const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")).slice(0, 12) : "";
  return {
    fileName: file.name,
    storedName: `${randomUUID()}${ext}`,
    mimeType: file.type || "application/octet-stream",
    data: Buffer.from(await file.arrayBuffer()),
  };
}

function refresh(requestId: string) {
  revalidatePath(`/requests/${requestId}`);
  revalidatePath("/inbox");
  revalidatePath("/sent");
  revalidatePath("/admin-requests");
}

export async function createRequestAction(
  _prev: { error?: string } | null,
  formData: FormData,
) {
  const user = await requireUser();
  if (!canCreateRequests(user.role)) {
    return { error: "Tu perfil no puede crear ni enviar solicitudes." };
  }
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const intent = String(formData.get("intent") || "draft");

  if (!title) return { error: "El título es obligatorio." };

  let stages: StageInput[] = [];
  try {
    stages = parseStages(String(formData.get("stages") || "[]"));
  } catch {
    return { error: "El flujo de etapas no es válido." };
  }

  if (intent === "send") {
    if (stages.length === 0) return { error: "Agrega al menos una etapa para enviar." };
    if (stages.some((stage) => stage.recipients.length === 0)) {
      return { error: "Cada etapa necesita al menos un correo." };
    }
    if (stages.some((stage) => stage.recipients.some((recipient) => !isValidEmail(recipient.email)))) {
      return { error: "Hay un correo con formato inválido." };
    }
  }

  try {
    const upload = await saveUpload(formData.get("file") as File | null);
    const request = await prisma.approvalRequest.create({
      data: {
        title,
        description,
        createdById: user.id,
        fileName: upload?.fileName,
        storedName: upload?.storedName,
        mimeType: upload?.mimeType,
        stages: {
          create: stages.map((stage, index) => ({
            order: index + 1,
            name: stage.name,
            mode: stage.mode,
            tasks: {
              create: stage.recipients.map((recipient) => ({
                email: recipient.email,
                name: recipient.name,
                accessToken: createAccessToken(),
                status: "WAITING",
              })),
            },
          })),
        },
        auditEvents: {
          create: {
            actorId: user.id,
            actorEmail: user.email,
            actorName: user.name,
            action: "CREATED",
            detail: title,
          },
        },
      },
    });

    if (upload) {
      await saveRequestFile(request.id, upload.data);
    }

    if (intent === "send") {
      await sendRequestFlow(request.id, user.id);
    }

    redirect(`/requests/${request.id}`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { error: error instanceof Error ? error.message : "No se pudo crear la solicitud." };
  }
}

export async function sendDraftAction(requestId: string) {
  try {
    const user = await requireUser();
    if (!canCreateRequests(user.role)) {
      return { error: "Tu perfil no puede enviar solicitudes." };
    }
    await sendRequestFlow(requestId, user.id);
    refresh(requestId);
    return { ok: true as const };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo enviar." };
  }
}

export async function resendInviteAction(requestId: string) {
  try {
    const user = await requireUser();
    if (!canCreateRequests(user.role)) {
      return { error: "Tu perfil no puede reenviar solicitudes." };
    }
    const request = await prisma.approvalRequest.findFirst({
      where: { id: requestId, createdById: user.id },
    });
    if (!request) return { error: "No puedes reenviar esta solicitud." };
    await notifyPendingInvites(requestId, true);
    refresh(requestId);
    return { ok: true as const };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo reenviar." };
  }
}

export async function decideByTokenAction(
  _prev: { error?: string } | null,
  formData: FormData,
) {
  try {
    const token = String(formData.get("token") || "");
    const decision = String(formData.get("decision") || "") as "APPROVED" | "REJECTED";
    const comment = String(formData.get("comment") || "");
    if (decision !== "APPROVED" && decision !== "REJECTED") {
      return { error: "Decisión no válida." };
    }
    await decideByToken(token, decision, comment);
    revalidatePath(`/aprobar/${token}`);
    return { ok: true as const };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo registrar la decisión." };
  }
}

export async function cancelAction(requestId: string) {
  try {
    const user = await requireUser();
    if (!canCreateRequests(user.role)) {
      return { error: "Tu perfil no puede cancelar solicitudes." };
    }
    await cancelRequestFlow(requestId, user.id);
    refresh(requestId);
    return { ok: true as const };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo cancelar." };
  }
}
