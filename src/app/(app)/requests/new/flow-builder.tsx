"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { stageModeLabel } from "@/lib/labels";
import { UiSelect } from "@/components/ui-select";

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
        <section key={stage.key} className="ui-card p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-subtle">Etapa {index + 1}</p>
            <div className="flex gap-1">
              <button type="button" onClick={() => move(index, -1)} className="ui-iconbtn" aria-label="Subir etapa">
                <ArrowUp className="size-4" />
              </button>
              <button type="button" onClick={() => move(index, 1)} className="ui-iconbtn" aria-label="Bajar etapa">
                <ArrowDown className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setStages((current) => current.filter((item) => item.key !== stage.key))}
                className="ui-iconbtn text-danger hover:bg-danger-50"
                aria-label="Eliminar etapa"
                disabled={stages.length === 1}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="ui-label">Nombre de la etapa</span>
              <input
                value={stage.name}
                onChange={(event) => updateStage(stage.key, { name: event.target.value })}
                className="ui-input"
              />
            </label>
            <label className="block text-sm">
              <span className="ui-label">Regla</span>
              <UiSelect
                value={stage.mode}
                onChange={(mode) => updateStage(stage.key, { mode: mode as "ALL" | "ANY" })}
                options={[
                  { value: "ALL", label: stageModeLabel.ALL },
                  { value: "ANY", label: stageModeLabel.ANY },
                ]}
              />
            </label>
          </div>
          <div className="mt-4 space-y-3">
            <p className="text-sm font-medium">Destinatarios</p>
            {stage.recipients.map((recipient) => (
              <div key={recipient.key} className="grid gap-2 sm:grid-cols-[1fr_1.3fr_auto]">
                <input
                  value={recipient.name}
                  onChange={(event) => updateRecipient(stage.key, recipient.key, { name: event.target.value })}
                  placeholder="Nombre (opcional)"
                  className="ui-input"
                />
                <input
                  type="email"
                  value={recipient.email}
                  onChange={(event) => updateRecipient(stage.key, recipient.key, { email: event.target.value })}
                  placeholder="correo@empresa.com"
                  className="ui-input"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateStage(stage.key, {
                      recipients: stage.recipients.filter((item) => item.key !== recipient.key),
                    })
                  }
                  className="ui-iconbtn justify-self-end sm:justify-self-center"
                  aria-label="Quitar destinatario"
                  disabled={stage.recipients.length === 1}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateStage(stage.key, { recipients: [...stage.recipients, emptyRecipient()] })}
              className="ui-link text-sm font-medium"
            >
              + Agregar otro correo en esta etapa
            </button>
          </div>
        </section>
      ))}
      <button
        type="button"
        onClick={() => setStages((current) => [...current, emptyStage(current.length)])}
        className="ui-btn ui-btn-secondary w-full border-dashed sm:w-auto"
      >
        <Plus className="size-4" />
        Agregar etapa
      </button>
      <p className="text-xs text-subtle">
        Cada persona recibe un enlace en su correo. No necesita cuenta ni rol. Las etapas se recorren
        en orden; varios correos en la misma etapa trabajan en paralelo.
      </p>
    </div>
  );
}
