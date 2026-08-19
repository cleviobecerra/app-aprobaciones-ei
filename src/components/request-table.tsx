import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/labels";
import { hasActiveRequestFilters, type RequestListFilters } from "@/lib/request-query";
import { displayName } from "@/lib/tokens";

type ListedRequest = {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: { name: string; email: string };
  stages: { tasks: { status: string; name: string; email: string }[] }[];
};

function waitingOn(request: ListedRequest) {
  return request.stages
    .flatMap((stage) => stage.tasks)
    .filter((task) => task.status === "PENDING")
    .map((task) => displayName(task.name, task.email));
}

export function RequestTable({
  requests,
  filters,
  showCreator,
  emptyLabel,
}: {
  requests: ListedRequest[];
  filters: RequestListFilters;
  showCreator: boolean;
  emptyLabel: string;
}) {
  if (requests.length === 0) {
    return (
      <div className="ui-empty">
        {hasActiveRequestFilters(filters)
          ? "No hay solicitudes que coincidan con los filtros."
          : emptyLabel}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {requests.map((request) => {
          const waiting = waitingOn(request);
          return (
            <Link key={request.id} href={`/requests/${request.id}`} className="ui-card ui-card-hover block touch-manipulation">
              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 break-words font-medium text-fg">{request.title}</h3>
                <span className="shrink-0">
                  <StatusBadge status={request.status} />
                </span>
              </div>
              {request.description ? (
                <p className="mt-1 line-clamp-2 text-xs text-subtle">{request.description}</p>
              ) : null}
              <p className="mt-3 text-xs text-subtle">
                {showCreator ? `${request.createdBy.name} · ` : null}
                {formatDate(request.createdAt)}
              </p>
              {waiting.length ? (
                <p className="mt-2 text-sm text-primary-700">Pendiente de: {waiting.join(", ")}</p>
              ) : null}
            </Link>
          );
        })}
      </div>

      <div className="-mx-4 hidden overflow-x-auto md:mx-0 md:block">
        <div className="min-w-[720px] overflow-hidden rounded-2xl border border-line bg-surface md:min-w-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-soft text-subtle">
              <tr>
                <th className="px-4 py-3 font-medium">Solicitud</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                {showCreator ? <th className="px-4 py-3 font-medium">Solicitante</th> : null}
                <th className="px-4 py-3 font-medium">Creada</th>
                <th className="px-4 py-3 font-medium">Actualizada</th>
                <th className="px-4 py-3 font-medium">Pendiente de</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => {
                const waiting = waitingOn(request);
                return (
                  <tr key={request.id} className="border-t border-line transition-colors hover:bg-soft">
                    <td className="px-4 py-3">
                      <Link href={`/requests/${request.id}`} className="font-medium text-fg hover:text-primary-700">
                        {request.title}
                      </Link>
                      {request.description ? (
                        <p className="mt-0.5 line-clamp-1 text-xs text-subtle">{request.description}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={request.status} />
                    </td>
                    {showCreator ? (
                      <td className="px-4 py-3">
                        <p className="text-fg">{request.createdBy.name}</p>
                        <p className="text-xs text-subtle">{request.createdBy.email}</p>
                      </td>
                    ) : null}
                    <td className="px-4 py-3 whitespace-nowrap text-subtle">{formatDate(request.createdAt)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-subtle">{formatDate(request.updatedAt)}</td>
                    <td className="px-4 py-3 text-muted">{waiting.length ? waiting.join(", ") : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
