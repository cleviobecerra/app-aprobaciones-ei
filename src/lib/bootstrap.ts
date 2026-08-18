import { hash } from "bcryptjs";
import { prisma } from "./db";

export async function ensureDemoUsers() {
  const count = await prisma.user.count();
  if (count > 0) return;

  const passwordHash = await hash("demo1234", 10);
  await prisma.user.createMany({
    data: [
      {
        email: "admin@eisa.local",
        name: "Administrador",
        area: "TI",
        role: "ADMIN",
        passwordHash,
      },
      {
        email: "ana.garcia@eisa.local",
        name: "Ana García",
        area: "Compras",
        role: "SOLICITANTE",
        passwordHash,
      },
    ],
  });
}

export function describeDbError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (!process.env.AUTH_SECRET) {
    return "Falta AUTH_SECRET en las variables de entorno de Vercel.";
  }
  if (!process.env.DATABASE_URL) {
    return "Falta DATABASE_URL. En Vercel crea una base Postgres (Storage) y conéctala al proyecto.";
  }
  if (message.includes("sqlite") || message.includes("SQLite") || message.includes("file:./")) {
    return "SQLite no funciona en Vercel. Usa una base PostgreSQL (Vercel Postgres o Neon) en DATABASE_URL.";
  }
  if (message.toLowerCase().includes("can't reach") || message.includes("P1001") || message.includes("P1017")) {
    return "No se pudo conectar a la base de datos. Revisa DATABASE_URL en Vercel.";
  }
  if (message.includes("P1013") || message.toLowerCase().includes("scheme is not recognized")) {
    return "DATABASE_URL inválida en Vercel. Pégala sin comillas, empezando por postgresql://";
  }
  if (message.includes("does not exist") || message.includes("P2021") || message.includes("P2010")) {
    return "La base no tiene las tablas. Vuelve a desplegar para que se ejecute prisma db push.";
  }
  return `No se pudo iniciar sesión: ${message}`;
}
