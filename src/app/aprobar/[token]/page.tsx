import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/labels";
import { StatusBadge } from "@/components/status-badge";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppFooter } from "@/components/app-footer";
import { PublicDecisionForm } from "./decision-form";

export default async function PublicApprovePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const task = await prisma.approvalTask.findUnique({
    where: { accessToken: token },
    include: {
      stage: {
        include: {
          request: { include: { createdBy: true } },
        },
      },
    },
  });

  if (!task) notFound();

  const request = task.stage.request;
  const canDecide = task.status === "PENDING" && request.status === "IN_PROGRESS";
  const isPreviewable = Boolean(
    request.storedName && request.mimeType && (request.mimeType.startsWith("image/") || request.mimeType === "application/pdf"),
  );
  const fileHref = `/api/files/${request.id}?token=${encodeURIComponent(token)}`;

  return (
    <main className="login-mesh flex min-h-dvh flex-col">
      <header className="border-b border-line/80 bg-surface/80 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4">
          <BrandMark size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold tracking-tight">Aprobaciones</p>
            <p className="text-xs text-subtle">Acceso por enlace · no necesitas cuenta</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto max-w-3xl flex-1 space-y-6 p-4 py-6 sm:py-8">
        <section className="ui-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-subtle">Solicitud de {request.createdBy.name}</p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight break-words sm:text-2xl">{request.title}</h1>
            </div>
            <StatusBadge status={request.status} />
          </div>
          <p className="mt-3 whitespace-pre-wrap text-muted">{request.description || "Sin descripción."}</p>
          <p className="mt-4 text-sm text-subtle">
            Tu etapa: {task.stage.name} · {task.email}
          </p>
        </section>

        <section className="ui-card">
          <h2 className="mb-4 font-semibold">Documento</h2>
          {request.storedName ? (
            <div>
              <a href={fileHref} download={request.fileName ?? true} className="ui-link inline-flex items-center gap-2 text-sm font-medium">
                <FileText className="size-4" />
                {request.fileName}
              </a>
              {isPreviewable ? (
                <iframe title={request.fileName ?? "Documento"} src={fileHref} className="mt-4 h-[240px] w-full rounded-2xl border border-line sm:h-[360px] lg:h-[420px]" />
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-subtle">Esta solicitud no tiene archivo adjunto.</p>
          )}
        </section>

        <section className="ui-card">
          <h2 className="mb-4 font-semibold">Tu decisión</h2>
          {canDecide ? (
            <PublicDecisionForm token={token} />
          ) : task.status === "WAITING" ? (
            <p className="text-sm text-muted">
              Todavía no es tu turno. Te llegará un correo cuando la etapa anterior termine.
            </p>
          ) : (
            <p className="text-sm text-muted">
              Esta revisión ya no está pendiente
              {task.actedAt ? ` · ${formatDate(task.actedAt)}` : ""}.
              {task.comment ? ` Comentario: ${task.comment}` : ""}
            </p>
          )}
        </section>
      </div>
      <AppFooter />
    </main>
  );
}
