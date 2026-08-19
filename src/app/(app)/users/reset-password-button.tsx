"use client";

import { useEffect, useId, useState } from "react";
import { KeyRound, X } from "lucide-react";
import { resetUserPasswordAction } from "@/lib/actions/users";
import { PasswordInput } from "@/components/password-input";

export function ResetPasswordButton({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const formId = useId();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const password = String(new FormData(form).get("password") || "");
    const confirm = String(new FormData(form).get("confirm") || "");
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      setOk(false);
      return;
    }

    setPending(true);
    setError(null);
    setOk(false);
    const result = await resetUserPasswordAction(userId, password);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setOk(true);
    form.reset();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setError(null);
          setOk(false);
        }}
        className="ui-iconbtn"
        title={`Restablecer contraseña de ${userName}`}
      >
        <KeyRound className="size-4" />
      </button>
      {open ? (
        <div className="fixed inset-0 z-[120] flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-fg/40 backdrop-blur-[2px]"
            aria-label="Cerrar"
            onClick={() => setOpen(false)}
          />
          <div className="ui-card relative z-10 w-full max-w-md p-5 shadow-xl shadow-fg/10 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Restablecer contraseña</h2>
                <p className="mt-1 text-sm text-muted">
                  Asigna una contraseña nueva a <span className="font-medium text-fg">{userName}</span> y
                  entrégasela. La anterior deja de servir de inmediato.
                </p>
              </div>
              <button type="button" className="ui-iconbtn shrink-0" aria-label="Cerrar" onClick={() => setOpen(false)}>
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <label htmlFor={`${formId}-password`} className="ui-label">
                  Contraseña nueva
                </label>
                <PasswordInput
                  id={`${formId}-password`}
                  name="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label htmlFor={`${formId}-confirm`} className="ui-label">
                  Confirmar
                </label>
                <PasswordInput
                  id={`${formId}-confirm`}
                  name="confirm"
                  required
                  placeholder="Repite la contraseña"
                  autoComplete="new-password"
                />
              </div>
              {error ? <p className="ui-alert ui-alert-danger">{error}</p> : null}
              {ok ? (
                <p className="ui-alert ui-alert-success">
                  Contraseña actualizada. Comunícasela a {userName}.
                </p>
              ) : null}
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button type="button" className="ui-btn ui-btn-ghost w-full sm:w-auto" onClick={() => setOpen(false)}>
                  Cerrar
                </button>
                <button type="submit" disabled={pending} className="ui-btn ui-btn-primary w-full sm:w-auto">
                  {pending ? "Guardando…" : "Guardar contraseña"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
