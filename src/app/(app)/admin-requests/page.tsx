import { requireAllRequestsAccess } from "@/lib/auth";
import { RequestInbox } from "@/components/request-inbox";
import { canCreateRequests, isAuditor } from "@/lib/roles";

export default async function AllRequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAllRequestsAccess();
  const params = await searchParams;

  return (
    <RequestInbox
      title="Todas las solicitudes"
      description={
        isAuditor(user.role)
          ? "Vista de auditoría: todas las solicitudes del sistema, con filtros de búsqueda, estado, fecha y solicitante."
          : "Vista de administrador: todas las solicitudes del sistema, con filtros de búsqueda, estado, fecha y solicitante."
      }
      basePath="/admin-requests"
      searchParams={params}
      showCreator
      emptyLabel="No hay solicitudes todavía."
      action={
        canCreateRequests(user.role) ? { href: "/requests/new", label: "Nueva solicitud" } : undefined
      }
    />
  );
}
