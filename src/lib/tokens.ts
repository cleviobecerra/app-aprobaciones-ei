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
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function approvalUrl(token: string) {
  return `${appUrl()}/aprobar/${token}`;
}
