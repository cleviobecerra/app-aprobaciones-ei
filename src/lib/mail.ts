import nodemailer from "nodemailer";
import { prisma } from "./db";
import { approvalUrl } from "./tokens";

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
};

export function normalizeSmtp(input: {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
}): SmtpConfig {
  const host = input.host.trim().toLowerCase();
  let port = Number.isFinite(input.port) ? input.port : 587;
  let secure = input.secure;
  if (port === 587) secure = false;
  if (port === 465) secure = true;
  if (host.includes("gmail.com") && port !== 465 && port !== 587) {
    port = 587;
    secure = false;
  }

  return {
    host,
    port,
    secure,
    username: input.username.trim(),
    password: input.password.replace(/\s+/g, ""),
    fromEmail: input.fromEmail.trim() || input.username.trim(),
    fromName: input.fromName.trim() || "Aprobaciones",
  };
}

export async function getMailConfig(): Promise<SmtpConfig | null> {
  try {
    const saved = await prisma.mailSettings.findUnique({ where: { id: "default" } });
    if (saved?.host && saved.username && saved.password && saved.fromEmail) {
      return normalizeSmtp(saved);
    }
  } catch (error) {
    console.error("No se pudo leer MailSettings", error);
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return normalizeSmtp({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      username: process.env.SMTP_USER,
      password: process.env.SMTP_PASS,
      fromEmail: process.env.SMTP_FROM || process.env.SMTP_USER,
      fromName: "Aprobaciones",
    });
  }

  return null;
}

export async function isMailConfigured() {
  return Boolean(await getMailConfig());
}

function transport(config: SmtpConfig) {
  const isGmail = config.host.includes("gmail.com") || config.username.endsWith("@gmail.com");
  if (isGmail) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user: config.username, pass: config.password },
    });
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: !config.secure && config.port === 587,
    auth: { user: config.username, pass: config.password },
    tls: { minVersion: "TLSv1.2" },
  });
}

export function explainSmtpError(raw: string, config?: SmtpConfig | null) {
  const text = raw.toLowerCase();
  if (config?.host.includes("gmail") && config.password.length < 16) {
    return "Gmail rechazó el acceso. No uses tu clave de Gmail: crea una contraseña de aplicación de 16 caracteres en https://myaccount.google.com/apppasswords (activa primero la verificación en 2 pasos).";
  }
  if (text.includes("invalid login") || text.includes("badcredentials") || text.includes("535") || text.includes("username and password not accepted") || text.includes("authentication failed")) {
    if (config?.host.includes("gmail") || config?.username.includes("@gmail.com")) {
      return "Gmail no aceptó usuario o contraseña. Usa una contraseña de aplicación de 16 caracteres, no la clave con la que entras a Gmail.";
    }
    return "Usuario o contraseña SMTP incorrectos. En Microsoft 365 suele ser el correo completo y la clave de la cuenta (o una contraseña de aplicación si está exigida).";
  }
  if (text.includes("wrong version number") || text.includes("ssl routines") || text.includes("econnreset")) {
    return "El modo SSL no coincide con el puerto. En el puerto 587 deja SSL desmarcado. En el 465 actívalo.";
  }
  if (text.includes("self signed") || text.includes("certificate")) {
    return "El servidor SMTP rechazó el certificado TLS. Revisa host y puerto, o la red corporativa.";
  }
  if (text.includes("etimedout") || text.includes("timeout") || text.includes("econnrefused")) {
    return "No se pudo conectar al servidor SMTP. Revisa host, puerto y que la red no bloquee la salida 587/465.";
  }
  return raw || "No se pudo enviar el correo.";
}

export async function sendMail(to: string, subject: string, text: string, html: string) {
  const config = await getMailConfig();
  if (!config) {
    return { delivered: false, error: "Falta configurar SMTP en Correo SMTP." };
  }
  if ((config.host.includes("gmail") || config.username.endsWith("@gmail.com")) && config.password.length < 16) {
    return {
      delivered: false,
      error:
        "Gmail no envía con la clave de la cuenta. Crea una contraseña de aplicación de 16 caracteres en https://myaccount.google.com/apppasswords y pégala en Correo SMTP.",
    };
  }

  try {
    const mailer = transport(config);
    await mailer.sendMail({
      from: `"${config.fromName}" <${config.fromEmail || config.username}>`,
      to,
      subject,
      text,
      html,
    });
    return { delivered: true, error: "" };
  } catch (err) {
    const raw = err instanceof Error ? err.message : "No se pudo enviar el correo.";
    console.error("SMTP error:", raw);
    return { delivered: false, error: explainSmtpError(raw, config) };
  }
}

export async function sendApprovalInvite(input: {
  requestId: string;
  requestTitle: string;
  senderName: string;
  toEmail: string;
  toName: string;
  accessToken: string;
  stageName: string;
}) {
  const accessUrl = approvalUrl(input.accessToken);
  const subject = `Revisión pendiente: ${input.requestTitle}`;
  const greeting = input.toName || input.toEmail;
  const bodyText = [
    `Hola ${greeting},`,
    "",
    `${input.senderName} te pidió revisar “${input.requestTitle}” (${input.stageName}).`,
    "",
    "No necesitas una cuenta. Abre este enlace para aprobar o rechazar:",
    accessUrl,
    "",
    "Si no esperabas este correo, puedes ignorarlo.",
  ].join("\n");
  const html = `<p>Hola ${greeting},</p>
<p><strong>${input.senderName}</strong> te pidió revisar “${input.requestTitle}” (${input.stageName}).</p>
<p>No necesitas una cuenta. Abre el enlace para aprobar o rechazar:</p>
<p><a href="${accessUrl}">${accessUrl}</a></p>
<p style="color:#64748b;font-size:12px">Si abres el correo en otro dispositivo, el enlace localhost solo funciona en esta misma computadora.</p>`;

  const result = await sendMail(input.toEmail, subject, bodyText, html);

  await prisma.outboundEmail.create({
    data: {
      requestId: input.requestId,
      toEmail: input.toEmail,
      toName: input.toName,
      subject,
      bodyText,
      accessUrl,
      delivered: result.delivered,
      error: result.error,
    },
  });

  return { ...result, accessUrl };
}
