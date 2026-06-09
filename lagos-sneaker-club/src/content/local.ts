/**
 * Local fallback content. This is the source of truth until a Sanity project is
 * connected (VITE_SANITY_PROJECT_ID). It also seeds first render so the site is
 * never blank while Sanity loads.
 */
import { PRODUCTS } from "../data/products";
import { HERO_SLIDES, MEDIA_RAIL } from "../data/media";
import { EVENTS } from "../data/events";
import { SITE } from "../data/site";
import type { SiteContent, SiteSettings } from "./types";

export const LOCAL_SETTINGS: SiteSettings = {
  whatsapp: SITE.whatsapp,
  whatsappDisplay: SITE.whatsappDisplay,
  instagramUrl: SITE.instagram.url,
  instagramHandle: SITE.instagram.handle,
  addressStreet: SITE.address.street,
  addressRegion: SITE.address.region,
  addressFull: SITE.address.full,
  hoursSummary: SITE.hoursSummary,
  hours: SITE.hours,
  mapEmbed: SITE.mapEmbed,
  mapsDirections: SITE.mapsDirections,
  announcement: undefined,
  seoTitle: "Lagos Sneaker Club — A Hub for Sneaker Culture in Lagos",
  seoDescription: SITE.description,
};

export const LOCAL_CONTENT: SiteContent = {
  products: PRODUCTS,
  featured: PRODUCTS.filter((p) => p.featured),
  heroSlides: HERO_SLIDES,
  mediaRail: MEDIA_RAIL,
  events: EVENTS,
  settings: LOCAL_SETTINGS,
  source: "local",
};
