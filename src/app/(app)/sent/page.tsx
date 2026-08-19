import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { RequestInbox } from "@/components/request-inbox";
import { homePath, isAuditor } from "@/lib/roles";

export default async function SentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  if (isAuditor(user.role)) redirect(homePath(user.role));
  const params = await searchParams;

  return (
    <RequestInbox
      title="Mis solicitudes"
      description="Todas las solicitudes que creaste. Filtra por texto, estado o fecha para encontrarlas más rápido."
      basePath="/sent"
      searchParams={params}
      scope={{ createdById: user.id }}
      showCreator={false}
      emptyLabel="Todavía no has creado solicitudes."
      action={{ href: "/requests/new", label: "Nueva solicitud" }}
    />
  );
}
