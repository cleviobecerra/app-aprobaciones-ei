"use client";

import { useEffect, useId, useState } from "react";
import { Pencil, X } from "lucide-react";
import { updateUserAction } from "@/lib/actions/users";
import { UiSelect } from "@/components/ui-select";

const roleOptions = [
  { value: "SOLICITANTE", label: "Solicitante" },
  { value: "AUDITOR", label: "Auditor" },
  { value: "ADMIN", label: "Administrador" },
];

export function EditUserButton({
  user,
}: {
  user: { id: string; name: string; email: string; area: string; role: string };
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
    const data = new FormData(form);
    setPending(true);
    setError(null);
    setOk(false);
    const result = await updateUserAction(user.id, {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      area: String(data.get("area") || ""),
      role: String(data.get("role") || ""),
    });
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setOk(true);
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
        title={`Editar datos de ${user.name}`}
      >
        <Pencil className="size-4" />
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
                <h2 className="text-lg font-semibold tracking-tight">Editar usuario</h2>
                <p className="mt-1 text-sm text-muted">
                  Actualiza nombre, correo, área o perfil de{" "}
                  <span className="font-medium text-fg">{user.name}</span>.
                </p>
              </div>
              <button type="button" className="ui-iconbtn shrink-0" aria-label="Cerrar" onClick={() => setOpen(false)}>
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <label htmlFor={`${formId}-name`} className="ui-label">
                  Nombre
                </label>
                <input
                  id={`${formId}-name`}
                  name="name"
                  required
                  defaultValue={user.name}
                  className="ui-input"
                />
              </div>
              <div>
                <label htmlFor={`${formId}-email`} className="ui-label">
                  Correo
                </label>
                <input
                  id={`${formId}-email`}
                  name="email"
                  type="email"
                  required
                  defaultValue={user.email}
                  className="ui-input"
                />
              </div>
              <div>
                <label htmlFor={`${formId}-area`} className="ui-label">
                  Área
                </label>
                <input id={`${formId}-area`} name="area" defaultValue={user.area} className="ui-input" />
              </div>
              <div>
                <span className="ui-label">Perfil</span>
                <UiSelect name="role" defaultValue={user.role} options={roleOptions} />
              </div>
              {error ? <p className="ui-alert ui-alert-danger">{error}</p> : null}
              {ok ? <p className="ui-alert ui-alert-success">Datos actualizados.</p> : null}
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button type="button" className="ui-btn ui-btn-ghost w-full sm:w-auto" onClick={() => setOpen(false)}>
                  Cerrar
                </button>
                <button type="submit" disabled={pending} className="ui-btn ui-btn-primary w-full sm:w-auto">
                  {pending ? "Guardando…" : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
