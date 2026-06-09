/**
 * Minimal, dependency-free Sanity reader. Uses the public GROQ HTTP API + the
 * image/file CDN, so the main app needs no Sanity SDK (keeps the bundle clean
 * and the build offline-safe). Only published documents are queried.
 *
 * Activated when VITE_SANITY_PROJECT_ID is set. Otherwise the app uses local data.
 */
import { LOCAL_CONTENT, LOCAL_SETTINGS } from "./local";
import type {
  LscEvent,
  MediaItem,
  Product,
  SiteContent,
  SiteSettings,
  Slide,
} from "./types";
import type { Availability, Category, Condition, Silhouette } from "../data/products";

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET || "production";
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION || "2024-01-01";

export function isSanityConfigured(): boolean {
  return Boolean(projectId);
}

async function query<T>(groq: string): Promise<T> {
  const url =
    `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}` +
    `?query=${encodeURIComponent(groq)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status}`);
  const json = (await res.json()) as { result: T };
  return json.result;
}

const nonEmpty = <T>(arr: T[] | undefined | null, fallback: T[]): T[] =>
  Array.isArray(arr) && arr.length > 0 ? arr : fallback;

function dateChip(iso?: string): { d: string; m: string } | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return { d: String(d.getDate()).padStart(2, "0"), m: d.toLocaleString("en", { month: "short" }) };
}

/* ----------------------------------------------------------------- queries */

const PRODUCTS_Q = `*[_type == "product" && published == true]
  | order(coalesce(sortOrder, 9999) asc, _createdAt desc){
    "id": coalesce(slug.current, _id),
    brand, model, colorway, category, silhouette, condition, availability, tag, featured, origin,
    priceMode, price,
    "sizes": sizes[].size,
    "soldOut": sizes[soldOut == true || available == false].size,
    "image": images[0].asset->url
  }`;

const MEDIA_Q = `*[_type == "mediaItem" && published == true]
  | order(coalesce(sortOrder, 9999) asc, _createdAt desc){
    "id": _id, "type": mediaType, placement, "label": title, "caption": coalesce(caption, title),
    "src": select(mediaType == "video" => coalesce(video.asset->url, externalUrl), coalesce(image.asset->url, externalUrl)),
    "poster": poster.asset->url,
    "href": coalesce(link, externalUrl),
    "duration": duration
  }`;

const EVENTS_Q = `*[_type == "event" && published == true] | order(date asc){
    "id": coalesce(slug.current, _id),
    title, kind, "blurb": description, "whenText": when, "dateIso": date, time, tag,
    "mediaType": media.mediaType,
    "mediaSrc": select(media.mediaType == "video" => coalesce(media.video.asset->url, media.externalUrl), coalesce(media.image.asset->url, media.externalUrl)),
    "mediaPoster": media.poster.asset->url
  }`;

const SETTINGS_Q = `*[_type == "siteSettings"][0]{
    whatsapp, whatsappDisplay, instagramUrl, instagramHandle,
    addressStreet, addressRegion, addressFull, hoursSummary,
    "hours": hours[]{dow, day, time}, mapEmbed, mapsDirections, announcement, seoTitle, seoDescription
  }`;

/* ------------------------------------------------------------------ mappers */

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapProduct(d: any): Product {
  return {
    id: d.id,
    brand: d.brand ?? "",
    model: d.model ?? "",
    colorway: d.colorway ?? "",
    category: (d.category as Category) ?? "Sneakers",
    condition: (d.condition as Condition) ?? "New",
    silhouette: (d.silhouette as Silhouette) ?? "low",
    sizes: Array.isArray(d.sizes) ? d.sizes.filter(Boolean) : [],
    soldOut: Array.isArray(d.soldOut) ? d.soldOut.filter(Boolean) : [],
    image: d.image ?? null,
    availability: (d.availability as Availability) ?? "request",
    tag: d.tag || undefined,
    featured: Boolean(d.featured),
    origin: d.origin || undefined,
    priceMode: d.priceMode || undefined,
    price: typeof d.price === "number" ? d.price : undefined,
  };
}

function mapSlide(d: any): Slide {
  return {
    id: d.id,
    type: d.type === "video" ? "video" : "image",
    src: d.src,
    poster: d.poster || undefined,
    label: d.label ?? "",
    duration: typeof d.duration === "number" ? d.duration : undefined,
  };
}

function mapMediaItem(d: any, fallbackHref: string): MediaItem {
  return {
    id: d.id,
    type: d.type === "video" ? "video" : "image",
    src: d.src,
    poster: d.poster || undefined,
    caption: d.caption ?? d.label ?? "",
    href: d.href || fallbackHref,
  };
}

function mapEvent(d: any): LscEvent {
  return {
    id: d.id,
    title: d.title ?? "",
    kind: d.kind ?? "",
    blurb: d.blurb ?? "",
    when: d.whenText ?? "",
    date: dateChip(d.dateIso),
    time: d.time || undefined,
    media: {
      type: d.mediaType === "video" ? "video" : "image",
      src: d.mediaSrc ?? d.mediaPoster ?? "",
      poster: d.mediaPoster || undefined,
    },
    tag: d.tag || undefined,
  };
}

function mapSettings(d: any): SiteSettings {
  if (!d) return LOCAL_SETTINGS;
  const hours =
    Array.isArray(d.hours) && d.hours.length > 0 ? d.hours : LOCAL_SETTINGS.hours;
  return {
    whatsapp: d.whatsapp || LOCAL_SETTINGS.whatsapp,
    whatsappDisplay: d.whatsappDisplay || LOCAL_SETTINGS.whatsappDisplay,
    instagramUrl: d.instagramUrl || LOCAL_SETTINGS.instagramUrl,
    instagramHandle: d.instagramHandle || LOCAL_SETTINGS.instagramHandle,
    addressStreet: d.addressStreet || LOCAL_SETTINGS.addressStreet,
    addressRegion: d.addressRegion || LOCAL_SETTINGS.addressRegion,
    addressFull: d.addressFull || LOCAL_SETTINGS.addressFull,
    hoursSummary: d.hoursSummary || LOCAL_SETTINGS.hoursSummary,
    hours,
    mapEmbed: d.mapEmbed || LOCAL_SETTINGS.mapEmbed,
    mapsDirections: d.mapsDirections || LOCAL_SETTINGS.mapsDirections,
    announcement: d.announcement || undefined,
    seoTitle: d.seoTitle || LOCAL_SETTINGS.seoTitle,
    seoDescription: d.seoDescription || LOCAL_SETTINGS.seoDescription,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Fetch + map all content. Falls back to local data per-section if Sanity is empty. */
export async function fetchSanityContent(): Promise<SiteContent> {
  const [pRaw, mRaw, eRaw, sRaw] = await Promise.all([
    query<any[]>(PRODUCTS_Q),
    query<any[]>(MEDIA_Q),
    query<any[]>(EVENTS_Q),
    query<any>(SETTINGS_Q),
  ]);

  const settings = mapSettings(sRaw);

  const products = nonEmpty(
    (pRaw ?? []).map(mapProduct).filter((p) => p.id && p.model),
    LOCAL_CONTENT.products,
  );

  const media = (mRaw ?? []).filter((d) => d && d.src);
  const heroSlides = nonEmpty(
    media.filter((d) => d.placement === "slideshow").map(mapSlide),
    LOCAL_CONTENT.heroSlides,
  );
  const mediaRail = nonEmpty(
    media.filter((d) => d.placement === "rail").map((d) => mapMediaItem(d, settings.instagramUrl)),
    LOCAL_CONTENT.mediaRail,
  );

  const events = nonEmpty(
    (eRaw ?? []).map(mapEvent).filter((e) => e.title),
    LOCAL_CONTENT.events,
  );

  return {
    products,
    featured: products.filter((p) => p.featured),
    heroSlides,
    mediaRail,
    events,
    settings,
    source: "sanity",
  };
}
