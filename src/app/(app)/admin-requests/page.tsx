import { requireAdmin } from "@/lib/auth";
import { RequestInbox } from "@/components/request-inbox";

export default async function AllRequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;

  return (
    <RequestInbox
      title="Todas las solicitudes"
      description="Vista de administrador: todas las solicitudes del sistema, con filtros de búsqueda, estado, fecha y solicitante."
      basePath="/admin-requests"
      searchParams={params}
      showCreator
      emptyLabel="No hay solicitudes todavía."
    />
  );
}
