"use client";

import { useActionState } from "react";
import { createRequestAction } from "@/lib/actions/requests";
import { FlowBuilder } from "./flow-builder";

export function NewRequestForm() {
  const [state, action, pending] = useActionState(createRequestAction, null);

  return (
    <form action={action} className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold tracking-wide text-slate-500 uppercase">Solicitud</h2>
        <label className="mb-4 block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Título</span>
          <input
            name="title"
            required
            placeholder="Ej. Contrato de servicios Q3"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-blue-600 focus:ring-2"
          />
        </label>
        <label className="mb-4 block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Descripción</span>
          <textarea
            name="description"
            rows={4}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-blue-600 focus:ring-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Documento (opcional)</span>
          <input
            name="file"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5"
          />
        </label>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">Destinatarios</h2>
        <FlowBuilder />
      </section>

      {state?.error ? (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          name="intent"
          value="draft"
          disabled={pending}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Guardar borrador
        </button>
        <button
          type="submit"
          name="intent"
          value="send"
          disabled={pending}
          className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {pending ? "Enviando…" : "Enviar enlaces por correo"}
        </button>
      </div>
    </form>
  );
}
