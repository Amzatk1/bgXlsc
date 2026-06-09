import { ASSETS } from "./assets";

export type LscEvent = {
  id: string;
  title: string;
  kind: string;
  blurb: string;
  when: string;
  date?: { d: string; m: string };
  time?: string;
  media: { type: "image" | "video"; src: string; poster?: string };
  tag?: string;
};

/**
 * Community programme. Dates are indicative placeholders for the first build —
 * the live next-date should be confirmed on WhatsApp / @lgssnkrclub.
 */
export const EVENTS: LscEvent[] = [
  {
    id: "sneaker-saturday",
    title: "1K Sneaker Saturday",
    kind: "Flagship meet-up",
    blurb:
      "The monthly clue hunt and sneaker meet. Solve the clues, pull up to the space, and a winner walks with a pair for 1K.",
    when: "Monthly · Saturday",
    date: { d: "28", m: "Jun" },
    time: "2pm – 6pm",
    media: { type: "video", src: ASSETS.videos.countdown4, poster: ASSETS.products.clue4 },
    tag: "Flagship",
  },
  {
    id: "rasta-roast",
    title: "Rasta Roast V",
    kind: "Dinner series",
    blurb:
      "Good food brings the right people together. A long-table community dinner under the hanging sneakers — sneakerhead edition.",
    when: "Quarterly",
    date: { d: "19", m: "Jul" },
    time: "From 4pm",
    media: { type: "image", src: ASSETS.events.rastaRoast },
    tag: "Community",
  },
  {
    id: "creator-day",
    title: "Creator Day",
    kind: "Content & creators",
    blurb:
      "Open studio for Lagos creators — shoot your fit, trade ideas, and build with the people moving the culture forward.",
    when: "Monthly",
    date: { d: "05", m: "Jul" },
    time: "1pm – 5pm",
    media: { type: "image", src: ASSETS.products.cultureFit },
    tag: "Creators",
  },
  {
    id: "brand-popup",
    title: "Brand Pop-Up",
    kind: "Retail pop-up",
    blurb:
      "Rotating African fashion, accessory and lifestyle brands take over the floor for a weekend. Stock with us to be featured.",
    when: "Seasonal",
    date: { d: "26", m: "Jul" },
    time: "12pm – 6pm",
    media: { type: "image", src: ASSETS.events.sneakerSaturday },
    tag: "Pop-up",
  },
];
