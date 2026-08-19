import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/labels";
import { roleLabel } from "@/lib/roles";
import { CreateUserForm } from "./create-user-form";
import { DeleteUserButton } from "./delete-user-button";
import { ResetPasswordButton } from "./reset-password-button";

export default async function UsersPage() {
  const admin = await requireAdmin();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <div>
        <h1 className="ui-page-title">Usuarios</h1>
        <p className="ui-page-desc mb-6">
          El administrador crea cuentas y puede restablecer contraseñas. Quien aprueba no necesita
          cuenta: se invita por correo.
        </p>
        <div className="space-y-3 md:hidden">
          {users.map((user) => (
            <article key={user.id} className="ui-card ui-card-hover">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-fg">{user.name}</p>
                  <p className="break-all text-sm text-muted">{user.email}</p>
                  <p className="mt-1 text-xs text-subtle">
                    {roleLabel[user.role] ?? user.role} · {user.area || "Sin área"} · {formatDate(user.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-start">
                  <ResetPasswordButton userId={user.id} userName={user.name} />
                  <DeleteUserButton
                    userId={user.id}
                    userName={user.name}
                    disabled={user.id === admin.id}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="-mx-4 hidden overflow-x-auto md:mx-0 md:block">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-soft text-subtle">
                <tr>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Correo</th>
                  <th className="px-4 py-3 font-medium">Perfil</th>
                  <th className="px-4 py-3 font-medium">Alta</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-line transition-colors hover:bg-soft">
                    <td className="px-4 py-3">
                      <p className="font-medium text-fg">{user.name}</p>
                      <p className="text-xs text-subtle">{user.area || "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">{user.email}</td>
                    <td className="px-4 py-3">{roleLabel[user.role] ?? user.role}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-subtle">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <ResetPasswordButton userId={user.id} userName={user.name} />
                        <DeleteUserButton
                          userId={user.id}
                          userName={user.name}
                          disabled={user.id === admin.id}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <CreateUserForm />
    </div>
  );
}
