export const ROLES = {
  ADMIN: "ADMIN",
  AUDITOR: "AUDITOR",
  SOLICITANTE: "SOLICITANTE",
} as const;

export const roleLabel: Record<string, string> = {
  ADMIN: "Administrador",
  AUDITOR: "Auditor",
  SOLICITANTE: "Solicitante",
};

export function isAdmin(role?: string | null) {
  return role === ROLES.ADMIN;
}

export function isAuditor(role?: string | null) {
  return role === ROLES.AUDITOR;
}

export function canViewAllRequests(role?: string | null) {
  return isAdmin(role) || isAuditor(role);
}

export function canCreateRequests(role?: string | null) {
  return isAdmin(role) || role === ROLES.SOLICITANTE;
}

export function canSeeAccessLinks(role?: string | null) {
  return isAdmin(role);
}

export function canManageUsers(role?: string | null) {
  return isAdmin(role);
}

export function parseAssignableRole(role: string) {
  if (role === ROLES.ADMIN) return ROLES.ADMIN;
  if (role === ROLES.AUDITOR) return ROLES.AUDITOR;
  return ROLES.SOLICITANTE;
}

export function homePath(role?: string | null) {
  if (isAdmin(role)) return "/users";
  if (isAuditor(role)) return "/admin-requests";
  return "/sent";
}
