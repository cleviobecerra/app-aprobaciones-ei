"use server";

import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";
import { clearSession, createSession } from "@/lib/auth";
import { describeDbError, ensureDemoUsers } from "@/lib/bootstrap";

export async function loginAction(_prev: { error?: string } | null, formData: FormData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Ingresa correo y contraseña." };
  }

  try {
    if (!process.env.AUTH_SECRET) {
      return { error: "Falta AUTH_SECRET en Vercel (Settings → Environment Variables)." };
    }
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith("file:")) {
      return {
        error:
          "Falta DATABASE_URL de Supabase. En Vercel agrega DATABASE_URL y DIRECT_URL (pooler) y AUTH_SECRET.",
      };
    }

    await ensureDemoUsers();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await compare(password, user.passwordHash))) {
      return { error: "Credenciales incorrectas." };
    }

    await createSession(user.id);
    redirect(user.role === "ADMIN" ? "/users" : "/sent");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("loginAction", error);
    return { error: describeDbError(error) };
  }
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
