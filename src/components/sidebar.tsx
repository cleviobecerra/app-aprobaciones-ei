"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FilePlus2, Inbox, LogOut, Send, Settings, Stamp, Users } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { initials } from "@/lib/labels";
import { isAdmin, roleLabel } from "@/lib/roles";

export function Sidebar({
  user,
}: {
  user: { name: string; email: string; area: string; role: string };
}) {
  const pathname = usePathname();
  const admin = isAdmin(user.role);
  const nav = admin
    ? [
        { href: "/users", label: "Usuarios", icon: Users },
        { href: "/admin-requests", label: "Solicitudes", icon: Inbox },
        { href: "/inbox", label: "Enlaces de acceso", icon: Send },
        { href: "/settings", label: "Correo SMTP", icon: Settings },
      ]
    : [
        { href: "/sent", label: "Enviadas", icon: Send },
        { href: "/requests/new", label: "Nueva solicitud", icon: FilePlus2 },
      ];

  return (
    <aside className="flex w-full flex-col border-b border-slate-200 bg-white lg:h-screen lg:w-72 lg:border-r lg:border-b-0">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-700 text-white">
          <Stamp className="size-5" />
        </div>
        <div>
          <p className="font-semibold tracking-tight">Aprobaciones</p>
          <p className="text-xs text-slate-500">{roleLabel[user.role] ?? user.role}</p>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap ${
                active ? "bg-blue-50 text-blue-800" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
            {initials(user.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.area || user.email}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            title="Cerrar sesión"
          >
            <LogOut className="size-4" />
          </button>
        </form>
      </div>
    </aside>
  );
}
