import { requireUser } from "@/lib/auth";
import { getReportData, parseReportFilters } from "@/lib/reports";
import {
  AreaKpis,
  MonthlyBars,
  ReportAreaFilters,
  ReportKpis,
  ReportPeriodTabs,
  StatusDonut,
  TopRequesters,
} from "@/components/report-dashboard";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const filters = parseReportFilters(await searchParams);
  const report = await getReportData(user, filters);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="ui-page-title">Reportes</h1>
          <p className="ui-page-desc">
            {report.global
              ? "KPIs de todas las solicitudes del sistema: volumen, estados, áreas y solicitantes con más actividad."
              : "Métricas de tu gestión: cuántas solicitudes has creado y en qué estado están."}
          </p>
        </div>
        <ReportPeriodTabs filters={report.filters} />
      </div>

      <div className="space-y-6">
        {report.global ? <ReportAreaFilters filters={report.filters} areas={report.byArea} /> : null}
        <ReportKpis report={report} />
        {report.global ? <AreaKpis rows={report.byArea} filters={report.filters} /> : null}
        <div className="grid gap-6 lg:grid-cols-2">
          <StatusDonut items={report.statusItems} total={report.total} />
          <MonthlyBars months={report.months} />
        </div>
        {report.global ? <TopRequesters rows={report.topRequesters} /> : null}
      </div>
    </div>
  );
}
