import { auditActionLabel, formatDate } from "@/lib/labels";

export type AuditEventItem = {
  id: string;
  actorName: string;
  actorEmail: string;
  action: string;
  detail: string;
  createdAt: Date;
};

export function AuditTrail({ events }: { events: AuditEventItem[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-subtle">Aún no hay eventos de auditoría.</p>;
  }

  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li key={event.id} className="border-l-2 border-line pl-3">
          <p className="text-sm font-medium text-fg">
            {event.actorName || event.actorEmail || "Sistema"} · {auditActionLabel[event.action] ?? event.action}
          </p>
          {event.detail ? <p className="text-sm text-muted">{event.detail}</p> : null}
          <p className="text-xs text-subtle">{formatDate(event.createdAt)}</p>
        </li>
      ))}
    </ol>
  );
}
