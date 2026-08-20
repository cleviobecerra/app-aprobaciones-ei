"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BarChart3, FilePlus2, Inbox, LogOut, Menu, Send, Settings, Users, X } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { initials } from "@/lib/labels";
import { isAdmin, isAuditor, roleLabel } from "@/lib/roles";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";

type NavItem = { href: string; label: string; icon: typeof Users };

function matchesHref(current: string, href: string) {
  return current === href || current.startsWith(`${href}/`);
}

function isInternalPath(href: string | null) {
  return Boolean(href && href.startsWith("/") && !href.startsWith("//"));
}

function navForRole(role: string): NavItem[] {
  if (isAdmin(role)) {
    return [
      { href: "/users", label: "Usuarios", icon: Users },
      { href: "/admin-requests", label: "Solicitudes", icon: Inbox },
      { href: "/reports", label: "Reportes", icon: BarChart3 },
      { href: "/requests/new", label: "Nueva solicitud", icon: FilePlus2 },
      { href: "/inbox", label: "Enlaces de acceso", icon: Send },
      { href: "/settings", label: "Correo SMTP", icon: Settings },
    ];
  }
  if (isAuditor(role)) {
    return [
      { href: "/admin-requests", label: "Solicitudes", icon: Inbox },
      { href: "/reports", label: "Reportes", icon: BarChart3 },
    ];
  }
  return [
    { href: "/sent", label: "Mis solicitudes", icon: Send },
    { href: "/reports", label: "Reportes", icon: BarChart3 },
    { href: "/requests/new", label: "Nueva solicitud", icon: FilePlus2 },
  ];
}

function Brand({ subtitle }: { subtitle: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <BrandMark />
      <div className="min-w-0">
        <p className="truncate text-[17px] font-semibold tracking-tight">Aprobaciones</p>
        <p className="truncate text-xs text-subtle">{subtitle}</p>
      </div>
    </div>
  );
}

function NavLinks({
  items,
  pathname,
  pendingHref,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  pendingHref: string | null;
  onNavigate: (href: string) => void;
}) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {items.map((item) => {
        const pending = pendingHref ? matchesHref(pendingHref.split("?")[0], item.href) : false;
        const active = pending || (!pendingHref && matchesHref(pathname, item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            aria-current={active ? "page" : undefined}
            aria-busy={pending || undefined}
            onClick={() => onNavigate(item.href)}
            className={`flex min-h-11 touch-manipulation items-center gap-3 rounded-xl px-3 text-sm transition-colors ${
              active
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:bg-soft hover:text-fg active:bg-soft active:text-fg"
            }`}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Account({
  user,
}: {
  user: { name: string; email: string; area: string };
}) {
  return (
    <div className="border-t border-line px-3 py-3">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-soft text-xs font-semibold text-muted">
          {initials(user.name)}
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="whitespace-nowrap text-sm font-medium" title={user.name}>
            {user.name}
          </p>
          <p className="truncate text-xs text-subtle" title={user.area || user.email}>
            {user.area || user.email}
          </p>
        </div>
        <div className="flex shrink-0 items-center">
          <ThemeToggle className="ui-iconbtn !min-h-9 !min-w-9" />
          <form action={logoutAction}>
            <button type="submit" className="ui-iconbtn !min-h-9 !min-w-9" title="Cerrar sesión">
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function RouteChangeListener({ onChange }: { onChange: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    onChange();
  }, [pathname, searchParams, onChange]);

  return null;
}

export function Sidebar({
  user,
}: {
  user: { name: string; email: string; area: string; role: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const nav = navForRole(user.role);
  const subtitle = pendingHref ? "Cargando…" : (roleLabel[user.role] ?? user.role);
  const clearPending = useCallback(() => {
    setPendingHref(null);
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!pendingHref) return;
    const timer = window.setTimeout(() => setPendingHref(null), 6000);
    return () => window.clearTimeout(timer);
  }, [pendingHref]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    for (const item of navForRole(user.role)) {
      router.prefetch(item.href);
    }
  }, [router, user.role]);

  useEffect(() => {
    function pathFromAnchor(anchor: HTMLAnchorElement) {
      const href = anchor.getAttribute("href");
      if (!isInternalPath(href) || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return null;
      }
      try {
        const url = new URL(href!, window.location.href);
        if (url.origin !== window.location.origin) return null;
        return `${url.pathname}${url.search}`;
      } catch {
        return null;
      }
    }

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      const next = pathFromAnchor(anchor);
      if (!next || next === `${pathname}${window.location.search}`) return;
      setPendingHref(next);
      setOpen(false);
    }

    function onSubmit(event: SubmitEvent) {
      const form = event.target as HTMLFormElement | null;
      if (!form || form.getAttribute("method")?.toLowerCase() !== "get") return;
      setPendingHref(`${pathname}${window.location.search}`);
      setOpen(false);
    }

    document.addEventListener("click", onClick);
    document.addEventListener("submit", onSubmit);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("submit", onSubmit);
    };
  }, [pathname]);

  function onNavigate(href: string) {
    if (href !== pathname) setPendingHref(href);
    setOpen(false);
  }

  const navigating = Boolean(pendingHref);

  return (
    <>
      <Suspense fallback={null}>
        <RouteChangeListener onChange={clearPending} />
      </Suspense>
      {navigating ? (
        <div className="nav-progress" role="progressbar" aria-label="Cargando página" />
      ) : null}

      <header className="sticky top-0 z-[100] flex min-h-16 items-center justify-between gap-3 border-b border-line/80 bg-surface/80 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-md lg:hidden">
        <Brand subtitle={subtitle} />
        <div className="flex shrink-0 items-center">
          <ThemeToggle />
          <button
            type="button"
            className="ui-iconbtn"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[110] lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
        inert={!open}
      >
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          className={`absolute inset-0 bg-fg/40 backdrop-blur-[2px] transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
        />
        <aside
          className={`relative flex h-full w-[min(100%,300px)] flex-col bg-surface shadow-2xl transition-transform duration-200 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center justify-between gap-3 px-4">
            <Brand subtitle={subtitle} />
            <button type="button" className="ui-iconbtn" aria-label="Cerrar menú" onClick={() => setOpen(false)}>
              <X className="size-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            <NavLinks items={nav} pathname={pathname} pendingHref={pendingHref} onNavigate={onNavigate} />
          </div>
          <Account user={user} />
        </aside>
      </div>

      <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 flex-col border-r border-line bg-surface/90 lg:flex">
        <div className="px-4 py-5">
          <Brand subtitle={subtitle} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <NavLinks items={nav} pathname={pathname} pendingHref={pendingHref} onNavigate={onNavigate} />
        </div>
        <Account user={user} />
      </aside>
    </>
  );
}
