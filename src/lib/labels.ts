export const REQUEST_STATUS = {
  DRAFT: "DRAFT",
  IN_PROGRESS: "IN_PROGRESS",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;

export const TASK_STATUS = {
  WAITING: "WAITING",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SKIPPED: "SKIPPED",
} as const;

export const STAGE_MODE = {
  ALL: "ALL",
  ANY: "ANY",
} as const;

export const requestStatusLabel: Record<string, string> = {
  DRAFT: "Borrador",
  IN_PROGRESS: "En curso",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  CANCELLED: "Cancelada",
};

export const taskStatusLabel: Record<string, string> = {
  WAITING: "En espera",
  PENDING: "Pendiente",
  APPROVED: "Aprobó",
  REJECTED: "Rechazó",
  SKIPPED: "Omitida",
};

export const stageModeLabel: Record<string, string> = {
  ALL: "Todos deben aprobar",
  ANY: "Basta con uno",
};

export const auditActionLabel: Record<string, string> = {
  CREATED: "Creó la solicitud",
  UPDATED: "Actualizó la solicitud",
  SENT: "Envió el flujo de aprobación",
  APPROVED: "Aprobó su etapa",
  REJECTED: "Rechazó la solicitud",
  STAGE_ADVANCED: "El flujo avanzó de etapa",
  COMPLETED: "El flujo quedó aprobado",
  CANCELLED: "Canceló la solicitud",
};

export const APP_TIME_ZONE = "America/Santiago";

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: APP_TIME_ZONE,
  }).format(new Date(value));
}

function timeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");
  const asUtc = Date.UTC(value("year"), value("month") - 1, value("day"), value("hour"), value("minute"), value("second"));
  return asUtc - date.getTime();
}

export function chileDayBoundary(dateOnly: string, endOfDay: boolean) {
  const clock = endOfDay ? "23:59:59.999" : "00:00:00.000";
  const asUtc = new Date(`${dateOnly}T${clock}Z`);
  const firstOffset = timeZoneOffsetMs(asUtc, APP_TIME_ZONE);
  let instant = new Date(asUtc.getTime() - firstOffset);
  const secondOffset = timeZoneOffsetMs(instant, APP_TIME_ZONE);
  if (secondOffset !== firstOffset) {
    instant = new Date(asUtc.getTime() - secondOffset);
  }
  return instant;
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function requestPdfFileName(title: string) {
  const slug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return `${slug || "solicitud"}-aprobada.pdf`;
}

export const APP_COPYRIGHT = `App Aprobaciones EI · Todos los derechos reservados ${new Date().getFullYear()}`;

