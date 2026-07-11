// =====================================================================
// CUSTOM TEE STUDIO — local export: mockups, reference sheet, brief,
// and preserved original artwork. Everything is composed client-side;
// nothing is uploaded anywhere. Exports contain NO editor UI.
// =====================================================================

import type { ViewId } from "./catalog";
import { PREVIEW_DISCLAIMER } from "./catalog";
import { buildDesignSpec } from "./messages";
import { getProduct, type DesignState } from "./state";
import { STAGE_H, STAGE_W, teeSvgDocument } from "./teeArt";

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Compose one garment view (tee + artwork, no UI) onto a canvas. */
export async function composeViewCanvas(
  state: DesignState,
  view: ViewId,
  scale = 2,
): Promise<HTMLCanvasElement> {
  const product = getProduct(state);
  const zone = product.zones[view];
  const canvas = document.createElement("canvas");
  canvas.width = STAGE_W * scale;
  canvas.height = STAGE_H * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  const svg = teeSvgDocument(product.cut, view, state.color.hex);
  const tee = await loadImage("data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg));
  ctx.drawImage(tee, 0, 0, canvas.width, canvas.height);

  const art = state.artworks[view];
  if (art) {
    const img = await loadImage(art.src);
    const pxPerIn = (zone.w / zone.widthIn) * scale;
    const wPx = art.widthIn * pxPerIn;
    const hPx = wPx * (art.naturalH / art.naturalW);
    const cx = (zone.x + art.cx * zone.w) * scale;
    const cy = (zone.y + art.cy * zone.h) * scale;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((art.rotation * Math.PI) / 180);
    ctx.drawImage(img, -wPx / 2, -hPx / 2, wPx, hPx);
    ctx.restore();
  }
  return canvas;
}

/** Simple side-by-side preview PNG (front + back when designed). */
export async function exportPreviewPng(state: DesignState): Promise<string> {
  const views: ViewId[] = state.artworks.back ? ["front", "back"] : ["front"];
  const scale = 2;
  const w = STAGE_W * scale * views.length;
  const h = STAGE_H * scale + 72;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#f7f3ec";
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < views.length; i++) {
    const v = await composeViewCanvas(state, views[i], scale);
    ctx.drawImage(v, i * STAGE_W * scale, 0);
    ctx.fillStyle = "rgba(20,17,15,0.75)";
    ctx.font = "600 26px Archivo, Arial, sans-serif";
    ctx.fillText(views[i].toUpperCase(), i * STAGE_W * scale + 24, 44);
  }
  ctx.fillStyle = "#14110f";
  ctx.fillRect(0, h - 72, w, 72);
  ctx.fillStyle = "#f7f3ec";
  ctx.font = "600 26px Archivo, Arial, sans-serif";
  ctx.fillText(`${state.reference} · ${getProduct(state).name} · ${state.color.name}`, 24, h - 42);
  ctx.font = "20px Archivo, Arial, sans-serif";
  ctx.globalAlpha = 0.75;
  ctx.fillText(PREVIEW_DISCLAIMER.slice(0, 132), 24, h - 14);
  ctx.globalAlpha = 1;
  return canvas.toDataURL("image/png");
}

export function download(href: string, filename: string): void {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function downloadPreview(state: DesignState): Promise<void> {
  download(await exportPreviewPng(state), `${state.reference}-mockup.png`);
}

export function downloadSpec(state: DesignState): void {
  const blob = new Blob([JSON.stringify(buildDesignSpec(state, true), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  download(url, `${state.reference}-design-brief.json`);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Preserve the customer's ORIGINAL artwork bytes (no re-encoding). */
export function downloadOriginalArtwork(state: DesignState, view: ViewId): void {
  const art = state.artworks[view];
  if (!art) return;
  download(art.src, `${state.reference}-${view}-original-${art.fileName}`);
}

/** Web Share API — share generated files where the device supports it. */
export async function shareFiles(state: DesignState, files: File[]): Promise<"shared" | "unsupported"> {
  const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
  if (nav.share && nav.canShare && nav.canShare({ files })) {
    await nav.share({
      files,
      title: `Custom tee enquiry ${state.reference}`,
      text: `Design reference ${state.reference} for The Factory Nigeria`,
    });
    return "shared";
  }
  return "unsupported";
}

export async function dataUrlToFile(dataUrl: string, name: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], name, { type: blob.type || "image/png" });
}
