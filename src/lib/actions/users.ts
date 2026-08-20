"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ROLES, parseAssignableRole } from "@/lib/roles";

export async function createUserAction(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData,
) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const area = String(formData.get("area") || "").trim();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || ROLES.SOLICITANTE);
  const safeRole = parseAssignableRole(role);

  if (!name || !email || !password) {
    return { error: "Nombre, correo y contraseña son obligatorios." };
  }
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "Ese correo ya tiene una cuenta." };

  await prisma.user.create({
    data: {
      name,
      email,
      area,
      role: safeRole,
      passwordHash: await hash(password, 10),
    },
  });

  revalidatePath("/users");
  revalidatePath("/login");
  return { ok: true, createdAt: Date.now() };
}

export async function updateUserAction(
  userId: string,
  input: { name: string; email: string; area: string; role: string },
) {
  const admin = await requireAdmin();
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const area = input.area.trim();
  const role = parseAssignableRole(input.role);

  if (!name || !email) {
    return { error: "Nombre y correo son obligatorios." };
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { error: "La cuenta no existe." };

  if (target.role === ROLES.ADMIN && role !== ROLES.ADMIN) {
    const admins = await prisma.user.count({ where: { role: ROLES.ADMIN } });
    if (admins <= 1) {
      return { error: "No se puede quitar el perfil de administrador al último administrador." };
    }
  }

  const emailTaken = await prisma.user.findFirst({
    where: { email, NOT: { id: userId } },
    select: { id: true },
  });
  if (emailTaken) return { error: "Ese correo ya tiene una cuenta." };

  await prisma.user.update({
    where: { id: userId },
    data: { name, email, area, role },
  });

  revalidatePath("/users");
  revalidatePath("/login");
  if (userId === admin.id) revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function deleteUserAction(userId: string) {
  const admin = await requireAdmin();
  if (userId === admin.id) {
    return { error: "No puedes eliminar tu propia cuenta." };
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { error: "La cuenta no existe." };

  if (target.role === ROLES.ADMIN) {
    const admins = await prisma.user.count({ where: { role: ROLES.ADMIN } });
    if (admins <= 1) {
      return { error: "No se puede eliminar al último administrador." };
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.auditEvent.updateMany({
      where: { actorId: userId },
      data: { actorId: null },
    });
    await tx.approvalRequest.deleteMany({
      where: { createdById: userId },
    });
    await tx.user.delete({ where: { id: userId } });
  });

  revalidatePath("/users");
  revalidatePath("/login");
  revalidatePath("/admin-requests");
  return { ok: true as const };
}

export async function resetUserPasswordAction(userId: string, password: string) {
  await requireAdmin();
  const next = password.trim();
  if (next.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { error: "La cuenta no existe." };

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hash(next, 10) },
  });

  revalidatePath("/users");
  revalidatePath("/login");
  return { ok: true as const };
}
