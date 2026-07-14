// =====================================================================
// STUDIO — full-surface jersey designs (sublimation)
//
// Sublimated jerseys are not "a logo on a blank shirt": the whole panel is
// printed before the garment is sewn, so the base colour, stripes, sashes,
// gradients and geometric blocks are all part of ONE printed surface.
//
// This module builds that surface as a plain SVG (base + secondary + accent
// colour), which the editor drops in as an ordinary background image layer.
// It is generated locally and deterministically — no AI, no network, no
// third party ever sees the customer's design. The exact colours and the
// pattern spec are recorded in the production reference and the design brief
// so The Factory can reproduce the surface precisely.
//
// Everything here is still a visual reference: colour, fabric and finish are
// confirmed by the team before production (see MARKET_SOURCING_NOTICE).
// =====================================================================

/** The generated surface matches the stage (600×700) at 2× so exports stay crisp. */
const W = 1200;
const H = 1400;

export type PatternId = "solid" | "stripes" | "hoops" | "sash" | "halves" | "chevron" | "fade" | "blocks";

export type PatternSpec = {
  id: PatternId;
  /** main garment colour */
  base: string;
  /** the second colour of the pattern */
  secondary: string;
  /** trim / detail colour */
  accent: string;
};

export type PatternDef = {
  id: PatternId;
  name: string;
  /** plain-language description for the customer */
  hint: string;
};

export const JERSEY_PATTERNS: PatternDef[] = [
  { id: "solid", name: "Solid", hint: "One colour across the whole jersey." },
  { id: "stripes", name: "Vertical stripes", hint: "Classic football stripes, top to bottom." },
  { id: "hoops", name: "Hoops", hint: "Horizontal bands across the body." },
  { id: "sash", name: "Sash", hint: "A diagonal band across the chest." },
  { id: "halves", name: "Halves", hint: "Split down the middle into two colours." },
  { id: "chevron", name: "Chevron", hint: "A bold V across the chest." },
  { id: "fade", name: "Gradient fade", hint: "One colour fading into another." },
  { id: "blocks", name: "Geometric blocks", hint: "Angular colour blocking." },
];

export const DEFAULT_PATTERN: PatternSpec = {
  id: "stripes",
  base: "#232f45",
  secondary: "#f4f2ee",
  accent: "#a5252b",
};

export function getPatternDef(id: PatternId): PatternDef {
  return JERSEY_PATTERNS.find((p) => p.id === id) ?? JERSEY_PATTERNS[0];
}

/**
 * Colours come from a colour input, but this string is interpolated straight
 * into SVG markup — validate rather than trust.
 */
function safe(hex: string): string {
  return /^#[0-9a-f]{6}$/i.test(hex.trim()) ? hex.trim() : "#808080";
}

function surface(spec: PatternSpec): string {
  const b = safe(spec.base);
  const s = safe(spec.secondary);
  const a = safe(spec.accent);
  const bg = `<rect width="${W}" height="${H}" fill="${b}"/>`;

  switch (spec.id) {
    case "solid":
      return bg;

    case "stripes": {
      const n = 9;
      const w = W / n;
      let out = bg;
      for (let i = 1; i < n; i += 2) out += `<rect x="${i * w}" y="0" width="${w}" height="${H}" fill="${s}"/>`;
      for (let i = 1; i < n; i++) out += `<rect x="${i * w - 5}" y="0" width="10" height="${H}" fill="${a}"/>`;
      return out;
    }

    case "hoops": {
      const n = 7;
      const h = H / n;
      let out = bg;
      for (let i = 1; i < n; i += 2) out += `<rect x="0" y="${i * h}" width="${W}" height="${h}" fill="${s}"/>`;
      for (let i = 1; i < n; i++) out += `<rect x="0" y="${i * h - 5}" width="${W}" height="10" fill="${a}"/>`;
      return out;
    }

    case "sash":
      return (
        bg +
        `<g transform="rotate(-28 ${W / 2} ${H / 2})">` +
        `<rect x="-500" y="600" width="2200" height="30" fill="${a}"/>` +
        `<rect x="-500" y="630" width="2200" height="180" fill="${s}"/>` +
        `<rect x="-500" y="810" width="2200" height="30" fill="${a}"/>` +
        `</g>`
      );

    case "halves":
      return (
        bg +
        `<rect x="${W / 2}" y="0" width="${W / 2}" height="${H}" fill="${s}"/>` +
        `<rect x="${W / 2 - 8}" y="0" width="16" height="${H}" fill="${a}"/>`
      );

    case "chevron":
      return (
        bg +
        `<polygon points="0,340 ${W / 2},760 ${W},340 ${W},560 ${W / 2},980 0,560" fill="${s}"/>` +
        `<polygon points="0,300 ${W / 2},720 ${W},300 ${W},340 ${W / 2},760 0,340" fill="${a}"/>`
      );

    case "fade":
      return (
        `<defs><linearGradient id="tfnFade" x1="0" y1="0" x2="0" y2="1">` +
        `<stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${s}"/>` +
        `</linearGradient></defs>` +
        `<rect width="${W}" height="${H}" fill="url(#tfnFade)"/>` +
        `<rect x="0" y="${H - 120}" width="${W}" height="24" fill="${a}"/>`
      );

    case "blocks":
      return (
        bg +
        `<polygon points="0,0 ${W},0 0,820" fill="${s}"/>` +
        `<polygon points="${W},0 ${W},640 ${W - 420},0" fill="${a}"/>` +
        `<polygon points="0,${H} 0,${H - 380} 560,${H}" fill="${a}"/>`
      );
  }
}

/** The full-surface design as standalone SVG markup. */
export function renderPatternSvg(spec: PatternSpec): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    surface(spec) +
    `</svg>`
  );
}

/**
 * A data URL the editor and the canvas exporter can both draw. Data URLs are
 * same-origin, so this never taints the export canvas.
 */
export function patternDataUrl(spec: PatternSpec): string {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(renderPatternSvg(spec));
}

export const PATTERN_W = W;
export const PATTERN_H = H;

/** Human line for the enquiry, brief and production reference. */
export function patternSummary(spec: PatternSpec): string {
  const def = getPatternDef(spec.id);
  if (spec.id === "solid") return `${def.name} — base ${spec.base.toUpperCase()}`;
  return `${def.name} — base ${spec.base.toUpperCase()}, secondary ${spec.secondary.toUpperCase()}, accent ${spec.accent.toUpperCase()}`;
}

export const PATTERN_NOTE =
  "Full-surface designs are printed into the fabric (sublimation). Colours on screen are a visual reference — The Factory Nigeria confirms the exact ink and fabric match before production.";
