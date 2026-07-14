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

// ---------------------------------------------------------------------
// Production methods — HOW a garment is actually made.
//
// This is not a styling detail. Sublimation, printing onto a ready-made
// garment, and cutting-and-sewing a garment from fabric are different
// processes with different creative freedom, and the customer must know
// which one applies to the thing they are designing. Every method here is
// still confirmed by The Factory Nigeria before an order is accepted.
// ---------------------------------------------------------------------
export type ProductionMethodId = "sublimation" | "ready-made-print" | "custom-made" | "headwear-print";

export type ProductionMethod = {
  id: ProductionMethodId;
  /** exact phrase used on the review screen and the production reference */
  label: string;
  /** short badge for product cards */
  badge: string;
  /** one plain sentence for the customer */
  summary: string;
  /** what the method means for the design itself (shown in the editor) */
  designNote: string;
};

export const PRODUCTION_METHODS: Record<ProductionMethodId, ProductionMethod> = {
  sublimation: {
    id: "sublimation",
    label: "Sublimation",
    badge: "Sublimated",
    summary:
      "Jerseys are sublimated — the design is printed into the fabric panels before the jersey is sewn, not printed on top of a finished garment.",
    designNote:
      "This jersey is sublimated, so your design is not limited to a print box. Colour, patterns and artwork can cover the whole garment, edge to edge and across seams.",
  },
  "ready-made-print": {
    id: "ready-made-print",
    label: "Print on a ready-made garment",
    badge: "Ready-made + print",
    summary: "A finished garment is bought and your design is printed onto it.",
    designNote:
      "Your design is printed onto a finished garment. Place it anywhere you like — The Factory Nigeria will review the placement and confirm how it can be produced.",
  },
  "custom-made": {
    id: "custom-made",
    label: "Custom-made (cut and sewn for you)",
    badge: "Custom-made",
    summary: "The garment is sewn specifically for you, then your design is applied.",
    designNote:
      "This garment is made for you from fabric, so the cut, the fabric and the design can all be discussed with the team.",
  },
  "headwear-print": {
    id: "headwear-print",
    label: "Print or embroidery on a ready-made cap",
    badge: "Cap + print",
    summary: "A finished cap is bought and your design is printed or embroidered onto it.",
    designNote:
      "Caps are decorated panel by panel. Place your design anywhere — the team will confirm whether it is printed or embroidered.",
  },
};

export function getProductionMethod(product: Product): ProductionMethod {
  return PRODUCTION_METHODS[product.production];
}

export function isSublimated(product: Product): boolean {
  return product.production === "sublimation";
}

/**
 * The most important message in the editor. Guides help you line things up —
 * they do NOT limit where a design may go. Wording approved by the manager;
 * do not soften it into "print area" language.
 */
export const GUIDES_NOTICE =
  "Guides are provided to help with alignment. You can place your design anywhere on the visible garment. The Factory Nigeria will review the final placement and confirm how it can be produced.";

/** Soft, never-blocking note when a design crosses a seam/pocket/zip/collar/hem. */
export const DIFFICULT_AREA_NOTICE =
  "This design crosses an area that may require special production handling. You can continue with your idea, and The Factory Nigeria will review and confirm how it can be produced.";

/**
 * The Factory's own words for the custom-made T-shirt fabric. Kept verbatim.
 * (Externally this reads like a loopback / French-terry style knit — loops on
 * the reverse, like a towel — but the team's term is the one that ships, and
 * the exact fabric is a confirmation item, not an assumption.)
 */
export const TOWEL_BACK_NOTE =
  "Custom-made T-shirts are usually sewn using The Factory's towel-back fabric option. The exact fabric is confirmed with you before production.";

export const SUBLIMATION_NOTE =
  "Sublimated garments are produced on polyester-based sports fabric — that is what allows the design to run across the whole garment.";

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

/** A named printable region on a garment view (torso, sleeve, pocket…). */
export type PrintArea = PrintZone & { id: string; name: string };

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
  /** How this garment is actually produced — drives the copy everywhere downstream. */
  production: ProductionMethodId;
  /**
   * T-shirts only. The Factory makes T-shirts two genuinely different ways and
   * the customer must consciously choose — never merged into one vague "T-shirt".
   */
  tshirtOption?: "custom-made" | "ready-made";
  /** The exact line written onto the review screen and the production reference. */
  tshirtOptionLabel?: string;
  /** Garment family — decides which placement presets apply (chest/back vs cap panels). */
  family?: "top" | "headwear";
  /** Product-card thumbnail (real processed studio asset) */
  thumb: string;
  /** Primary (torso) print zones per view, in stage units */
  zones: Record<ViewId, PrintZone>;
  /**
   * Additional named printable regions per view (sleeves, pocket, sponsor
   * bands…). Approximate references measured from the garment render —
   * placement and size are always confirmed by the team before production.
   */
  extraAreas?: Partial<Record<ViewId, PrintArea[]>>;
  /**
   * Regions that need special production handling if a design crosses them
   * (collar, pocket, placket, zip, hem…). Never a hard block — a soft warning,
   * and the team confirms whether it can be produced accurately.
   */
  avoidAreas?: Partial<Record<ViewId, PrintArea[]>>;
  /** Slightly different silhouette proportions */
  cut: "regular" | "oversized";
};

/** Difficult regions on a view (collar/pocket/placket…), for soft warnings. */
export function avoidAreasForView(product: Product, view: ViewId): PrintArea[] {
  return product.avoidAreas?.[view] ?? [];
}

/**
 * All printable areas for a view — the torso zone first, then any extras
 * (sleeves/pocket). "Place anywhere" designs are checked against the nearest
 * of these, so a sleeve logo isn't flagged for leaving the chest area.
 */
export function areasForView(product: Product, view: ViewId): PrintArea[] {
  const torso: PrintArea = {
    ...product.zones[view],
    id: "torso",
    name: view === "front" ? "Front" : "Back",
  };
  return [torso, ...(product.extraAreas?.[view] ?? [])];
}

/** Stage pixels per real inch for a garment, from its front torso zone. */
export function productPpi(product: Product): number {
  return product.zones.front.w / product.zones.front.widthIn;
}

/** Shared tee geometry — the two T-shirt options differ by HOW they are made, not by shape. */
const TEE_ZONES: Record<ViewId, PrintZone> = {
  front: { x: 185, y: 205, w: 230, h: 288, widthIn: 12, heightIn: 15 },
  back: { x: 185, y: 185, w: 230, h: 307, widthIn: 12, heightIn: 16 },
};
const TEE_EXTRA: Partial<Record<ViewId, PrintArea[]>> = {
  front: [
    { id: "left-sleeve", name: "Left sleeve", x: 96, y: 214, w: 72, h: 92, widthIn: 3.8, heightIn: 4.8 },
    { id: "right-sleeve", name: "Right sleeve", x: 432, y: 214, w: 72, h: 92, widthIn: 3.8, heightIn: 4.8 },
  ],
};
const TEE_AVOID: Partial<Record<ViewId, PrintArea[]>> = {
  front: [{ id: "collar", name: "collar / neckline", x: 250, y: 150, w: 100, h: 62, widthIn: 5, heightIn: 3 }],
  back: [{ id: "collar", name: "collar / neckline", x: 250, y: 150, w: 100, h: 46, widthIn: 5, heightIn: 2 }],
};

export const PRODUCTS: Product[] = [
  {
    id: "tee-custom",
    name: "Custom-made T-shirt",
    note: "Sewn for you — towel-back fabric option",
    fit: "Made to your specification",
    description:
      "A T-shirt made specifically for you rather than bought ready-made. It is usually sewn using The Factory's towel-back fabric option.",
    use: "Brands wanting their own fit and fabric, premium drops, uniforms",
    material: "Towel-back fabric option (reference — confirmed by the team)",
    availability: "confirm",
    production: "custom-made",
    tshirtOption: "custom-made",
    tshirtOptionLabel: "Custom-made (towel-back fabric option, subject to Factory confirmation)",
    thumb: `${ASSET_BASE}/tee-std-thumb.webp`,
    cut: "regular",
    zones: TEE_ZONES,
    extraAreas: TEE_EXTRA,
    avoidAreas: TEE_AVOID,
  },
  {
    id: "tee-readymade",
    name: "Ready-made T-shirt (100% cotton)",
    note: "Bought ready-made, then printed",
    fit: "Classic fit",
    description: "A ready-made 100% cotton T-shirt, purchased and then customised with your requested print.",
    use: "Events, teams, merch drops, everyday branding",
    material: "100% cotton jersey (reference)",
    availability: "common",
    production: "ready-made-print",
    tshirtOption: "ready-made",
    tshirtOptionLabel: "Ready-made 100% cotton",
    thumb: `${ASSET_BASE}/tee-std-thumb.webp`,
    cut: "regular",
    zones: TEE_ZONES,
    extraAreas: TEE_EXTRA,
    avoidAreas: TEE_AVOID,
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
    production: "ready-made-print",
    thumb: `${ASSET_BASE}/tee-os-thumb.webp`,
    cut: "oversized",
    zones: {
      front: { x: 175, y: 210, w: 250, h: 288, widthIn: 13, heightIn: 15 },
      back: { x: 175, y: 190, w: 250, h: 307, widthIn: 13, heightIn: 16 },
    },
    extraAreas: {
      front: [
        { id: "left-sleeve", name: "Left sleeve", x: 84, y: 236, w: 86, h: 96, widthIn: 4.2, heightIn: 5 },
        { id: "right-sleeve", name: "Right sleeve", x: 430, y: 236, w: 86, h: 96, widthIn: 4.2, heightIn: 5 },
      ],
    },
    avoidAreas: {
      front: [{ id: "collar", name: "collar / neckline", x: 250, y: 155, w: 100, h: 62, widthIn: 5, heightIn: 3 }],
      back: [{ id: "collar", name: "collar / neckline", x: 250, y: 155, w: 100, h: 46, widthIn: 5, heightIn: 2 }],
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
    production: "ready-made-print",
    thumb: `${ASSET_BASE}/polo-thumb.webp`,
    cut: "regular",
    zones: {
      // Front zone sits below the button placket; measured from the
      // processed asset (asset px ÷ 2 → stage units).
      front: { x: 170, y: 295, w: 260, h: 275, widthIn: 10, heightIn: 10.5 },
      back: { x: 170, y: 130, w: 260, h: 415, widthIn: 10, heightIn: 16 },
    },
    extraAreas: {
      front: [
        { id: "left-sleeve", name: "Left sleeve", x: 104, y: 244, w: 68, h: 84, widthIn: 3.6, heightIn: 4.4 },
        { id: "right-sleeve", name: "Right sleeve", x: 428, y: 244, w: 68, h: 84, widthIn: 3.6, heightIn: 4.4 },
      ],
    },
    avoidAreas: {
      front: [
        { id: "placket", name: "button placket", x: 272, y: 150, w: 56, h: 160, widthIn: 3, heightIn: 8 },
        { id: "collar", name: "collar", x: 240, y: 120, w: 120, h: 55, widthIn: 6, heightIn: 3 },
      ],
      back: [{ id: "collar", name: "collar / neckline", x: 250, y: 120, w: 100, h: 40, widthIn: 5, heightIn: 2 }],
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
    production: "ready-made-print",
    thumb: `${ASSET_BASE}/hoodie-thumb.webp`,
    cut: "oversized",
    zones: {
      // Front print area sits ABOVE the kangaroo pocket (pocket top
      // measured at stage y≈461) and below the hood.
      front: { x: 160, y: 280, w: 280, h: 170, widthIn: 12, heightIn: 7 },
      back: { x: 160, y: 300, w: 280, h: 280, widthIn: 12, heightIn: 12 },
    },
    extraAreas: {
      front: [
        { id: "left-sleeve", name: "Left sleeve", x: 96, y: 312, w: 66, h: 108, widthIn: 3.6, heightIn: 5.6 },
        { id: "right-sleeve", name: "Right sleeve", x: 438, y: 312, w: 66, h: 108, widthIn: 3.6, heightIn: 5.6 },
      ],
    },
    avoidAreas: {
      front: [
        { id: "pocket", name: "kangaroo pocket", x: 175, y: 458, w: 250, h: 150, widthIn: 12, heightIn: 7 },
        { id: "hood", name: "hood", x: 205, y: 55, w: 190, h: 120, widthIn: 9, heightIn: 6 },
      ],
      back: [{ id: "hood", name: "hood", x: 210, y: 60, w: 180, h: 110, widthIn: 9, heightIn: 5 }],
    },
  },
  {
    id: "jersey",
    name: "Sports jersey",
    note: "Athletic crew neck, short sleeves",
    fit: "Athletic fit",
    description:
      "A sublimated performance jersey with a ribbed crew neck. The design is printed into the fabric, so colour, patterns and artwork can cover the whole jersey — not just a chest box.",
    use: "Football/soccer teams, sports clubs, five-a-side, fan merch",
    material: "Breathable polyester performance knit (reference)",
    availability: "confirm",
    production: "sublimation",
    thumb: `${ASSET_BASE}/jersey-thumb.webp`,
    cut: "regular",
    zones: {
      front: { x: 185, y: 205, w: 230, h: 285, widthIn: 12, heightIn: 15 },
      back: { x: 185, y: 180, w: 230, h: 315, widthIn: 12, heightIn: 16 },
    },
    extraAreas: {
      front: [
        { id: "left-sleeve", name: "Left sleeve", x: 74, y: 206, w: 78, h: 92, widthIn: 4, heightIn: 4.8 },
        { id: "right-sleeve", name: "Right sleeve", x: 448, y: 206, w: 78, h: 92, widthIn: 4, heightIn: 4.8 },
        { id: "left-panel", name: "Left side panel", x: 158, y: 250, w: 40, h: 230, widthIn: 2, heightIn: 12 },
        { id: "right-panel", name: "Right side panel", x: 402, y: 250, w: 40, h: 230, widthIn: 2, heightIn: 12 },
      ],
    },
    avoidAreas: {
      front: [{ id: "collar", name: "collar / neckline", x: 255, y: 150, w: 90, h: 58, widthIn: 4.5, heightIn: 3 }],
      back: [{ id: "collar", name: "collar / neckline", x: 255, y: 150, w: 90, h: 42, widthIn: 4.5, heightIn: 2 }],
    },
  },
  {
    id: "basketball",
    name: "Basketball jersey",
    note: "Sleeveless tank, V-neck, mesh",
    fit: "Loose athletic fit",
    description:
      "A sublimated sleeveless basketball tank with a ribbed V-neck. Full-surface colour, patterns, big numbers, team name and sponsors — printed into the fabric.",
    use: "Basketball teams, 3×3, leagues, training squads, fan jerseys",
    material: "Breathable polyester basketball mesh (reference)",
    availability: "confirm",
    production: "sublimation",
    thumb: `${ASSET_BASE}/basketball-thumb.webp`,
    cut: "regular",
    zones: {
      front: { x: 196, y: 220, w: 208, h: 275, widthIn: 11, heightIn: 14.5 },
      back: { x: 196, y: 185, w: 208, h: 315, widthIn: 11, heightIn: 16.5 },
    },
    extraAreas: {
      front: [
        { id: "left-panel", name: "Left side panel", x: 168, y: 255, w: 34, h: 210, widthIn: 1.8, heightIn: 11 },
        { id: "right-panel", name: "Right side panel", x: 398, y: 255, w: 34, h: 210, widthIn: 1.8, heightIn: 11 },
      ],
    },
    avoidAreas: {
      front: [{ id: "collar", name: "V-neck collar", x: 258, y: 150, w: 84, h: 78, widthIn: 4, heightIn: 4 }],
      back: [{ id: "collar", name: "neckline", x: 258, y: 150, w: 84, h: 40, widthIn: 4, heightIn: 2 }],
    },
  },
  {
    id: "cap-snapback",
    name: "Snapback cap",
    note: "Flat peak, structured, snap closure",
    fit: "Structured 6-panel",
    description: "A flat-brim structured snapback — a bold front panel for embroidery or a printed patch.",
    use: "Streetwear, team caps, merch, events",
    material: "Structured cotton twill (reference)",
    availability: "confirm",
    production: "headwear-print",
    family: "headwear",
    thumb: `${ASSET_BASE}/cap-snapback-thumb.webp`,
    cut: "regular",
    zones: {
      front: { x: 222, y: 190, w: 156, h: 142, widthIn: 4.5, heightIn: 3 },
      back: { x: 238, y: 205, w: 124, h: 92, widthIn: 3.6, heightIn: 2.6 },
    },
    avoidAreas: {
      front: [{ id: "brim", name: "peak / brim", x: 150, y: 470, w: 300, h: 110, widthIn: 7, heightIn: 2.5 }],
    },
  },
  {
    id: "cap-baseball",
    name: "Baseball cap (curved)",
    note: "Curved peak, soft, strap back",
    fit: "Unstructured dad-cap",
    description: "The classic soft curved-peak cap (face cap) — a clean front panel for a logo or name.",
    use: "Everyday caps, casual merch, giveaways",
    material: "Washed cotton twill (reference)",
    availability: "confirm",
    production: "headwear-print",
    family: "headwear",
    thumb: `${ASSET_BASE}/cap-baseball-thumb.webp`,
    cut: "regular",
    zones: {
      front: { x: 225, y: 198, w: 150, h: 135, widthIn: 4.2, heightIn: 3 },
      back: { x: 240, y: 210, w: 120, h: 88, widthIn: 3.4, heightIn: 2.4 },
    },
    avoidAreas: {
      front: [{ id: "brim", name: "peak / brim", x: 150, y: 470, w: 300, h: 110, widthIn: 7, heightIn: 2.5 }],
    },
  },
  {
    id: "cap-trucker",
    name: "Trucker cap",
    note: "Foam front, mesh back, snap closure",
    fit: "Structured 5-panel",
    description: "A foam-front trucker with a breathable mesh back — a big flat front panel, ideal for bold logos.",
    use: "Streetwear, festivals, summer merch, teams",
    material: "Foam front + polyester mesh (reference)",
    availability: "confirm",
    production: "headwear-print",
    family: "headwear",
    thumb: `${ASSET_BASE}/cap-trucker-thumb.webp`,
    cut: "regular",
    zones: {
      front: { x: 220, y: 182, w: 160, h: 150, widthIn: 4.8, heightIn: 3.2 },
      back: { x: 244, y: 200, w: 112, h: 84, widthIn: 3.2, heightIn: 2.2 },
    },
    avoidAreas: {
      front: [{ id: "brim", name: "peak / brim", x: 150, y: 470, w: 300, h: 110, widthIn: 7, heightIn: 2.5 }],
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
    id: "sports-mesh",
    name: "Sports mesh",
    description: "Open, airy knit with tiny holes — the coolest, most breathable option.",
    use: "Basketball jerseys, training bibs, hot-weather sports",
    weight: "Light",
    availability: "confirm",
    img: `${ASSET_BASE}/fabric-mesh.webp`,
    refNote: "Macro crop of this project's basketball-mesh render — the exact hole size is confirmed with a market sample.",
  },
  {
    id: "interlock",
    name: "Polyester interlock",
    description: "Smooth, stable double-knit with a clean surface — holds prints crisply.",
    use: "Football/soccer jerseys, structured sportswear",
    weight: "Mid",
    availability: "confirm",
    img: `${ASSET_BASE}/fabric-interlock.webp`,
    refNote: "Macro crop of this project's jersey render; interlock is a similar smooth performance knit.",
  },
  {
    id: "twill",
    name: "Cotton twill",
    description: "A tight, durable diagonal weave — structured and hard-wearing.",
    use: "Caps, workwear, structured garments",
    weight: "Mid",
    availability: "common",
    img: `${ASSET_BASE}/fabric-twill.webp`,
    refNote: "Macro crop of this project's cap render; twill has a fine diagonal rib.",
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
// Text fonts — a small, safe set (loaded from the OS / already-bundled
// site faces). Rendered identically in the editor (HTML) and exports
// (Canvas 2D), so the on-screen text matches the production reference.
// ---------------------------------------------------------------------
export type FontSpec = {
  id: string;
  name: string;
  /** CSS font-family stack, used verbatim by both HTML and Canvas. */
  stack: string;
  /** the primary family name (for canvas font loading + @font-face) */
  family: string;
  weight: number;
  category: FontCategory;
  /** licence recorded in the production reference so the team can reuse it */
  license: string;
  /** where the team can obtain the exact font (internal production note) */
  source?: string;
};

/**
 * Free, production-usable fonts. The OFL faces are bundled as WebFonts under
 * /assets/the-factory-nigeria/fonts and recorded (with licence + source) in the
 * generated reference, so The Factory can obtain and reuse the exact font.
 */
export type FontCategory = "Athletic" | "Jersey" | "Varsity" | "Bold" | "Condensed" | "Modern" | "Script" | "General";

/** Order the categories are shown in the font picker. */
export const FONT_CATEGORIES: FontCategory[] = [
  "Athletic",
  "Jersey",
  "Varsity",
  "Bold",
  "Condensed",
  "Modern",
  "Script",
  "General",
];

export const FONTS: FontSpec[] = [
  { id: "bebas", name: "Bebas Neue", family: "Bebas Neue", stack: "'Bebas Neue', 'Arial Narrow', sans-serif", weight: 400, category: "Athletic", license: "SIL Open Font License 1.1", source: "fonts.google.com/specimen/Bebas+Neue" },
  { id: "teko", name: "Teko", family: "Teko", stack: "'Teko', 'Arial Narrow', sans-serif", weight: 600, category: "Jersey", license: "SIL Open Font License 1.1", source: "fonts.google.com/specimen/Teko" },
  { id: "graduate", name: "Graduate", family: "Graduate", stack: "'Graduate', Georgia, serif", weight: 400, category: "Varsity", license: "SIL Open Font License 1.1", source: "fonts.google.com/specimen/Graduate" },
  { id: "anton", name: "Anton", family: "Anton", stack: "'Anton', Impact, sans-serif", weight: 400, category: "Bold", license: "SIL Open Font License 1.1", source: "fonts.google.com/specimen/Anton" },
  { id: "oswald", name: "Oswald", family: "Oswald", stack: "'Oswald', 'Arial Narrow', sans-serif", weight: 600, category: "Condensed", license: "SIL Open Font License 1.1", source: "fonts.google.com/specimen/Oswald" },
  { id: "archivo", name: "Archivo", family: "Archivo", stack: "Archivo, Arial, sans-serif", weight: 800, category: "Modern", license: "SIL Open Font License 1.1", source: "fonts.google.com/specimen/Archivo" },
  { id: "pacifico", name: "Pacifico", family: "Pacifico", stack: "'Pacifico', 'Segoe Script', cursive", weight: 400, category: "Script", license: "SIL Open Font License 1.1", source: "fonts.google.com/specimen/Pacifico" },
  { id: "mono", name: "Mono", family: "IBM Plex Mono", stack: "'IBM Plex Mono', ui-monospace, monospace", weight: 700, category: "General", license: "SIL Open Font License 1.1", source: "fonts.google.com/specimen/IBM+Plex+Mono" },
];

/** Fonts grouped for the picker — categories with no fonts are dropped. */
export function fontsByCategory(): { category: FontCategory; fonts: FontSpec[] }[] {
  return FONT_CATEGORIES.map((category) => ({
    category,
    fonts: FONTS.filter((f) => f.category === category),
  })).filter((g) => g.fonts.length > 0);
}

/** Font families that ship as bundled WebFonts (need loading before canvas export). */
export const BUNDLED_FONT_FAMILIES = ["Teko", "Anton", "Bebas Neue", "Oswald", "Graduate", "Pacifico"];

export function getFontById(id: string): FontSpec {
  return FONTS.find((f) => f.id === id) ?? FONTS[0];
}

// ---------------------------------------------------------------------
// Placement presets — position a layer inside a named print area. Sets
// an initial spot/size; the user can still drag/scale/rotate freely.
// rx/ry are 0–1 within the referenced area; sizeIn is a printed size hint.
// ---------------------------------------------------------------------
export type Placement = {
  id: string;
  name: string;
  view: ViewId;
  areaId: string;
  rx: number;
  ry: number;
  /** printed width hint, inches (image layers) */
  sizeIn: number;
  /** garment family this preset belongs to (default "top") */
  family?: "top" | "headwear";
  /** which garments this preset suits (undefined = all in family) */
  only?: string[];
};

export const PLACEMENTS: Placement[] = [
  // Front
  { id: "left-chest", name: "Left chest", view: "front", areaId: "torso", rx: 0.74, ry: 0.14, sizeIn: 3.5 },
  { id: "right-chest", name: "Right chest", view: "front", areaId: "torso", rx: 0.26, ry: 0.14, sizeIn: 3.5 },
  { id: "front-centre", name: "Centre chest", view: "front", areaId: "torso", rx: 0.5, ry: 0.22, sizeIn: 8 },
  { id: "upper-front", name: "Upper front", view: "front", areaId: "torso", rx: 0.5, ry: 0.07, sizeIn: 9 },
  { id: "full-front", name: "Full front", view: "front", areaId: "torso", rx: 0.5, ry: 0.5, sizeIn: 11 },
  { id: "lower-front", name: "Lower front", view: "front", areaId: "torso", rx: 0.5, ry: 0.82, sizeIn: 7 },
  { id: "left-shoulder", name: "Left shoulder", view: "front", areaId: "torso", rx: 0.82, ry: 0.04, sizeIn: 3 },
  { id: "right-shoulder", name: "Right shoulder", view: "front", areaId: "torso", rx: 0.18, ry: 0.04, sizeIn: 3 },
  { id: "left-sleeve", name: "Left sleeve", view: "front", areaId: "left-sleeve", rx: 0.5, ry: 0.5, sizeIn: 3 },
  { id: "right-sleeve", name: "Right sleeve", view: "front", areaId: "right-sleeve", rx: 0.5, ry: 0.5, sizeIn: 3 },
  { id: "left-panel", name: "Left side panel", view: "front", areaId: "left-panel", rx: 0.5, ry: 0.5, sizeIn: 1.6 },
  { id: "right-panel", name: "Right side panel", view: "front", areaId: "right-panel", rx: 0.5, ry: 0.5, sizeIn: 1.6 },
  // Back
  { id: "upper-back", name: "Upper back", view: "back", areaId: "torso", rx: 0.5, ry: 0.12, sizeIn: 10 },
  { id: "centre-back", name: "Centre back", view: "back", areaId: "torso", rx: 0.5, ry: 0.45, sizeIn: 9 },
  { id: "full-back", name: "Full back", view: "back", areaId: "torso", rx: 0.5, ry: 0.5, sizeIn: 11.5 },
  { id: "lower-back", name: "Lower back", view: "back", areaId: "torso", rx: 0.5, ry: 0.84, sizeIn: 7 },
  // Headwear (caps) — front/back panels
  { id: "cap-front-centre", name: "Front panel", view: "front", areaId: "torso", rx: 0.5, ry: 0.5, sizeIn: 3.5, family: "headwear" },
  { id: "cap-front-left", name: "Front left", view: "front", areaId: "torso", rx: 0.26, ry: 0.5, sizeIn: 2, family: "headwear" },
  { id: "cap-front-right", name: "Front right", view: "front", areaId: "torso", rx: 0.74, ry: 0.5, sizeIn: 2, family: "headwear" },
  { id: "cap-back", name: "Back panel", view: "back", areaId: "torso", rx: 0.5, ry: 0.5, sizeIn: 3, family: "headwear" },
];

export function placementsFor(product: Product, view: ViewId): Placement[] {
  const areaIds = new Set(areasForView(product, view).map((a) => a.id));
  const fam = product.family ?? "top";
  return PLACEMENTS.filter(
    (p) => p.view === view && areaIds.has(p.areaId) && (p.family ?? "top") === fam && (!p.only || p.only.includes(product.id)),
  );
}

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
