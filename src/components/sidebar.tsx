"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FilePlus2, Inbox, LogOut, Menu, Send, Settings, Users, X } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { initials } from "@/lib/labels";
import { isAdmin, roleLabel } from "@/lib/roles";
import { BrandMark } from "@/components/brand-mark";

export function Sidebar({
  user,
}: {
  user: { name: string; email: string; area: string; role: string };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const admin = isAdmin(user.role);
  const nav = admin
    ? [
        { href: "/users", label: "Usuarios", icon: Users },
        { href: "/admin-requests", label: "Solicitudes", icon: Inbox },
        { href: "/inbox", label: "Enlaces de acceso", icon: Send },
        { href: "/settings", label: "Correo SMTP", icon: Settings },
      ]
    : [
        { href: "/sent", label: "Mis solicitudes", icon: Send },
        { href: "/requests/new", label: "Nueva solicitud", icon: FilePlus2 },
      ];

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const brand = (
    <div className="flex min-w-0 items-center gap-3">
      <BrandMark />
      <div className="min-w-0">
        <p className="truncate text-[17px] font-semibold tracking-tight">Aprobaciones</p>
        <p className="truncate text-xs text-subtle">{roleLabel[user.role] ?? user.role}</p>
      </div>
    </div>
  );

  const links = (
    <nav className="flex flex-col gap-1 px-3">
      {nav.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors ${
              active
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:bg-soft hover:text-fg"
            }`}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const account = (
    <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-soft text-xs font-semibold text-muted">
          {initials(user.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-subtle">{user.area || user.email}</p>
        </div>
      </div>
      <form action={logoutAction}>
        <button type="submit" className="ui-iconbtn" title="Cerrar sesión">
          <LogOut className="size-4" />
        </button>
      </form>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-[100] flex min-h-16 items-center justify-between gap-3 border-b border-line/80 bg-surface/80 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-md lg:hidden">
        {brand}
        <button
          type="button"
          className="ui-iconbtn"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      {open ? (
        <div className="fixed inset-0 z-[110] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-fg/40 backdrop-blur-[2px]"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
          />
          <aside className="relative flex h-full w-[min(100%,280px)] flex-col bg-surface shadow-2xl">
            <div className="flex h-16 items-center justify-between gap-3 px-4">
              {brand}
              <button type="button" className="ui-iconbtn" aria-label="Cerrar menú" onClick={() => setOpen(false)}>
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">{links}</div>
            {account}
          </aside>
        </div>
      ) : null}

      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface/90 lg:flex">
        <div className="px-4 py-5">{brand}</div>
        <div className="min-h-0 flex-1 overflow-y-auto">{links}</div>
        {account}
      </aside>
    </>
  );
}
