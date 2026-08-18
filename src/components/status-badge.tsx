import { Stamp } from "lucide-react";
import { requestStatusLabel } from "@/lib/labels";

const styles: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-blue-50 text-blue-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-rose-50 text-rose-700",
  CANCELLED: "bg-amber-50 text-amber-800",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] ?? styles.DRAFT}`}
    >
      <Stamp className="size-3.5" />
      {requestStatusLabel[status] ?? status}
    </span>
  );
}
