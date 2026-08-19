"use client";

import { useActionState, useState } from "react";
import { saveMailSettingsAction, sendTestMailAction } from "@/lib/actions/mail";

const presets = {
  outlook: { host: "smtp.office365.com", port: "587", secure: false },
  gmail: { host: "smtp.gmail.com", port: "587", secure: false },
};

type Saved = {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  fromEmail: string;
  fromName: string;
  hasPassword: boolean;
};

export function MailSettingsForm({ saved }: { saved: Saved | null }) {
  const [host, setHost] = useState(saved?.host || "smtp.office365.com");
  const [port, setPort] = useState(String(saved?.port || 587));
  const [secure, setSecure] = useState(saved?.secure ?? false);
  const [state, action, pending] = useActionState(saveMailSettingsAction, null);
  const [test, setTest] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testTo, setTestTo] = useState("");

  function applyPreset(key: keyof typeof presets) {
    const preset = presets[key];
    setHost(preset.host);
    setPort(preset.port);
    setSecure(preset.secure);
  }

  return (
    <div className="space-y-6">
      <form action={action} className="ui-card space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyPreset("outlook")}
            className="ui-btn ui-btn-ghost h-8"
          >
            Outlook 365
          </button>
          <button
            type="button"
            onClick={() => applyPreset("gmail")}
            className="ui-btn ui-btn-ghost h-8"
          >
            Gmail
          </button>
        </div>
        <p className="text-xs text-subtle">
          Gmail: no uses tu clave habitual. Activa la verificación en 2 pasos y crea una
          contraseña de aplicación de 16 caracteres en{" "}
          <a
            className="ui-link underline"
            href="https://myaccount.google.com/apppasswords"
            target="_blank"
            rel="noreferrer"
          >
            myaccount.google.com/apppasswords
          </a>
          . Puerto 587, SSL desmarcado.
        </p>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Servidor SMTP</span>
          <input
            name="host"
            value={host}
            onChange={(event) => setHost(event.target.value)}
            className="ui-input"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Puerto</span>
            <input
              name="port"
              value={port}
              onChange={(event) => setPort(event.target.value)}
              className="ui-input"
            />
          </label>
          <label className="mt-7 flex items-center gap-2 text-sm">
            <input
              name="secure"
              type="checkbox"
              checked={secure}
              onChange={(event) => setSecure(event.target.checked)}
            />
            SSL (puerto 465)
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Usuario</span>
          <input
            name="username"
            type="email"
            defaultValue={saved?.username}
            placeholder="tu.correo@empresa.com"
            className="ui-input"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Contraseña SMTP</span>
          <input
            name="password"
            type="password"
            placeholder="Contraseña de aplicación (16 caracteres en Gmail)"
            className="ui-input"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Remitente</span>
          <input
            name="fromEmail"
            type="email"
            defaultValue={saved?.fromEmail}
            placeholder="tu.correo@empresa.com"
            className="ui-input"
          />
        </label>
        <input type="hidden" name="fromName" value="Aprobaciones" />

        {state?.error ? <p className="ui-alert ui-alert-danger">{state.error}</p> : null}
        {state?.ok ? <p className="ui-alert ui-alert-success">Configuración guardada.</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="ui-btn ui-btn-primary w-full sm:w-auto"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
      </form>

      <div className="ui-card">
        <p className="mb-3 text-sm text-muted">
          Envía una prueba a un correo real (Gmail u Outlook). El usuario de demo @eisa.local no
          recibe mail.
        </p>
        <input
          type="email"
          value={testTo}
          onChange={(event) => setTestTo(event.target.value)}
          placeholder="tu.correo@gmail.com"
          className="ui-input mb-3"
        />
        <button
          type="button"
          disabled={testing}
          onClick={async () => {
            setTesting(true);
            setTest(null);
            const result = await sendTestMailAction(testTo);
            setTest(result.error ? result.error : "Prueba enviada. Revisa bandeja y spam.");
            setTesting(false);
          }}
          className="ui-btn ui-btn-secondary w-full sm:w-auto"
        >
          {testing ? "Enviando…" : "Enviar correo de prueba"}
        </button>
        {test ? (
          <p className={`mt-3 text-sm ${test.startsWith("Prueba enviada") ? "text-success-700" : "text-danger-700"}`}>
            {test}
          </p>
        ) : null}
      </div>
    </div>
  );
}
