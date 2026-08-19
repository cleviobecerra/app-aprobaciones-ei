import { Prisma } from "@prisma/client";
import { REQUEST_STATUS, chileDayBoundary } from "@/lib/labels";

export const REQUEST_STATUS_FILTERS = [
  REQUEST_STATUS.DRAFT,
  REQUEST_STATUS.IN_PROGRESS,
  REQUEST_STATUS.APPROVED,
  REQUEST_STATUS.REJECTED,
  REQUEST_STATUS.CANCELLED,
] as const;

export type RequestListFilters = {
  q: string;
  status: string;
  from: string;
  to: string;
  dateField: "created" | "updated";
  createdById: string;
  sort: "updated" | "created" | "title";
};

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function isDateOnly(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function parseRequestFilters(
  searchParams: Record<string, string | string[] | undefined>,
): RequestListFilters {
  const status = firstParam(searchParams.status);
  const sort = firstParam(searchParams.sort);
  const dateField = firstParam(searchParams.dateField);
  const from = firstParam(searchParams.from);
  const to = firstParam(searchParams.to);

  return {
    q: firstParam(searchParams.q).trim(),
    status: REQUEST_STATUS_FILTERS.includes(status as (typeof REQUEST_STATUS_FILTERS)[number])
      ? status
      : "",
    from: isDateOnly(from) ? from : "",
    to: isDateOnly(to) ? to : "",
    dateField: dateField === "updated" ? "updated" : "created",
    createdById: firstParam(searchParams.createdById).trim(),
    sort: sort === "created" || sort === "title" ? sort : "updated",
  };
}

export function requestFilterQuery(
  filters: RequestListFilters,
  overrides: Partial<RequestListFilters> = {},
) {
  const next = { ...filters, ...overrides };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.status) params.set("status", next.status);
  if (next.from) params.set("from", next.from);
  if (next.to) params.set("to", next.to);
  if (next.dateField === "updated") params.set("dateField", "updated");
  if (next.createdById) params.set("createdById", next.createdById);
  if (next.sort !== "updated") params.set("sort", next.sort);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function requestWhere(
  filters: RequestListFilters,
  scope: { createdById?: string } = {},
): Prisma.ApprovalRequestWhereInput {
  const where: Prisma.ApprovalRequestWhereInput = {};

  if (scope.createdById) {
    where.createdById = scope.createdById;
  } else if (filters.createdById) {
    where.createdById = filters.createdById;
  }

  if (filters.status) where.status = filters.status;

  if (filters.from || filters.to) {
    const range: Prisma.DateTimeFilter = {};
    if (filters.from) range.gte = chileDayBoundary(filters.from, false);
    if (filters.to) range.lte = chileDayBoundary(filters.to, true);
    if (filters.dateField === "updated") where.updatedAt = range;
    else where.createdAt = range;
  }

  if (filters.q) {
    const q = filters.q;
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { createdBy: { name: { contains: q } } },
      { createdBy: { email: { contains: q } } },
      {
        stages: {
          some: {
            tasks: {
              some: {
                OR: [{ name: { contains: q } }, { email: { contains: q } }],
              },
            },
          },
        },
      },
    ];
  }

  return where;
}

export function requestOrderBy(
  filters: RequestListFilters,
): Prisma.ApprovalRequestOrderByWithRelationInput {
  if (filters.sort === "title") return { title: "asc" };
  if (filters.sort === "created") return { createdAt: "desc" };
  return { updatedAt: "desc" };
}

export function hasActiveRequestFilters(filters: RequestListFilters) {
  return Boolean(filters.q || filters.status || filters.from || filters.to || filters.createdById);
}
