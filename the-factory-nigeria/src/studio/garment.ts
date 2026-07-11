// =====================================================================
// CUSTOM TEE STUDIO — photoreal garment rendering (deterministic, local)
//
// The garment is a REAL photograph (generated once with Higgsfield's
// marketing-studio model during development — see docs), processed into
// a transparent-background PNG. At runtime we never call any AI service:
// colour is applied locally by compositing
//    1. flat colour, masked by the garment's alpha silhouette
//    2. the customer's artwork (clipped to the garment)
//    3. the photo itself as a multiply layer   -> real folds & shadows
//    4. the photo again as a screen layer      -> highlights on dark fabric
// The same math runs in CSS (live editor) and Canvas 2D (exports), so the
// preview and the production reference always match.
// =====================================================================

import type { ViewId } from "./catalog";

/** Logical stage space (all zone/artwork coordinates live here). */
export const STAGE_W = 600;
export const STAGE_H = 700;

const A = "/assets/the-factory-nigeria/studio";

export const GARMENT_IMG: Record<string, Record<ViewId, string>> = {
  "unisex-tee": { front: `${A}/tee-std-front.webp`, back: `${A}/tee-std-back.webp` },
  "oversized-tee": { front: `${A}/tee-os-front.webp`, back: `${A}/tee-os-back.webp` },
};

/** Mean luminance of the photographed grey fabric (measured from asset). */
export const FABRIC_LUMA = 0.505;

// ---------------------------------------------------------------------
// Colour math
// ---------------------------------------------------------------------
export function hexLuma(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 0.5;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/**
 * Layer tuning per shirt colour: the multiply layer is brightness-lifted so
 * mid-grey fabric doesn't muddy the tint; dark shirts get a stronger screen
 * (highlight) pass so folds stay visible on black/navy.
 */
export function layerTuning(colorHex: string) {
  const luma = hexLuma(colorHex);
  const shadeBrightness = 1 / FABRIC_LUMA; // normalise fabric to ~white flats
  const lightOpacity = luma < 0.16 ? 0.5 : luma < 0.35 ? 0.34 : luma < 0.6 ? 0.16 : 0.08;
  return { shadeBrightness: round2(shadeBrightness), lightOpacity };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

// ---------------------------------------------------------------------
// Shared image cache (decoded once; reused by editor + exports)
// ---------------------------------------------------------------------
const cache = new Map<string, Promise<HTMLImageElement>>();

export function loadGarmentImage(src: string): Promise<HTMLImageElement> {
  let p = cache.get(src);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
    cache.set(src, p);
  }
  return p;
}

// ---------------------------------------------------------------------
// Canvas compositing (used by exports; mirrors the CSS layers exactly)
// ---------------------------------------------------------------------
export async function drawGarment(
  ctx: CanvasRenderingContext2D,
  productId: string,
  view: ViewId,
  colorHex: string,
  x: number,
  y: number,
  w: number,
  h: number,
  drawArtwork?: (ctx: CanvasRenderingContext2D) => void,
): Promise<void> {
  const photo = await loadGarmentImage((GARMENT_IMG[productId] ?? GARMENT_IMG["unisex-tee"])[view]);
  const { shadeBrightness, lightOpacity } = layerTuning(colorHex);

  // Work on an offscreen layer so blend modes stay contained
  const layer = document.createElement("canvas");
  layer.width = Math.round(w);
  layer.height = Math.round(h);
  const lc = layer.getContext("2d");
  if (!lc) return;

  // 1) flat colour masked by the garment silhouette
  lc.drawImage(photo, 0, 0, layer.width, layer.height);
  lc.globalCompositeOperation = "source-in";
  lc.fillStyle = colorHex;
  lc.fillRect(0, 0, layer.width, layer.height);

  // 2) customer artwork, clipped to the silhouette
  if (drawArtwork) {
    lc.globalCompositeOperation = "source-atop";
    drawArtwork(lc);
  }

  // 3) folds & shadows (multiply, luma-normalised)
  lc.globalCompositeOperation = "multiply";
  lc.filter = `grayscale(1) brightness(${shadeBrightness})`;
  lc.drawImage(photo, 0, 0, layer.width, layer.height);
  lc.filter = "none";

  // 4) highlights for dark fabrics (screen)
  if (lightOpacity > 0) {
    lc.globalCompositeOperation = "screen";
    lc.globalAlpha = lightOpacity;
    lc.filter = "grayscale(1) contrast(1.15)";
    lc.drawImage(photo, 0, 0, layer.width, layer.height);
    lc.filter = "none";
    lc.globalAlpha = 1;
  }

  // 5) restore crisp silhouette (blend ops can spill onto transparent edge)
  lc.globalCompositeOperation = "destination-in";
  lc.drawImage(photo, 0, 0, layer.width, layer.height);

  ctx.drawImage(layer, x, y, w, h);
}
