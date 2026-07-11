// =====================================================================
// CUSTOM TEE STUDIO — design state (pure, framework-free, unit-tested)
// =====================================================================

import {
  DPI_THRESHOLDS,
  MIN_ORDER,
  PLACEMENTS,
  PRODUCTS,
  type Placement,
  type PrintZone,
  type Product,
  type QualityLevel,
  type ShirtColor,
  type ViewId,
} from "./catalog";

// ---------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------
export type Artwork = {
  /** object URL / data URL, kept local to the browser */
  src: string;
  fileName: string;
  fileKB: number;
  naturalW: number;
  naturalH: number;
  hasAlpha: boolean;
  /** centre of the artwork, relative to the print zone (0–1) */
  cx: number;
  cy: number;
  /** printed width in inches */
  widthIn: number;
  /** degrees, clockwise */
  rotation: number;
};

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
  otherSizes: string; // custom sizing — flagged for manual confirmation
  sameDesign: "yes" | "no" | "";
  method: string; // print/embroidery preference (confirmed by the factory)
  fabricWeight: string;
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
  artworks: Partial<Record<ViewId, Artwork>>;
  details: OrderDetails;
  reference: string;
};

// ---------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------
export function makeReference(now: number = Date.now()): string {
  return "TFN-DS-" + now.toString(36).toUpperCase().slice(-6);
}

export function initialState(): DesignState {
  return {
    productId: PRODUCTS[0].id,
    view: "front",
    color: { id: "white", name: "White", hex: "#f4f2ee", status: "standard" },
    artworks: {},
    details: {
      quantity: "",
      sizes: emptySizes(),
      otherSizes: "",
      sameDesign: "",
      method: "",
      fabricWeight: "",
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

export function getZone(state: DesignState): PrintZone {
  return getProduct(state).zones[state.view];
}

// ---------------------------------------------------------------------
// Artwork placement + constraints (all in inch-space of the print zone)
// ---------------------------------------------------------------------
export function defaultArtworkPlacement(
  zone: PrintZone,
  naturalW: number,
  naturalH: number,
): Pick<Artwork, "cx" | "cy" | "widthIn" | "rotation"> {
  // Start at ~70% of zone width, capped so the height also fits
  let widthIn = zone.widthIn * 0.7;
  const aspect = naturalH / naturalW;
  const maxByHeight = (zone.heightIn * 0.7) / aspect;
  widthIn = Math.min(widthIn, maxByHeight);
  return { cx: 0.5, cy: 0.32, widthIn: round2(widthIn), rotation: 0 };
}

export function applyPlacement(art: Artwork, placement: Placement, zone: PrintZone): Artwork {
  const aspect = art.naturalH / art.naturalW;
  let widthIn = Math.min(placement.widthIn, zone.widthIn);
  // keep height inside the zone too
  const maxByHeight = zone.heightIn / aspect;
  widthIn = Math.min(widthIn, maxByHeight);
  return { ...art, cx: placement.cx, cy: placement.cy, widthIn: round2(widthIn), rotation: 0 };
}

export function placementsForView(view: ViewId): Placement[] {
  return PLACEMENTS.filter((p) => p.view === view);
}

/** Clamp scale + keep the artwork centre inside the zone (with margin). */
export function clampArtwork(art: Artwork, zone: PrintZone): Artwork {
  const widthIn = clamp(art.widthIn, 0.75, zone.widthIn * 1.15);
  const cx = clamp(art.cx, 0.02, 0.98);
  const cy = clamp(art.cy, 0.02, 0.98);
  const rotation = ((art.rotation % 360) + 360) % 360;
  return { ...art, widthIn: round2(widthIn), cx, cy, rotation };
}

/** Corners of the (rotated) artwork in inch-space, zone origin top-left. */
export function artworkCornersIn(art: Artwork, zone: PrintZone): { x: number; y: number }[] {
  const w = art.widthIn;
  const h = art.widthIn * (art.naturalH / art.naturalW);
  const cx = art.cx * zone.widthIn;
  const cy = art.cy * zone.heightIn;
  const rad = (art.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return [
    { x: -w / 2, y: -h / 2 },
    { x: w / 2, y: -h / 2 },
    { x: w / 2, y: h / 2 },
    { x: -w / 2, y: h / 2 },
  ].map((p) => ({ x: cx + p.x * cos - p.y * sin, y: cy + p.x * sin + p.y * cos }));
}

/** True when any part of the artwork leaves the recommended print zone. */
export function isOutOfZone(art: Artwork, zone: PrintZone, toleranceIn = 0.06): boolean {
  return artworkCornersIn(art, zone).some(
    (c) =>
      c.x < -toleranceIn ||
      c.y < -toleranceIn ||
      c.x > zone.widthIn + toleranceIn ||
      c.y > zone.heightIn + toleranceIn,
  );
}

/** One-click remedy: centre the artwork and shrink until fully inside. */
export function fitArtworkToZone(art: Artwork, zone: PrintZone): Artwork {
  let next: Artwork = { ...art, cx: 0.5, cy: 0.5 };
  const aspect = art.naturalH / art.naturalW;
  const maxW = Math.min(zone.widthIn, zone.heightIn / aspect) * 0.96;
  if (next.widthIn > maxW) next = { ...next, widthIn: round2(maxW) };
  for (let i = 0; i < 24 && isOutOfZone(next, zone); i++) {
    next = { ...next, widthIn: round2(next.widthIn * 0.95) };
  }
  return clampArtwork(next, zone);
}

// ---------------------------------------------------------------------
// Print-quality estimate (approximate, never a hard block)
// ---------------------------------------------------------------------
export function estimatedDpi(art: Artwork): number {
  return Math.round(art.naturalW / art.widthIn);
}

export function qualityLevel(art: Artwork): QualityLevel {
  const dpi = estimatedDpi(art);
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

/** Verify the size breakdown against the requested quantity. */
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
      message: `Your size breakdown currently totals ${total} shirt${total === 1 ? "" : "s"}, but your order quantity is ${qty}. Please assign the remaining ${qty - total} shirt${qty - total === 1 ? "" : "s"} before continuing.`,
    };
  }
  return {
    level: "error",
    message: `Your size breakdown totals ${total} shirts — ${total - qty} more than your order quantity of ${qty}. Please reduce the breakdown or increase the quantity.`,
  };
}

export type ValidationIssue = { field: string; message: string };

export function validateForSubmit(state: DesignState): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const d = state.details;
  if (!state.artworks.front && !state.artworks.back) {
    issues.push({ field: "artwork", message: "Add at least one design (front or back) before submitting." });
  }
  if (!parseQuantity(d.quantity)) {
    issues.push({ field: "quantity", message: "Enter how many shirts you need (a best estimate is fine)." });
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

// ---------------------------------------------------------------------
// utils
// ---------------------------------------------------------------------
export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
