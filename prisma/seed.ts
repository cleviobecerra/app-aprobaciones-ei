import { randomBytes } from "crypto";
import { hashSync } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function token() {
  return randomBytes(32).toString("base64url");
}

async function main() {
  await prisma.outboundEmail.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.approvalTask.deleteMany();
  await prisma.approvalStage.deleteMany();
  await prisma.approvalRequest.deleteMany();
  await prisma.user.deleteMany();

  const ana = await prisma.user.create({
    data: {
      email: "ana.garcia@eisa.local",
      name: "Ana García",
      area: "Compras",
      role: "SOLICITANTE",
      passwordHash: hashSync("demo1234", 10),
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@eisa.local",
      name: "Administrador",
      area: "TI",
      role: "ADMIN",
      passwordHash: hashSync("demo1234", 10),
    },
  });

  const sequential = await prisma.approvalRequest.create({
    data: {
      title: "Contrato de servicios Q3",
      description: "Renovación del contrato con el proveedor de logística.",
      status: "IN_PROGRESS",
      currentStage: 1,
      createdById: ana.id,
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
      stages: {
        create: [
          {
            order: 1,
            name: "Revisión Finanzas",
            mode: "ALL",
            tasks: {
              create: [{
                email: "carlos.ruiz@empresa.com",
                name: "Carlos Ruiz",
                accessToken: token(),
                status: "PENDING",
                invitedAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
              }],
            },
          },
          {
            order: 2,
            name: "Revisión Legal",
            mode: "ALL",
            tasks: {
              create: [{
                email: "maria.lopez@empresa.com",
                name: "María López",
                accessToken: token(),
                status: "WAITING",
              }],
            },
          },
          {
            order: 3,
            name: "Aprobación Dirección",
            mode: "ALL",
            tasks: {
              create: [{
                email: "juan.perez@empresa.com",
                name: "Juan Pérez",
                accessToken: token(),
                status: "WAITING",
              }],
            },
          },
        ],
      },
      auditEvents: {
        create: [
          { actorId: ana.id, actorEmail: ana.email, actorName: ana.name, action: "CREATED", detail: "Contrato de servicios Q3" },
          { actorId: ana.id, actorEmail: ana.email, actorName: ana.name, action: "SENT", detail: "Se envió el enlace a la etapa 1: Revisión Finanzas." },
        ],
      },
    },
    include: { stages: { include: { tasks: true } } },
  });

  const firstToken = sequential.stages[0].tasks[0];
  await prisma.outboundEmail.create({
    data: {
      requestId: sequential.id,
      toEmail: firstToken.email,
      toName: firstToken.name,
      subject: `Revisión pendiente: ${sequential.title}`,
      bodyText: `Enlace de acceso: http://localhost:3000/aprobar/${firstToken.accessToken}`,
      accessUrl: `http://localhost:3000/aprobar/${firstToken.accessToken}`,
      delivered: false,
      error: "SMTP no configurado. Usa el enlace desde la aplicación.",
    },
  });

  const parallel = await prisma.approvalRequest.create({
    data: {
      title: "Política de gastos de viaje",
      description: "Finanzas y Legal revisan en paralelo; luego Dirección.",
      status: "IN_PROGRESS",
      currentStage: 1,
      createdById: ana.id,
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      stages: {
        create: [
          {
            order: 1,
            name: "Revisión paralela",
            mode: "ALL",
            tasks: {
              create: [
                {
                  email: "carlos.ruiz@empresa.com",
                  name: "Carlos Ruiz",
                  accessToken: token(),
                  status: "PENDING",
                  invitedAt: new Date(),
                },
                {
                  email: "maria.lopez@empresa.com",
                  name: "María López",
                  accessToken: token(),
                  status: "PENDING",
                  invitedAt: new Date(),
                },
              ],
            },
          },
          {
            order: 2,
            name: "Aprobación Dirección",
            mode: "ANY",
            tasks: {
              create: [{
                email: "juan.perez@empresa.com",
                name: "Juan Pérez",
                accessToken: token(),
                status: "WAITING",
              }],
            },
          },
        ],
      },
      auditEvents: {
        create: [
          { actorId: ana.id, actorEmail: ana.email, actorName: ana.name, action: "CREATED", detail: "Política de gastos de viaje" },
          { actorId: ana.id, actorEmail: ana.email, actorName: ana.name, action: "SENT", detail: "Se envió el enlace a la etapa 1: Revisión paralela." },
        ],
      },
    },
    include: { stages: { include: { tasks: true } } },
  });

  for (const task of parallel.stages[0].tasks) {
    await prisma.outboundEmail.create({
      data: {
        requestId: parallel.id,
        toEmail: task.email,
        toName: task.name,
        subject: `Revisión pendiente: ${parallel.title}`,
        bodyText: `Enlace de acceso: http://localhost:3000/aprobar/${task.accessToken}`,
        accessUrl: `http://localhost:3000/aprobar/${task.accessToken}`,
        delivered: false,
        error: "SMTP no configurado. Usa el enlace desde la aplicación.",
      },
    });
  }

  await prisma.approvalRequest.create({
    data: {
      title: "Alta de proveedor ACME",
      description: "Alta completa del proveedor ACME Ltda.",
      status: "APPROVED",
      currentStage: 2,
      createdById: ana.id,
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      stages: {
        create: [
          {
            order: 1,
            name: "Finanzas",
            mode: "ALL",
            tasks: {
              create: [{
                email: "carlos.ruiz@empresa.com",
                name: "Carlos Ruiz",
                accessToken: token(),
                status: "APPROVED",
                comment: "Presupuesto disponible.",
                invitedAt: new Date(Date.now() - 1000 * 60 * 60 * 47),
                actedAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
              }],
            },
          },
          {
            order: 2,
            name: "Dirección",
            mode: "ALL",
            tasks: {
              create: [{
                email: "juan.perez@empresa.com",
                name: "Juan Pérez",
                accessToken: token(),
                status: "APPROVED",
                comment: "Autorizado.",
                invitedAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
                actedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
              }],
            },
          },
        ],
      },
      auditEvents: {
        create: [
          { actorId: ana.id, actorEmail: ana.email, actorName: ana.name, action: "CREATED", detail: "Alta de proveedor ACME" },
          { actorId: ana.id, actorEmail: ana.email, actorName: ana.name, action: "SENT", detail: "Se envió el enlace a la etapa 1: Finanzas." },
          { actorEmail: "carlos.ruiz@empresa.com", actorName: "Carlos Ruiz", action: "APPROVED", detail: "Presupuesto disponible." },
          { actorEmail: "carlos.ruiz@empresa.com", actorName: "Carlos Ruiz", action: "STAGE_ADVANCED", detail: "Avanzó a la etapa 2: Dirección." },
          { actorEmail: "juan.perez@empresa.com", actorName: "Juan Pérez", action: "APPROVED", detail: "Autorizado." },
          { actorEmail: "juan.perez@empresa.com", actorName: "Juan Pérez", action: "COMPLETED", detail: "Todas las etapas requeridas fueron aprobadas." },
        ],
      },
    },
  });

  await prisma.approvalRequest.create({
    data: {
      title: "Anexo de confidencialidad",
      description: "Borrador. Completa los correos y envía el flujo.",
      status: "DRAFT",
      createdById: ana.id,
      stages: {
        create: [{
          order: 1,
          name: "Legal",
          mode: "ALL",
          tasks: {
            create: [{
              email: "maria.lopez@empresa.com",
              name: "María López",
              accessToken: token(),
              status: "WAITING",
            }],
          },
        }],
      },
      auditEvents: {
        create: [{ actorId: ana.id, actorEmail: ana.email, actorName: ana.name, action: "CREATED", detail: "Anexo de confidencialidad" }],
      },
    },
  });

  console.log("Listo.");
  console.log("Quien envía: ana.garcia@eisa.local / demo1234");
  console.log("Los aprobadores entran con el enlace del correo (o desde Correos, si SMTP no está configurado).");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
