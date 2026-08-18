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
  APPROVED: "bg-emerald-600 text-white",
  REJECTED: "bg-rose-600 text-white",
  PENDING: "bg-blue-600 text-white",
  SKIPPED: "bg-slate-300 text-slate-700",
  WAITING: "bg-white text-slate-400 border border-slate-200",
};

export function FlowTimeline({ stages, currentStage }: { stages: Stage[]; currentStage: number }) {
  return (
    <ol className="space-y-0">
      {stages.map((stage, index) => {
        const active = stage.order === currentStage;
        return (
          <li key={stage.id} className="relative flex gap-4 pb-8 last:pb-0">
            {index < stages.length - 1 ? (
              <span className="absolute top-8 left-[15px] h-[calc(100%-16px)] w-px bg-slate-200" />
            ) : null}
            <div
              className={`relative z-10 mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                active ? "bg-blue-600 text-white stamp-ring" : "bg-slate-200 text-slate-700"
              }`}
            >
              {stage.order}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-slate-900">{stage.name}</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
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
                      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3"
                    >
                      <span
                        className={`mt-0.5 flex size-7 items-center justify-center rounded-full ${colorFor[task.status] ?? colorFor.WAITING}`}
                      >
                        <Icon className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="flex size-7 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600">
                            {initials(label)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">{label}</p>
                            <p className="truncate text-xs text-slate-500">{task.email}</p>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          {taskStatusLabel[task.status]}
                          {task.actedAt ? ` · ${formatDate(task.actedAt)}` : ""}
                        </p>
                        {task.comment ? (
                          <p className="mt-1 rounded-lg bg-slate-50 px-2 py-1 text-sm text-slate-700">
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
