import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/labels";

type RequestCardProps = {
  id: string;
  title: string;
  status: string;
  createdBy: string;
  createdAt: Date;
  waitingOn?: string;
};

export function RequestCard({ id, title, status, createdBy, createdAt, waitingOn }: RequestCardProps) {
  return (
    <Link
      href={`/requests/${id}`}
      className="ui-card ui-card-hover block"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium text-fg">{title}</h3>
        <StatusBadge status={status} />
      </div>
      <p className="mt-2 text-sm text-subtle">
        {createdBy} · {formatDate(createdAt)}
      </p>
      {waitingOn ? <p className="mt-3 text-sm text-primary-700">Esperando a: {waitingOn}</p> : null}
    </Link>
  );
}
