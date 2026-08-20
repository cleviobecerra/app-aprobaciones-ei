import { prisma } from "@/lib/db";
import { APP_TIME_ZONE, REQUEST_STATUS, chileDayBoundary, requestStatusLabel } from "@/lib/labels";
import { canViewAllRequests } from "@/lib/roles";
import type { SessionUser } from "@/lib/auth";

export const REPORT_PERIODS = ["30d", "90d", "year", "all"] as const;
export type ReportPeriod = (typeof REPORT_PERIODS)[number];

export const REPORT_STATUSES = [
  REQUEST_STATUS.DRAFT,
  REQUEST_STATUS.IN_PROGRESS,
  REQUEST_STATUS.APPROVED,
  REQUEST_STATUS.REJECTED,
  REQUEST_STATUS.CANCELLED,
] as const;

export const statusChartColor: Record<string, string> = {
  DRAFT: "var(--subtle)",
  IN_PROGRESS: "var(--primary)",
  APPROVED: "var(--success)",
  REJECTED: "var(--danger)",
  CANCELLED: "var(--warning)",
};

export const NONE_AREA = "none";

export type ReportFilters = {
  period: ReportPeriod;
  area: string;
};

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function parseReportPeriod(value: string | string[] | undefined): ReportPeriod {
  const raw = firstParam(value);
  return REPORT_PERIODS.includes(raw as ReportPeriod) ? (raw as ReportPeriod) : "all";
}

export function parseReportArea(value: string | string[] | undefined) {
  return firstParam(value).trim();
}

export function parseReportFilters(searchParams: Record<string, string | string[] | undefined>): ReportFilters {
  return {
    period: parseReportPeriod(searchParams.period),
    area: parseReportArea(searchParams.area),
  };
}

export function reportHref(filters: ReportFilters, overrides: Partial<ReportFilters> = {}) {
  const next = { ...filters, ...overrides };
  const params = new URLSearchParams();
  if (next.period !== "all") params.set("period", next.period);
  if (next.area) params.set("area", next.area);
  const query = params.toString();
  return query ? `/reports?${query}` : "/reports";
}

function createdByAreaWhere(area: string) {
  if (!area) return {};
  if (area === NONE_AREA) return { createdBy: { area: "" } };
  return { createdBy: { area } };
}

function emptyStatusCounts() {
  return Object.fromEntries(REPORT_STATUSES.map((status) => [status, 0])) as Record<string, number>;
}

function approvalRate(byStatus: Record<string, number>) {
  const decided = (byStatus.APPROVED ?? 0) + (byStatus.REJECTED ?? 0);
  return decided > 0 ? Math.round(((byStatus.APPROVED ?? 0) / decided) * 100) : null;
}

function areaLabel(area: string) {
  return area || "Sin área";
}

function areaValue(area: string) {
  return area || NONE_AREA;
}

function periodStart(period: ReportPeriod) {
  if (period === "all") return null;
  const now = new Date();
  const chileNow = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const [year, month, day] = chileNow.split("-").map(Number);
  if (period === "year") return chileDayBoundary(`${year}-01-01`, false);
  const days = period === "30d" ? 30 : 90;
  const start = new Date(Date.UTC(year, month - 1, day));
  start.setUTCDate(start.getUTCDate() - (days - 1));
  const y = start.getUTCFullYear();
  const m = String(start.getUTCMonth() + 1).padStart(2, "0");
  const d = String(start.getUTCDate()).padStart(2, "0");
  return chileDayBoundary(`${y}-${m}-${d}`, false);
}

function monthKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).format(date);
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  const label = new Intl.DateTimeFormat("es-CL", { month: "short" }).format(new Date(year, month - 1, 1));
  return `${label.replace(".", "")} ${String(year).slice(2)}`;
}

export async function getReportData(user: SessionUser, filters: ReportFilters) {
  const global = canViewAllRequests(user.role);
  const period = filters.period;
  const area = global ? filters.area : "";
  const from = periodStart(period);
  const periodWhere = {
    ...(global ? {} : { createdById: user.id }),
    ...(from ? { createdAt: { gte: from } } : {}),
  };
  const where = {
    ...periodWhere,
    ...(global ? createdByAreaWhere(area) : {}),
  };

  const nowKey = monthKey(new Date());
  const [yearNow, monthNow] = nowKey.split("-").map(Number);
  const monthKeys: string[] = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(yearNow, monthNow - 1 - offset, 1);
    monthKeys.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  }
  const monthFrom = chileDayBoundary(`${monthKeys[0]}-01`, false);

  const [statusRows, monthRows, creatorRows, areaCreatorRows] = await Promise.all([
    prisma.approvalRequest.groupBy({
      by: ["status"],
      where,
      _count: { _all: true },
    }),
    prisma.approvalRequest.findMany({
      where: {
        ...(global ? {} : { createdById: user.id }),
        ...(global ? createdByAreaWhere(area) : {}),
        createdAt: { gte: monthFrom },
      },
      select: { createdAt: true },
    }),
    global
      ? prisma.approvalRequest.groupBy({
          by: ["createdById", "status"],
          where,
          _count: { _all: true },
        })
      : Promise.resolve([]),
    global
      ? prisma.approvalRequest.groupBy({
          by: ["createdById", "status"],
          where: periodWhere,
          _count: { _all: true },
        })
      : Promise.resolve([]),
  ]);

  const byStatus = emptyStatusCounts();
  for (const row of statusRows) byStatus[row.status] = row._count._all;
  const total = Object.values(byStatus).reduce((sum, value) => sum + value, 0);

  const monthCounts = Object.fromEntries(monthKeys.map((key) => [key, 0]));
  for (const row of monthRows) {
    const key = monthKey(row.createdAt);
    if (key in monthCounts) monthCounts[key] += 1;
  }

  let topRequesters: {
    id: string;
    name: string;
    area: string;
    total: number;
    byStatus: Record<string, number>;
  }[] = [];
  let byArea: {
    value: string;
    label: string;
    total: number;
    approvalRate: number | null;
    byStatus: Record<string, number>;
  }[] = [];

  const areaUserIds = [...new Set(areaCreatorRows.map((row) => row.createdById))];
  const requesterIds = [...new Set(creatorRows.map((row) => row.createdById))];
  const users =
    global && (areaUserIds.length > 0 || requesterIds.length > 0)
      ? await prisma.user.findMany({
          where: { id: { in: [...new Set([...areaUserIds, ...requesterIds])] } },
          select: { id: true, name: true, area: true },
        })
      : [];
  const usersById = Object.fromEntries(users.map((item) => [item.id, item]));

  if (global && creatorRows.length > 0) {
    const totals = new Map<string, number>();
    const breakdown = new Map<string, Record<string, number>>();
    for (const row of creatorRows) {
      totals.set(row.createdById, (totals.get(row.createdById) ?? 0) + row._count._all);
      const current = breakdown.get(row.createdById) ?? emptyStatusCounts();
      current[row.status] = row._count._all;
      breakdown.set(row.createdById, current);
    }
    const ranked = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    topRequesters = ranked.map(([id, count]) => ({
      id,
      name: usersById[id]?.name ?? "Usuario",
      area: usersById[id]?.area ?? "",
      total: count,
      byStatus: breakdown.get(id) ?? emptyStatusCounts(),
    }));
  }

  if (global && areaCreatorRows.length > 0) {
    const totals = new Map<string, number>();
    const breakdown = new Map<string, Record<string, number>>();
    for (const row of areaCreatorRows) {
      const key = usersById[row.createdById]?.area ?? "";
      totals.set(key, (totals.get(key) ?? 0) + row._count._all);
      const current = breakdown.get(key) ?? emptyStatusCounts();
      current[row.status] = (current[row.status] ?? 0) + row._count._all;
      breakdown.set(key, current);
    }
    byArea = [...totals.entries()]
      .sort((a, b) => b[1] - a[1] || areaLabel(a[0]).localeCompare(areaLabel(b[0]), "es"))
      .map(([key, count]) => ({
        value: areaValue(key),
        label: areaLabel(key),
        total: count,
        byStatus: breakdown.get(key) ?? emptyStatusCounts(),
        approvalRate: approvalRate(breakdown.get(key) ?? emptyStatusCounts()),
      }));
  }

  return {
    global,
    filters: { period, area },
    total,
    byStatus,
    approvalRate: approvalRate(byStatus),
    months: monthKeys.map((key) => ({ key, label: monthLabel(key), count: monthCounts[key] })),
    topRequesters,
    byArea,
    statusItems: REPORT_STATUSES.map((status) => ({
      status,
      label: requestStatusLabel[status],
      count: byStatus[status],
      color: statusChartColor[status],
    })),
  };
}

export const periodLabel: Record<ReportPeriod, string> = {
  "30d": "30 días",
  "90d": "90 días",
  year: "Este año",
  all: "Todo",
};
