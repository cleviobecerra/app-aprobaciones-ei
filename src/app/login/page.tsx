import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getLoginShortcuts } from "@/lib/bootstrap";
import { homePath, ROLES } from "@/lib/roles";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppFooter } from "@/components/app-footer";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect(homePath(user.role));
  const shortcuts = await getLoginShortcuts();
  const defaultEmail =
    shortcuts.find((item) => item.role === ROLES.SOLICITANTE)?.email ?? shortcuts[0]?.email ?? "";
  return (
    <main className="login-mesh relative flex min-h-dvh flex-col">
      <div className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3">
        <ThemeToggle />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
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
          <LoginForm shortcuts={shortcuts} defaultEmail={defaultEmail} />
        </div>
      </div>
      <AppFooter />
    </main>
  );
}
