import { prisma } from "@/lib/db";
import { RequestFilters } from "@/components/request-filters";
import { RequestTable } from "@/components/request-table";
import {
  parseRequestFilters,
  requestOrderBy,
  requestWhere,
  type RequestListFilters,
} from "@/lib/request-query";

type SearchParams = Record<string, string | string[] | undefined>;

export async function RequestInbox({
  title,
  description,
  basePath,
  searchParams,
  scope,
  showCreator,
  emptyLabel,
}: {
  title: string;
  description: string;
  basePath: string;
  searchParams: SearchParams;
  scope?: { createdById: string };
  showCreator: boolean;
  emptyLabel: string;
}) {
  const filters = parseRequestFilters(searchParams);
  const scopedFilters: RequestListFilters = scope
    ? { ...filters, createdById: "" }
    : filters;
  const where = requestWhere(scopedFilters, scope);
  const countWhere = requestWhere({ ...scopedFilters, status: "" }, scope);

  const [requests, grouped, creators] = await Promise.all([
    prisma.approvalRequest.findMany({
      where,
      include: {
        createdBy: { select: { name: true, email: true } },
        stages: { include: { tasks: { select: { status: true, name: true, email: true } } } },
      },
      orderBy: requestOrderBy(filters),
    }),
    prisma.approvalRequest.groupBy({
      by: ["status"],
      where: countWhere,
      _count: { _all: true },
    }),
    showCreator
      ? prisma.user.findMany({
          where: { requestsCreated: { some: {} } },
          select: { id: true, name: true, email: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve(undefined),
  ]);

  const statusCounts = Object.fromEntries(
    grouped.map((row) => [row.status, row._count._all]),
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">{description}</p>
      <RequestFilters
        basePath={basePath}
        filters={filters}
        statusCounts={statusCounts}
        matchedCount={requests.length}
        creators={creators}
      />
      <RequestTable
        requests={requests}
        filters={filters}
        showCreator={showCreator}
        emptyLabel={emptyLabel}
      />
    </div>
  );
}
