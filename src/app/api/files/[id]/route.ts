import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { userOwnsRequest } from "@/lib/workflow";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = new URL(request.url).searchParams.get("token");
  const user = await getSessionUser();

  let allowed = false;
  if (user && (user.role === "ADMIN" || (await userOwnsRequest(user.id, id)))) {
    allowed = true;
  } else if (token) {
    const task = await prisma.approvalTask.findUnique({
      where: { accessToken: token },
      select: { stage: { select: { requestId: true } } },
    });
    allowed = task?.stage.requestId === id;
  }

  if (!allowed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const doc = await prisma.approvalRequest.findUnique({
    where: { id },
    select: { storedName: true, fileName: true, mimeType: true },
  });

  if (!doc?.storedName) {
    return NextResponse.json({ error: "Sin archivo" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "uploads", doc.storedName);
  try {
    const data = await readFile(filePath);
    return new NextResponse(data, {
      headers: {
        "Content-Type": doc.mimeType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${encodeURIComponent(doc.fileName ?? "documento")}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }
}
