import { Stamp } from "lucide-react";
import { requestStatusLabel } from "@/lib/labels";

const styles: Record<string, string> = {
  DRAFT: "bg-soft text-muted",
  IN_PROGRESS: "bg-primary-50 text-primary-700",
  APPROVED: "bg-success-50 text-success-700",
  REJECTED: "bg-danger-50 text-danger-700",
  CANCELLED: "bg-warning-50 text-warning-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`ui-chip ${styles[status] ?? styles.DRAFT}`}>
      <Stamp className="size-3.5" />
      {requestStatusLabel[status] ?? status}
    </span>
  );
}
