import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { RequestCard } from "@/components/request-card";
import { displayName } from "@/lib/tokens";

export default async function SentPage() {
  const user = await requireUser();
  const requests = await prisma.approvalRequest.findMany({
    where: { createdById: user.id },
    include: {
      createdBy: true,
      stages: { include: { tasks: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Enviadas</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">Solicitudes que creaste y su estado actual.</p>
      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          Todavía no has creado solicitudes.
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
