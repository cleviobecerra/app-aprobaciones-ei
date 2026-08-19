"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";

type Invite = {
  email: string;
  name: string;
  accessToken: string;
  status: string;
};

function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="ui-iconbtn"
      title="Copiar enlace"
    >
      {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
    </button>
  );
}

export function InviteLinks({ invites }: { invites: Invite[] }) {
  const pending = invites.filter((invite) => invite.status === "PENDING");
  if (pending.length === 0) {
    return <p className="text-sm text-subtle">No hay enlaces pendientes de envío en esta etapa.</p>;
  }

  return (
    <ul className="space-y-3">
      {pending.map((invite) => {
        const path = `/aprobar/${invite.accessToken}`;
        const absolute = typeof window === "undefined" ? path : `${window.location.origin}${path}`;
        return (
          <li key={invite.accessToken} className="rounded-xl border border-line bg-soft/60 p-3">
            <p className="text-sm font-medium text-fg">{invite.name || invite.email}</p>
            <p className="text-xs text-subtle">{invite.email}</p>
            <div className="mt-2 flex items-center gap-1">
              <code className="min-w-0 flex-1 truncate text-[11px] text-muted">{path}</code>
              <CopyButton url={absolute} />
              <a
                href={path}
                target="_blank"
                rel="noreferrer"
                className="ui-iconbtn text-primary-700"
                title="Abrir como destinatario"
              >
                <ExternalLink className="size-4" />
              </a>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
