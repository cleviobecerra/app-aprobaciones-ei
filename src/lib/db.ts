import dns from "node:dns";
import { PrismaClient } from "@prisma/client";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Node sin soporte para el orden de DNS
}

function normalizeDatabaseUrl(value: string) {
  let next = value.trim().replace(/^["']|["']$/g, "");
  next = next.replace(/^(DATABASE_URL|DIRECT_URL)\s*=\s*/i, "").trim();
  return next.replace(/^["']|["']$/g, "");
}

function appendParam(url: string, key: string, value: string) {
  if (new RegExp(`[?&]${key}=`, "i").test(url)) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${key}=${value}`;
}

function prepareDatabaseUrl(value: string) {
  let next = normalizeDatabaseUrl(value);
  const pooled =
    next.includes("pooler.supabase.com") || /:(6543)\b/.test(next) || /[?&]pgbouncer=true/i.test(next);
  if (pooled) next = appendParam(next, "pgbouncer", "true");
  next = appendParam(next, "connection_limit", "1");
  next = appendParam(next, "connect_timeout", "10");
  return next;
}

for (const name of ["DATABASE_URL", "DIRECT_URL"] as const) {
  const value = process.env[name];
  if (!value) continue;
  process.env[name] = name === "DATABASE_URL" ? prepareDatabaseUrl(value) : normalizeDatabaseUrl(value);
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

globalForPrisma.prisma = prisma;
