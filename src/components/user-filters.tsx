import Link from "next/link";
import { Search, X } from "lucide-react";
import { UiSelect } from "@/components/ui-select";
import { roleLabel } from "@/lib/roles";
import {
  USER_ROLE_FILTERS,
  hasActiveUserFilters,
  userFilterQuery,
  type UserListFilters,
} from "@/lib/user-query";

export function UserFilters({
  filters,
  roleCounts,
  matchedCount,
  areas,
}: {
  filters: UserListFilters;
  roleCounts: Record<string, number>;
  matchedCount: number;
  areas: string[];
}) {
  const total = Object.values(roleCounts).reduce((sum, value) => sum + value, 0);

  return (
    <div className="mb-6 space-y-4">
      <form method="get" className="ui-card p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block text-sm sm:col-span-2 lg:col-span-1">
            <span className="ui-label">Buscar</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
              <input
                name="q"
                defaultValue={filters.q}
                placeholder="Nombre, correo o área"
                className="ui-input ui-input-icon"
              />
            </span>
          </label>
          <label className="block text-sm">
            <span className="ui-label">Perfil</span>
            <UiSelect
              name="role"
              defaultValue={filters.role}
              options={[
                { value: "", label: "Todos" },
                ...USER_ROLE_FILTERS.map((role) => ({
                  value: role,
                  label: roleLabel[role],
                })),
              ]}
            />
          </label>
          <label className="block text-sm">
            <span className="ui-label">Área</span>
            <UiSelect
              name="area"
              defaultValue={filters.area}
              options={[
                { value: "", label: "Todas" },
                ...areas.map((area) => ({ value: area, label: area })),
              ]}
            />
          </label>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <button type="submit" className="ui-btn ui-btn-primary w-full sm:w-auto">
            Aplicar filtros
          </button>
          {hasActiveUserFilters(filters) ? (
            <Link href="/users" className="ui-btn ui-btn-ghost w-full sm:w-auto">
              <X className="size-4" />
              Limpiar
            </Link>
          ) : null}
          <p className="text-sm text-subtle sm:ml-auto">
            {matchedCount} {matchedCount === 1 ? "usuario" : "usuarios"}
          </p>
        </div>
      </form>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
          <Link
            href={`/users${userFilterQuery(filters, { role: "" })}`}
            className={`inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${
              !filters.role
                ? "bg-primary text-white shadow-sm"
                : "bg-surface text-muted ring-1 ring-line transition-colors hover:bg-soft hover:text-fg"
            }`}
          >
            Todos
            <span className={!filters.role ? "text-white/70" : "text-subtle"}>{total}</span>
          </Link>
          {USER_ROLE_FILTERS.map((role) => {
            const active = filters.role === role;
            return (
              <Link
                key={role}
                href={`/users${userFilterQuery(filters, { role })}`}
                className={`inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface text-muted ring-1 ring-line transition-colors hover:bg-soft hover:text-fg"
                }`}
              >
                {roleLabel[role]}
                <span className={active ? "text-white/70" : "text-subtle"}>{roleCounts[role] ?? 0}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
