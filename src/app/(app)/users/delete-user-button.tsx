"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteUserAction } from "@/lib/actions/users";

export function DeleteUserButton({
  userId,
  userName,
  disabled,
}: {
  userId: string;
  userName: string;
  disabled?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onDelete() {
    if (disabled) return;
    const confirmed = window.confirm(
      `¿Eliminar la cuenta de ${userName}? También se borrarán sus solicitudes.`,
    );
    if (!confirmed) return;

    setPending(true);
    setError(null);
    const result = await deleteUserAction(userId);
    if (result.error) setError(result.error);
    setPending(false);
  }

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={onDelete}
        disabled={disabled || pending}
        title={disabled ? "No puedes eliminar tu propia cuenta" : "Eliminar cuenta"}
        className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
      >
        <Trash2 className="size-4" />
      </button>
      {error ? <p className="mt-1 text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
