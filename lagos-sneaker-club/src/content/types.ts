/**
 * Content types shared by the local fallback data and the Sanity adapter.
 * Components depend on these shapes — never on where the data comes from.
 */
import type { Product } from "../data/products";
import type { Slide, MediaItem } from "../data/media";
import type { LscEvent } from "../data/events";
import type { HourRow } from "../data/site";

export type { Product, Slide, MediaItem, LscEvent, HourRow };

/** Owner-editable site settings (Sanity `siteSettings`, falls back to SITE). */
export type SiteSettings = {
  whatsapp: string;
  whatsappDisplay: string;
  instagramUrl: string;
  instagramHandle: string;
  addressStreet: string;
  addressRegion: string;
  addressFull: string;
  hoursSummary: string;
  hours: HourRow[];
  mapEmbed: string;
  mapsDirections: string;
  /** Optional override for the announcement bar; when empty the open/closed status shows. */
  announcement?: string;
  seoTitle: string;
  seoDescription: string;
};

export type SiteContent = {
  products: Product[];
  featured: Product[];
  heroSlides: Slide[];
  mediaRail: MediaItem[];
  events: LscEvent[];
  settings: SiteSettings;
  /** Where the live content came from — useful for debugging the handover. */
  source: "local" | "sanity";
};
