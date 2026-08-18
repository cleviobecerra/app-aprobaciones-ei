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
      <h1 className="text-2xl font-semibold">Correos y enlaces</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        Solo el administrador puede ver y abrir los enlaces de acceso enviados a los destinatarios.
      </p>
      {emails.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          Todavía no se generó ningún correo.
        </div>
      ) : (
        <div className="space-y-3">
          {emails.map((email) => (
            <article key={email.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{email.subject}</p>
                  <p className="text-sm text-slate-500">
                    Para {email.toName || email.toEmail} · {email.toEmail}
                  </p>
                  <p className="text-xs text-slate-400">{email.request.title}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    email.delivered ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
                  }`}
                >
                  {email.delivered ? "Enviado" : "No enviado"}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400">{formatDate(email.createdAt)}</p>
              {email.error ? <p className="mt-1 text-xs text-rose-700">{email.error}</p> : null}
              <a
                href={(() => {
                  try {
                    return new URL(email.accessUrl).pathname;
                  } catch {
                    return email.accessUrl;
                  }
                })()}
                className="mt-3 inline-flex text-sm font-medium text-blue-700 hover:underline"
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
