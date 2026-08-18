import { notFound } from "next/navigation";
import { FileText, Stamp } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/labels";
import { StatusBadge } from "@/components/status-badge";
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
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <div className="flex size-9 items-center justify-center rounded-xl bg-blue-700 text-white">
            <Stamp className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Aprobaciones</p>
            <p className="text-xs text-slate-500">Acceso por enlace · no necesitas cuenta</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-6 p-4 py-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Solicitud de {request.createdBy.name}</p>
              <h1 className="mt-1 text-2xl font-semibold">{request.title}</h1>
            </div>
            <StatusBadge status={request.status} />
          </div>
          <p className="mt-3 whitespace-pre-wrap text-slate-600">{request.description || "Sin descripción."}</p>
          <p className="mt-4 text-sm text-slate-500">
            Tu etapa: {task.stage.name} · {task.email}
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 font-semibold">Documento</h2>
          {request.storedName ? (
            <div>
              <a href={fileHref} className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline">
                <FileText className="size-4" />
                {request.fileName}
              </a>
              {isPreviewable ? (
                <iframe title={request.fileName ?? "Documento"} src={fileHref} className="mt-4 h-[420px] w-full rounded-xl border border-slate-200" />
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Esta solicitud no tiene archivo adjunto.</p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 font-semibold">Tu decisión</h2>
          {canDecide ? (
            <PublicDecisionForm token={token} />
          ) : task.status === "WAITING" ? (
            <p className="text-sm text-slate-600">
              Todavía no es tu turno. Te llegará un correo cuando la etapa anterior termine.
            </p>
          ) : (
            <p className="text-sm text-slate-600">
              Esta revisión ya no está pendiente
              {task.actedAt ? ` · ${formatDate(task.actedAt)}` : ""}.
              {task.comment ? ` Comentario: ${task.comment}` : ""}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
