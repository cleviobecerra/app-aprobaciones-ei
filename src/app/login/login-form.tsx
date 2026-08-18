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
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue="ana.garcia@eisa.local"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-blue-600 focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
          Contraseña
        </label>
        <PasswordInput id="password" name="password" required defaultValue="demo1234" autoComplete="current-password" />
      </div>
      {state?.error ? (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
      >
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
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left hover:border-blue-200 hover:bg-blue-50"
          >
            <span className="block text-sm font-medium text-slate-800">{demo.label}</span>
            <span className="text-xs text-slate-500">{demo.hint}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500">Contraseña de ambos: demo1234</p>
    </form>
  );
}
