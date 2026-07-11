// =====================================================================
// CUSTOM TEE STUDIO — structured enquiry summary, WhatsApp text, JSON spec
// Test mode: nothing is ever sent automatically.
// =====================================================================

import {
  AVAILABILITY_LABEL,
  colorAvailability,
  CUSTOM_COLOR_NOTICE,
  getFabricById,
  MARKET_SOURCING_NOTICE,
  MIN_ORDER,
  PREVIEW_DISCLAIMER,
  type Fabric,
} from "./catalog";
import {
  estimatedDpi,
  getProduct,
  qualityLevel,
  round2,
  SIZE_KEYS,
  sizeTotal,
  type Artwork,
  type DesignState,
} from "./state";
import { BRAND } from "../data/brand";

export type SummaryRow = { label: string; value: string; step?: number };

export function artworkLine(art: Artwork): string {
  const hIn = round2(art.widthIn * (art.naturalH / art.naturalW));
  return `${art.fileName} — ${art.widthIn}″ × ${hIn}″ (~${estimatedDpi(art)} DPI, ${qualityLevel(art)})${
    art.rotation ? `, rotated ${Math.round(art.rotation)}°` : ""
  }`;
}

export function sizesLine(state: DesignState): string {
  const d = state.details;
  const parts = SIZE_KEYS.filter((k) => d.sizes[k] > 0).map((k) => `${k} ×${d.sizes[k]}`);
  if (d.otherSizes.trim()) parts.push(`Custom: ${d.otherSizes.trim()} (to confirm)`);
  return parts.join(", ") || "—";
}

/** "Front and back" | "Front only" | "Back only" | "" */
export function designSidesLine(state: DesignState): string {
  const f = !!state.artworks.front;
  const b = !!state.artworks.back;
  return f && b ? "Front and back" : f ? "Front only" : b ? "Back only" : "";
}

export function getFabric(state: DesignState): Fabric | undefined {
  return getFabricById(state.details.fabricId);
}

/** "Midweight cotton (Mid weight) — Commonly available (confirmed by the team)" */
export function fabricLine(state: DesignState): string {
  const f = getFabric(state);
  if (!f) return "";
  return `${f.name} (${f.weight.toLowerCase()} weight) — ${AVAILABILITY_LABEL[f.availability].toLowerCase()}, confirmed by the team`;
}

export function summaryRows(state: DesignState): SummaryRow[] {
  const d = state.details;
  const product = getProduct(state);
  const rows: SummaryRow[] = [
    { label: "Reference", value: state.reference },
    {
      label: "Product",
      value: `${product.name} — ${AVAILABILITY_LABEL[product.availability].toLowerCase()}`,
      step: 0,
    },
    {
      label: "Garment colour",
      value: `${state.color.name} (${state.color.hex}) — ${AVAILABILITY_LABEL[colorAvailability(state.color.status)].toLowerCase()}`,
      step: 1,
    },
    {
      label: "Fabric",
      value: fabricLine(state) || "No preference — the team will advise",
      step: 1,
    },
  ];
  if (state.artworks.front) rows.push({ label: "Front design", value: artworkLine(state.artworks.front), step: 2 });
  if (state.artworks.back) rows.push({ label: "Back design", value: artworkLine(state.artworks.back), step: 2 });
  if (d.quantity.trim()) rows.push({ label: "Quantity", value: d.quantity.trim(), step: 4 });
  if (sizeTotal(d.sizes) > 0 || d.otherSizes.trim()) rows.push({ label: "Sizes", value: sizesLine(state), step: 4 });
  if (d.sameDesign) rows.push({ label: "Same design on all", value: d.sameDesign === "yes" ? "Yes" : "No — see notes", step: 4 });
  if (d.method.trim()) rows.push({ label: "Method preference", value: d.method.trim(), step: 4 });
  if (d.deadline.trim()) rows.push({ label: "Needed by", value: d.deadline.trim(), step: 4 });
  if (d.deliveryLocation.trim()) rows.push({ label: "Delivery location", value: d.deliveryLocation.trim(), step: 4 });
  if (d.name.trim()) rows.push({ label: "Name", value: d.name.trim(), step: 4 });
  if (d.phone.trim()) rows.push({ label: "Phone / WhatsApp", value: d.phone.trim(), step: 4 });
  if (d.email.trim()) rows.push({ label: "Email", value: d.email.trim(), step: 4 });
  if (d.notes.trim()) rows.push({ label: "Notes", value: d.notes.trim(), step: 4 });
  return rows;
}

/**
 * Structured WhatsApp enquiry (test mode — opened only by explicit user
 * action, never automatically; contains no image data).
 */
export function buildStudioMessage(state: DesignState): string {
  const d = state.details;
  const line = (label: string, value: string) => (value.trim() ? `*${label}:* ${value.trim()}` : "");
  const placement = (v: "front" | "back") => {
    const a = state.artworks[v];
    if (!a) return "";
    return `${v === "front" ? "Front" : "Back"} — ${a.fileName}, ${a.widthIn}″ wide`;
  };
  const printing = [placement("front"), placement("back")].filter(Boolean).join("\n");

  const product = getProduct(state);
  const parts = [
    "*New Studio enquiry* 👕",
    "",
    line("Reference", state.reference),
    line("Customer", d.name),
    line("Phone", d.phone),
    d.email.trim() ? line("Email", d.email) : "",
    line("Product", `${product.name} — ${AVAILABILITY_LABEL[product.availability].toLowerCase()}`),
    line(
      "Colour",
      `${state.color.name} (${state.color.hex}) — ${AVAILABILITY_LABEL[colorAvailability(state.color.status)].toLowerCase()}`,
    ),
    line("Fabric", fabricLine(state) || "No preference — please advise"),
    line("Design", designSidesLine(state)),
    line("Quantity", d.quantity),
    line("Sizes", sizesLine(state)),
    printing ? `*Printing:*\n${printing}` : "",
    d.method.trim() ? line("Print preference", d.method) : "",
    line("Required date", d.deadline),
    line("Delivery", d.deliveryLocation),
    d.notes.trim() ? line("Notes", d.notes) : "",
    "",
    "The shared reference file contains the complete front and back design, artwork placement, colour reference and production information.",
    "Please confirm garment and fabric availability, final artwork size and placement, printing method, price and production time.",
    `_I understand the garment, fabric and colour shown are visual references — availability depends on market sourcing at the time of this request, and the team confirms everything (or suggests the closest alternative) before any order is accepted. Studio requests can start from one item._`,
  ].filter((l) => l !== "");

  return parts.join("\n");
}

export function studioWaLink(state: DesignState): string {
  return `${BRAND.whatsapp.base}?text=${encodeURIComponent(buildStudioMessage(state))}`;
}

/** Machine-readable design brief. Original artwork preserved separately. */
export function buildDesignSpec(state: DesignState, includeArtworkData = false): object {
  const artSpec = (a?: Artwork) =>
    a
      ? {
          fileName: a.fileName,
          fileKB: a.fileKB,
          naturalPx: { w: a.naturalW, h: a.naturalH },
          hasAlpha: a.hasAlpha,
          printedInches: { width: a.widthIn, height: round2(a.widthIn * (a.naturalH / a.naturalW)) },
          centreWithinZone: { x: round2(a.cx), y: round2(a.cy) },
          rotationDeg: Math.round(a.rotation * 10) / 10,
          estimatedDpi: estimatedDpi(a),
          quality: qualityLevel(a),
          ...(includeArtworkData ? { originalDataUrl: a.src } : {}),
        }
      : undefined;

  const d = state.details;
  const product = getProduct(state);
  const fabric = getFabric(state);
  return {
    prototype: true,
    generator: "The Factory Nigeria — Studio (experimental prototype)",
    disclaimer: PREVIEW_DISCLAIMER,
    availabilityNotice: MARKET_SOURCING_NOTICE,
    reference: state.reference,
    createdAt: new Date().toISOString(),
    status: "draft", // future statuses: submitted, awaiting-review, quoted, approved, in-production, completed, cancelled
    product: {
      id: state.productId,
      name: product.name,
      availability: AVAILABILITY_LABEL[product.availability],
    },
    color: {
      name: state.color.name,
      hex: state.color.hex,
      status: state.color.status,
      availability: AVAILABILITY_LABEL[colorAvailability(state.color.status)],
      ...(state.color.status === "confirm" ? { notice: CUSTOM_COLOR_NOTICE } : {}),
    },
    fabric: fabric
      ? {
          id: fabric.id,
          name: fabric.name,
          weight: fabric.weight,
          availability: AVAILABILITY_LABEL[fabric.availability],
        }
      : { id: "", name: "No preference — team to advise" },
    artworks: { front: artSpec(state.artworks.front), back: artSpec(state.artworks.back) },
    order: {
      minimumOrder: MIN_ORDER,
      quantity: d.quantity,
      sizes: d.sizes,
      otherSizes: d.otherSizes,
      sameDesignOnAll: d.sameDesign,
      methodPreference: d.method,
      requiredDate: d.deadline,
      deliveryLocation: d.deliveryLocation,
      notes: d.notes,
    },
    customer: { name: d.name, phone: d.phone, email: d.email },
  };
}
