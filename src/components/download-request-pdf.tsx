"use client";

import { useState, type MouseEvent } from "react";
import { createRoot } from "react-dom/client";
import { Download, LoaderCircle } from "lucide-react";
import { RequestPdfDocument } from "@/components/request-pdf-document";
import { APP_COPYRIGHT } from "@/lib/labels";
import type { RequestPdfPayload } from "@/lib/request-pdf-data";

async function canvasFromElement(node: HTMLElement) {
  const { default: html2canvas } = await import("html2canvas-pro");
  const width = Math.max(794, node.scrollWidth);
  const height = Math.max(node.scrollHeight, node.offsetHeight, 1);
  return html2canvas(node, {
    scale: 2,
    backgroundColor: "#f3f5f9",
    useCORS: true,
    width,
    height,
    windowWidth: width,
    windowHeight: height,
    scrollX: 0,
    scrollY: 0,
    onclone(clonedDoc, element) {
      clonedDoc.documentElement.classList.remove("dark");
      clonedDoc.documentElement.style.colorScheme = "light";
      clonedDoc.body.style.height = "auto";
      clonedDoc.body.style.overflow = "visible";
      element.style.height = "auto";
      element.style.maxHeight = "none";
      element.style.overflow = "visible";
    },
  });
}

function addFittedPage(
  pdf: import("jspdf").jsPDF,
  canvas: HTMLCanvasElement,
  isFirst: boolean,
) {
  if (!isFirst) pdf.addPage();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const footerSpace = 12;
  const maxWidth = pageWidth - margin * 2;
  const maxHeight = pageHeight - margin - footerSpace;
  const ratio = canvas.height / canvas.width;
  let width = maxWidth;
  let height = width * ratio;
  if (height > maxHeight) {
    height = maxHeight;
    width = height / ratio;
  }
  const x = margin + (maxWidth - width) / 2;
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", x, margin, width, height);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(107, 114, 128);
  pdf.text(APP_COPYRIGHT, pageWidth / 2, pageHeight - 6, { align: "center" });
}

async function waitForPaint() {
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  if (document.fonts?.ready) await document.fonts.ready;
  await new Promise((resolve) => window.setTimeout(resolve, 50));
}

async function downloadRequestPdfFromPayload(data: RequestPdfPayload) {
  const host = document.createElement("div");
  host.className = "pdf-capture";
  document.body.appendChild(host);

  const root = createRoot(host);
  root.render(<RequestPdfDocument data={data} />);
  try {
    await waitForPaint();
    const sheets = [...host.querySelectorAll<HTMLElement>(".pdf-sheet")];
    if (sheets.length === 0) throw new Error("empty");
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    for (const [index, sheet] of sheets.entries()) {
      const canvas = await canvasFromElement(sheet);
      addFittedPage(pdf, canvas, index === 0);
    }
    pdf.save(data.fileName);
  } finally {
    root.unmount();
    host.remove();
  }
}

function useRequestPdfDownload(requestId: string) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/requests/${requestId}/export`);
      if (!response.ok) throw new Error("export");
      const data = (await response.json()) as RequestPdfPayload;
      await downloadRequestPdfFromPayload(data);
    } catch {
      setError("No se pudo generar el PDF. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return { busy, error, download };
}

export function DownloadRequestPdfButton({ requestId }: { requestId: string }) {
  const { busy, error, download } = useRequestPdfDownload(requestId);

  return (
    <div className="space-y-2">
      <button type="button" disabled={busy} onClick={() => void download()} className="ui-btn ui-btn-primary">
        <Download className="size-4" />
        {busy ? "Generando PDF…" : "Descargar PDF"}
      </button>
      {error ? <p className="ui-alert ui-alert-danger">{error}</p> : null}
    </div>
  );
}

export function DownloadRequestPdfIcon({ requestId }: { requestId: string }) {
  const { busy, download } = useRequestPdfDownload(requestId);

  function onClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    void download();
  }

  return (
    <button
      type="button"
      className="ui-iconbtn"
      title="Descargar PDF"
      aria-label="Descargar PDF"
      disabled={busy}
      onClick={onClick}
    >
      {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Download className="size-4" />}
    </button>
  );
}
