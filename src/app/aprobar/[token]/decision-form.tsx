"use client";

import { useActionState, useState } from "react";
import { decideByTokenAction } from "@/lib/actions/requests";

export function PublicDecisionForm({ token }: { token: string }) {
  const [comment, setComment] = useState("");
  const [state, action, pending] = useActionState(decideByTokenAction, null);

  if (state && "ok" in state) {
    return <p className="ui-alert ui-alert-success font-medium">Listo. Tu decisión quedó registrada.</p>;
  }

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="token" value={token} />
      <textarea
        name="comment"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        rows={3}
        placeholder="Comentario (obligatorio al rechazar)"
        className="ui-input"
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <button name="decision" value="APPROVED" disabled={pending} className="ui-btn ui-btn-success w-full sm:flex-1">
          Aprobar
        </button>
        <button name="decision" value="REJECTED" disabled={pending} className="ui-btn ui-btn-danger w-full sm:flex-1">
          Rechazar
        </button>
      </div>
      {state && "error" in state && state.error ? (
        <p className="ui-alert ui-alert-danger">{state.error}</p>
      ) : null}
    </form>
  );
}
