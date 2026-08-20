import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { REQUEST_STATUS } from "@/lib/labels";
import { toRequestPdfPayload } from "@/lib/request-pdf-data";
import { canViewAllRequests } from "@/lib/roles";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const request = await prisma.approvalRequest.findFirst({
    where: canViewAllRequests(user.role) ? { id } : { id, createdById: user.id },
    include: {
      createdBy: { select: { name: true } },
      stages: {
        orderBy: { order: "asc" },
        include: { tasks: { orderBy: { email: "asc" } } },
      },
      auditEvents: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!request) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }
  if (request.status !== REQUEST_STATUS.APPROVED) {
    return NextResponse.json({ error: "La solicitud aún no está aprobada" }, { status: 409 });
  }

  return NextResponse.json(toRequestPdfPayload(request), {
    headers: { "Cache-Control": "private, no-store" },
  });
}
