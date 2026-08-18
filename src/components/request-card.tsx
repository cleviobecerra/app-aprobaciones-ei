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
      className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <StatusBadge status={status} />
      </div>
      <p className="mt-2 text-sm text-slate-500">
        {createdBy} · {formatDate(createdAt)}
      </p>
      {waitingOn ? (
        <p className="mt-3 text-sm text-blue-700">Esperando a: {waitingOn}</p>
      ) : null}
    </Link>
  );
}
