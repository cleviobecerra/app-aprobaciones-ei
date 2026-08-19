"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { PasswordInput } from "@/components/password-input";

const demos = [
  { email: "admin@eisa.local", label: "Administrador", hint: "Crea cuentas" },
  { email: "ana.garcia@eisa.local", label: "Solicitante", hint: "Envía aprobaciones" },
];

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="ui-label">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue="ana.garcia@eisa.local"
          className="ui-input"
        />
      </div>
      <div>
        <label htmlFor="password" className="ui-label">
          Contraseña
        </label>
        <PasswordInput id="password" name="password" required defaultValue="demo1234" autoComplete="current-password" />
      </div>
      {state?.error ? <p className="ui-alert ui-alert-danger">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="ui-btn ui-btn-primary ui-btn-block">
        {pending ? "Ingresando…" : "Entrar"}
      </button>
      <div className="grid grid-cols-2 gap-2">
        {demos.map((demo) => (
          <button
            key={demo.email}
            type="button"
            onClick={() => {
              const email = document.getElementById("email") as HTMLInputElement | null;
              const password = document.getElementById("password") as HTMLInputElement | null;
              if (email) email.value = demo.email;
              if (password) password.value = "demo1234";
            }}
            className="rounded-xl border border-line bg-soft px-3 py-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50"
          >
            <span className="block text-sm font-medium">{demo.label}</span>
            <span className="text-xs text-subtle">{demo.hint}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-subtle">Contraseña de ambos: demo1234</p>
    </form>
  );
}
