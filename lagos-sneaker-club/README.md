# Lagos Sneaker Club

A premium, minimal ecommerce + culture website for **Lagos Sneaker Club** — a sneaker retail and
culture space in Ikoyi, Lagos. Shop and reserve drops over WhatsApp, visit the space, join community
events, and stock African brands with us.

> Single brand only. **Bearded Genius is not included** anywhere (brand, nav, page, product line,
> collaborator, or copy). See `DESIGN.md` for how legacy poster text was handled.

## Quick start

```bash
npm install
npm run dev        # http://127.0.0.1:5173
npm run build      # tsc + vite production build → dist/
npm run preview    # serve the production build
```

## Pages

Home · Shop · Events & Culture · Stock With Us · Visit Ikoyi · About · Contact

## Highlights

- Editorial-retail homepage with an image/video **slideshow** from the first screen
- **Shop** with real filters (brand, type, size, condition, availability) + sort
- **Reserve bag** drawer that builds a pre-filled **WhatsApp** checkout message (no fake prices)
- Draggable media rail, spring drawers, tasteful scroll reveals, full **reduced-motion** support
- Mobile-first: stacked hero, serif menu, bottom filter sheet, WhatsApp FAB

## Structure

```
index.html                 fonts (Fraunces + Inter), meta, favicon
src/
  App.tsx                  layout shell + routing
  router.tsx               minimal pathname router
  styles.css               full design system (tokens, components, responsive, motion)
  hooks.ts                 useInView / useReducedMotion / useScrollLock / …
  store/reserve.tsx        reserve bag context (localStorage)
  lib/whatsapp.ts          WhatsApp deep-link builders
  data/                    assets, site config, products, events, media
  components/              Header, Footer, Slideshow, MediaRail, ProductCard, ReserveDrawer, …
  pages/                   Home, Shop, Events, StockWithUs, Visit, About, Contact
public/assets/lsc/         curated Lagos Sneaker Club assets (logo, images, videos)
```

## Documentation

- **`DESIGN.md`** — Relume prompt, sitemap, wireframe briefs, style guide, motion spec, asset plan,
  implementation notes, quality checklist, and the list of client inputs still needed.

## Notes / pending client inputs

Real prices, inventory and product photography, the confirmed sales WhatsApp number and email,
payment/shipping/returns policy, final map pin and domain — all flagged in `DESIGN.md §10`.

## Content management (CMS handover)

The owner edits products, media, events and store settings in **Sanity Studio** — no code
changes. The site is **local-first**: it runs on bundled sample content with zero config, and
pulls live content from Sanity when `VITE_SANITY_PROJECT_ID` is set (falling back to local if
the CMS is unreachable).

```
src/content/        local-first adapter (types, local fallback, sanity reader, ContentProvider)
studio/             Sanity Studio app (schemas: product, mediaItem, event, siteSettings)
.env.example        website env (VITE_SANITY_*)
vercel.json         SPA rewrite for client routing
```

- **Owner guide:** `HANDOVER.md`
- **Architecture & decisions:** `CMS_PLAN.md` (Sanity now, Shopify later for real checkout)
- **Studio setup:** `studio/README.md`

Components read content via `useContent()` / `useSettings()` — they never import data arrays
directly, so swapping local data for the CMS required no UI changes.
