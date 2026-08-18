"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { normalizeSmtp, sendMail } from "@/lib/mail";

export async function saveMailSettingsAction(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData,
) {
  await requireAdmin();
  const host = String(formData.get("host") || "").trim();
  const port = Number(formData.get("port") || 587);
  const username = String(formData.get("username") || "").trim();
  const fromEmail = String(formData.get("fromEmail") || username).trim();
  const fromName = String(formData.get("fromName") || "Aprobaciones").trim();
  const incomingPassword = String(formData.get("password") || "");
  const current = await prisma.mailSettings.findUnique({ where: { id: "default" } });
  const password = (incomingPassword || current?.password || "").replace(/\s+/g, "");
  const smtp = normalizeSmtp({
    host,
    port: Number.isFinite(port) ? port : 587,
    secure: formData.get("secure") === "on",
    username,
    password,
    fromEmail,
    fromName,
  });

  if (!smtp.host || !smtp.username || !smtp.fromEmail) {
    return { error: "Completa servidor, usuario y correo remitente." };
  }
  if (!smtp.password) {
    return { error: "Ingresa la contraseña SMTP o la contraseña de aplicación." };
  }
  if ((smtp.host.includes("gmail") || smtp.username.endsWith("@gmail.com")) && smtp.password.length < 16) {
    return {
      error:
        "Para Gmail no sirve la clave con la que entras. Crea una contraseña de aplicación de 16 caracteres en https://myaccount.google.com/apppasswords",
    };
  }

  await prisma.mailSettings.upsert({
    where: { id: "default" },
    update: smtp,
    create: { id: "default", ...smtp },
  });

  revalidatePath("/settings");
  revalidatePath("/inbox");
  return { ok: true };
}

export async function sendTestMailAction(toEmail: string) {
  await requireAdmin();
  const to = toEmail.trim().toLowerCase();
  if (!to.includes("@") || to.endsWith(".local")) {
    return { error: "Usa un correo real (Gmail, Outlook, etc.), no uno de demostración." };
  }
  const result = await sendMail(
    to,
    "Prueba de Aprobaciones",
    "El correo SMTP quedó configurado. Si ves este mensaje, los enlaces de aprobación ya pueden salir.",
    "<p>El correo SMTP quedó configurado. Si ves este mensaje, los enlaces de aprobación ya pueden salir.</p>",
  );
  if (!result.delivered) {
    return { error: result.error || "No se pudo enviar la prueba." };
  }
  return { ok: true };
}
