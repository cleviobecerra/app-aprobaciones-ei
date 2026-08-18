"use client";

import { useActionState } from "react";
import { createUserAction } from "@/lib/actions/users";
import { PasswordInput } from "@/components/password-input";

export function CreateUserForm() {
  const [state, action, pending] = useActionState(createUserAction, null);

  return (
    <form action={action} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="font-semibold">Crear cuenta</h2>
      <input
        name="name"
        required
        placeholder="Nombre"
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-blue-600 focus:ring-2"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="correo@empresa.com"
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-blue-600 focus:ring-2"
      />
      <input
        name="area"
        placeholder="Área"
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-blue-600 focus:ring-2"
      />
      <select
        name="role"
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-blue-600 focus:ring-2"
        defaultValue="SOLICITANTE"
      >
        <option value="SOLICITANTE">Solicitante</option>
        <option value="ADMIN">Administrador</option>
      </select>
      <PasswordInput
        id="new-user-password"
        name="password"
        required
        placeholder="Contraseña"
        autoComplete="new-password"
        className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-11 pl-3 text-sm outline-none ring-blue-600 focus:ring-2"
      />
      {state?.error ? <p className="text-sm text-rose-700">{state.error}</p> : null}
      {state?.ok ? <p className="text-sm text-emerald-700">Cuenta creada.</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
      >
        {pending ? "Creando…" : "Crear usuario"}
      </button>
    </form>
  );
}
