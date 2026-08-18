"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { stageModeLabel } from "@/lib/labels";

type RecipientDraft = { key: string; name: string; email: string };
type StageDraft = {
  key: string;
  name: string;
  mode: "ALL" | "ANY";
  recipients: RecipientDraft[];
};

function emptyRecipient(): RecipientDraft {
  return { key: crypto.randomUUID(), name: "", email: "" };
}

function emptyStage(index: number): StageDraft {
  return {
    key: crypto.randomUUID(),
    name: index === 0 ? "Revisión inicial" : `Etapa ${index + 1}`,
    mode: "ALL",
    recipients: [emptyRecipient()],
  };
}

export function FlowBuilder({ name = "stages" }: { name?: string }) {
  const [stages, setStages] = useState<StageDraft[]>([emptyStage(0)]);

  const payload = useMemo(
    () =>
      JSON.stringify(
        stages.map((stage) => ({
          name: stage.name,
          mode: stage.mode,
          recipients: stage.recipients.map((recipient) => ({
            name: recipient.name,
            email: recipient.email,
          })),
        })),
      ),
    [stages],
  );

  function updateStage(key: string, patch: Partial<StageDraft>) {
    setStages((current) => current.map((stage) => (stage.key === key ? { ...stage, ...patch } : stage)));
  }

  function updateRecipient(stageKey: string, recipientKey: string, patch: Partial<RecipientDraft>) {
    setStages((current) =>
      current.map((stage) =>
        stage.key === stageKey
          ? {
              ...stage,
              recipients: stage.recipients.map((recipient) =>
                recipient.key === recipientKey ? { ...recipient, ...patch } : recipient,
              ),
            }
          : stage,
      ),
    );
  }

  function move(index: number, direction: -1 | 1) {
    setStages((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={payload} />
      {stages.map((stage, index) => (
        <section key={stage.key} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-500">Etapa {index + 1}</p>
            <div className="flex gap-1">
              <button type="button" onClick={() => move(index, -1)} className="rounded-lg p-1.5 hover:bg-slate-100">
                <ArrowUp className="size-4" />
              </button>
              <button type="button" onClick={() => move(index, 1)} className="rounded-lg p-1.5 hover:bg-slate-100">
                <ArrowDown className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setStages((current) => current.filter((item) => item.key !== stage.key))}
                className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"
                disabled={stages.length === 1}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Nombre de la etapa</span>
              <input
                value={stage.name}
                onChange={(event) => updateStage(stage.key, { name: event.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-blue-600 focus:ring-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Regla</span>
              <select
                value={stage.mode}
                onChange={(event) => updateStage(stage.key, { mode: event.target.value as "ALL" | "ANY" })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-blue-600 focus:ring-2"
              >
                <option value="ALL">{stageModeLabel.ALL}</option>
                <option value="ANY">{stageModeLabel.ANY}</option>
              </select>
            </label>
          </div>
          <div className="mt-4 space-y-3">
            <p className="text-sm font-medium text-slate-700">Destinatarios</p>
            {stage.recipients.map((recipient) => (
              <div key={recipient.key} className="grid gap-2 sm:grid-cols-[1fr_1.3fr_auto]">
                <input
                  value={recipient.name}
                  onChange={(event) => updateRecipient(stage.key, recipient.key, { name: event.target.value })}
                  placeholder="Nombre (opcional)"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-blue-600 focus:ring-2"
                />
                <input
                  type="email"
                  value={recipient.email}
                  onChange={(event) => updateRecipient(stage.key, recipient.key, { email: event.target.value })}
                  placeholder="correo@empresa.com"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-blue-600 focus:ring-2"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateStage(stage.key, {
                      recipients: stage.recipients.filter((item) => item.key !== recipient.key),
                    })
                  }
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  disabled={stage.recipients.length === 1}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateStage(stage.key, { recipients: [...stage.recipients, emptyRecipient()] })}
              className="text-sm font-medium text-blue-700 hover:underline"
            >
              + Agregar otro correo en esta etapa
            </button>
          </div>
        </section>
      ))}
      <button
        type="button"
        onClick={() => setStages((current) => [...current, emptyStage(current.length)])}
        className="inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white"
      >
        <Plus className="size-4" />
        Agregar etapa
      </button>
      <p className="text-xs text-slate-500">
        Cada persona recibe un enlace en su correo. No necesita cuenta ni rol. Las etapas se recorren
        en orden; varios correos en la misma etapa trabajan en paralelo.
      </p>
    </div>
  );
}
