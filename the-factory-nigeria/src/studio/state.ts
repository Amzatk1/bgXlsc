// =====================================================================
// STUDIO — design state (pure, framework-free, unit-tested)
//
// A design is a stack of LAYERS placed anywhere on the garment. Each layer
// is either an uploaded image (logo, sponsor, artwork) or editable text
// (custom text, player name, player number). Layers live in stage-normalised
// coordinates (0–1 over the 600×700 stage), so designs can be positioned
// freely — chest, full front/back, sleeves — not confined to one box.
// Printable-area guides and per-area warnings are advisory; the team always
// confirms placement, size and method before production.
// =====================================================================

import {
  areasForView,
  avoidAreasForView,
  DPI_THRESHOLDS,
  getFontById,
  getProductionMethod,
  isSublimated,
  MIN_ORDER,
  placementsFor,
  PRODUCTS,
  productPpi,
  SUBLIMATION_MAX_BLANK_LUMA,
  type Placement,
  type PrintArea,
  type PrintZone,
  type Product,
  type ProductionMethod,
  type QualityLevel,
  type ShirtColor,
  type ViewId,
} from "./catalog";
import { hexLuma, STAGE_H, STAGE_W } from "./garment";
import { getPatternDef, patternDataUrl, PATTERN_H, PATTERN_W, renderPatternSvg, type PatternSpec } from "./patterns";

// ---------------------------------------------------------------------
// Layer model
// ---------------------------------------------------------------------
export type TextRole = "text" | "name" | "number";

/** Fields captured when an image is taken in locally (see imageFile.ts). */
export type Artwork = {
  src: string;
  fileName: string;
  fileKB: number;
  naturalW: number;
  naturalH: number;
  hasAlpha: boolean;
  /** average tone of the artwork (0–1), used for legibility warnings */
  avgLuma?: number;
  /**
   * Artwork reads as photographic / gradient (many distinct colours). Screen
   * printing is priced per colour, so this steers a soft "usually a digital
   * method" note — never a block, never a claim about the team's machines.
   */
  manyColors?: boolean;
};

type LayerBase = {
  id: string;
  view: ViewId;
  /** optional custom name (falls back to a generated label) */
  name?: string;
  /** hidden layers stay in the list but are excluded from preview + exports */
  hidden?: boolean;
  /** locked layers render normally but can't be dragged/edited until unlocked */
  locked?: boolean;
  /** centre, stage-normalised (0–1 across the whole garment) */
  cx: number;
  cy: number;
  /**
   * size — images: fraction of stage WIDTH the artwork spans.
   * text: fraction of stage HEIGHT the cap height spans.
   */
  size: number;
  /** degrees, clockwise */
  rotation: number;
};

export type ImageLayer = LayerBase & { kind: "image" } & Artwork & {
    /** Studio generated this image (a full-surface jersey design) — not a customer upload. */
    generated?: boolean;
    /** the pattern spec that produced it, so The Factory can reproduce it exactly */
    pattern?: PatternSpec;
  };

export type TextAlign = "left" | "center" | "right";

export type TextLayer = LayerBase & {
  kind: "text";
  role: TextRole;
  /** may contain newlines — text is a block, not a single line */
  text: string;
  fontId: string;
  color: string;
  /** outline colour; "" = no outline */
  outline: string;
  /** outline width as a fraction of cap height (0 = none) */
  outlineWidth: number;
  /** letter spacing as a fraction of cap height (can be negative) */
  letterSpacing: number;
  /** line spacing as a multiple of the font size (1 = tight) */
  lineHeight: number;
  /** how multiple lines line up against each other */
  align: TextAlign;
  /** measured width÷height of the whole rendered block (kept fresh by the editor) */
  aspect: number;
};

export type Layer = ImageLayer | TextLayer;

export type ColorChoice = ShirtColor & { custom?: boolean };

export const SIZE_KEYS = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export type SizeKey = (typeof SIZE_KEYS)[number];
export type SizeBreakdown = Record<SizeKey, number>;

export function emptySizes(): SizeBreakdown {
  return { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
}

export type OrderDetails = {
  quantity: string;
  sizes: SizeBreakdown;
  otherSizes: string;
  sameDesign: "yes" | "no" | "";
  method: string;
  fabricId: string;
  deadline: string;
  deliveryLocation: string;
  notes: string;
  name: string;
  phone: string;
  email: string;
};

export type DesignState = {
  productId: string;
  view: ViewId;
  color: ColorChoice;
  layers: Layer[];
  selectedId: string | null;
  details: OrderDetails;
  reference: string;
};

// ---------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------
export function makeReference(now: number = Date.now()): string {
  return "TFN-DS-" + now.toString(36).toUpperCase().slice(-6);
}

let layerSeq = 0;
export function makeLayerId(): string {
  layerSeq += 1;
  return "L" + Date.now().toString(36) + "-" + layerSeq;
}

export function initialState(): DesignState {
  return {
    productId: PRODUCTS[0].id,
    view: "front",
    color: { id: "white", name: "White", hex: "#f4f2ee", status: "standard" },
    layers: [],
    selectedId: null,
    details: {
      quantity: "",
      sizes: emptySizes(),
      otherSizes: "",
      sameDesign: "",
      method: "",
      fabricId: "",
      deadline: "",
      deliveryLocation: "",
      notes: "",
      name: "",
      phone: "",
      email: "",
    },
    reference: makeReference(),
  };
}

export function getProduct(state: DesignState): Product {
  return PRODUCTS.find((p) => p.id === state.productId) ?? PRODUCTS[0];
}

/** How the selected garment is actually made — surfaced everywhere downstream. */
export function productionOf(state: DesignState): ProductionMethod {
  return getProductionMethod(getProduct(state));
}

/**
 * The T-shirt option line, exactly as it must appear on the review screen and
 * the production reference. Empty for garments that are not T-shirts.
 */
export function tshirtOptionLine(product: Product): string {
  return product.tshirtOptionLabel ?? "";
}

/**
 * Order details that stop making sense on the newly selected garment.
 * A sublimated jersey has no print-method choice — the method IS sublimation —
 * so a preference picked for an earlier garment must not travel with the
 * design and resurface as a stale claim in the review and the enquiry.
 * Never touches layers: switching garments never deletes design work.
 */
export function reconcileDetailsForProduct(details: OrderDetails, product: Product): OrderDetails {
  if (isSublimated(product) && details.method.trim()) {
    return { ...details, method: "" };
  }
  return details;
}

/** Primary (torso) print zone for the current view. */
export function getZone(state: DesignState): PrintZone {
  return getProduct(state).zones[state.view];
}

export function layersForView(state: DesignState, view: ViewId): Layer[] {
  return state.layers.filter((l) => l.view === view);
}

/** Layers actually rendered on a view (skips hidden). */
export function visibleLayersForView(state: DesignState, view: ViewId): Layer[] {
  return state.layers.filter((l) => l.view === view && !l.hidden);
}

export function getSelected(state: DesignState): Layer | undefined {
  return state.layers.find((l) => l.id === state.selectedId);
}

export function hasAnyDesign(state: DesignState): boolean {
  return state.layers.some((l) => !l.hidden);
}

export function viewsWithDesign(state: DesignState): ViewId[] {
  const out: ViewId[] = [];
  for (const v of ["front", "back"] as ViewId[]) if (state.layers.some((l) => l.view === v && !l.hidden)) out.push(v);
  return out;
}

/** Short summary of what's on a view, e.g. "3 elements" / "Name, number" / "No design". */
export function viewSummary(state: DesignState, view: ViewId): string {
  const ls = visibleLayersForView(state, view);
  if (!ls.length) return "No design";
  const roles = ls.map((l) => (l.kind === "image" ? "logo" : l.role === "name" ? "name" : l.role === "number" ? "number" : "text"));
  if (ls.length <= 3) {
    // e.g. "Name, number, logo"
    return roles.map((r) => r[0].toUpperCase() + r.slice(1)).join(", ");
  }
  return `${ls.length} elements`;
}

// ---------------------------------------------------------------------
// Layer geometry — everything in stage pixels (600×700)
// ---------------------------------------------------------------------
/** Text is a block: one entry per line. */
export function textLines(text: string): string[] {
  return (text || " ").split("\n");
}

/** Block height as a multiple of the font size (lines × line spacing). */
export function textBlockScale(layer: TextLayer): number {
  const lh = layer.lineHeight > 0 ? layer.lineHeight : 1;
  return textLines(layer.text).length * lh;
}

/** Text aspect fallback when the editor hasn't measured yet (block width ÷ block height). */
export function textAspectGuess(text: string, lineHeight = 1): number {
  const lines = textLines(text);
  const longest = Math.max(1, ...lines.map((l) => l.trim().length));
  const blockH = lines.length * (lineHeight > 0 ? lineHeight : 1);
  return clamp((longest * 0.62) / blockH, 0.15, 12);
}

export function layerAspect(layer: Layer): number {
  if (layer.kind === "image") return layer.naturalW / layer.naturalH;
  return layer.aspect > 0 ? layer.aspect : textAspectGuess(layer.text, layer.lineHeight);
}

/** Bounding box in stage pixels: centre (x,y) + width/height. */
export function layerBox(layer: Layer): { x: number; y: number; w: number; h: number } {
  let w: number;
  let h: number;
  if (layer.kind === "image") {
    w = layer.size * STAGE_W;
    h = w * (layer.naturalH / layer.naturalW);
  } else {
    // `size` is the FONT size; the block grows with the number of lines.
    h = layer.size * STAGE_H * textBlockScale(layer);
    w = h * layerAspect(layer);
  }
  return { x: layer.cx * STAGE_W, y: layer.cy * STAGE_H, w, h };
}

/** Rotated corners of a layer, in stage pixels. */
export function layerCorners(layer: Layer): { x: number; y: number }[] {
  const b = layerBox(layer);
  const rad = (layer.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return [
    { x: -b.w / 2, y: -b.h / 2 },
    { x: b.w / 2, y: -b.h / 2 },
    { x: b.w / 2, y: b.h / 2 },
    { x: -b.w / 2, y: b.h / 2 },
  ].map((p) => ({ x: b.x + p.x * cos - p.y * sin, y: b.y + p.x * sin + p.y * cos }));
}

/** The alignment guide (torso / sleeve / …) whose centre is nearest the layer. */
export function homeArea(layer: Layer, product: Product): PrintArea {
  const areas = areasForView(product, layer.view);
  const b = layerBox(layer);
  let best = areas[0];
  let bestD = Infinity;
  for (const a of areas) {
    const d = Math.hypot(a.x + a.w / 2 - b.x, a.y + a.h / 2 - b.y);
    if (d < bestD) {
      bestD = d;
      best = a;
    }
  }
  return best;
}

/**
 * True when the layer extends beyond its nearest alignment guide.
 *
 * This is INFORMATION, not a verdict. A design that sits outside a guide is a
 * perfectly valid design — the guides exist to help people line things up, and
 * The Factory reviews the real placement before production. Nothing in the app
 * may use this to move, resize, block or reject a design; see validateForSubmit.
 */
export function isLayerOutOfArea(layer: Layer, product: Product, tolPx = 10): boolean {
  const a = homeArea(layer, product);
  return layerCorners(layer).some(
    (c) => c.x < a.x - tolPx || c.y < a.y - tolPx || c.x > a.x + a.w + tolPx || c.y > a.y + a.h + tolPx,
  );
}

/** Reads better at the call sites that only want to show an advisory hint. */
export const isOutsideGuide = isLayerOutOfArea;

/**
 * Names of difficult regions (collar/pocket/placket/seam/hem…) a layer overlaps.
 *
 * Method-aware, because the same seam is only a problem for some methods: a
 * SUBLIMATED garment is printed as flat panels BEFORE it is sewn, so a design
 * running across a side seam or a hem is completely normal — the seam does not
 * exist at print time. Warning about it would be a false alarm. Printing onto a
 * garment that is already finished is the case where a seam actually fights the
 * press, so the warnings apply there.
 */
export function difficultCrossings(layer: Layer, product: Product): string[] {
  const corners = layerCorners(layer);
  const minX = Math.min(...corners.map((c) => c.x));
  const maxX = Math.max(...corners.map((c) => c.x));
  const minY = Math.min(...corners.map((c) => c.y));
  const maxY = Math.max(...corners.map((c) => c.y));
  const sublimated = isSublimated(product);
  const out: string[] = [];
  for (const a of avoidAreasForView(product, layer.view)) {
    if (sublimated && a.seamRelated) continue;
    const overlap = minX < a.x + a.w && maxX > a.x && minY < a.y + a.h && maxY > a.y;
    if (overlap) out.push(a.name);
  }
  return out;
}

/**
 * Sublimation ink is a translucent dye: it can only darken what it bonds with,
 * so it cannot print a light colour onto a dark blank. A sublimated garment
 * starts from a white blank and gets ALL of its colour from the print.
 *
 * Returns an explanation when the chosen blank is too dark to be printed on —
 * never a block. The customer's real intent (a dark jersey) is achievable; it
 * just has to come from a full-surface design rather than from dyed fabric.
 */
export function blankTooDarkForSublimation(product: Product, colorHex: string): boolean {
  return isSublimated(product) && hexLuma(colorHex) < SUBLIMATION_MAX_BLANK_LUMA;
}

/**
 * A full-surface design is a SUBLIMATION idea: the whole panel is printed before
 * the garment is sewn. Carry one onto a garment that is printed after it is made
 * (a tee, a cap) and it stops being reproducible as drawn.
 *
 * We never delete it — the customer keeps their work, and switching garment must
 * not destroy anything. We just say so plainly, and let the team confirm how much
 * of it can be reproduced with the method that garment actually uses.
 */
export function fullSurfaceOnNonSublimated(state: DesignState): boolean {
  const product = getProduct(state);
  if (isSublimated(product)) return false;
  return state.layers.some((l) => l.kind === "image" && l.generated && !l.hidden);
}

/**
 * Keep a layer on the stage, and its size and rotation finite.
 *
 * This is the ONLY positional constraint in the editor. It never pulls a design
 * back into a guide, never shrinks it to fit a preset, and never refuses an
 * unusual placement — a design may sit anywhere on the visible garment, at any
 * size, at any angle.
 */
export function clampLayer(layer: Layer): Layer {
  const cx = clamp(layer.cx, 0.02, 0.98);
  const cy = clamp(layer.cy, 0.02, 0.98);
  const rotation = ((layer.rotation % 360) + 360) % 360;
  // Images reach 3× the stage width so a full-surface (sublimated) design can
  // cover the whole garment and bleed off every edge.
  const size = layer.kind === "image" ? clamp(layer.size, 0.04, 3) : clamp(layer.size, 0.02, 0.6);
  return { ...layer, cx, cy, size, rotation };
}

/**
 * An OPTIONAL convenience the customer can trigger from the panel ("Fit to
 * guide"). Nothing calls this automatically — no design is ever moved or
 * resized on the customer's behalf.
 */
export function fitLayerToArea(layer: Layer, product: Product): Layer {
  const a = homeArea(layer, product);
  let next: Layer = { ...layer, cx: (a.x + a.w / 2) / STAGE_W, cy: (a.y + a.h / 2) / STAGE_H };
  for (let i = 0; i < 40 && isLayerOutOfArea(next, product, 2); i++) {
    next = { ...next, size: next.size * 0.95 };
  }
  return clampLayer(next);
}

/** Snap rotation to the nearest right angle when within `within` degrees. */
export function snapRotation(rotation: number, within = 4): number {
  const norm = ((rotation % 360) + 360) % 360;
  for (const snap of [0, 90, 180, 270, 360]) {
    if (Math.abs(norm - snap) < within) return snap % 360;
  }
  return rotation;
}

/** Straighten: reset rotation to 0. */
export function straightenLayer(layer: Layer): Layer {
  return { ...layer, rotation: 0 };
}

export function applyPlacement(layer: Layer, placement: Placement, product: Product): Layer {
  const area = areasForView(product, layer.view).find((a) => a.id === placement.areaId);
  if (!area) return layer;
  const cx = (area.x + placement.rx * area.w) / STAGE_W;
  const cy = (area.y + placement.ry * area.h) / STAGE_H;
  let size = layer.size;
  if (layer.kind === "image") {
    const ppi = productPpi(product);
    size = Math.min(placement.sizeIn, area.widthIn) * ppi / STAGE_W;
  }
  return clampLayer({ ...layer, cx, cy, size, rotation: 0 });
}

export function placementsForLayer(product: Product, view: ViewId): Placement[] {
  return placementsFor(product, view);
}

// ---------------------------------------------------------------------
// Layer factories
// ---------------------------------------------------------------------
export function newImageLayer(art: Artwork, product: Product, view: ViewId): ImageLayer {
  const ppi = productPpi(product);
  const zone = product.zones[view];
  // default width ≈ 60% of the torso zone, height-capped
  let widthIn = zone.widthIn * 0.6;
  const aspect = art.naturalH / art.naturalW;
  const maxByH = (zone.heightIn * 0.6) / aspect;
  widthIn = Math.min(widthIn, maxByH);
  const size = (widthIn * ppi) / STAGE_W;
  const cx = (zone.x + zone.w / 2) / STAGE_W;
  const cy = (zone.y + zone.h * 0.34) / STAGE_H;
  return clampLayer({
    id: makeLayerId(),
    kind: "image",
    view,
    cx,
    cy,
    size,
    rotation: 0,
    ...art,
  }) as ImageLayer;
}

// ---------------------------------------------------------------------
// Full-surface layers (how a sublimated jersey is actually designed)
// ---------------------------------------------------------------------
/** The size (fraction of stage width) at which an image covers the whole garment. */
export function coverSize(naturalW: number, naturalH: number): number {
  const byHeight = (STAGE_H / STAGE_W) * (naturalW / naturalH);
  return clamp(Math.max(1, byHeight), 1, 3);
}

/** An image scaled to cover the entire garment — the base of a sublimated design. */
export function newBackgroundLayer(art: Artwork, view: ViewId, extra: Partial<ImageLayer> = {}): ImageLayer {
  return clampLayer({
    id: makeLayerId(),
    kind: "image",
    view,
    cx: 0.5,
    cy: 0.5,
    size: coverSize(art.naturalW, art.naturalH),
    rotation: 0,
    ...art,
    ...extra,
  } as ImageLayer) as ImageLayer;
}

/** The generated full-surface design as an ordinary (movable, deletable) image layer. */
export function patternArtwork(spec: PatternSpec): Artwork {
  const svg = renderPatternSvg(spec);
  return {
    src: patternDataUrl(spec),
    fileName: `full-surface-${spec.id}.svg`,
    fileKB: Math.max(1, Math.round(svg.length / 1024)),
    naturalW: PATTERN_W,
    naturalH: PATTERN_H,
    hasAlpha: false,
  };
}

export function newPatternLayer(spec: PatternSpec, view: ViewId): ImageLayer {
  return newBackgroundLayer(patternArtwork(spec), view, {
    generated: true,
    pattern: spec,
    name: `Full surface — ${getPatternDef(spec.id).name}`,
  });
}

/** Re-render a generated full-surface layer after its colours or pattern change. */
export function restylePatternLayer(layer: ImageLayer, spec: PatternSpec): ImageLayer {
  return {
    ...layer,
    ...patternArtwork(spec),
    generated: true,
    pattern: spec,
    name: `Full surface — ${getPatternDef(spec.id).name}`,
  };
}

/** The full-surface layer on a view, if the design has one. */
export function backgroundLayer(state: DesignState, view: ViewId): ImageLayer | undefined {
  return state.layers.find((l): l is ImageLayer => l.view === view && l.kind === "image" && !!l.generated);
}

const TEXT_DEFAULT_SIZE: Record<TextRole, number> = { text: 0.06, name: 0.05, number: 0.16 };
const TEXT_DEFAULT: Record<TextRole, { text: string; outlineWidth: number }> = {
  text: { text: "YOUR TEXT", outlineWidth: 0 },
  name: { text: "PLAYER", outlineWidth: 0 },
  number: { text: "10", outlineWidth: 0.08 },
};

export function newTextLayer(role: TextRole, product: Product, view: ViewId): TextLayer {
  const zone = product.zones[view];
  const def = TEXT_DEFAULT[role];
  // sensible spots: name high, number centred, text upper-third
  const ry = role === "name" ? 0.16 : role === "number" ? 0.5 : 0.28;
  const cx = (zone.x + zone.w / 2) / STAGE_W;
  const cy = (zone.y + zone.h * ry) / STAGE_H;
  return clampLayer({
    id: makeLayerId(),
    kind: "text",
    view,
    cx,
    cy,
    size: TEXT_DEFAULT_SIZE[role],
    rotation: 0,
    role,
    text: def.text,
    fontId: role === "number" ? "teko" : role === "name" ? "oswald" : "archivo",
    color: "#ffffff",
    outline: role === "number" ? "#211f1e" : "",
    outlineWidth: def.outlineWidth,
    letterSpacing: role === "name" ? 0.04 : 0,
    lineHeight: 1.1,
    align: "center",
    aspect: textAspectGuess(def.text, 1.1),
  }) as TextLayer;
}

// ---------------------------------------------------------------------
// Printed size + quality (image layers)
// ---------------------------------------------------------------------
export function layerWidthIn(layer: Layer, product: Product): number {
  return round2(layerBox(layer).w / productPpi(product));
}
export function layerHeightIn(layer: Layer, product: Product): number {
  return round2(layerBox(layer).h / productPpi(product));
}

export function estimatedDpi(layer: Layer, product: Product): number {
  if (layer.kind !== "image") return 0;
  const widthIn = layerBox(layer).w / productPpi(product);
  return Math.round(layer.naturalW / Math.max(0.1, widthIn));
}

export function qualityLevel(layer: Layer, product: Product): QualityLevel {
  const dpi = estimatedDpi(layer, product);
  if (dpi >= DPI_THRESHOLDS.good) return "good";
  if (dpi >= DPI_THRESHOLDS.soft) return "soft";
  return "low";
}

// ---------------------------------------------------------------------
// Order details validation
// ---------------------------------------------------------------------
export function parseQuantity(q: string): number | null {
  const n = parseInt(q.replace(/[^\d]/g, ""), 10);
  return Number.isNaN(n) || n <= 0 ? null : n;
}

export function belowMinimum(q: string): boolean {
  const n = parseQuantity(q);
  return n !== null && n < MIN_ORDER;
}

export function sizeTotal(sizes: SizeBreakdown): number {
  return SIZE_KEYS.reduce((sum, k) => sum + (sizes[k] || 0), 0);
}

export type SizeIssue = { level: "error" | "note"; message: string };

export function sizeIssue(details: OrderDetails): SizeIssue | null {
  const qty = parseQuantity(details.quantity);
  const total = sizeTotal(details.sizes);
  const hasCustom = details.otherSizes.trim().length > 0;
  if (qty === null || total === 0) {
    return hasCustom
      ? { level: "note", message: "Custom sizing will be confirmed manually by the team." }
      : null;
  }
  if (total === qty) return null;
  if (hasCustom) {
    return {
      level: "note",
      message: `Standard sizes total ${total} of ${qty} — the remaining pieces are covered by your custom sizing note and will be confirmed manually.`,
    };
  }
  if (total < qty) {
    return {
      level: "error",
      message: `Your size breakdown currently totals ${total} item${total === 1 ? "" : "s"}, but your order quantity is ${qty}. Please assign the remaining ${qty - total} item${qty - total === 1 ? "" : "s"} before continuing.`,
    };
  }
  return {
    level: "error",
    message: `Your size breakdown totals ${total} items — ${total - qty} more than your order quantity of ${qty}. Please reduce the breakdown or increase the quantity.`,
  };
}

export type ValidationIssue = { field: string; message: string };

export function validateForSubmit(state: DesignState): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const d = state.details;
  if (!hasAnyDesign(state)) {
    issues.push({ field: "artwork", message: "Add at least one design or text (front or back) before submitting." });
  }
  if (!parseQuantity(d.quantity)) {
    issues.push({ field: "quantity", message: "Enter how many items you need (a best estimate is fine)." });
  }
  const sizes = sizeIssue(d);
  if (sizes && sizes.level === "error") issues.push({ field: "sizes", message: sizes.message });
  if (!d.name.trim()) {
    issues.push({ field: "name", message: "Add your name so the team knows who the design belongs to." });
  }
  if (!d.phone.trim() && !d.email.trim()) {
    issues.push({ field: "phone", message: "Add a phone/WhatsApp number (or email) so the team can reply with your quote." });
  }
  return issues;
}

/** Human label for a layer (used in summaries, layers panel, exports). */
export function layerLabel(layer: Layer): string {
  if (layer.name && layer.name.trim()) return layer.name.trim();
  if (layer.kind === "image") return layer.fileName;
  if (layer.role === "name") return `Name “${layer.text}”`;
  if (layer.role === "number") return `Number “${layer.text}”`;
  return `Text “${layer.text}”`;
}

export function fontOf(layer: TextLayer) {
  return getFontById(layer.fontId);
}

// ---------------------------------------------------------------------
// utils
// ---------------------------------------------------------------------
export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
