// =====================================================================
// CUSTOM TEE STUDIO — PROTOTYPE CATALOGUE (test data)
//
// ⚠ Everything in this file is placeholder data for the experimental
// prototype. Colours, garments, fabrics, print sizes and thresholds
// MUST be reviewed and confirmed by The Factory Nigeria before any
// production use. Nothing here is a live availability or capability
// claim — see MARKET_SOURCING_NOTICE.
// =====================================================================

export type ViewId = "front" | "back";

/** Base path for studio image assets (garment photos, thumbs, fabrics). */
export const ASSET_BASE = "/assets/the-factory-nigeria/studio";

// ---------------------------------------------------------------------
// Availability language — the ONLY four statuses the studio may show.
// Never a stock guarantee: everything is confirmed by the team against
// what the market can supply at the time of the request.
// ---------------------------------------------------------------------
export type AvailabilityStatus = "common" | "confirm" | "special" | "custom";

export const AVAILABILITY_LABEL: Record<AvailabilityStatus, string> = {
  common: "Commonly available",
  confirm: "Availability to confirm",
  special: "Special sourcing required",
  custom: "Custom request",
};

export const MARKET_SOURCING_NOTICE =
  "Garment, fabric and colour availability depends on what can be sourced in the market at the time of your request. If your selection is available, The Factory Nigeria can produce it; if not, the team suggests the closest available alternative. Availability, minimum quantity, pricing and production time are always confirmed before any order is accepted.";

export const FABRIC_VISUAL_NOTICE =
  "Fabric visuals are approximate references. The exact material, weight, texture and colour will be confirmed using available market samples before production.";

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
  /** Plain-language fit description shown on the product card */
  fit: string;
  /** One-sentence plain description */
  description: string;
  /** Typical use, plain language */
  use: string;
  /** Material reference (visual/feel reference only, not a stock claim) */
  material: string;
  availability: AvailabilityStatus;
  /** Product-card thumbnail (real processed studio asset) */
  thumb: string;
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
    fit: "Classic fit",
    description: "The everyday crew-neck tee with a clean, regular cut.",
    use: "Events, teams, merch drops, everyday branding",
    material: "Midweight cotton jersey (reference)",
    availability: "common",
    thumb: `${ASSET_BASE}/tee-std-thumb.webp`,
    cut: "regular",
    zones: {
      front: { x: 185, y: 205, w: 230, h: 288, widthIn: 12, heightIn: 15 },
      back: { x: 185, y: 185, w: 230, h: 307, widthIn: 12, heightIn: 16 },
    },
  },
  {
    id: "oversized-tee",
    name: "Oversized T-shirt",
    note: "Relaxed drop-shoulder fit",
    fit: "Relaxed drop-shoulder fit",
    description: "A boxier, streetwear-leaning tee with extra room.",
    use: "Streetwear lines, statement prints, creator merch",
    material: "Heavier cotton jersey (reference)",
    availability: "common",
    thumb: `${ASSET_BASE}/tee-os-thumb.webp`,
    cut: "oversized",
    zones: {
      front: { x: 175, y: 210, w: 250, h: 288, widthIn: 13, heightIn: 15 },
      back: { x: 175, y: 190, w: 250, h: 307, widthIn: 13, heightIn: 16 },
    },
  },
  {
    id: "polo",
    name: "Polo shirt",
    note: "Piqué knit, three-button placket",
    fit: "Classic fit",
    description: "A collared piqué polo with a three-button placket and ribbed cuffs.",
    use: "Uniforms, corporate branding, hospitality teams",
    material: "Cotton piqué knit (reference)",
    availability: "confirm",
    thumb: `${ASSET_BASE}/polo-thumb.webp`,
    cut: "regular",
    zones: {
      // Front zone sits below the button placket; measured from the
      // processed asset (asset px ÷ 2 → stage units).
      front: { x: 170, y: 295, w: 260, h: 275, widthIn: 10, heightIn: 10.5 },
      back: { x: 170, y: 130, w: 260, h: 415, widthIn: 10, heightIn: 16 },
    },
  },
  {
    id: "hoodie",
    name: "Pullover hoodie",
    note: "Fleece, kangaroo pocket",
    fit: "Relaxed fit",
    description: "A brushed-fleece pullover hoodie with a kangaroo pocket and ribbed trims.",
    use: "Crews, colder-season merch, premium drops",
    material: "Brushed fleece, cotton-rich (reference)",
    availability: "confirm",
    thumb: `${ASSET_BASE}/hoodie-thumb.webp`,
    cut: "oversized",
    zones: {
      // Front print area sits ABOVE the kangaroo pocket (pocket top
      // measured at stage y≈461) and below the hood.
      front: { x: 160, y: 280, w: 280, h: 170, widthIn: 12, heightIn: 7 },
      back: { x: 160, y: 300, w: 280, h: 280, widthIn: 12, heightIn: 12 },
    },
  },
];

// ---------------------------------------------------------------------
// Fabrics & textiles — visual REFERENCES only (see FABRIC_VISUAL_NOTICE).
// Close-up images are macro crops of this project's own processed
// garment photography; each represents the closest fabric family.
// ---------------------------------------------------------------------
export type FabricWeight = "Light" | "Mid" | "Heavy";

export type Fabric = {
  id: string;
  name: string;
  /** One-sentence plain-language description (no textile jargon) */
  description: string;
  /** Typical use, plain language */
  use: string;
  weight: FabricWeight;
  availability: AvailabilityStatus;
  /** Close-up reference tile */
  img: string;
  /** What the reference photo actually shows (honesty caption) */
  refNote?: string;
};

export const FABRICS: Fabric[] = [
  {
    id: "cotton-light",
    name: "Lightweight cotton",
    description: "Thin, soft and breathable — the coolest option for hot days.",
    use: "Everyday tees, giveaways, warm-weather events",
    weight: "Light",
    availability: "common",
    img: `${ASSET_BASE}/fabric-cotton-light.webp`,
  },
  {
    id: "cotton-mid",
    name: "Midweight cotton",
    description: "The balanced everyday choice — sturdy but still soft.",
    use: "Team tees, uniforms, retail-quality merch",
    weight: "Mid",
    availability: "common",
    img: `${ASSET_BASE}/fabric-cotton-mid.webp`,
  },
  {
    id: "cotton-heavy",
    name: "Heavyweight cotton",
    description: "Thick and structured with a premium, boxy drape.",
    use: "Streetwear, premium drops, oversized fits",
    weight: "Heavy",
    availability: "confirm",
    img: `${ASSET_BASE}/fabric-cotton-heavy.webp`,
  },
  {
    id: "cotton-poly",
    name: "Cotton-polyester blend",
    description: "Cotton comfort with added crease and shrink resistance.",
    use: "Workwear, frequently washed uniforms",
    weight: "Mid",
    availability: "common",
    img: `${ASSET_BASE}/fabric-cotton-poly.webp`,
    refNote: "Reference photo shows a similar smooth jersey knit.",
  },
  {
    id: "performance",
    name: "Performance polyester",
    description: "Light sports fabric that dries fast and stays cool.",
    use: "Sports teams, fitness brands, jerseys",
    weight: "Light",
    availability: "confirm",
    img: `${ASSET_BASE}/fabric-performance.webp`,
    refNote: "Reference photo shows a similar knit; polyester is smoother with a slight sheen.",
  },
  {
    id: "pique",
    name: "Piqué",
    description: "The classic polo texture — a fine waffle-like knit.",
    use: "Polos, collared uniforms, smart-casual teams",
    weight: "Mid",
    availability: "confirm",
    img: `${ASSET_BASE}/fabric-pique.webp`,
  },
  {
    id: "french-terry",
    name: "French terry",
    description: "Soft sweatshirt fabric with smooth outside and looped inside.",
    use: "Lighter hoodies, sweatshirts, loungewear",
    weight: "Mid",
    availability: "special",
    img: `${ASSET_BASE}/fabric-terry.webp`,
    refNote: "Reference photo shows the fleece family; french terry has visible loops inside.",
  },
  {
    id: "fleece",
    name: "Fleece",
    description: "Warm, brushed-soft inside — the classic hoodie feel.",
    use: "Hoodies, sweatshirts, colder-season merch",
    weight: "Heavy",
    availability: "confirm",
    img: `${ASSET_BASE}/fabric-fleece.webp`,
  },
];

export function getFabricById(id: string): Fabric | undefined {
  return FABRICS.find((f) => f.id === id);
}

/** Shown when no fabric is picked — the team recommends instead. */
export const FABRIC_ADVISE_ID = "";

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

/** Map colour statuses onto the shared availability vocabulary. */
export function colorAvailability(status: ColorStatus): AvailabilityStatus {
  return status === "standard" ? "common" : "confirm";
}

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

export const MIN_ORDER = 30; // general manufacturing enquiry minimum (live site)
export const STUDIO_MIN_ORDER = 1; // Studio accepts requests from a single item

export const PREVIEW_DISCLAIMER =
  "The on-screen preview is an approximation. Fabric colour, sizing, placement, and final print appearance are confirmed during production review.";
