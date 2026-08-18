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

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
