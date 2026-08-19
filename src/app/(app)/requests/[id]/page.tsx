import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isMailConfigured } from "@/lib/mail";
import { auditActionLabel, formatDate, taskStatusLabel } from "@/lib/labels";
import { StatusBadge } from "@/components/status-badge";
import { FlowTimeline } from "@/components/flow-timeline";
import { canCreateRequests, canSeeAccessLinks, canViewAllRequests, isAuditor } from "@/lib/roles";
import { InviteLinks } from "@/components/invite-links";
import { ActionsPanel } from "./actions-panel";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const request = await prisma.approvalRequest.findFirst({
    where: canViewAllRequests(user.role) ? { id } : { id, createdById: user.id },
    include: {
      createdBy: true,
      stages: {
        orderBy: { order: "asc" },
        include: {
          tasks: { orderBy: { email: "asc" } },
        },
      },
      auditEvents: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!request) notFound();

  const pendingInvites = request.stages.flatMap((stage) =>
    stage.tasks.map((task) => ({
      id: task.id,
      email: task.email,
      name: task.name,
      accessToken: task.accessToken,
      status: task.status,
    })),
  );

  const isPreviewable = Boolean(
    request.storedName && request.mimeType && (request.mimeType.startsWith("image/") || request.mimeType === "application/pdf"),
  );
  const smtpReady = canSeeAccessLinks(user.role) ? await isMailConfigured() : false;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="space-y-6">
        <header className="ui-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-subtle">Solicitud</p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight break-words sm:text-2xl">{request.title}</h1>
            </div>
            <StatusBadge status={request.status} />
          </div>
          <p className="mt-3 whitespace-pre-wrap text-muted">{request.description || "Sin descripción."}</p>
          <p className="mt-4 text-sm text-subtle">
            Creada por {request.createdBy.name} · {formatDate(request.createdAt)}
          </p>
        </header>

        <section className="ui-card">
          <h2 className="mb-4 font-semibold">Documento</h2>
          {request.storedName ? (
            <div>
              <a
                href={`/api/files/${request.id}`}
                download={request.fileName ?? true}
                className="ui-link inline-flex items-center gap-2 text-sm font-medium"
              >
                <FileText className="size-4" />
                {request.fileName}
              </a>
              {isPreviewable ? (
                <iframe
                  title={request.fileName ?? "Documento"}
                  src={`/api/files/${request.id}`}
                  className="mt-4 h-[240px] w-full rounded-2xl border border-line sm:h-[360px] lg:h-[480px]"
                />
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-subtle">Esta solicitud no tiene archivo adjunto.</p>
          )}
        </section>

        <section className="ui-card">
          <h2 className="mb-2 font-semibold">Pista de auditoría</h2>
          <ol className="space-y-3">
            {request.auditEvents.map((event) => (
              <li key={event.id} className="border-l-2 border-line pl-3">
                <p className="text-sm font-medium text-fg">
                  {event.actorName || event.actorEmail || "Sistema"} · {auditActionLabel[event.action] ?? event.action}
                </p>
                <p className="text-sm text-muted">{event.detail}</p>
                <p className="text-xs text-subtle">{formatDate(event.createdAt)}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <aside className="space-y-6">
        <ActionsPanel
          requestId={request.id}
          status={request.status}
          isOwner={canCreateRequests(user.role) && request.createdById === user.id}
          readOnly={isAuditor(user.role)}
        />
        {canSeeAccessLinks(user.role) ? (
          <section className="ui-card">
            <h2 className="mb-1 font-semibold">Enlaces de acceso</h2>
            <p className="mb-4 text-xs text-subtle">
              {smtpReady
                ? "También se enviaron por correo a cada destinatario de la etapa actual."
                : "El correo aún no sale: configura SMTP en Correo SMTP. Mientras tanto puedes abrir el enlace aquí."}
            </p>
            <InviteLinks invites={pendingInvites} />
          </section>
        ) : (
          <section className="ui-card">
            <h2 className="mb-1 font-semibold">Destinatarios</h2>
            {isAuditor(user.role) ? (
              pendingInvites.length === 0 ? (
                <p className="text-sm text-muted">Esta solicitud no tiene destinatarios.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {pendingInvites.map((invite) => (
                    <li key={invite.id} className="flex flex-col gap-0.5">
                      <span className="font-medium text-fg">{invite.name || invite.email}</span>
                      <span className="text-muted">{invite.email}</span>
                      <span className="text-xs text-subtle">{taskStatusLabel[invite.status] ?? invite.status}</span>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <p className="text-sm text-muted">
                El enlace de aprobación solo llega al correo de cada persona. El solicitante no puede
                verlo ni copiarlo.
              </p>
            )}
          </section>
        )}
        <section className="ui-card bg-soft/50">
          <h2 className="mb-4 font-semibold">Flujo</h2>
          <FlowTimeline stages={request.stages} currentStage={request.currentStage} />
        </section>
      </aside>
    </div>
  );
}
