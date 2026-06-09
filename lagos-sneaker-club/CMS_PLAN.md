# CMS Plan — Lagos Sneaker Club

**Goal:** the owner updates stock, media, events and store info without code edits.

**Decision: Sanity CMS (now) + Vercel hosting. Shopify later** — only if/when LSC wants
real on-site payments and live inventory. Today the shop is browse + **reserve over
WhatsApp**, which Sanity serves perfectly: structured content, media uploads, version
history, and an editor-friendly Studio. Shopify is the right tool for variant inventory and
checkout, so it's the documented next step rather than now.

---

## 1. Audit — what was hardcoded (and where it moved)

| Content | Was in code | Now sourced from |
|---|---|---|
| Products, sizes, availability, badges, featured | `src/data/products.ts` | `product` documents → `useContent().products` |
| Homepage slideshow | `src/data/media.ts` (`HERO_SLIDES`) | `mediaItem` (placement = slideshow) → `useContent().heroSlides` |
| Media rail / feed wall | `src/data/media.ts` (`MEDIA_RAIL`) | `mediaItem` (placement = rail) → `useContent().mediaRail` |
| Events programme | `src/data/events.ts` | `event` documents → `useContent().events` |
| WhatsApp, IG, address, hours, announcement, SEO | `src/data/site.ts` | `siteSettings` → `useSettings()` |
| Videos/posters | `src/data/assets.ts` (local files) | uploaded in Sanity, or kept local as fallback |

All of `src/data/*` **remains as the local fallback** so the site runs with zero config.

## 2. Architecture — local-first adapter

```
components/pages
      │  useContent() / useSettings()      (never import data arrays directly)
      ▼
src/content/index.tsx   ContentProvider
      │  renders local data immediately, then…
      ├─ env set?  ── no ──▶ local data (src/data/*)
      └─ yes ──▶ src/content/sanity.ts ──fetch GROQ──▶ Sanity CDN
                         │ (per-section fallback to local if empty)
                         ▼
                   mapped to the same app shapes
```

- **`src/content/types.ts`** — shared shapes (`Product`, `Slide`, `MediaItem`, `LscEvent`, `SiteSettings`, `SiteContent`).
- **`src/content/local.ts`** — `LOCAL_CONTENT` / `LOCAL_SETTINGS` built from `src/data/*`.
- **`src/content/sanity.ts`** — dependency-free reader (public GROQ HTTP API + image/file CDN).
  No `@sanity/client` in the app bundle → build stays clean and offline-safe. Maps Sanity
  docs to the exact app shapes; falls back to local per section if Sanity returns nothing.
- **`src/content/index.tsx`** — `ContentProvider`, `useContent()`, `useSettings()`, and async
  getters `getProducts()`, `getFeaturedProducts()`, `getMediaItems()`, `getEvents()`,
  `getSiteSettings()`.
- **Dynamic WhatsApp** — `lib/whatsapp.ts` exposes `setWhatsAppNumber()`; the provider calls
  it when settings load, so changing the number in Sanity updates every deep link.

**Why local-first:** instant first paint (no spinner), no blank state if Sanity is slow/down,
and the repo is demoable/offline without credentials.

## 3. Content model (Sanity schemas in `studio/schemaTypes/`)

- **product** — published, brand, model, colorway, slug, category, silhouette, condition,
  availability, sizes[{size, available, soldOut}], priceMode (whatsapp/fixed/hidden), price,
  images[] (with required alt), video, tag, featured, origin, sortOrder.
- **mediaItem** — published, title, mediaType, placement (slideshow/rail), image|video|externalUrl,
  poster, caption, link, duration, soundAllowed, sortOrder.
- **event** — published, title, kind, date, when, time, description, media{image|video,poster},
  tag, slug, sortOrder.
- **siteSettings** (singleton) — whatsapp, whatsappDisplay, instagram, address fields, hours[],
  hoursSummary, mapEmbed, mapsDirections, announcement, seoTitle, seoDescription.

Validation guards the owner: required brand/model, alt text on product photos, price required
when "fixed", a single settings document via the desk structure.

## 4. Connecting (env + CORS)

Website (`.env` locally, Vercel project settings in prod):
```
VITE_SANITY_PROJECT_ID=<project id>
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2024-01-01   # optional
```
Sanity → **API → CORS origins**: add the production URL + `http://localhost:5173`.
Only **published** docs are read, via the cached `apicdn.sanity.io` endpoint.

## 5. Seeding Sanity from the current samples (optional)

The local arrays in `src/data/*` mirror the schemas, so they're an easy import. Two options:
1. Recreate the ~9 products + media + events by hand in the Studio (10–15 min — fine for this size).
2. Or script it with `@sanity/client` + a write token, mapping each local object to a document
   (`_type: "product"`, etc.). Upload images/videos via the assets API and reference them.

Until seeded, the site falls back to the local samples per section, so it's never empty.

## 6. Hosting (Vercel)

- Framework preset: **Vite**. Build `npm run build`, output `dist/`.
- `vercel.json` adds the SPA rewrite (`/(.*) → /index.html`) so client routes like `/shop`
  work on refresh/deep-link.
- Add the `VITE_SANITY_*` env vars. Deploy the Studio separately with `sanity deploy`.

## 7. Later: Shopify for real checkout

When LSC wants payments + live inventory:
- Add Shopify; model sneakers as products with **size variants** and inventory.
- Repoint the product grid + reserve action to Shopify's Storefront API (cart/checkout).
- Keep Sanity for editorial (videos, events, homepage, store info) — the two compose well.
- Everything else (design system, motion, pages) stays unchanged.

Sources: Sanity Studio (sanity.io/studio), Vercel CMS integrations (vercel.com/docs/integrations/cms),
Shopify variants & inventory (help.shopify.com/en/manual/products/variants).
