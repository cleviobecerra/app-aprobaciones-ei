import { randomBytes } from "crypto";

export function createAccessToken() {
  return randomBytes(32).toString("base64url");
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function displayName(name: string, email: string) {
  const trimmed = name.trim();
  if (trimmed) return trimmed;
  return email.split("@")[0] || email;
}

export function appUrl() {
  const configured = (process.env.APP_URL || "").replace(/\/$/, "");
  if (configured && !configured.includes("localhost")) return configured;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  return configured || "http://localhost:3000";
}

export function approvalUrl(token: string) {
  return `${appUrl()}/aprobar/${token}`;
}
