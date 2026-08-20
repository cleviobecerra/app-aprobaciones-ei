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

function setParam(url: string, key: string, value: string) {
  const separator = url.indexOf("?");
  const base = separator >= 0 ? url.slice(0, separator) : url;
  const query = separator >= 0 ? url.slice(separator + 1) : "";
  const params = new URLSearchParams(query);
  params.set(key, value);
  return `${base}?${params.toString()}`;
}

function prepareDatabaseUrl(value: string) {
  let next = normalizeDatabaseUrl(value);
  const pooled =
    next.includes("pooler.supabase.com") || /:(6543)\b/.test(next) || /[?&]pgbouncer=true/i.test(next);
  if (pooled) next = setParam(next, "pgbouncer", "true");
  const localDev = process.env.NODE_ENV === "development" && !process.env.VERCEL;
  next = setParam(next, "connection_limit", localDev ? "5" : "1");
  next = setParam(next, "pool_timeout", localDev ? "20" : "10");
  next = setParam(next, "connect_timeout", "10");
  return next;
}

const databaseUrl = process.env.DATABASE_URL ? prepareDatabaseUrl(process.env.DATABASE_URL) : undefined;
if (process.env.DIRECT_URL) {
  process.env.DIRECT_URL = normalizeDatabaseUrl(process.env.DIRECT_URL);
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: databaseUrl,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

globalForPrisma.prisma = prisma;
