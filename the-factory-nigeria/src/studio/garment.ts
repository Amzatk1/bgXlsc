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

import { ASSET_BASE, type ViewId } from "./catalog";

/** Logical stage space (all zone/artwork coordinates live here). */
export const STAGE_W = 600;
export const STAGE_H = 700;

const A = ASSET_BASE;

export const GARMENT_IMG: Record<string, Record<ViewId, string>> = {
  // The two T-shirt options differ by how they are MADE, not by silhouette —
  // they legitimately share the same photographed tee.
  "tee-custom": { front: `${A}/tee-std-front.webp`, back: `${A}/tee-std-back.webp` },
  "tee-readymade": { front: `${A}/tee-std-front.webp`, back: `${A}/tee-std-back.webp` },
  "oversized-tee": { front: `${A}/tee-os-front.webp`, back: `${A}/tee-os-back.webp` },
  polo: { front: `${A}/polo-front.webp`, back: `${A}/polo-back.webp` },
  hoodie: { front: `${A}/hoodie-front.webp`, back: `${A}/hoodie-back.webp` },
  jersey: { front: `${A}/jersey-front.webp`, back: `${A}/jersey-back.webp` },
  basketball: { front: `${A}/basketball-front.webp`, back: `${A}/basketball-back.webp` },
  "cap-snapback": { front: `${A}/cap-snapback-front.webp`, back: `${A}/cap-snapback-back.webp` },
  "cap-baseball": { front: `${A}/cap-baseball-front.webp`, back: `${A}/cap-baseball-back.webp` },
  "cap-trucker": { front: `${A}/cap-trucker-front.webp`, back: `${A}/cap-trucker-back.webp` },
};

/**
 * Mean luminance of each garment's photographed grey fabric, measured
 * per asset (alpha-weighted mean over garment pixels). Keeps the
 * multiply-normalisation correct as the library grows.
 */
export const FABRIC_LUMA: Record<string, number> = {
  "tee-custom": 0.505,
  "tee-readymade": 0.505,
  "oversized-tee": 0.505,
  polo: 0.507,
  hoodie: 0.506,
  jersey: 0.505,
  basketball: 0.518,
  "cap-snapback": 0.487,
  "cap-baseball": 0.524,
  "cap-trucker": 0.474,
};

export const DEFAULT_FABRIC_LUMA = 0.505;

/** Fallback garment when an unknown product id turns up (e.g. an old saved design). */
export const DEFAULT_PRODUCT_ID = "tee-readymade";

export function garmentImg(productId: string, view: ViewId): string {
  return (GARMENT_IMG[productId] ?? GARMENT_IMG[DEFAULT_PRODUCT_ID])[view];
}

// ---------------------------------------------------------------------
// Colour math
// ---------------------------------------------------------------------
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

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
 * (highlight) pass so folds stay visible on black/navy. The normalisation
 * constant is per garment (each photo's fabric luma is measured).
 */
export function layerTuning(colorHex: string, productId?: string) {
  const luma = hexLuma(colorHex);
  const fabricLuma = (productId && FABRIC_LUMA[productId]) || DEFAULT_FABRIC_LUMA;
  const shadeBrightness = 1 / fabricLuma; // normalise fabric to ~white flats
  const lightOpacity = luma < 0.16 ? 0.5 : luma < 0.35 ? 0.34 : luma < 0.6 ? 0.16 : 0.08;
  return { shadeBrightness: round2(shadeBrightness), lightOpacity };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

// ---------------------------------------------------------------------
// Text rendering — the SAME convention drives the HTML editor and the
// Canvas exports, so on-screen text matches the production reference:
//   font-size (px) = `size` × STAGE_H × scale
//   aspect = measured text width ÷ font-size
// ---------------------------------------------------------------------
let measureCtx: CanvasRenderingContext2D | null = null;
function getMeasureCtx(): CanvasRenderingContext2D | null {
  if (measureCtx) return measureCtx;
  if (typeof document === "undefined") return null;
  measureCtx = document.createElement("canvas").getContext("2d");
  return measureCtx;
}

type CtxLS = CanvasRenderingContext2D & { letterSpacing?: string };

/**
 * Block width ÷ block height of the rendered text, where the block is every
 * line stacked at `lineHeight`. Used to size the layer's bounding box, so a
 * two-line name occupies twice the height of a one-line name.
 */
export function measureTextAspect(
  text: string,
  fontStack: string,
  weight = 700,
  letterSpacing = 0,
  lineHeight = 1,
): number {
  const lines = (text || " ").split("\n");
  const lh = lineHeight > 0 ? lineHeight : 1;
  const blockH = lines.length * lh * 100; // at a 100px reference font size
  const ctx = getMeasureCtx() as CtxLS | null;
  if (!ctx) {
    const longest = Math.max(1, ...lines.map((l) => l.length));
    return Math.max(0.15, (longest * (0.62 + letterSpacing) * 100) / blockH);
  }
  ctx.font = `${weight} 100px ${fontStack}`;
  try {
    ctx.letterSpacing = `${letterSpacing * 100}px`;
  } catch {
    /* older engines: fall back to metric width only */
  }
  let maxW = 0;
  for (const line of lines) {
    const t = line || " ";
    const w = ctx.measureText(t).width + (ctx.letterSpacing ? 0 : letterSpacing * 100 * Math.max(0, t.length - 1));
    if (w > maxW) maxW = w;
  }
  try {
    ctx.letterSpacing = "0px";
  } catch {
    /* noop */
  }
  return Math.max(0.15, maxW / blockH);
}

export type TextDraw = {
  /** may contain newlines */
  text: string;
  fontStack: string;
  weight: number;
  color: string;
  outline: string;
  outlineWidth: number; // fraction of font size
  letterSpacing?: number; // fraction of font size
  lineHeight?: number; // multiple of font size
  align?: "left" | "center" | "right";
};

/**
 * Draw a text block centred at (cx,cy). `fontSizePx` is the size of ONE line;
 * the block grows downward/upward around the centre as lines are added. The
 * geometry matches the CSS the editor uses, so the export is what you saw.
 */
export function drawText(
  ctx: CanvasRenderingContext2D,
  t: TextDraw,
  cx: number,
  cy: number,
  fontSizePx: number,
  rotationDeg: number,
): void {
  const c = ctx as CtxLS;
  const lines = (t.text || " ").split("\n");
  const lh = (t.lineHeight && t.lineHeight > 0 ? t.lineHeight : 1) * fontSizePx;
  const blockH = lines.length * lh;
  const align = t.align ?? "center";

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotationDeg * Math.PI) / 180);
  ctx.font = `${t.weight} ${fontSizePx}px ${t.fontStack}`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  try {
    c.letterSpacing = `${(t.letterSpacing ?? 0) * fontSizePx}px`;
  } catch {
    /* noop */
  }

  // Left/right alignment is relative to the widest line, which is what the
  // layer's bounding box is measured from — same as the CSS box in the editor.
  let maxW = 0;
  for (const line of lines) maxW = Math.max(maxW, ctx.measureText(line || " ").width);
  const x = align === "left" ? -maxW / 2 : align === "right" ? maxW / 2 : 0;

  lines.forEach((line, i) => {
    const y = -blockH / 2 + lh * (i + 0.5);
    if (t.outline && t.outlineWidth > 0) {
      ctx.strokeStyle = t.outline;
      ctx.lineWidth = Math.max(1, t.outlineWidth * fontSizePx * 2);
      ctx.strokeText(line, x, y);
    }
    ctx.fillStyle = t.color;
    ctx.fillText(line, x, y);
  });

  try {
    c.letterSpacing = "0px";
  } catch {
    /* noop */
  }
  ctx.restore();
}

/**
 * Ensure bundled WebFonts are decoded before a canvas export uses them
 * (canvas silently falls back to a default face for a font that isn't loaded).
 */
export async function ensureFontsLoaded(families: string[]): Promise<void> {
  const fd = (document as Document & { fonts?: FontFaceSet }).fonts;
  if (!fd) return;
  try {
    await Promise.all(families.flatMap((f) => [fd.load(`400 40px "${f}"`), fd.load(`600 40px "${f}"`)]));
    await fd.ready;
  } catch {
    /* font loading best-effort; export still succeeds with fallback */
  }
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
  const photo = await loadGarmentImage(garmentImg(productId, view));
  const { shadeBrightness, lightOpacity } = layerTuning(colorHex, productId);

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
