// =====================================================================
// THE FACTORY NIGERIA — verified brand facts only.
// Source: claude-factory-kit/profile.json + ASSET_MANIFEST.md.
// Do NOT add pricing, turnaround, delivery, payment terms, or client
// claims here. Anything unconfirmed is routed to "confirm on WhatsApp".
// =====================================================================

export const BRAND = {
  name: "The Factory Nigeria",
  shortName: "The Factory NG",
  fullName: "Garment Production & Printing Factory in Lagos",
  username: "thefactorynigeria_",
  bioMoq: "30 pieces",
  moqShort: "30pcs",

  hours: "9am – 5pm, Monday to Friday",
  hoursShort: "Mon–Fri · 9–5",
  visits: "Factory visits by appointment",

  whatsapp: {
    e164: "2349099436487",
    display: "+234 909 943 6487",
    base: "https://wa.me/2349099436487",
  },

  instagram: "https://www.instagram.com/thefactorynigeria_/",

  address: {
    street: "46 Industrial Avenue, Ilupeju",
    city: "Lagos, Nigeria",
    display: "46 Industrial Avenue, Ilupeju, Lagos, Nigeria",
    lat: 6.54003,
    lng: 3.35868,
  },

  // Audience the site converts
  audiences: [
    "Clothing brands",
    "Companies & corporates",
    "Teams & clubs",
    "Creators & drops",
    "Events & pop-ups",
    "Schools & groups",
  ],
} as const;

export const MAP_URL = `https://www.google.com/maps/search/?api=1&query=${BRAND.address.lat},${BRAND.address.lng}`;
export const MAP_DIR_URL = `https://www.google.com/maps/dir/?api=1&destination=${BRAND.address.lat},${BRAND.address.lng}`;

// Brands the factory has produced for — list supplied by the manager.
export const CLIENTS = [
  "Hennessy",
  "Shoreline",
  "Obi's House",
  "Koko Beach",
  "Mota NG",
  "Bearded Genius",
  "Bill Energy",
] as const;

export type NavItem = { label: string; href: string };

export const NAV: NavItem[] = [
  { label: "Services", href: "#/services" },
  { label: "How it works", href: "#/process" },
  { label: "Our work", href: "#/work" },
  { label: "Brands & Co.", href: "#/brands" },
  { label: "Contact", href: "#/visit" },
  { label: "FAQs", href: "#/faq" },
];

// Ticker keywords (plain, operational)
export const TICKER = [
  "Garment production",
  "Printing & embroidery",
  "Corporate uniforms",
  "Custom jerseys",
  "Branded merchandise",
  "Minimum order: 30 pieces",
  "Ilupeju, Lagos",
  "Visits by appointment",
  "Start an order enquiry",
];
