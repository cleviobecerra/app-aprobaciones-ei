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
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
        {hasActiveRequestFilters(filters)
          ? "No hay solicitudes que coincidan con los filtros."
          : emptyLabel}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-slate-50 text-slate-500">
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
            const waiting = request.stages
              .flatMap((stage) => stage.tasks)
              .filter((task) => task.status === "PENDING")
              .map((task) => displayName(task.name, task.email));
            return (
              <tr key={request.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/requests/${request.id}`} className="font-medium text-slate-900 hover:text-blue-800">
                    {request.title}
                  </Link>
                  {request.description ? (
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{request.description}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={request.status} />
                </td>
                {showCreator ? (
                  <td className="px-4 py-3">
                    <p className="text-slate-800">{request.createdBy.name}</p>
                    <p className="text-xs text-slate-500">{request.createdBy.email}</p>
                  </td>
                ) : null}
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">{formatDate(request.createdAt)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">{formatDate(request.updatedAt)}</td>
                <td className="px-4 py-3 text-slate-600">
                  {waiting.length ? waiting.join(", ") : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
