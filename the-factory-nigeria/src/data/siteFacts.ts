// =====================================================================
// SITE-WIDE CUSTOMER-FACING FACTS — one source of truth for claims that
// repeat across the marketing pages, the enquiry flow and Studio copy.
//
// Three states, kept deliberately distinct:
//   1. CONFIRMED — verified business facts (address, hours, contact, the
//      stated 30-piece general minimum). Sourced from BRAND (the verified
//      brand kit). Safe to state plainly.
//   2. PROVISIONAL — customer-safe wording for things the team confirms
//      per order (decoration methods, how production stages are handled,
//      artwork preparation). Helpful and confident about the OUTCOME,
//      precise that the team confirms the HOW.
//   3. INTERNAL questions/assumptions live in src/studio/factoryFacts.ts
//      and docs/experiments/FACTORY_QUESTIONS.md. They must never render
//      to a customer as fact.
//
// The specific trap this file exists to prevent: presenting a decoration
// method list (screen / DTF / DTG / embroidery) as a confirmed in-house
// equipment list, or claiming "every stage happens on our floor", before
// the business has confirmed its equipment and in-house/partner model.
// Decoration methods are EXAMPLES the team may recommend after review.
// =====================================================================

import { BRAND } from "./brand";

// ---------------------------------------------------------------------
// 1. CONFIRMED
// ---------------------------------------------------------------------
export const MOQ_GENERAL = 30; // pieces — the stated minimum for general manufacturing enquiries
export const MOQ_LINE = `Minimum order: ${MOQ_GENERAL} pieces`;

/** The one canonical explanation of the two enquiry lanes. */
export const MOQ_VS_STUDIO =
  `General manufacturing enquiries start from ${MOQ_GENERAL} pieces. Studio design requests can start from one item — in both cases the team confirms availability, minimums, price and timing before anything is accepted.`;

export const CONTACT = {
  whatsappDisplay: BRAND.whatsapp.display,
  hours: BRAND.hours,
  address: BRAND.address.display,
} as const;

// ---------------------------------------------------------------------
// 2. PROVISIONAL — confident about outcomes, precise about who confirms
// ---------------------------------------------------------------------

/**
 * Decoration methods, framed as what they are until the equipment list is
 * confirmed: common recommendations the team makes after reviewing the
 * artwork, fabric and quantity — never an unconditional service list.
 */
export const METHOD_EXAMPLES = [
  { t: "Screen printing", d: "Bold, durable prints — often recommended for larger runs and solid colours." },
  { t: "Transfer print (DTF)", d: "Detailed, full-colour artwork on a range of fabrics." },
  { t: "Embroidery", d: "Premium, raised branding for caps, polos, jackets and uniforms." },
] as const;

export const METHOD_WORDING =
  "The team recommends the best method for your artwork, fabric and quantity after reviewing your enquiry — and confirms it with you before production.";

/** The FAQ answer for "What print methods do you offer?" — review-first, then examples. */
export const METHOD_FAQ_ANSWER =
  "The best method depends on your artwork, fabric and quantity, so the team confirms it for each order after reviewing your enquiry. Common recommendations include screen printing for bold, simple designs; transfer printing (DTF) for detailed, full-colour artwork; and embroidery for a premium finish.";

/**
 * Production stages without the "every stage happens on our floor"
 * totality claim. The factory, the address and the photography are real;
 * exactly how each stage of a given order is handled is the team's call.
 */
export const PRODUCTION_WORDING =
  "From design and cutting to sewing, printing and finishing — the team confirms how each stage of your order is handled before production begins.";

export const PRODUCTION_STEP_SHORT = "Made to the agreed specification.";

/** Quality language as a described practice, not a categorical guarantee. */
export const QUALITY_WORDING =
  "The team reviews stitch, print and finishing before anything is packed for handover.";

/**
 * Artwork guidance: helpful, never an acceptance rule. The visual guides on
 * the Services page are the brand's own published material; this wording
 * frames them as help rather than policy.
 */
export const ARTWORK_WORDING =
  "A sharp, high-quality file works best — vector if you have it. If your file isn't ready, send whatever you have and the team will help get it production-ready.";
