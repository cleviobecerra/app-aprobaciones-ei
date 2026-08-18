import { redirect } from "next/navigation";
import { Stamp } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { homePath } from "@/lib/roles";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect(homePath(user.role));
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between bg-blue-800 p-10 text-white lg:flex">
        <div className="flex items-center gap-3">
          <Stamp className="size-7" />
          <span className="text-lg font-semibold">Aprobaciones</span>
        </div>
        <div className="max-w-md">
          <h1 className="text-4xl leading-tight font-semibold">
            Envía, recorre y cierra flujos de aprobación.
          </h1>
          <p className="mt-4 text-blue-100">
            Escribes el correo de cada persona. Recibe un enlace y aprueba sin crear cuenta ni rol.
          </p>
        </div>
        <p className="text-sm text-blue-200">Admin y solicitante inician sesión. Quien aprueba entra con el enlace del correo.</p>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">Iniciar sesión</h2>
          <p className="mt-1 mb-6 text-sm text-slate-500">
            El administrador crea cuentas. El solicitante envía flujos. Quien aprueba no necesita
            cuenta.
          </p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
