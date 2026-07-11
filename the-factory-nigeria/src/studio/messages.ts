// =====================================================================
// CUSTOM TEE STUDIO — structured enquiry summary, WhatsApp text, JSON spec
// Test mode: nothing is ever sent automatically.
// =====================================================================

import { CUSTOM_COLOR_NOTICE, MIN_ORDER, PREVIEW_DISCLAIMER } from "./catalog";
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
  const parts = SIZE_KEYS.filter((k) => d.sizes[k] > 0).map((k) => `${k} — ${d.sizes[k]}`);
  if (d.otherSizes.trim()) parts.push(`Custom: ${d.otherSizes.trim()} (to confirm)`);
  return parts.join(", ") || "—";
}

export function summaryRows(state: DesignState): SummaryRow[] {
  const d = state.details;
  const rows: SummaryRow[] = [
    { label: "Reference", value: state.reference },
    { label: "Product", value: getProduct(state).name, step: 0 },
    {
      label: "Shirt colour",
      value: `${state.color.name} (${state.color.hex})${
        state.color.status === "confirm" ? " — availability to confirm" : ""
      }`,
      step: 1,
    },
  ];
  if (state.artworks.front) rows.push({ label: "Front design", value: artworkLine(state.artworks.front), step: 2 });
  if (state.artworks.back) rows.push({ label: "Back design", value: artworkLine(state.artworks.back), step: 2 });
  if (d.quantity.trim()) rows.push({ label: "Quantity", value: d.quantity.trim(), step: 4 });
  if (sizeTotal(d.sizes) > 0 || d.otherSizes.trim()) rows.push({ label: "Sizes", value: sizesLine(state), step: 4 });
  if (d.sameDesign) rows.push({ label: "Same design on all", value: d.sameDesign === "yes" ? "Yes" : "No — see notes", step: 4 });
  if (d.method.trim()) rows.push({ label: "Method preference", value: d.method.trim(), step: 4 });
  if (d.fabricWeight.trim()) rows.push({ label: "Fabric preference", value: d.fabricWeight.trim(), step: 4 });
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

  const parts = [
    "*New custom T-shirt enquiry* 👕",
    "",
    line("Reference", state.reference),
    line("Customer", d.name),
    line("Phone", d.phone),
    d.email.trim() ? line("Email", d.email) : "",
    line("Product", getProduct(state).name),
    line(
      "Colour",
      `${state.color.name} (${state.color.hex})${state.color.status === "confirm" ? " — requires confirmation" : ""}`,
    ),
    line("Quantity", d.quantity),
    line("Sizes", sizesLine(state)),
    printing ? `*Printing:*\n${printing}` : "",
    d.method.trim() ? line("Method preference", d.method) : "",
    d.fabricWeight.trim() ? line("Fabric preference", d.fabricWeight) : "",
    line("Required date", d.deadline),
    line("Delivery location", d.deliveryLocation),
    d.notes.trim() ? line("Notes", d.notes) : "",
    "",
    "I'm attaching the design reference sheet and my original artwork in this chat.",
    `_The mockups are visual references. Please confirm fabric availability, printing method, final placement, price and production timeline. Minimum order noted: ${MIN_ORDER} pieces._`,
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
  return {
    prototype: true,
    generator: "The Factory Nigeria — Custom Tee Studio (experimental prototype)",
    disclaimer: PREVIEW_DISCLAIMER,
    reference: state.reference,
    createdAt: new Date().toISOString(),
    status: "draft", // future statuses: submitted, awaiting-review, quoted, approved, in-production, completed, cancelled
    product: { id: state.productId, name: getProduct(state).name },
    color: {
      name: state.color.name,
      hex: state.color.hex,
      status: state.color.status,
      ...(state.color.status === "confirm" ? { notice: CUSTOM_COLOR_NOTICE } : {}),
    },
    artworks: { front: artSpec(state.artworks.front), back: artSpec(state.artworks.back) },
    order: {
      minimumOrder: MIN_ORDER,
      quantity: d.quantity,
      sizes: d.sizes,
      otherSizes: d.otherSizes,
      sameDesignOnAll: d.sameDesign,
      methodPreference: d.method,
      fabricPreference: d.fabricWeight,
      requiredDate: d.deadline,
      deliveryLocation: d.deliveryLocation,
      notes: d.notes,
    },
    customer: { name: d.name, phone: d.phone, email: d.email },
  };
}
