import { SITE } from "../data/site";

/**
 * The active WhatsApp number used by every deep link. Defaults to the SITE
 * constant and is updated at runtime by the content layer when site settings
 * load from the CMS — so changing the number in Sanity updates every link with
 * no code change or redeploy.
 */
let activeWhatsApp: string = SITE.whatsapp;

export function setWhatsAppNumber(num?: string): void {
  const digits = (num ?? "").replace(/\D/g, "");
  if (digits) activeWhatsApp = digits;
}

/** Build a wa.me deep link with a prefilled, URL-encoded message. */
export function waLink(message: string): string {
  return `https://wa.me/${activeWhatsApp}?text=${encodeURIComponent(message)}`;
}

const SIGNATURE = "— sent from lagossneakerclub.com";

export type ReserveLineLike = {
  name: string;
  brand?: string;
  condition?: string;
  size?: string;
  qty: number;
};

/** Reserve / checkout message built from the bag. */
export function waReserveMessage(lines: ReserveLineLike[]): string {
  if (lines.length === 0) {
    return [
      `Hi ${SITE.name} 👋`,
      "",
      "I'd like to check what's currently in stock, sizes and availability.",
      "",
      SIGNATURE,
    ].join("\n");
  }

  const items = lines.map((l, i) => {
    const bits = [l.brand, l.name].filter(Boolean).join(" ");
    const detail = [l.condition, l.size].filter(Boolean).join(" · ");
    return `${i + 1}. ${bits}${detail ? ` — ${detail}` : ""}${l.qty > 1 ? ` ×${l.qty}` : ""}`;
  });

  return [
    `Hi ${SITE.name} 👋`,
    "",
    "I'd like to reserve / confirm availability for:",
    ...items,
    "",
    "Could you confirm price, size availability and pickup or delivery? Thanks!",
    "",
    SIGNATURE,
  ].join("\n");
}

/** Single-product quick reserve. */
export function waProductMessage(name: string, brand?: string, size?: string): string {
  const head = [brand, name].filter(Boolean).join(" ");
  return waLink(
    [
      `Hi ${SITE.name} 👋`,
      "",
      `I'm interested in the ${head}${size ? ` (${size})` : ""}.`,
      "Is it available, and what's the price?",
      "",
      SIGNATURE,
    ].join("\n"),
  );
}

/** Contextual enquiry links used across the site. */
export const waEnquiries = {
  general: () =>
    waLink([`Hi ${SITE.name} 👋`, "", "I have a question about the store.", "", SIGNATURE].join("\n")),

  visit: () =>
    waLink(
      [
        `Hi ${SITE.name} 👋`,
        "",
        `I'd like to visit the Ikoyi space (${SITE.address.full}). Are you open today?`,
        "",
        SIGNATURE,
      ].join("\n"),
    ),

  stock: () =>
    waLink(
      [
        `Hi ${SITE.name} 👋`,
        "",
        "I run an African fashion / accessories / beauty / lifestyle brand and I'd like to stock with LSC.",
        "Here's a bit about us:",
        "",
        SIGNATURE,
      ].join("\n"),
    ),

  event: (eventName?: string) =>
    waLink(
      [
        `Hi ${SITE.name} 👋`,
        "",
        eventName
          ? `I'd like to RSVP / get details for ${eventName}.`
          : "I'd like details on your next community event.",
        "",
        SIGNATURE,
      ].join("\n"),
    ),
};
