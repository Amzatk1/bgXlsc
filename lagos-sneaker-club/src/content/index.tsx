import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { setWhatsAppNumber } from "../lib/whatsapp";
import { LOCAL_CONTENT } from "./local";
import { fetchSanityContent, isSanityConfigured } from "./sanity";
import type { SiteContent, SiteSettings } from "./types";

const ContentContext = createContext<SiteContent>(LOCAL_CONTENT);

/**
 * Local-first content provider. Renders immediately with local data, then — if
 * a Sanity project is configured — replaces it with CMS content. If Sanity is
 * not configured or the fetch fails, the site keeps working on local data.
 */
export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(LOCAL_CONTENT);

  // Keep WhatsApp deep links in sync with the active settings.
  useEffect(() => {
    setWhatsAppNumber(content.settings.whatsapp);
  }, [content.settings.whatsapp]);

  useEffect(() => {
    if (!isSanityConfigured()) return;
    let alive = true;
    fetchSanityContent()
      .then((next) => {
        if (alive) setContent(next);
      })
      .catch((err) => {
        if (import.meta.env.DEV) console.warn("Sanity load failed — using local content.", err);
      });
    return () => {
      alive = false;
    };
  }, []);

  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}

export function useContent(): SiteContent {
  return useContext(ContentContext);
}

export function useSettings(): SiteSettings {
  return useContext(ContentContext).settings;
}

/* --------------------------------------------------------------------------
 * Async getters — same data outside the React tree (scripts, future SSR).
 * They mirror the provider: Sanity when configured, otherwise local.
 * ------------------------------------------------------------------------ */
export async function getSiteContent(): Promise<SiteContent> {
  if (!isSanityConfigured()) return LOCAL_CONTENT;
  try {
    return await fetchSanityContent();
  } catch {
    return LOCAL_CONTENT;
  }
}

export async function getProducts() {
  return (await getSiteContent()).products;
}
export async function getFeaturedProducts() {
  return (await getSiteContent()).featured;
}
export async function getMediaItems(placement?: "slideshow" | "rail") {
  const c = await getSiteContent();
  if (placement === "slideshow") return c.heroSlides;
  return c.mediaRail;
}
export async function getEvents() {
  return (await getSiteContent()).events;
}
export async function getSiteSettings() {
  return (await getSiteContent()).settings;
}

export { LOCAL_CONTENT } from "./local";
export type { SiteContent, SiteSettings } from "./types";
