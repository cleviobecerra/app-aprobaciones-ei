import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { RequestCard } from "@/components/request-card";
import { displayName } from "@/lib/tokens";

export default async function AllRequestsPage() {
  await requireAdmin();
  const requests = await prisma.approvalRequest.findMany({
    include: {
      createdBy: true,
      stages: { include: { tasks: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Todas las solicitudes</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">Vista del administrador sobre lo enviado por los solicitantes.</p>
      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          No hay solicitudes todavía.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {requests.map((request) => {
            const waiting = request.stages
              .flatMap((stage) => stage.tasks)
              .filter((task) => task.status === "PENDING")
              .map((task) => displayName(task.name, task.email));
            return (
              <RequestCard
                key={request.id}
                id={request.id}
                title={request.title}
                status={request.status}
                createdBy={request.createdBy.name}
                createdAt={request.createdAt}
                waitingOn={waiting.length ? waiting.join(", ") : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
