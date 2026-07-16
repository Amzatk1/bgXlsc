// =====================================================================
// STUDIO — complete production reference sheet
//
// ONE professional file that gives The Factory Nigeria everything:
// front/back mockups, print-area close-ups, ORIGINAL artwork panels
// (untouched, aspect preserved, transparency shown on checkerboard),
// colour name/swatch/HEX/RGB/status, fabric, quantity, sizes,
// placement measurements, quality/contrast warnings and the honesty
// notices. No editor UI, handles or grids appear here.
// =====================================================================

import {
  AVAILABILITY_LABEL,
  colorAvailability,
  DIFFICULT_AREA_NOTICE,
  fabricMethodIssue,
  getProductionMethod,
  GUIDES_NOTICE,
  isSublimated,
  MARKET_SOURCING_NOTICE,
  PREVIEW_DISCLAIMER,
  QUALITY_COPY,
  SUBLIMATION_BLANK_NOTE,
  SUBLIMATION_NOTE,
  TOWEL_BACK_NOTE,
  type ViewId,
} from "./catalog";
import { minimumFor } from "./factoryFacts";
import { composeViewCanvas, download, imageLayers, loadImage } from "./exporter";
import { fabricLine, getFabric, layerLine, productionLine, sizesLine } from "./messages";
import {
  blankTooDarkForSublimation,
  difficultCrossings,
  fontOf,
  fullSurfaceOnNonSublimated,
  getProduct,
  qualityLevel,
  SIZE_KEYS,
  sizeTotal,
  visibleLayersForView,
  type DesignState,
  type ImageLayer,
} from "./state";
import { hexLuma, hexToRgb, STAGE_H, STAGE_W } from "./garment";

const W = 2200;
const H = 1980;
const FOOT = 150;
const INK = "#14110f";
const PAPER = "#f7f3ec";
const LINE = "#d8d3c8";
const SOFT = "#5c554d";
const WARN = "#8a5d0f";
const ERR = "#b02a20";

const COLOUR_NOTICE =
  "Screen colours are approximate. The Factory Nigeria will confirm the final garment, fabric and print colours before production.";
const CUSTOM_COLOUR_LINE =
  "Custom colour — market availability and final colour match require confirmation.";

function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
  ctx.fillStyle = SOFT;
  ctx.font = "600 22px Archivo, Arial, sans-serif";
  ctx.fillText(text.toUpperCase(), x, y);
}

function value(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max = 560, colour = INK, size = 27) {
  ctx.fillStyle = colour;
  ctx.font = `500 ${size}px Archivo, Arial, sans-serif`;
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const w of words) {
    const t = line ? line + " " + w : w;
    if (ctx.measureText(t).width > max && line) {
      ctx.fillText(line, x, yy);
      line = w;
      yy += size + 7;
    } else line = t;
  }
  ctx.fillText(line, x, yy);
  return yy + size + 7;
}

/** Draw one mockup panel with a labelled frame. */
async function mockupPanel(ctx: CanvasRenderingContext2D, state: DesignState, view: ViewId, x: number, y: number, h: number) {
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
  if (!visibleLayersForView(state, view).length) {
    ctx.fillStyle = "rgba(20,17,15,0.55)";
    ctx.fillRect(x, y + h - 44, w, 44);
    ctx.fillStyle = PAPER;
    ctx.font = "700 20px Archivo, Arial, sans-serif";
    ctx.fillText("NO DESIGN ADDED", x + 16, y + h - 16);
  }
  return w;
}

/** Close-up of the print zone (cropped from the composed view). */
async function closeupPanel(ctx: CanvasRenderingContext2D, state: DesignState, view: ViewId, x: number, y: number, w: number, h: number) {
  const zone = getProduct(state).zones[view];
  const composed = await composeViewCanvas(state, view, 2);
  const pad = 28;
  const sx = zone.x * 2 - pad;
  const sy = zone.y * 2 - pad;
  const sw = zone.w * 2 + pad * 2;
  const sh = zone.h * 2 + pad * 2;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x, y, w, h);
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

/** Original artwork panel: untouched uploaded image, aspect preserved,
 *  checkerboard behind transparency. Never stretched, never recoloured. */
async function originalPanel(ctx: CanvasRenderingContext2D, layer: ImageLayer | undefined, title: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#ececea";
  const c = 14;
  for (let yy = 0; yy < h; yy += c)
    for (let xx = yy % (c * 2) === 0 ? 0 : c; xx < w; xx += c * 2)
      ctx.fillRect(x + xx, y + yy, Math.min(c, w - xx), Math.min(c, h - yy));
  if (layer) {
    const img = await loadImage(layer.src);
    const k = Math.min((w - 24) / img.naturalWidth, (h - 56) / img.naturalHeight);
    const dw = img.naturalWidth * k;
    const dh = img.naturalHeight * k;
    ctx.drawImage(img, x + (w - dw) / 2, y + 40 + (h - 56 - dh) / 2, dw, dh);
  } else {
    ctx.fillStyle = SOFT;
    ctx.font = "600 22px Archivo, Arial, sans-serif";
    ctx.fillText("Text layers only", x + 20, y + h / 2 + 8);
  }
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = INK;
  ctx.fillRect(x, y, Math.min(w, 320), 34);
  ctx.fillStyle = PAPER;
  ctx.font = "700 17px Archivo, Arial, sans-serif";
  ctx.fillText(title.toUpperCase(), x + 14, y + 23);
}

function warnings(state: DesignState): string[] {
  const out: string[] = [];
  const product = getProduct(state);
  const shirtLuma = hexLuma(state.color.hex);

  // Can the chosen method physically do what the design asks of it?
  const fabIssue = fabricMethodIssue(product, getFabric(state));
  if (fabIssue) out.push(`Fabric: ${fabIssue}`);
  if (blankTooDarkForSublimation(product, state.color.hex)) {
    out.push(`Blank: “${state.color.name}” is too dark to sublimate onto. ${SUBLIMATION_BLANK_NOTE}`);
  }
  if (fullSurfaceOnNonSublimated(state)) {
    out.push(
      `Full surface: this design carries a full-surface (sublimation) layer, but the ${product.name.toLowerCase()} is ${getProductionMethod(product).label.toLowerCase()}. Confirm how much of it can be reproduced with that method.`,
    );
  }
  // Prompt the team to state the minimum, since Studio does not invent one.
  const min = minimumFor(product);
  if (!min.confirmed) out.push(`Minimum: ${min.note}`);
  for (const l of state.layers) {
    if (l.hidden) continue;
    const side = l.view === "front" ? "Front" : "Back";
    const who = l.kind === "image" ? `“${l.fileName}”` : `“${l.text.replace(/\n/g, " / ")}”`;
    if (l.kind === "image") {
      // A Studio-generated full surface is vector artwork — it has no pixel
      // resolution to be "low", so a DPI warning on it would be a false alarm.
      if (!l.generated) {
        const q = qualityLevel(l, product);
        if (q !== "good") out.push(`${side} ${who}: ${QUALITY_COPY[q]}`);
        // Sublimation prints gradients natively; for printed garments,
        // many-colour art usually means a digital method, not screens.
        if (l.manyColors && !isSublimated(product))
          out.push(
            `${side} ${who}: many-colour / gradient artwork — usually suits a digital method rather than per-colour screen printing; confirm the method.`,
          );
      }
      if (typeof l.avgLuma === "number" && Math.abs(l.avgLuma - shirtLuma) < 0.16)
        out.push(`${side} ${who}: low contrast against the ${state.color.name.toLowerCase()} fabric — confirm legibility before printing.`);
    }
    // A full-surface sublimated design is MEANT to cover everything — it is not
    // a "difficult crossing", it is the product.
    const generated = l.kind === "image" && l.generated;
    const cross = generated ? [] : difficultCrossings(l, product);
    if (cross.length) out.push(`${side} ${who}: crosses the ${cross.join(" and ")}. ${DIFFICULT_AREA_NOTICE}`);
  }
  return out;
}

/** Distinct fonts used across text layers, with licence (for production reuse). */
function fontsUsed(state: DesignState): string[] {
  const seen = new Map<string, string>();
  for (const l of state.layers) {
    if (l.hidden || l.kind !== "text") continue;
    const f = fontOf(l);
    if (!seen.has(f.name)) seen.set(f.name, `${f.name} — ${f.license}${f.source ? ` (${f.source})` : ""}`);
  }
  return [...seen.values()];
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
  ctx.fillText("THE FACTORY NIGERIA — STUDIO REFERENCE", 48, 68);
  ctx.font = "600 26px Archivo, Arial, sans-serif";
  ctx.globalAlpha = 0.8;
  const dateStr = new Date().toISOString().slice(0, 10);
  const head = `${state.reference}  ·  ${dateStr}  ·  PROTOTYPE — VISUAL REFERENCE ONLY`;
  ctx.fillText(head, W - 48 - ctx.measureText(head).width, 68);
  ctx.globalAlpha = 1;

  // Mockup panels (left)
  const mockH = 840;
  let mx = 48;
  for (const v of views) {
    const w = await mockupPanel(ctx, state, v, mx, 150, mockH);
    mx += w + 28;
  }

  // Close-ups under mockups — always BOTH sides
  const cuY = 150 + mockH + 26;
  const cuW = (mx - 48 - 28) / 2 - 14;
  let cx0 = 48;
  for (const v of views) {
    await closeupPanel(ctx, state, v, cx0, cuY, cuW, H - cuY - FOOT - 20);
    cx0 += cuW + 28;
  }

  // ------- Info column (right) -------
  const ix = mx + 24;
  const colW = W - ix - 48;
  let iy = 186;

  label(ctx, "Customer", ix, iy);
  iy = value(ctx, [d.name || "—", d.phone, d.email].filter((s) => s.trim()).join("  ·  "), ix, iy + 34, colW);

  label(ctx, "Product", ix, iy + 14);
  iy = value(ctx, `${product.name} — ${AVAILABILITY_LABEL[product.availability]}`, ix, iy + 48, colW);

  // HOW it is made — the team reads this before anything else.
  label(ctx, "Production method", ix, iy + 14);
  iy = value(ctx, productionLine(product), ix, iy + 48, colW);
  if (isSublimated(product)) iy = value(ctx, SUBLIMATION_NOTE, ix, iy + 6, colW, SOFT, 21);

  if (product.tshirtOptionLabel) {
    label(ctx, "T-shirt option", ix, iy + 14);
    iy = value(ctx, product.tshirtOptionLabel, ix, iy + 48, colW);
    if (product.tshirtOption === "custom-made") iy = value(ctx, TOWEL_BACK_NOTE, ix, iy + 6, colW, SOFT, 21);
  }

  // Colour: swatch + name/hex/rgb/status + notices
  label(ctx, "Garment colour", ix, iy + 14);
  ctx.fillStyle = state.color.hex;
  ctx.fillRect(ix, iy + 28, 64, 64);
  ctx.strokeStyle = LINE;
  ctx.strokeRect(ix, iy + 28, 64, 64);
  const rgb = hexToRgb(state.color.hex);
  const rgbTxt = rgb ? `RGB ${rgb.r}, ${rgb.g}, ${rgb.b}` : "";
  iy = value(
    ctx,
    `${state.color.name} — ${state.color.hex.toUpperCase()} · ${rgbTxt} · ${AVAILABILITY_LABEL[colorAvailability(state.color.status)]}`,
    ix + 84,
    iy + 56,
    colW - 90,
  );
  iy = value(ctx, COLOUR_NOTICE, ix, iy + 8, colW, SOFT, 21);
  if (state.color.status === "confirm") iy = value(ctx, CUSTOM_COLOUR_LINE, ix, iy + 2, colW, "#7e1680", 21);

  label(ctx, "Fabric", ix, iy + 14);
  iy = value(ctx, fabricLine(state) || "No preference — team to advise", ix, iy + 48, colW);

  for (const v of views) {
    const ls = visibleLayersForView(state, v);
    if (!ls.length) continue;
    label(ctx, `${v} design — ${ls.length} layer${ls.length === 1 ? "" : "s"}`, ix, iy + 14);
    iy += 42;
    for (const l of ls) iy = value(ctx, "• " + layerLine(l, product), ix, iy + 6, colW, INK, 22);
  }

  label(ctx, "Quantity", ix, iy + 14);
  iy = value(ctx, `${d.quantity.trim() || "—"}  ·  Sizes: ${sizesLine(state)}`, ix, iy + 48, colW);

  // Size table
  label(ctx, "Size breakdown", ix, iy + 14);
  iy += 40;
  const step = Math.floor((colW - 90) / SIZE_KEYS.length);
  let sx0 = ix;
  for (const k of SIZE_KEYS) {
    ctx.fillStyle = SOFT;
    ctx.font = "600 24px Archivo, Arial, sans-serif";
    ctx.fillText(k, sx0, iy + 26);
    ctx.fillStyle = INK;
    ctx.font = "700 30px Archivo, Arial, sans-serif";
    ctx.fillText(String(d.sizes[k] || 0), sx0, iy + 62);
    sx0 += step;
  }
  ctx.fillStyle = SOFT;
  ctx.font = "600 24px Archivo, Arial, sans-serif";
  ctx.fillText("TOTAL", sx0, iy + 26);
  ctx.fillStyle = INK;
  ctx.font = "800 30px Archivo, Arial, sans-serif";
  ctx.fillText(String(sizeTotal(d.sizes)), sx0, iy + 62);
  iy += 92;
  if (d.otherSizes.trim()) iy = value(ctx, `Custom sizing (to confirm): ${d.otherSizes.trim()}`, ix, iy, colW);

  const facts: [string, string][] = [
    ["Print preference", d.method],
    ["Required date", d.deadline],
    ["Delivery", d.deliveryLocation],
    ["Notes", d.notes],
  ];
  for (const [l, v] of facts) {
    if (!v.trim()) continue;
    label(ctx, l, ix, iy + 14);
    iy = value(ctx, v, ix, iy + 48, colW);
  }

  // Fonts used (licence + source, so the team can reuse the exact font)
  const fonts = fontsUsed(state);
  if (fonts.length) {
    label(ctx, "Fonts used (licensed)", ix, iy + 14);
    iy += 42;
    for (const ft of fonts) iy = value(ctx, "• " + ft, ix, iy + 6, colW, SOFT, 22);
  }

  // Warnings block (quality / contrast) — text, colour-coded
  const warns = warnings(state);
  if (warns.length) {
    label(ctx, "Checks for the team", ix, iy + 14);
    iy += 48;
    for (const wtxt of warns) {
      iy = value(ctx, "⚠ " + wtxt, ix, iy, colW, wtxt.includes("Low resolution") ? ERR : WARN, 22);
      iy += 2;
    }
  }

  // Original artwork panels — anchored to the column bottom, shrinking
  // (never overlapping the text above) if the column ran long.
  const originals = imageLayers(state);
  const thumbW = Math.floor((colW - 20) / 2);
  const ty = Math.max(iy + 18, H - FOOT - 20 - 250);
  const thumbH = Math.max(160, H - FOOT - 20 - ty);
  if (ty + thumbH <= H - FOOT - 10) {
    // Generated pattern SVGs are Studio output, never "original" customer art.
    const title = (l?: ImageLayer) => (l ? `${l.generated ? "Studio-generated" : "Original"} — ${l.fileName}` : "Uploaded artwork");
    const t0 = title(originals[0]);
    const t1 = originals.length > 2 ? `${title(originals[1])} (+${originals.length - 2} more)` : title(originals[1]);
    await originalPanel(ctx, originals[0], t0, ix, ty, thumbW, thumbH);
    await originalPanel(ctx, originals[1], t1, ix + thumbW + 20, ty, thumbW, thumbH);
  }

  // Footer disclaimers. The guides notice is here deliberately: the team must
  // read the placement as the customer's intent, not as a mistake to correct.
  const noticeSplit = MARKET_SOURCING_NOTICE.indexOf("; if not");
  const noticeA = MARKET_SOURCING_NOTICE.slice(0, noticeSplit + 1);
  const noticeB = MARKET_SOURCING_NOTICE.slice(noticeSplit + 2);
  ctx.fillStyle = INK;
  ctx.fillRect(0, H - FOOT, W, FOOT);
  ctx.fillStyle = PAPER;
  ctx.globalAlpha = 0.85;
  ctx.font = "19px Archivo, Arial, sans-serif";
  ctx.fillText(GUIDES_NOTICE, 48, H - 126);
  ctx.fillText(PREVIEW_DISCLAIMER, 48, H - 100);
  ctx.fillText(COLOUR_NOTICE, 48, H - 74);
  ctx.fillText(noticeA, 48, H - 48);
  ctx.fillText(noticeB, 48, H - 22);
  ctx.globalAlpha = 1;

  return canvas.toDataURL("image/png");
}

export async function downloadReferenceSheet(state: DesignState): Promise<void> {
  download(await exportReferenceSheet(state), `${state.reference}-studio-reference.png`);
}
