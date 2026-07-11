// =====================================================================
// CUSTOM TEE STUDIO — production reference sheet
//
// A clean, labelled order sheet for The Factory's production team:
// front/back mockups, print-area close-ups, colour, quantity, size
// breakdown and notes. No editor UI, handles or grids appear here.
// =====================================================================

import {
  AVAILABILITY_LABEL,
  colorAvailability,
  CUSTOM_COLOR_NOTICE,
  MARKET_SOURCING_NOTICE,
  PREVIEW_DISCLAIMER,
  type ViewId,
} from "./catalog";
import { composeViewCanvas, download } from "./exporter";
import { artworkLine, fabricLine } from "./messages";
import { getProduct, SIZE_KEYS, sizeTotal, type DesignState } from "./state";
import { STAGE_H, STAGE_W } from "./garment";

const W = 2200;
const H = 1560;
const INK = "#14110f";
const PAPER = "#f7f3ec";
const LINE = "#d8d3c8";
const SOFT = "#5c554d";

function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
  ctx.fillStyle = SOFT;
  ctx.font = "600 22px Archivo, Arial, sans-serif";
  ctx.fillText(text.toUpperCase(), x, y);
}

function value(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max = 560) {
  ctx.fillStyle = INK;
  ctx.font = "500 27px Archivo, Arial, sans-serif";
  // simple wrap
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const w of words) {
    const t = line ? line + " " + w : w;
    if (ctx.measureText(t).width > max && line) {
      ctx.fillText(line, x, yy);
      line = w;
      yy += 34;
    } else line = t;
  }
  ctx.fillText(line, x, yy);
  return yy + 34;
}

/** Draw one mockup panel with a labelled frame. */
async function mockupPanel(
  ctx: CanvasRenderingContext2D,
  state: DesignState,
  view: ViewId,
  x: number,
  y: number,
  h: number,
) {
  const w = (h / STAGE_H) * STAGE_W;
  const canvas = await composeViewCanvas(state, view, 2);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x, y, w, h);
  ctx.drawImage(canvas, x, y, w, h);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = INK;
  ctx.fillRect(x, y, 110, 40);
  ctx.fillStyle = PAPER;
  ctx.font = "700 22px Archivo, Arial, sans-serif";
  ctx.fillText(view.toUpperCase(), x + 18, y + 27);
  if (!state.artworks[view]) {
    ctx.fillStyle = "rgba(20,17,15,0.55)";
    ctx.fillRect(x, y + h - 44, w, 44);
    ctx.fillStyle = PAPER;
    ctx.font = "700 20px Archivo, Arial, sans-serif";
    ctx.fillText("NO DESIGN ADDED", x + 16, y + h - 16);
  }
  return w;
}

/** Close-up of the print zone (cropped from the composed view). */
async function closeupPanel(
  ctx: CanvasRenderingContext2D,
  state: DesignState,
  view: ViewId,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const zone = getProduct(state).zones[view];
  const composed = await composeViewCanvas(state, view, 2);
  const pad = 14 * 2;
  const sx = zone.x * 2 - pad;
  const sy = zone.y * 2 - pad;
  const sw = zone.w * 2 + pad * 2;
  const sh = zone.h * 2 + pad * 2;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x, y, w, h);
  // contain-fit the crop
  const k = Math.min(w / sw, h / sh);
  const dw = sw * k;
  const dh = sh * k;
  ctx.drawImage(composed, sx, sy, sw, sh, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = INK;
  ctx.fillRect(x, y, 260, 40);
  ctx.fillStyle = PAPER;
  ctx.font = "700 20px Archivo, Arial, sans-serif";
  ctx.fillText(`${view.toUpperCase()} PRINT AREA`, x + 16, y + 27);
}

export async function exportReferenceSheet(state: DesignState): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  const d = state.details;
  const product = getProduct(state);
  const views: ViewId[] = ["front", "back"];

  // Background + header
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, 110);
  ctx.fillStyle = PAPER;
  ctx.font = "800 44px Archivo, Arial, sans-serif";
  ctx.fillText("THE FACTORY NIGERIA — DESIGN REFERENCE", 48, 68);
  ctx.font = "600 26px Archivo, Arial, sans-serif";
  ctx.globalAlpha = 0.8;
  const dateStr = new Date().toISOString().slice(0, 10);
  const head = `${state.reference}  ·  ${dateStr}  ·  PROTOTYPE — VISUAL REFERENCE ONLY`;
  ctx.fillText(head, W - 48 - ctx.measureText(head).width, 68);
  ctx.globalAlpha = 1;

  // Mockup panels (left)
  const mockH = 900;
  let mx = 48;
  for (const v of views) {
    const w = await mockupPanel(ctx, state, v, mx, 150, mockH);
    mx += w + 28;
  }

  // Close-ups under mockups (only for sides that carry artwork)
  const cuViews = views.filter((vv) => state.artworks[vv]);
  const cuY = 150 + mockH + 26;
  const cuW = cuViews.length === 2 ? (mx - 48 - 28) / 2 - 14 : 380;
  let cx0 = 48;
  for (const v of cuViews) {
    await closeupPanel(ctx, state, v, cx0, cuY, cuW, H - cuY - 140);
    cx0 += cuW + 28;
  }

  // Info panel (right)
  const ix = Math.max(mx + 24, 1220);
  let iy = 190;
  label(ctx, "Product", ix, iy);
  iy = value(ctx, `${product.name} — ${AVAILABILITY_LABEL[product.availability]}`, ix, iy + 36, W - ix - 220);

  label(ctx, "Garment colour", ix, iy + 18);
  // swatch
  ctx.fillStyle = state.color.hex;
  ctx.fillRect(ix, iy + 34, 64, 64);
  ctx.strokeStyle = LINE;
  ctx.strokeRect(ix, iy + 34, 64, 64);
  iy = value(
    ctx,
    `${state.color.name} (${state.color.hex}) — ${AVAILABILITY_LABEL[colorAvailability(state.color.status)].toUpperCase()}`,
    ix + 84,
    iy + 72,
    W - ix - 300,
  );
  iy += 16;

  label(ctx, "Fabric", ix, iy + 18);
  iy = value(ctx, fabricLine(state) || "No preference — team to advise", ix, iy + 54, W - ix - 220);

  for (const v of views) {
    const art = state.artworks[v];
    if (!art) continue;
    label(ctx, `${v} artwork`, ix, iy + 18);
    iy = value(ctx, artworkLine(art), ix, iy + 54, W - ix - 220);
  }

  label(ctx, "Quantity", ix, iy + 18);
  iy = value(ctx, d.quantity.trim() || "—", ix, iy + 54);

  // Size table
  label(ctx, "Size breakdown", ix, iy + 18);
  iy += 44;
  ctx.font = "600 26px Archivo, Arial, sans-serif";
  let sx0 = ix;
  for (const k of SIZE_KEYS) {
    ctx.fillStyle = SOFT;
    ctx.fillText(k, sx0, iy + 26);
    ctx.fillStyle = INK;
    ctx.font = "700 30px Archivo, Arial, sans-serif";
    ctx.fillText(String(d.sizes[k] || 0), sx0, iy + 64);
    ctx.font = "600 26px Archivo, Arial, sans-serif";
    sx0 += 108;
  }
  ctx.fillStyle = SOFT;
  ctx.fillText("TOTAL", sx0 + 8, iy + 26);
  ctx.fillStyle = INK;
  ctx.font = "800 30px Archivo, Arial, sans-serif";
  ctx.fillText(String(sizeTotal(d.sizes)), sx0 + 8, iy + 64);
  iy += 96;
  if (d.otherSizes.trim()) iy = value(ctx, `Custom sizing (to confirm): ${d.otherSizes.trim()}`, ix, iy, W - ix - 220);

  const facts: [string, string][] = [
    ["Method preference", d.method],
    ["Required date", d.deadline],
    ["Delivery location", d.deliveryLocation],
    ["Customer", [d.name, d.phone, d.email].filter((s) => s.trim()).join(" · ")],
    ["Notes", d.notes],
  ];
  for (const [l, v] of facts) {
    if (!v.trim()) continue;
    label(ctx, l, ix, iy + 18);
    iy = value(ctx, v, ix, iy + 54, W - ix - 220);
  }
  if (state.color.status === "confirm") {
    iy += 8;
    ctx.fillStyle = "#7e1680";
    ctx.font = "600 24px Archivo, Arial, sans-serif";
    iy = value(ctx, CUSTOM_COLOR_NOTICE, ix, iy + 18, W - ix - 220);
  }

  // Footer disclaimers: preview approximation + market-sourcing honesty
  const noticeSplit = MARKET_SOURCING_NOTICE.indexOf("; if not");
  const noticeA = MARKET_SOURCING_NOTICE.slice(0, noticeSplit + 1);
  const noticeB = MARKET_SOURCING_NOTICE.slice(noticeSplit + 2);
  ctx.fillStyle = INK;
  ctx.fillRect(0, H - 118, W, 118);
  ctx.fillStyle = PAPER;
  ctx.globalAlpha = 0.85;
  ctx.font = "21px Archivo, Arial, sans-serif";
  ctx.fillText(PREVIEW_DISCLAIMER, 48, H - 82);
  ctx.fillText(noticeA, 48, H - 52);
  ctx.fillText(noticeB, 48, H - 22);
  ctx.globalAlpha = 1;

  return canvas.toDataURL("image/png");
}

export async function downloadReferenceSheet(state: DesignState): Promise<void> {
  download(await exportReferenceSheet(state), `${state.reference}-reference-sheet.png`);
}
