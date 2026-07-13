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
    extraAreas: {
      front: [
        { id: "left-sleeve", name: "Left sleeve", x: 96, y: 214, w: 72, h: 92, widthIn: 3.8, heightIn: 4.8 },
        { id: "right-sleeve", name: "Right sleeve", x: 432, y: 214, w: 72, h: 92, widthIn: 3.8, heightIn: 4.8 },
      ],
    },
    avoidAreas: {
      front: [{ id: "collar", name: "collar / neckline", x: 250, y: 150, w: 100, h: 62, widthIn: 5, heightIn: 3 }],
      back: [{ id: "collar", name: "collar / neckline", x: 250, y: 150, w: 100, h: 46, widthIn: 5, heightIn: 2 }],
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
    description: "A lightweight performance jersey with a ribbed crew neck — built for team names, numbers and sponsor logos.",
    use: "Football/soccer teams, sports clubs, five-a-side, fan merch",
    material: "Breathable performance knit (reference)",
    availability: "confirm",
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
    description: "A sleeveless mesh basketball tank with a ribbed V-neck — big front and back numbers, team name and sponsors.",
    use: "Basketball teams, 3×3, leagues, training squads, fan jerseys",
    material: "Breathable basketball mesh (reference)",
    availability: "confirm",
    thumb: `${ASSET_BASE}/basketball-thumb.webp`,
    cut: "regular",
    zones: {
      front: { x: 196, y: 220, w: 208, h: 275, widthIn: 11, heightIn: 14.5 },
      back: { x: 196, y: 185, w: 208, h: 315, widthIn: 11, heightIn: 16.5 },
    },
    avoidAreas: {
      front: [{ id: "collar", name: "V-neck collar", x: 258, y: 150, w: 84, h: 78, widthIn: 4, heightIn: 4 }],
      back: [{ id: "collar", name: "neckline", x: 258, y: 150, w: 84, h: 40, widthIn: 4, heightIn: 2 }],
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
  category: string;
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
export const FONTS: FontSpec[] = [
  { id: "teko", name: "Teko (jersey number)", family: "Teko", stack: "'Teko', 'Arial Narrow', sans-serif", weight: 600, category: "Athletic / numbers", license: "SIL Open Font License 1.1", source: "fonts.google.com/specimen/Teko" },
  { id: "anton", name: "Anton (display)", family: "Anton", stack: "'Anton', Impact, sans-serif", weight: 400, category: "Display / block", license: "SIL Open Font License 1.1", source: "fonts.google.com/specimen/Anton" },
  { id: "bebas", name: "Bebas Neue (athletic)", family: "Bebas Neue", stack: "'Bebas Neue', 'Arial Narrow', sans-serif", weight: 400, category: "Condensed athletic", license: "SIL Open Font License 1.1", source: "fonts.google.com/specimen/Bebas+Neue" },
  { id: "oswald", name: "Oswald (condensed)", family: "Oswald", stack: "'Oswald', 'Arial Narrow', sans-serif", weight: 600, category: "Condensed sans", license: "SIL Open Font License 1.1", source: "fonts.google.com/specimen/Oswald" },
  { id: "graduate", name: "Graduate (varsity)", family: "Graduate", stack: "'Graduate', Georgia, serif", weight: 400, category: "Varsity / collegiate", license: "SIL Open Font License 1.1", source: "fonts.google.com/specimen/Graduate" },
  { id: "pacifico", name: "Pacifico (script)", family: "Pacifico", stack: "'Pacifico', 'Segoe Script', cursive", weight: 400, category: "Script", license: "SIL Open Font License 1.1", source: "fonts.google.com/specimen/Pacifico" },
  { id: "archivo", name: "Archivo (clean sans)", family: "Archivo", stack: "Archivo, Arial, sans-serif", weight: 800, category: "General purpose", license: "SIL Open Font License 1.1", source: "fonts.google.com/specimen/Archivo" },
  { id: "mono", name: "Mono", family: "IBM Plex Mono", stack: "'IBM Plex Mono', ui-monospace, monospace", weight: 700, category: "Monospace", license: "SIL Open Font License 1.1", source: "fonts.google.com/specimen/IBM+Plex+Mono" },
];

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
  /** which garments this preset suits (undefined = all) */
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
  // Back
  { id: "upper-back", name: "Upper back", view: "back", areaId: "torso", rx: 0.5, ry: 0.12, sizeIn: 10 },
  { id: "centre-back", name: "Centre back", view: "back", areaId: "torso", rx: 0.5, ry: 0.45, sizeIn: 9 },
  { id: "full-back", name: "Full back", view: "back", areaId: "torso", rx: 0.5, ry: 0.5, sizeIn: 11.5 },
  { id: "lower-back", name: "Lower back", view: "back", areaId: "torso", rx: 0.5, ry: 0.84, sizeIn: 7 },
];

export function placementsFor(product: Product, view: ViewId): Placement[] {
  const areaIds = new Set(areasForView(product, view).map((a) => a.id));
  return PLACEMENTS.filter((p) => p.view === view && areaIds.has(p.areaId) && (!p.only || p.only.includes(product.id)));
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
