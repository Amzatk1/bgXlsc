/**
 * Brand + site configuration for Lagos Sneaker Club.
 * Values flagged `// CONFIRM` are placeholders pending client sign-off.
 */

export type HourRow = { dow: number; day: string; time: string; closed?: boolean };

export const SITE = {
  name: "Lagos Sneaker Club",
  short: "LSC",
  tagline: "A Hub for Culture",
  description:
    "A sneaker retail and culture hub in Ikoyi, Lagos. Shop and reserve drops, visit the space, and pull up for community events.",

  instagram: {
    handle: "@lgssnkrclub",
    url: "https://www.instagram.com/lgssnkrclub/",
  },

  // WhatsApp from the LSC Instagram bio: +234 913 002 3762
  whatsapp: "2349130023762",
  whatsappDisplay: "+234 913 002 3762",

  // CONFIRM — neutral placeholder only; do NOT use the legacy bearded-genius email.
  email: "hello@lagossneakerclub.com",
  emailConfirmed: false,

  address: {
    street: "73 Ademola St, Ikoyi",
    region: "Lagos 106104",
    full: "73 Ademola St, Ikoyi, Lagos 106104",
  },

  // Map links (no API key required)
  mapsDirections:
    "https://www.google.com/maps/dir/?api=1&destination=73%20Ademola%20Street%2C%20Ikoyi%2C%20Lagos",
  mapEmbed:
    "https://www.google.com/maps?q=73%20Ademola%20Street%2C%20Ikoyi%2C%20Lagos&z=15&output=embed",

  // Mon–Sat 12–6pm, Sun 12–4pm
  hours: [
    { dow: 1, day: "Monday", time: "12:00 – 18:00" },
    { dow: 2, day: "Tuesday", time: "12:00 – 18:00" },
    { dow: 3, day: "Wednesday", time: "12:00 – 18:00" },
    { dow: 4, day: "Thursday", time: "12:00 – 18:00" },
    { dow: 5, day: "Friday", time: "12:00 – 18:00" },
    { dow: 6, day: "Saturday", time: "12:00 – 18:00" },
    { dow: 0, day: "Sunday", time: "12:00 – 16:00" },
  ] as HourRow[],
  hoursSummary: "Mon–Sat 12–6pm · Sun 12–4pm",
} as const;

export type NavItem = { label: string; to: string };

export const NAV: NavItem[] = [
  { label: "Shop", to: "/shop" },
  { label: "Events", to: "/events" },
  { label: "Visit", to: "/visit" },
  { label: "Stock With Us", to: "/stock-with-us" },
  { label: "About", to: "/about" },
];

/** Returns today's opening hours + an open/closed read based on local time. */
export function openStatus(now = new Date(), hours: HourRow[] = SITE.hours) {
  const row = hours.find((h) => h.dow === now.getDay()) ?? hours[0];
  const [openH, closeH] = row.time.includes("16")
    ? [12, 16]
    : [12, 18];
  const hour = now.getHours() + now.getMinutes() / 60;
  const isOpen = hour >= openH && hour < closeH;
  return { row, isOpen, opensAt: "12pm", closesAt: row.dow === 0 ? "4pm" : "6pm" };
}
