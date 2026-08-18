"use client";

import { useState } from "react";
import { cancelAction, resendInviteAction, sendDraftAction } from "@/lib/actions/requests";

export function ActionsPanel({
  requestId,
  status,
  isOwner,
}: {
  requestId: string;
  status: string;
  isOwner: boolean;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(callback: () => Promise<{ error?: string }>) {
    setBusy(true);
    setMessage(null);
    const result = await callback();
    if (result.error) setMessage(result.error);
    setBusy(false);
  }

  if (!isOwner) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
        Solo el autor puede enviar o cancelar esta solicitud. Los destinatarios entran con el enlace
        de su correo.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="font-semibold">Acciones</h2>
      {status === "DRAFT" ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => run(() => sendDraftAction(requestId))}
          className="w-full rounded-xl bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          Enviar enlaces por correo
        </button>
      ) : null}
      {status === "IN_PROGRESS" ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => run(() => resendInviteAction(requestId))}
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Reenviar correos pendientes
        </button>
      ) : null}
      {status === "DRAFT" || status === "IN_PROGRESS" ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => run(() => cancelAction(requestId))}
          className="w-full rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
        >
          Cancelar solicitud
        </button>
      ) : null}
      {message ? <p className="text-sm text-rose-700">{message}</p> : null}
    </div>
  );
}
