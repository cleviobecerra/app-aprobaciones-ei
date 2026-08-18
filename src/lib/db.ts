import { PrismaClient } from "@prisma/client";

function normalizeDatabaseUrl(value: string) {
  let next = value.trim().replace(/^["']|["']$/g, "");
  next = next.replace(/^(DATABASE_URL|DIRECT_URL)\s*=\s*/i, "").trim();
  return next.replace(/^["']|["']$/g, "");
}

for (const name of ["DATABASE_URL", "DIRECT_URL"] as const) {
  const value = process.env[name];
  if (value) process.env[name] = normalizeDatabaseUrl(value);
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
