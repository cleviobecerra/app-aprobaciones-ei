import type { ReactNode } from "react";
import { formatDate } from "@/lib/labels";
import { StatusBadge } from "@/components/status-badge";

export function RequestInfoCard({
  title,
  description,
  status,
  createdByName,
  createdAt,
  completedAt,
  actions,
}: {
  title: string;
  description: string;
  status: string;
  createdByName: string;
  createdAt: Date;
  completedAt?: Date | null;
  actions?: ReactNode;
}) {
  return (
    <header className="ui-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-subtle">Solicitud</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight break-words sm:text-2xl">{title}</h1>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <StatusBadge status={status} />
          {actions}
        </div>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-muted">{description || "Sin descripción."}</p>
      <p className="mt-4 text-sm text-subtle">
        Creada por {createdByName} · {formatDate(createdAt)}
        {completedAt ? ` · Aprobada ${formatDate(completedAt)}` : ""}
      </p>
    </header>
  );
}
