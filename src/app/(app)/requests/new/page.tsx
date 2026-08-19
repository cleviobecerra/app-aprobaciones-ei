import { requireUser } from "@/lib/auth";
import { NewRequestForm } from "./new-request-form";
import { canCreateRequests, homePath } from "@/lib/roles";
import { redirect } from "next/navigation";

export default async function NewRequestPage() {
  const user = await requireUser();
  if (!canCreateRequests(user.role)) redirect(homePath(user.role));

  return (
    <div className="max-w-3xl">
      <h1 className="ui-page-title">Nueva solicitud</h1>
      <p className="ui-page-desc mb-6">
        Escribe los correos de quienes deben aprobar. Cada persona recibe un enlace; no necesita
        cuenta ni rol.
      </p>
      <NewRequestForm />
    </div>
  );
}
