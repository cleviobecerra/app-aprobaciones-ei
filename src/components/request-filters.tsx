import Link from "next/link";
import { Search, X } from "lucide-react";
import { requestStatusLabel } from "@/lib/labels";
import { UiSelect } from "@/components/ui-select";
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
  const inputClass = "ui-input";

  return (
    <div className="mb-6 space-y-4">
      <form method="get" className="ui-card p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="block text-sm md:col-span-2">
            <span className="ui-label">Buscar</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
              <input
                name="q"
                defaultValue={filters.q}
                placeholder="Título, descripción, solicitante o aprobador"
                className={`${inputClass} ui-input-icon`}
              />
            </span>
          </label>
          <label className="block text-sm">
            <span className="ui-label">Estado</span>
            <UiSelect
              name="status"
              defaultValue={filters.status}
              options={[
                { value: "", label: "Todos" },
                ...REQUEST_STATUS_FILTERS.map((status) => ({
                  value: status,
                  label: requestStatusLabel[status],
                })),
              ]}
            />
          </label>
          <label className="block text-sm">
            <span className="ui-label">Ordenar por</span>
            <UiSelect
              name="sort"
              defaultValue={filters.sort}
              options={[
                { value: "updated", label: "Última actualización" },
                { value: "created", label: "Fecha de creación" },
                { value: "title", label: "Título" },
              ]}
            />
          </label>
          <label className="block text-sm">
            <span className="ui-label">Filtrar fecha por</span>
            <UiSelect
              name="dateField"
              defaultValue={filters.dateField}
              options={[
                { value: "created", label: "Creación" },
                { value: "updated", label: "Actualización" },
              ]}
            />
          </label>
          <label className="block text-sm">
            <span className="ui-label">Desde</span>
            <input type="date" name="from" defaultValue={filters.from} className={inputClass} />
          </label>
          <label className="block text-sm">
            <span className="ui-label">Hasta</span>
            <input type="date" name="to" defaultValue={filters.to} className={inputClass} />
          </label>
          {creators ? (
            <label className="block text-sm">
              <span className="ui-label">Solicitante</span>
              <UiSelect
                name="createdById"
                defaultValue={filters.createdById}
                options={[
                  { value: "", label: "Todos" },
                  ...creators.map((creator) => ({
                    value: creator.id,
                    label: `${creator.name} (${creator.email})`,
                  })),
                ]}
              />
            </label>
          ) : null}
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <button type="submit" className="ui-btn ui-btn-primary w-full sm:w-auto">
            Aplicar filtros
          </button>
          {hasActiveRequestFilters(filters) ? (
            <Link
              href={basePath}
              className="ui-btn ui-btn-ghost w-full sm:w-auto"
            >
              <X className="size-4" />
              Limpiar
            </Link>
          ) : null}
          <p className="text-sm text-subtle sm:ml-auto">
            {matchedCount} {matchedCount === 1 ? "solicitud" : "solicitudes"}
          </p>
        </div>
      </form>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
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
      className={`inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${
        active
          ? "bg-primary text-white shadow-sm"
          : "bg-surface text-muted ring-1 ring-line transition-colors hover:bg-soft hover:text-fg"
      }`}
    >
      {label}
      <span className={active ? "text-white/70" : "text-subtle"}>{count}</span>
    </Link>
  );
}
