import { prisma } from "@/lib/db";
import path from "path";
import { readFile } from "fs/promises";
import { uploadDir } from "@/lib/paths";

export function fileDisposition(fileName: string) {
  const ascii = fileName.replace(/[^\x20-\x7E]/g, "_") || "documento";
  return `inline; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

export async function saveRequestFile(requestId: string, data: Buffer) {
  await prisma.$executeRaw`
    INSERT INTO "RequestAttachment" ("requestId", "data")
    VALUES (${requestId}, ${data})
    ON CONFLICT ("requestId") DO UPDATE SET "data" = EXCLUDED."data"
  `;
}

export async function readRequestFile(requestId: string) {
  const rows = await prisma.$queryRaw<{ data: Uint8Array }[]>`
    SELECT "data" FROM "RequestAttachment" WHERE "requestId" = ${requestId} LIMIT 1
  `;
  if (rows[0]?.data?.length) {
    return Buffer.from(rows[0].data);
  }

  const doc = await prisma.approvalRequest.findUnique({
    where: { id: requestId },
    select: { storedName: true },
  });
  if (!doc?.storedName) return null;

  try {
    return await readFile(path.join(uploadDir(), doc.storedName));
  } catch {
    return null;
  }
}
