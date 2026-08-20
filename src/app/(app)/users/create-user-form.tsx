"use client";

import { useActionState, useEffect, useState } from "react";
import { createUserAction } from "@/lib/actions/users";
import { PasswordInput } from "@/components/password-input";
import { UiSelect } from "@/components/ui-select";

export function CreateUserForm() {
  const [state, action, pending] = useActionState(createUserAction, null);
  const [formKey, setFormKey] = useState(0);
  const [notice, setNotice] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (state?.ok) {
      setFormKey((key) => key + 1);
      setFading(false);
      setNotice({ type: "ok", text: "Cuenta creada." });
      const fadeTimer = window.setTimeout(() => setFading(true), 5000);
      const hideTimer = window.setTimeout(() => {
        setNotice(null);
        setFading(false);
      }, 6200);
      return () => {
        window.clearTimeout(fadeTimer);
        window.clearTimeout(hideTimer);
      };
    }
    if (state?.error) {
      setFading(false);
      setNotice({ type: "error", text: state.error });
    }
  }, [state]);

  return (
    <form action={action} className="ui-card space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">Crear cuenta</h2>
      <div key={formKey} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <input name="name" required placeholder="Nombre" className="ui-input" />
        <input name="email" type="email" required placeholder="correo@empresa.com" className="ui-input" />
        <input name="area" placeholder="Área" className="ui-input" />
        <UiSelect
          name="role"
          defaultValue="SOLICITANTE"
          options={[
            { value: "SOLICITANTE", label: "Solicitante" },
            { value: "AUDITOR", label: "Auditor" },
            { value: "ADMIN", label: "Administrador" },
          ]}
        />
        <div className="sm:col-span-2 lg:col-span-1">
          <PasswordInput
            id="new-user-password"
            name="password"
            required
            placeholder="Contraseña"
            autoComplete="new-password"
            className="ui-input pr-11"
          />
        </div>
      </div>
      {notice?.type === "error" ? <p className="ui-alert ui-alert-danger">{notice.text}</p> : null}
      {notice?.type === "ok" ? (
        <p
          className={`ui-alert ui-alert-success transition-opacity duration-1000 ease-out ${
            fading ? "opacity-0" : "opacity-100"
          }`}
        >
          {notice.text}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="ui-btn ui-btn-primary w-full sm:w-auto">
        {pending ? "Creando…" : "Crear usuario"}
      </button>
    </form>
  );
}
