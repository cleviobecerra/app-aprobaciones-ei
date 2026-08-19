import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fileDisposition, readRequestFile } from "@/lib/files";
import { canViewAllRequests } from "@/lib/roles";
import { userOwnsRequest } from "@/lib/workflow";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = new URL(request.url).searchParams.get("token");
  const user = await getSessionUser();

  let allowed = false;
  if (user && (canViewAllRequests(user.role) || (await userOwnsRequest(user.id, id)))) {
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

  if (!doc?.storedName && !doc?.fileName) {
    return NextResponse.json({ error: "Sin archivo" }, { status: 404 });
  }

  const data = await readRequestFile(id);
  if (!data) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }

  return new NextResponse(data, {
    headers: {
      "Content-Type": doc.mimeType || "application/octet-stream",
      "Content-Disposition": fileDisposition(doc.fileName ?? "documento"),
      "Content-Length": String(data.byteLength),
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
