import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MailSettingsForm } from "./mail-settings-form";

export default async function SettingsPage() {
  await requireAdmin();
  const saved = await (async () => {
    try {
      return (await prisma.mailSettings?.findUnique?.({ where: { id: "default" } })) ?? null;
    } catch {
      return null;
    }
  })();

  return (
    <div className="max-w-xl">
      <h1 className="ui-page-title">Correo SMTP</h1>
      <p className="ui-page-desc mb-6">
        Sin esto, el enlace se guarda en la app pero no llega a Gmail ni Outlook. En Gmail usa una
        contraseña de aplicación. En Microsoft 365 usa tu correo corporativo.
      </p>
      <MailSettingsForm
        saved={
          saved
            ? {
                host: saved.host,
                port: saved.port,
                secure: saved.secure,
                username: saved.username,
                fromEmail: saved.fromEmail,
                fromName: saved.fromName,
                hasPassword: Boolean(saved.password),
              }
            : null
        }
      />
    </div>
  );
}
