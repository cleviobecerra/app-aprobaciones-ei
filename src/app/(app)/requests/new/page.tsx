import { requireUser } from "@/lib/auth";
import { NewRequestForm } from "./new-request-form";

export default async function NewRequestPage() {
  await requireUser();

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
