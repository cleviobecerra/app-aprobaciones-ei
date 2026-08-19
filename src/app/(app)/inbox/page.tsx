import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/labels";
import { isAdmin } from "@/lib/roles";
import { redirect } from "next/navigation";

export default async function InboxPage() {
  const user = await requireUser();
  if (!isAdmin(user.role)) redirect("/sent");

  const emails = await prisma.outboundEmail.findMany({
    include: { request: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="ui-page-title">Correos y enlaces</h1>
      <p className="ui-page-desc mb-6">
        Solo el administrador puede ver y abrir los enlaces de acceso enviados a los destinatarios.
      </p>
      {emails.length === 0 ? (
        <div className="ui-empty">
          Todavía no se generó ningún correo.
        </div>
      ) : (
        <div className="space-y-3">
          {emails.map((email) => (
            <article key={email.id} className="ui-card ui-card-hover">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-fg">{email.subject}</p>
                  <p className="text-sm text-subtle">
                    Para {email.toName || email.toEmail} · {email.toEmail}
                  </p>
                  <p className="text-xs text-subtle">{email.request.title}</p>
                </div>
                <span
                  className={`ui-chip ${
                    email.delivered ? "bg-success-50 text-success-700" : "bg-warning-50 text-warning-700"
                  }`}
                >
                  {email.delivered ? "Enviado" : "No enviado"}
                </span>
              </div>
              <p className="mt-2 text-xs text-subtle">{formatDate(email.createdAt)}</p>
              {email.error ? <p className="mt-1 text-xs text-danger-700">{email.error}</p> : null}
              <a
                href={(() => {
                  try {
                    return new URL(email.accessUrl).pathname;
                  } catch {
                    return email.accessUrl;
                  }
                })()}
                className="ui-link mt-3 inline-flex text-sm font-medium"
              >
                Abrir enlace de aprobación
              </a>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
