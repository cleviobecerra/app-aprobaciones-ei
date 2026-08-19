"use client";

import { useActionState } from "react";
import { createUserAction } from "@/lib/actions/users";
import { PasswordInput } from "@/components/password-input";
import { UiSelect } from "@/components/ui-select";

export function CreateUserForm() {
  const [state, action, pending] = useActionState(createUserAction, null);

  return (
    <form action={action} className="ui-card space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">Crear cuenta</h2>
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
      <PasswordInput
        id="new-user-password"
        name="password"
        required
        placeholder="Contraseña"
        autoComplete="new-password"
        className="ui-input pr-11"
      />
      {state?.error ? <p className="ui-alert ui-alert-danger">{state.error}</p> : null}
      {state?.ok ? <p className="ui-alert ui-alert-success">Cuenta creada.</p> : null}
      <button type="submit" disabled={pending} className="ui-btn ui-btn-primary w-full sm:w-auto">
        {pending ? "Creando…" : "Crear usuario"}
      </button>
    </form>
  );
}
