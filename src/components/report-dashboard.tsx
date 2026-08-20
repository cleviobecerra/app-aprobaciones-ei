import Link from "next/link";
import { X } from "lucide-react";
import { requestStatusLabel } from "@/lib/labels";
import { UiSelect } from "@/components/ui-select";
import {
  periodLabel,
  reportHref,
  statusChartColor,
  type ReportFilters,
  type ReportPeriod,
  type getReportData,
} from "@/lib/reports";

type Report = Awaited<ReturnType<typeof getReportData>>;

function chipClass(active: boolean) {
  return `inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${
    active
      ? "bg-primary text-white shadow-sm"
      : "bg-surface text-muted ring-1 ring-line transition-colors hover:bg-soft hover:text-fg"
  }`;
}

export function ReportPeriodTabs({ filters }: { filters: ReportFilters }) {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(periodLabel) as ReportPeriod[]).map((value) => (
        <Link key={value} href={reportHref(filters, { period: value })} className={chipClass(filters.period === value)}>
          {periodLabel[value]}
        </Link>
      ))}
    </div>
  );
}

export function ReportAreaFilters({
  filters,
  areas,
}: {
  filters: ReportFilters;
  areas: Report["byArea"];
}) {
  const total = areas.reduce((sum, area) => sum + area.total, 0);

  return (
    <div className="space-y-4">
      <form method="get" className="ui-card p-4">
        {filters.period !== "all" ? <input type="hidden" name="period" value={filters.period} /> : null}
        <label className="block text-sm sm:max-w-sm">
          <span className="ui-label">Área</span>
          <UiSelect
            name="area"
            defaultValue={filters.area}
            options={[
              { value: "", label: "Todas las áreas" },
              ...areas.map((area) => ({ value: area.value, label: area.label })),
            ]}
          />
        </label>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <button type="submit" className="ui-btn ui-btn-primary w-full sm:w-auto">
            Aplicar filtros
          </button>
          {filters.area ? (
            <Link href={reportHref(filters, { area: "" })} className="ui-btn ui-btn-ghost w-full sm:w-auto">
              <X className="size-4" />
              Limpiar área
            </Link>
          ) : null}
        </div>
      </form>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
          <Link href={reportHref(filters, { area: "" })} className={chipClass(!filters.area)}>
            Todas
            <span className={!filters.area ? "text-white/70" : "text-subtle"}>{total}</span>
          </Link>
          {areas.map((area) => {
            const active = filters.area === area.value;
            return (
              <Link key={area.value} href={reportHref(filters, { area: area.value })} className={chipClass(active)}>
                {area.label}
                <span className={active ? "text-white/70" : "text-subtle"}>{area.total}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ReportKpis({ report }: { report: Report }) {
  const topArea = report.byArea[0];
  const cards = [
    { label: "Total", value: report.total, hint: "Solicitudes en el período", tone: "text-fg" },
    { label: "En curso", value: report.byStatus.IN_PROGRESS, hint: "Esperando aprobación", tone: "text-primary-700" },
    { label: "Aprobadas", value: report.byStatus.APPROVED, hint: "Flujo completo", tone: "text-success-700" },
    { label: "Rechazadas", value: report.byStatus.REJECTED, hint: "No avanzaron", tone: "text-danger-700" },
    {
      label: "Tasa de aprobación",
      value: report.approvalRate === null ? "—" : `${report.approvalRate}%`,
      hint: "Sobre aprobadas y rechazadas",
      tone: "text-fg",
    },
    { label: "Borradores", value: report.byStatus.DRAFT, hint: "Aún no enviadas", tone: "text-muted" },
    ...(report.global && !report.filters.area
      ? [
          {
            label: "Áreas activas",
            value: report.byArea.length,
            hint: "Áreas con solicitudes en el período",
            tone: "text-fg",
          },
          {
            label: "Área con más solicitudes",
            value: topArea ? topArea.total : "—",
            hint: topArea ? topArea.label : "Sin actividad por área",
            tone: "text-fg",
          },
        ]
      : []),
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <article key={card.label} className="ui-card">
          <p className="text-sm text-subtle">{card.label}</p>
          <p className={`mt-2 text-3xl font-semibold tracking-tight ${card.tone}`}>{card.value}</p>
          <p className="mt-1 text-xs text-subtle">{card.hint}</p>
        </article>
      ))}
    </div>
  );
}

export function StatusDonut({ items, total }: { items: Report["statusItems"]; total: number }) {
  const size = 180;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <section className="ui-card h-full">
      <h2 className="font-semibold">Solicitudes por estado</h2>
      <p className="mt-1 text-sm text-subtle">Distribución actual del período seleccionado.</p>
      {total === 0 ? (
        <p className="mt-8 text-sm text-muted">No hay solicitudes para graficar.</p>
      ) : (
        <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--line)" strokeWidth={stroke} />
            {items
              .filter((item) => item.count > 0)
              .map((item) => {
                const length = (item.count / total) * circumference;
                const circle = (
                  <circle
                    key={item.status}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={item.color}
                    strokeWidth={stroke}
                    strokeDasharray={`${length} ${circumference - length}`}
                    strokeDashoffset={-offset}
                    strokeLinecap="butt"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  />
                );
                offset += length;
                return circle;
              })}
            <text x="50%" y="48%" textAnchor="middle" fill="var(--foreground)" fontSize="28" fontWeight="600">
              {total}
            </text>
            <text x="50%" y="62%" textAnchor="middle" fill="var(--subtle)" fontSize="11">
              total
            </text>
          </svg>
          <ul className="w-full space-y-2">
            {items.map((item) => (
              <li key={item.status} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: item.color }} />
                  <span className="text-muted">{item.label}</span>
                </span>
                <span className="font-medium text-fg">
                  {item.count}
                  <span className="ml-1 text-xs font-normal text-subtle">
                    {total ? Math.round((item.count / total) * 100) : 0}%
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export function MonthlyBars({ months }: { months: Report["months"] }) {
  const max = Math.max(1, ...months.map((month) => month.count));

  return (
    <section className="ui-card h-full">
      <h2 className="font-semibold">Actividad de los últimos 6 meses</h2>
      <p className="mt-1 text-sm text-subtle">Solicitudes creadas por mes, independiente del filtro corto.</p>
      <div className="mt-6 flex h-44 items-end gap-2">
        {months.map((month) => (
          <div key={month.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <p className="text-xs font-medium text-muted">{month.count || ""}</p>
            <div className="flex h-32 w-full items-end justify-center">
              <div
                className="w-[70%] max-w-10 rounded-t-lg bg-primary"
                style={{ height: `${Math.max(month.count ? 8 : 2, (month.count / max) * 100)}%`, opacity: month.count ? 1 : 0.25 }}
                title={`${month.label}: ${month.count}`}
              />
            </div>
            <p className="truncate text-[11px] text-subtle">{month.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AreaKpis({
  rows,
  filters,
}: {
  rows: Report["byArea"];
  filters: ReportFilters;
}) {
  const max = Math.max(1, ...rows.map((row) => row.total));

  return (
    <section>
      <div className="mb-4">
        <h2 className="font-semibold">KPI por área</h2>
        <p className="mt-1 text-sm text-subtle">
          Volumen y estados según el área del solicitante. Elige un área para filtrar el resto del reporte.
        </p>
      </div>
      {rows.length === 0 ? (
        <p className="ui-card text-sm text-muted">No hay solicitudes por área en este período.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => {
            const active = filters.area === row.value;
            return (
              <Link
                key={row.value}
                href={reportHref(filters, { area: active ? "" : row.value })}
                className={`ui-card block transition-colors hover:bg-soft ${active ? "ring-2 ring-primary" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 truncate text-sm font-medium">{row.label}</p>
                  <p className="shrink-0 text-2xl font-semibold tracking-tight">{row.total}</p>
                </div>
                <p className="mt-1 text-xs text-subtle">
                  {row.approvalRate === null ? "Sin tasa de aprobación" : `${row.approvalRate}% de aprobación`}
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-soft">
                  <div className="flex h-full" style={{ width: `${(row.total / max) * 100}%` }}>
                    {Object.entries(row.byStatus)
                      .filter(([, count]) => count > 0)
                      .map(([status, count]) => (
                        <span
                          key={status}
                          className="h-full"
                          style={{
                            width: `${(count / row.total) * 100}%`,
                            background: statusChartColor[status] ?? "var(--subtle)",
                          }}
                        />
                      ))}
                  </div>
                </div>
                <p className="mt-2 text-xs text-subtle">
                  {Object.entries(row.byStatus)
                    .filter(([, count]) => count > 0)
                    .map(([status, count]) => `${count} ${requestStatusLabel[status] ?? status}`)
                    .join(" · ")}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function TopRequesters({ rows }: { rows: Report["topRequesters"] }) {
  const max = Math.max(1, ...rows.map((row) => row.total));

  return (
    <section className="ui-card">
      <h2 className="font-semibold">Solicitantes con más actividad</h2>
      <p className="mt-1 text-sm text-subtle">Quiénes han creado más solicitudes y en qué estado están.</p>
      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-muted">Todavía no hay solicitantes con solicitudes en este período.</p>
      ) : (
        <div className="mt-5 space-y-4">
          {rows.map((row, index) => (
            <div key={row.id}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <p className="min-w-0 truncate text-sm font-medium">
                  <span className="mr-2 text-subtle">{index + 1}.</span>
                  {row.name}
                  {row.area ? <span className="ml-2 text-xs font-normal text-subtle">{row.area}</span> : null}
                </p>
                <p className="shrink-0 text-sm text-muted">{row.total}</p>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-soft">
                <div className="flex h-full" style={{ width: `${(row.total / max) * 100}%` }}>
                  {Object.entries(row.byStatus)
                    .filter(([, count]) => count > 0)
                    .map(([status, count]) => (
                      <span
                        key={status}
                        className="h-full"
                        style={{
                          width: `${(count / row.total) * 100}%`,
                          background: statusChartColor[status] ?? "var(--subtle)",
                        }}
                      />
                    ))}
                </div>
              </div>
              <p className="mt-1.5 text-xs text-subtle">
                {Object.entries(row.byStatus)
                  .filter(([, count]) => count > 0)
                  .map(([status, count]) => `${count} ${requestStatusLabel[status] ?? status}`)
                  .join(" · ")}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

