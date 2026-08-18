import { requireUser } from "@/lib/auth";
import { NewRequestForm } from "./new-request-form";

export default async function NewRequestPage() {
  await requireUser();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Nueva solicitud</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        Escribe los correos de quienes deben aprobar. Cada persona recibe un enlace; no necesita
        cuenta ni rol.
      </p>
      <NewRequestForm />
    </div>
  );
}
