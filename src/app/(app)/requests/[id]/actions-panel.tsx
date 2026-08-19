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
      <div className="ui-card text-sm text-subtle">
        Solo el autor puede enviar o cancelar esta solicitud. Los destinatarios entran con el enlace
        de su correo.
      </div>
    );
  }

  return (
    <div className="ui-card space-y-3">
      <h2 className="font-medium">Acciones</h2>
      {status === "DRAFT" ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => run(() => sendDraftAction(requestId))}
          className="ui-btn ui-btn-primary ui-btn-block"
        >
          Enviar enlaces por correo
        </button>
      ) : null}
      {status === "IN_PROGRESS" ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => run(() => resendInviteAction(requestId))}
          className="ui-btn ui-btn-secondary ui-btn-block"
        >
          Reenviar correos pendientes
        </button>
      ) : null}
      {status === "DRAFT" || status === "IN_PROGRESS" ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => run(() => cancelAction(requestId))}
          className="ui-btn ui-btn-danger ui-btn-block"
        >
          Cancelar solicitud
        </button>
      ) : null}
      {message ? <p className="ui-alert ui-alert-danger">{message}</p> : null}
    </div>
  );
}
