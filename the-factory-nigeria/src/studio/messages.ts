// =====================================================================
// STUDIO — structured enquiry summary, WhatsApp text, JSON spec
// Test mode: nothing is ever sent automatically.
// =====================================================================

import {
  AVAILABILITY_LABEL,
  colorAvailability,
  CUSTOM_COLOR_NOTICE,
  getFabricById,
  MARKET_SOURCING_NOTICE,
  PREVIEW_DISCLAIMER,
  type Fabric,
  type Product,
  type ViewId,
} from "./catalog";
import {
  estimatedDpi,
  fontOf,
  getProduct,
  homeArea,
  layerHeightIn,
  layerLabel,
  layersForView,
  layerWidthIn,
  qualityLevel,
  round2,
  SIZE_KEYS,
  sizeTotal,
  viewsWithDesign,
  type DesignState,
  type Layer,
} from "./state";
import { BRAND } from "../data/brand";

export type SummaryRow = { label: string; value: string; step?: number };

/** One production line describing an image or text layer. */
export function layerLine(layer: Layer, product: Product): string {
  const area = homeArea(layer, product).name;
  const rot = layer.rotation ? `, ${Math.round(layer.rotation)}°` : "";
  if (layer.kind === "image") {
    const w = layerWidthIn(layer, product);
    const h = layerHeightIn(layer, product);
    return `${layer.fileName} — ${w}″ × ${h}″ (~${estimatedDpi(layer, product)} DPI, ${qualityLevel(layer, product)})${rot} · ${area}`;
  }
  const h = layerHeightIn(layer, product);
  const roleName = layer.role === "name" ? "Name" : layer.role === "number" ? "Number" : "Text";
  const outline = layer.outline ? ` / outline ${layer.outline}` : "";
  return `${roleName} “${layer.text}” — ${h}″ tall, ${fontOf(layer).name}, ${layer.color}${outline}${rot} · ${area}`;
}

export function sizesLine(state: DesignState): string {
  const d = state.details;
  const parts = SIZE_KEYS.filter((k) => d.sizes[k] > 0).map((k) => `${k} ×${d.sizes[k]}`);
  if (d.otherSizes.trim()) parts.push(`Custom: ${d.otherSizes.trim()} (to confirm)`);
  return parts.join(", ") || "—";
}

/** "Front and back" | "Front only" | "Back only" | "" */
export function designSidesLine(state: DesignState): string {
  const v = viewsWithDesign(state);
  const f = v.includes("front");
  const b = v.includes("back");
  return f && b ? "Front and back" : f ? "Front only" : b ? "Back only" : "";
}

export function getFabric(state: DesignState): Fabric | undefined {
  return getFabricById(state.details.fabricId);
}

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
    { label: "Product", value: `${product.name} — ${AVAILABILITY_LABEL[product.availability].toLowerCase()}`, step: 0 },
    {
      label: "Garment colour",
      value: `${state.color.name} (${state.color.hex}) — ${AVAILABILITY_LABEL[colorAvailability(state.color.status)].toLowerCase()}`,
      step: 1,
    },
    { label: "Fabric", value: fabricLine(state) || "No preference — the team will advise", step: 1 },
  ];
  for (const v of ["front", "back"] as ViewId[]) {
    const ls = layersForView(state, v);
    if (ls.length) {
      rows.push({
        label: `${v === "front" ? "Front" : "Back"} design`,
        value: ls.map(layerLabel).join(", "),
        step: 2,
      });
    }
  }
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

export function buildStudioMessage(state: DesignState): string {
  const d = state.details;
  const product = getProduct(state);
  const line = (label: string, value: string) => (value.trim() ? `*${label}:* ${value.trim()}` : "");
  const printBlocks: string[] = [];
  for (const v of ["front", "back"] as ViewId[]) {
    const ls = layersForView(state, v);
    if (!ls.length) continue;
    printBlocks.push(`${v === "front" ? "Front" : "Back"}:`);
    for (const l of ls) printBlocks.push(`• ${layerLine(l, product)}`);
  }

  const parts = [
    "*New Studio enquiry* 👕",
    "",
    line("Reference", state.reference),
    line("Customer", d.name),
    line("Phone", d.phone),
    d.email.trim() ? line("Email", d.email) : "",
    line("Product", `${product.name} — ${AVAILABILITY_LABEL[product.availability].toLowerCase()}`),
    line("Colour", `${state.color.name} (${state.color.hex}) — ${AVAILABILITY_LABEL[colorAvailability(state.color.status)].toLowerCase()}`),
    line("Fabric", fabricLine(state) || "No preference — please advise"),
    line("Design", designSidesLine(state)),
    line("Quantity", d.quantity),
    line("Sizes", sizesLine(state)),
    printBlocks.length ? `*Design layers:*\n${printBlocks.join("\n")}` : "",
    d.method.trim() ? line("Print preference", d.method) : "",
    line("Required date", d.deadline),
    line("Delivery", d.deliveryLocation),
    d.notes.trim() ? line("Notes", d.notes) : "",
    "",
    "The shared reference file shows every design layer, its placement, size and rotation, the colour reference and production information.",
    "Please confirm garment and fabric availability, final artwork size and placement, printing method, price and production time.",
    `_I understand the garment, fabric and colour shown are visual references — availability depends on market sourcing at the time of this request, and the team confirms everything (or suggests the closest alternative) before any order is accepted. Studio requests can start from one item._`,
  ].filter((l) => l !== "");

  return parts.join("\n");
}

export function studioWaLink(state: DesignState): string {
  return `${BRAND.whatsapp.base}?text=${encodeURIComponent(buildStudioMessage(state))}`;
}

/** Machine-readable design brief. Original uploaded artwork preserved separately. */
export function buildDesignSpec(state: DesignState, includeArtworkData = false): object {
  const product = getProduct(state);
  const layerSpec = (l: Layer) => {
    const common = {
      id: l.id,
      view: l.view,
      area: homeArea(l, product).name,
      centreOnGarment: { x: round2(l.cx), y: round2(l.cy) },
      rotationDeg: Math.round(l.rotation * 10) / 10,
    };
    if (l.kind === "image") {
      return {
        ...common,
        kind: "image",
        fileName: l.fileName,
        fileKB: l.fileKB,
        naturalPx: { w: l.naturalW, h: l.naturalH },
        hasAlpha: l.hasAlpha,
        printedInches: { width: layerWidthIn(l, product), height: layerHeightIn(l, product) },
        estimatedDpi: estimatedDpi(l, product),
        quality: qualityLevel(l, product),
        ...(includeArtworkData ? { originalDataUrl: l.src } : {}),
      };
    }
    return {
      ...common,
      kind: "text",
      role: l.role,
      text: l.text,
      font: fontOf(l).name,
      color: l.color,
      outline: l.outline || null,
      heightInches: layerHeightIn(l, product),
    };
  };

  const d = state.details;
  const fabric = getFabric(state);
  return {
    prototype: true,
    generator: "The Factory Nigeria — Studio (experimental prototype)",
    disclaimer: PREVIEW_DISCLAIMER,
    availabilityNotice: MARKET_SOURCING_NOTICE,
    reference: state.reference,
    createdAt: new Date().toISOString(),
    status: "draft",
    product: { id: state.productId, name: product.name, availability: AVAILABILITY_LABEL[product.availability] },
    color: {
      name: state.color.name,
      hex: state.color.hex,
      status: state.color.status,
      availability: AVAILABILITY_LABEL[colorAvailability(state.color.status)],
      ...(state.color.status === "confirm" ? { notice: CUSTOM_COLOR_NOTICE } : {}),
    },
    fabric: fabric
      ? { id: fabric.id, name: fabric.name, weight: fabric.weight, availability: AVAILABILITY_LABEL[fabric.availability] }
      : null,
    layers: state.layers.map(layerSpec),
    order: {
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
