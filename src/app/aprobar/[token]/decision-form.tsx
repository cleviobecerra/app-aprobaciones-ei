"use client";

import { useActionState, useState } from "react";
import { decideByTokenAction } from "@/lib/actions/requests";

export function PublicDecisionForm({ token }: { token: string }) {
  const [comment, setComment] = useState("");
  const [state, action, pending] = useActionState(decideByTokenAction, null);

  if (state && "ok" in state) {
    return (
      <p className="rounded-xl bg-emerald-50 px-3 py-3 text-sm font-medium text-emerald-800">
        Listo. Tu decisión quedó registrada.
      </p>
    );
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
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-blue-600 focus:ring-2"
      />
      <div className="flex gap-2">
        <button
          name="decision"
          value="APPROVED"
          disabled={pending}
          className="flex-1 rounded-xl bg-emerald-700 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          Aprobar
        </button>
        <button
          name="decision"
          value="REJECTED"
          disabled={pending}
          className="flex-1 rounded-xl bg-rose-700 px-3 py-2.5 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-60"
        >
          Rechazar
        </button>
      </div>
      {state && "error" in state && state.error ? (
        <p className="text-sm text-rose-700">{state.error}</p>
      ) : null}
    </form>
  );
}
