export const ROLES = {
  ADMIN: "ADMIN",
  SOLICITANTE: "SOLICITANTE",
} as const;

export const roleLabel: Record<string, string> = {
  ADMIN: "Administrador",
  SOLICITANTE: "Solicitante",
};

export function isAdmin(role?: string | null) {
  return role === ROLES.ADMIN;
}

export function homePath(role?: string | null) {
  return isAdmin(role) ? "/users" : "/sent";
}
