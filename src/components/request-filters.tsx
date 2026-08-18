import Link from "next/link";
import { Search, X } from "lucide-react";
import { requestStatusLabel } from "@/lib/labels";
import {
  REQUEST_STATUS_FILTERS,
  hasActiveRequestFilters,
  requestFilterQuery,
  type RequestListFilters,
} from "@/lib/request-query";

type CreatorOption = { id: string; name: string; email: string };

export function RequestFilters({
  basePath,
  filters,
  statusCounts,
  matchedCount,
  creators,
}: {
  basePath: string;
  filters: RequestListFilters;
  statusCounts: Record<string, number>;
  matchedCount: number;
  creators?: CreatorOption[];
}) {
  const scopedTotal = Object.values(statusCounts).reduce((sum, value) => sum + value, 0);
  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600 focus:ring-2";

  return (
    <div className="mb-6 space-y-4">
      <form method="get" className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">Buscar</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={filters.q}
                placeholder="Título, descripción, solicitante o aprobador"
                className={`${inputClass} pl-9`}
              />
            </span>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Estado</span>
            <select name="status" defaultValue={filters.status} className={inputClass}>
              <option value="">Todos</option>
              {REQUEST_STATUS_FILTERS.map((status) => (
                <option key={status} value={status}>
                  {requestStatusLabel[status]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Ordenar por</span>
            <select name="sort" defaultValue={filters.sort} className={inputClass}>
              <option value="updated">Última actualización</option>
              <option value="created">Fecha de creación</option>
              <option value="title">Título</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Filtrar fecha por</span>
            <select name="dateField" defaultValue={filters.dateField} className={inputClass}>
              <option value="created">Creación</option>
              <option value="updated">Actualización</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Desde</span>
            <input type="date" name="from" defaultValue={filters.from} className={inputClass} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Hasta</span>
            <input type="date" name="to" defaultValue={filters.to} className={inputClass} />
          </label>
          {creators ? (
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Solicitante</span>
              <select name="createdById" defaultValue={filters.createdById} className={inputClass}>
                <option value="">Todos</option>
                {creators.map((creator) => (
                  <option key={creator.id} value={creator.id}>
                    {creator.name} ({creator.email})
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="submit"
            className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            Aplicar filtros
          </button>
          {hasActiveRequestFilters(filters) ? (
            <Link
              href={basePath}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              <X className="size-4" />
              Limpiar
            </Link>
          ) : null}
          <p className="ml-auto text-sm text-slate-500">
            {matchedCount} {matchedCount === 1 ? "solicitud" : "solicitudes"}
          </p>
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        <StatusChip
          href={`${basePath}${requestFilterQuery(filters, { status: "" })}`}
          label="Todas"
          count={scopedTotal}
          active={!filters.status}
        />
        {REQUEST_STATUS_FILTERS.map((status) => (
          <StatusChip
            key={status}
            href={`${basePath}${requestFilterQuery(filters, { status })}`}
            label={requestStatusLabel[status]}
            count={statusCounts[status] ?? 0}
            active={filters.status === status}
          />
        ))}
      </div>
    </div>
  );
}

function StatusChip({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-sm font-medium ${
        active ? "bg-blue-700 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
      }`}
    >
      {label} <span className={active ? "text-blue-100" : "text-slate-400"}>{count}</span>
    </Link>
  );
}
