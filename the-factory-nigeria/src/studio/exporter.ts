// =====================================================================
// CUSTOM TEE STUDIO — local export: mockups, reference sheet, brief,
// and preserved original artwork. Everything is composed client-side;
// nothing is uploaded anywhere. Exports contain NO editor UI.
// =====================================================================

import { type ViewId } from "./catalog";
import { PREVIEW_DISCLAIMER } from "./catalog";
import { buildDesignSpec } from "./messages";
import { fontOf, getProduct, layerBox, layersForView, type DesignState, type ImageLayer, type Layer } from "./state";
import { drawGarment, drawText, STAGE_H, STAGE_W } from "./garment";

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Compose one garment view (photoreal garment + all design layers, no UI). */
export async function composeViewCanvas(
  state: DesignState,
  view: ViewId,
  scale = 2,
): Promise<HTMLCanvasElement> {
  const product = getProduct(state);
  const canvas = document.createElement("canvas");
  canvas.width = STAGE_W * scale;
  canvas.height = STAGE_H * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  ctx.fillStyle = "#f7f3ec";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Preload image layers for this view (in z-order, bottom → top).
  const layers = layersForView(state, view);
  const imgs = new Map<string, HTMLImageElement>();
  for (const l of layers) {
    if (l.kind === "image") imgs.set(l.id, await loadImage(l.src));
  }

  await drawGarment(ctx, product.id, view, state.color.hex, 0, 0, canvas.width, canvas.height, (lc) => {
    for (const l of layers) drawLayer(lc, l, imgs.get(l.id), scale);
  });
  return canvas;
}

/** Draw one layer at stage×scale coordinates (mirrors the editor exactly). */
function drawLayer(lc: CanvasRenderingContext2D, l: Layer, img: HTMLImageElement | undefined, scale: number) {
  const b = layerBox(l);
  const cx = b.x * scale;
  const cy = b.y * scale;
  if (l.kind === "image") {
    if (!img) return;
    lc.save();
    lc.translate(cx, cy);
    lc.rotate((l.rotation * Math.PI) / 180);
    lc.drawImage(img, (-b.w * scale) / 2, (-b.h * scale) / 2, b.w * scale, b.h * scale);
    lc.restore();
  } else {
    const f = fontOf(l);
    drawText(
      lc,
      { text: l.text, fontStack: f.stack, weight: f.weight, color: l.color, outline: l.outline, outlineWidth: l.outlineWidth },
      cx,
      cy,
      b.h * scale,
      l.rotation,
    );
  }
}

/** Simple side-by-side preview PNG (front + back when designed). */
export async function exportPreviewPng(state: DesignState): Promise<string> {
  const views: ViewId[] = ["front", "back"];
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
    ctx.fillText(views[i].toUpperCase() + (layersForView(state, views[i]).length ? '' : ' — NO DESIGN ADDED'), i * STAGE_W * scale + 24, 44);
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

/** All uploaded image layers (originals preserved separately from the mockup). */
export function imageLayers(state: DesignState): ImageLayer[] {
  return state.layers.filter((l): l is ImageLayer => l.kind === "image");
}

/** Preserve one uploaded artwork's ORIGINAL bytes (no re-encoding). */
export function downloadOriginalArtwork(state: DesignState, layer: ImageLayer): void {
  download(layer.src, `${state.reference}-${layer.view}-original-${layer.fileName}`);
}

/** Can this browser share files through the native share sheet? */
export function canShareFiles(): boolean {
  try {
    const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
    const probe = new File([new Blob(["x"])], "probe.png", { type: "image/png" });
    return (
      typeof nav.share === "function" && typeof nav.canShare === "function" && nav.canShare({ files: [probe] })
    );
  } catch {
    return false;
  }
}

/**
 * Web Share API — opens the DEVICE's share sheet (customer picks WhatsApp
 * and confirms themselves; nothing is ever sent automatically).
 */
export async function shareFiles(
  state: DesignState,
  files: File[],
  text?: string,
): Promise<"shared" | "unsupported"> {
  const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
  if (nav.share && nav.canShare && nav.canShare({ files })) {
    await nav.share({
      files,
      title: `Studio enquiry ${state.reference}`,
      text: text ?? `Studio design reference ${state.reference} for The Factory Nigeria`,
    });
    return "shared";
  }
  return "unsupported";
}

/** Copy the prepared enquiry message to the clipboard (with a fallback for
 *  browsers that restrict the async Clipboard API). */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export async function dataUrlToFile(dataUrl: string, name: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], name, { type: blob.type || "image/png" });
}
