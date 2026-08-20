import { Check, CircleDashed, Clock3, SkipForward, X } from "lucide-react";
import { formatDate, initials, stageModeLabel, taskStatusLabel } from "@/lib/labels";
import { displayName } from "@/lib/tokens";

type Task = {
  id: string;
  status: string;
  comment: string;
  actedAt: Date | null;
  email: string;
  name: string;
};

type Stage = {
  id: string;
  order: number;
  name: string;
  mode: string;
  tasks: Task[];
};

const iconFor: Record<string, typeof Check> = {
  APPROVED: Check,
  REJECTED: X,
  PENDING: Clock3,
  SKIPPED: SkipForward,
  WAITING: CircleDashed,
};

const colorFor: Record<string, string> = {
  APPROVED: "bg-success text-white",
  REJECTED: "bg-danger text-white",
  PENDING: "bg-primary text-white",
  SKIPPED: "bg-line text-muted",
  WAITING: "bg-surface text-subtle border border-line",
};

export function FlowTimeline({ stages, currentStage }: { stages: Stage[]; currentStage: number }) {
  return (
    <ol className="space-y-0">
      {stages.map((stage, index) => {
        const active = stage.order === currentStage;
        return (
          <li key={stage.id} className="relative flex gap-4 pb-8 last:pb-0">
            {index < stages.length - 1 ? (
              <span className="absolute top-8 bottom-0 left-[15px] w-px bg-line" />
            ) : null}
            <div
              className={`relative z-10 mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                active ? "bg-primary text-white stamp-ring" : "bg-soft text-muted"
              }`}
            >
              {stage.order}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium text-fg">{stage.name}</h3>
                <span className="ui-chip bg-soft text-muted">
                  {stageModeLabel[stage.mode]}
                </span>
              </div>
              <ul className="mt-3 space-y-2">
                {stage.tasks.map((task) => {
                  const Icon = iconFor[task.status] ?? CircleDashed;
                  const label = displayName(task.name, task.email);
                  return (
                    <li
                      key={task.id}
                      className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3"
                    >
                      <span
                        className={`mt-0.5 flex size-7 items-center justify-center rounded-full ${colorFor[task.status] ?? colorFor.WAITING}`}
                      >
                        <Icon className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="flex size-7 items-center justify-center rounded-full bg-soft text-[11px] font-medium text-muted">
                            {initials(label)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-fg">{label}</p>
                            <p className="truncate text-xs text-subtle">{task.email}</p>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-subtle">
                          {taskStatusLabel[task.status]}
                          {task.actedAt ? ` · ${formatDate(task.actedAt)}` : ""}
                        </p>
                        {task.comment ? (
                          <p className="mt-1 rounded-lg bg-soft px-2 py-1 text-sm text-muted">
                            {task.comment}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
