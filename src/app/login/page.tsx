import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { homePath } from "@/lib/roles";
import { BrandMark } from "@/components/brand-mark";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect(homePath(user.role));
  return (
    <main className="login-mesh flex min-h-dvh flex-col items-center justify-center px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="mb-8 flex flex-col items-center text-center">
        <BrandMark size="lg" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Aprobaciones</h1>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Envía un flujo, recorre cada etapa y cierra la solicitud. Quien aprueba entra con el enlace
          del correo.
        </p>
      </div>
      <div className="ui-card w-full max-w-md p-5 shadow-xl shadow-fg/5 sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight">Iniciar sesión</h2>
        <p className="ui-page-desc mb-6">
          El administrador crea cuentas. El solicitante envía flujos. Quien aprueba no necesita
          cuenta.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
