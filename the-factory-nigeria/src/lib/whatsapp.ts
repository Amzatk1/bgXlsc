import { BRAND } from "../data/brand";

// A structured Request-for-Quote enquiry that ends in WhatsApp. The site
// never calculates a price — the team confirms availability, price and
// timing after reading the enquiry.

export type EnquiryFields = {
  service: string;
  product: string;
  quantity: string;
  sizes: string;
  supply: string; // who makes the garment
  artwork: string; // artwork/logo status
  neededBy: string;
  fulfilment: string; // pickup or delivery
  name: string;
  company: string;
  email: string;
  notes: string;
};

export const EMPTY_ENQUIRY: EnquiryFields = {
  service: "",
  product: "",
  quantity: "",
  sizes: "",
  supply: "",
  artwork: "",
  neededBy: "",
  fulfilment: "",
  name: "",
  company: "",
  email: "",
  notes: "",
};

// Build a concise, readable WhatsApp enquiry. Empty fields are omitted, and
// the message makes clear this is an enquiry, not a confirmed order or price.
export function buildEnquiryMessage(q: EnquiryFields): string {
  const line = (label: string, value: string) =>
    value.trim() ? `• ${label}: ${value.trim()}` : "";

  const fields = [
    line("Name", q.name),
    line("Company", q.company),
    line("Service", q.service),
    line("Garment / product", q.product),
    line("Who makes it", q.supply),
    line("Quantity", q.quantity),
    line("Sizes", q.sizes),
    line("Artwork", q.artwork),
    line("Needed by", q.neededBy),
    line("Pickup / delivery", q.fulfilment),
    line("Email for a formal quote", q.email),
    line("Notes", q.notes),
  ].filter((l) => l !== "");

  return [
    "Hi The Factory Nigeria 👋 I'd like to start an order enquiry.",
    "",
    ...fields,
    "",
    "I understand this is an enquiry. Please confirm availability, price and production timing.",
  ].join("\n");
}

export function waLink(message: string): string {
  return `${BRAND.whatsapp.base}?text=${encodeURIComponent(message)}`;
}

export function enquiryLink(q: EnquiryFields): string {
  return waLink(buildEnquiryMessage(q));
}

// Secondary CTA — a plain chat, no "quote" wording and no price implied.
export function chatLink(context?: string): string {
  const msg = context
    ? `Hi The Factory Nigeria 👋 I have a question about ${context}.`
    : "Hi The Factory Nigeria 👋 I'd like to ask about custom production and printing.";
  return waLink(msg);
}

export function visitLink(): string {
  return waLink(
    `Hi The Factory Nigeria 👋 I'd like to book a factory visit at ${BRAND.address.display}. When are you available?`,
  );
}
