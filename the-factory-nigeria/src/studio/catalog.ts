// =====================================================================
// CUSTOM TEE STUDIO — PROTOTYPE CATALOGUE (test data)
//
// ⚠ Everything in this file is placeholder data for the experimental
// prototype. Colours, garments, print sizes and thresholds MUST be
// reviewed and confirmed by The Factory Nigeria before any production
// use. Nothing here is a live availability or capability claim.
// =====================================================================

export type ViewId = "front" | "back";

export type PrintZone = {
  /** Stage coordinates (SVG viewBox units, 600×700 stage) */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Real-world printable size this zone represents (inches) */
  widthIn: number;
  heightIn: number;
};

export type Product = {
  id: string;
  name: string;
  note: string;
  /** Print zones per view, in stage units */
  zones: Record<ViewId, PrintZone>;
  /** Slightly different silhouette proportions */
  cut: "regular" | "oversized";
};

export const PRODUCTS: Product[] = [
  {
    id: "unisex-tee",
    name: "Standard unisex T-shirt",
    note: "Classic fit, crew neck",
    cut: "regular",
    zones: {
      front: { x: 190, y: 205, w: 220, h: 290, widthIn: 12, heightIn: 15.8 },
      back: { x: 190, y: 185, w: 220, h: 300, widthIn: 12, heightIn: 16.4 },
    },
  },
  {
    id: "oversized-tee",
    name: "Oversized T-shirt",
    note: "Relaxed drop-shoulder fit",
    cut: "oversized",
    zones: {
      front: { x: 178, y: 215, w: 244, h: 290, widthIn: 13, heightIn: 15.4 },
      back: { x: 178, y: 195, w: 244, h: 300, widthIn: 13, heightIn: 16 },
    },
  },
];

// ---------------------------------------------------------------------
// Colours — PROTOTYPE list, not a stock claim. Names shown to users.
// ---------------------------------------------------------------------
export type ColorStatus = "standard" | "confirm";

export type ShirtColor = {
  id: string;
  name: string;
  hex: string;
  status: ColorStatus;
};

export const STANDARD_COLORS: ShirtColor[] = [
  { id: "white", name: "White", hex: "#f4f2ee", status: "standard" },
  { id: "black", name: "Black", hex: "#211f1e", status: "standard" },
  { id: "navy", name: "Navy", hex: "#232f45", status: "standard" },
  { id: "grey", name: "Heather grey", hex: "#9a9a96", status: "standard" },
  { id: "red", name: "Red", hex: "#a5252b", status: "standard" },
  { id: "royal", name: "Royal blue", hex: "#2b4f9e", status: "standard" },
  { id: "green", name: "Forest green", hex: "#2e5c43", status: "standard" },
  { id: "cream", name: "Cream", hex: "#e8dfc8", status: "standard" },
  { id: "brown", name: "Chocolate brown", hex: "#4e3a2d", status: "standard" },
];

export const CUSTOM_COLOR_NOTICE =
  "This colour requires availability confirmation. Submit your design and contact The Factory Nigeria to confirm fabric options, minimum quantity, pricing, and production time.";

// ---------------------------------------------------------------------
// Placement presets (sets initial position/size; user can still adjust)
// ---------------------------------------------------------------------
export type Placement = {
  id: string;
  name: string;
  view: ViewId;
  /** centre position, relative to the print zone (0–1) */
  cx: number;
  cy: number;
  /** printed artwork width, inches */
  widthIn: number;
};

export const PLACEMENTS: Placement[] = [
  { id: "left-chest", name: "Left chest", view: "front", cx: 0.73, cy: 0.14, widthIn: 3.5 },
  { id: "centre-chest", name: "Centre chest", view: "front", cx: 0.5, cy: 0.2, widthIn: 8 },
  { id: "large-front", name: "Large front", view: "front", cx: 0.5, cy: 0.42, widthIn: 11 },
  { id: "upper-back", name: "Upper back", view: "back", cx: 0.5, cy: 0.12, widthIn: 10 },
  { id: "large-back", name: "Large back", view: "back", cx: 0.5, cy: 0.45, widthIn: 11.5 },
];

// ---------------------------------------------------------------------
// Upload + quality rules (prototype values, based on common DTG guidance)
// ---------------------------------------------------------------------
export const UPLOAD_LIMITS = {
  maxBytes: 10 * 1024 * 1024, // 10 MB
  // SVG deliberately excluded from the prototype: safe sanitisation is
  // non-trivial (embedded scripts/foreignObject). Documented decision.
  allowedTypes: ["image/png", "image/jpeg"] as string[],
  minPixels: 50, // reject absurdly small/corrupt decodes
  maxPixels: 12000, // reject decompression-bomb dimensions
};

/** Estimated-print-quality thresholds (approximate guidance only). */
export const DPI_THRESHOLDS = { good: 150, soft: 100 };

export type QualityLevel = "good" | "soft" | "low";

export const QUALITY_COPY: Record<QualityLevel, string> = {
  good: "Good estimated resolution for this print size.",
  soft: "May appear slightly soft at this size — a larger file is safer.",
  low: "Low resolution for this size. It can still be submitted — the team will review it before anything is printed.",
};

export const MIN_ORDER = 30; // pieces — matches the live site's stated minimum

export const PREVIEW_DISCLAIMER =
  "The on-screen preview is an approximation. Fabric colour, sizing, placement, and final print appearance are confirmed during production review.";
