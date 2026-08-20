import { BrandMark } from "@/components/brand-mark";
import { FlowTimeline } from "@/components/flow-timeline";
import { AuditTrail } from "@/components/audit-trail";
import { RequestInfoCard } from "@/components/request-info";
import { formatDate } from "@/lib/labels";
import type { RequestPdfPayload } from "@/lib/request-pdf-data";

function asDate(value: string | Date | null | undefined) {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

function PdfHeader({
  title,
  subtitle,
  date,
}: {
  title: string;
  subtitle: string;
  date: Date;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-line pb-4">
      <BrandMark size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold tracking-tight">{title}</p>
        <p className="text-xs text-subtle">{subtitle}</p>
      </div>
      <p className="shrink-0 text-xs text-subtle">{formatDate(date)}</p>
    </div>
  );
}

export function RequestPdfDocument({ data }: { data: RequestPdfPayload }) {
  const createdAt = asDate(data.createdAt) ?? new Date(data.createdAt);
  const completedAt = asDate(data.completedAt);
  const stamp = completedAt ?? createdAt;

  return (
    <>
      <div className="pdf-sheet space-y-6">
        <PdfHeader title="Aprobaciones" subtitle="Comprobante de solicitud aprobada" date={stamp} />
        <RequestInfoCard
          title={data.title}
          description={data.description}
          status={data.status}
          createdByName={data.createdByName}
          createdAt={createdAt}
          completedAt={completedAt}
        />
        <section className="ui-card">
          <h2 className="mb-2 font-semibold">Pista de auditoría</h2>
          <AuditTrail
            events={data.auditEvents.map((event) => ({
              ...event,
              createdAt: asDate(event.createdAt) ?? new Date(event.createdAt),
            }))}
          />
        </section>
      </div>

      <div className="pdf-sheet space-y-6">
        <PdfHeader title="Aprobaciones" subtitle={`Flujo · ${data.title}`} date={stamp} />
        <section className="ui-card bg-soft/50">
          <h2 className="mb-4 font-semibold">Flujo</h2>
          <FlowTimeline
            stages={data.stages.map((stage) => ({
              ...stage,
              tasks: stage.tasks.map((task) => ({
                ...task,
                actedAt: asDate(task.actedAt),
              })),
            }))}
            currentStage={data.currentStage}
          />
        </section>
      </div>
    </>
  );
}
