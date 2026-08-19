"use client";

import { useActionState } from "react";
import { createRequestAction } from "@/lib/actions/requests";
import { FlowBuilder } from "./flow-builder";

export function NewRequestForm() {
  const [state, action, pending] = useActionState(createRequestAction, null);

  return (
    <form action={action} className="space-y-6">
      <section className="ui-card">
        <h2 className="mb-4 text-xs font-medium tracking-[0.08em] text-subtle uppercase">Solicitud</h2>
        <label className="mb-4 block text-sm">
          <span className="ui-label">Título</span>
          <input
            name="title"
            required
            placeholder="Ej. Contrato de servicios Q3"
            className="ui-input"
          />
        </label>
        <label className="mb-4 block text-sm">
          <span className="ui-label">Descripción</span>
          <textarea
            name="description"
            rows={4}
            className="ui-input"
          />
        </label>
        <label className="block text-sm">
          <span className="ui-label">Documento (opcional)</span>
          <input
            name="file"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
            className="ui-input file:mr-3 file:rounded-lg file:border-0 file:bg-soft file:px-3 file:py-1.5"
          />
        </label>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-medium tracking-[0.08em] text-subtle uppercase">Destinatarios</h2>
        <FlowBuilder />
      </section>

      {state?.error ? (
        <p className="ui-alert ui-alert-danger">{state.error}</p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="submit"
          name="intent"
          value="draft"
          disabled={pending}
          className="ui-btn ui-btn-secondary w-full sm:w-auto"
        >
          Guardar borrador
        </button>
        <button
          type="submit"
          name="intent"
          value="send"
          disabled={pending}
          className="ui-btn ui-btn-primary w-full sm:w-auto"
        >
          {pending ? "Enviando…" : "Enviar enlaces por correo"}
        </button>
      </div>
    </form>
  );
}
