import { Prisma } from "@prisma/client";
import { ROLES } from "@/lib/roles";

export const USER_ROLE_FILTERS = [ROLES.ADMIN, ROLES.AUDITOR, ROLES.SOLICITANTE] as const;

export type UserListFilters = {
  q: string;
  role: string;
  area: string;
};

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function parseUserFilters(
  searchParams: Record<string, string | string[] | undefined>,
): UserListFilters {
  const role = firstParam(searchParams.role);
  return {
    q: firstParam(searchParams.q).trim(),
    role: USER_ROLE_FILTERS.includes(role as (typeof USER_ROLE_FILTERS)[number]) ? role : "",
    area: firstParam(searchParams.area).trim(),
  };
}

export function userFilterQuery(filters: UserListFilters, overrides: Partial<UserListFilters> = {}) {
  const next = { ...filters, ...overrides };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.role) params.set("role", next.role);
  if (next.area) params.set("area", next.area);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function hasActiveUserFilters(filters: UserListFilters) {
  return Boolean(filters.q || filters.role || filters.area);
}

export function userWhere(filters: UserListFilters, omitRole = false): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};
  if (!omitRole && filters.role) where.role = filters.role;
  if (filters.area) where.area = filters.area;
  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { email: { contains: filters.q, mode: "insensitive" } },
      { area: { contains: filters.q, mode: "insensitive" } },
    ];
  }
  return where;
}
