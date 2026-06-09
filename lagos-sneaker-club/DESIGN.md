# Lagos Sneaker Club — Design System & Build Notes

A world-class, minimal **Lagos Sneaker Club** site: editorial sneaker retail + culture for the
Ikoyi space. Single brand only. **Bearded Genius does not appear** as a brand, nav item, page,
product line, collaborator, or in any live copy. Two source posters had a legacy
`LSC@BEARDEDGENIUS.ORG` line baked into the image — those bands are cropped out at build time, so the
email never reaches the live site.

This doc is the Relume-first workflow output (prompt → sitemap → sections → wireframes → style guide)
plus the production implementation notes.

---

## 1. Final Relume prompt (paste-ready)

> Create a premium, minimal ecommerce + culture website for **Lagos Sneaker Club**, a sneaker retail
> and culture space at 73 Ademola St, Ikoyi, Lagos. The brand sells and reserves sneakers, runs
> consignment/stocking for African fashion & lifestyle brands, hosts community events, and takes
> orders/enquiries over WhatsApp (+234 913 002 3762, IG @lgssnkrclub).
>
> Use only Lagos Sneaker Club. Do not include Bearded Genius anywhere.
>
> Pages: Home, Shop, Events & Culture, Stock With Us, Visit Ikoyi, About, Contact. Global nav: Shop,
> Events, Visit, Stock With Us, About, plus a WhatsApp CTA and a bag/reserve icon.
>
> The homepage must read like a real store from the first screen: a split editorial-retail hero with
> an image/video slideshow on one side and headline + shop/visit/WhatsApp CTAs on the other, then
> featured drops (product cards), Lagos culture/events, the Ikoyi space, a stock-with-us invitation,
> an Instagram-style media rail, and a final CTA.
>
> Shop = real ecommerce structure: filters for brand, type, size, condition and availability; sharp
> product cards with size chips and a reserve action; a slide-in reserve bag that builds a WhatsApp
> message. No invented prices — show "Price on WhatsApp" until real stock is supplied.
>
> Visual direction: minimal editorial retail. Black / white / charcoal / concrete grey + one strong
> red accent (#FE3231 from the LSC partner poster). Circular LSC monogram. Refined serif display
> (Fraunces) for statements like "A hub for sneaker culture", clean sans (Inter) for UI. Generous
> whitespace, thin borders, 6–8px radii, large image/video panels. No gradients, no purple/blue, no
> hypebeast clutter, no fake metrics.
>
> Motion: slow image/video crossfades in the hero slideshow; product-card hover (image scale ~1.04 +
> quick reserve reveal); minimal nav underlines; spring-like reserve drawer (~320–460ms); section
> reveals as opacity + small y-translate only; a draggable media rail; full reduced-motion support.

---

## 2. Sitemap

| # | Page | Route | Purpose | Sections |
|---|------|-------|---------|----------|
| 1 | **Home** | `/` | Prove LSC is a real store + culture hub instantly | Editorial-retail hero w/ slideshow · value marquee · featured drops · culture in Lagos · visit the space · stock with us · media rail · final CTA |
| 2 | **Shop** | `/shop` | Make buying/reserving feel real | Intro · sticky filters (brand/type/size/condition/availability) + sort · product grid · reserve bag drawer · confirm-on-WhatsApp disclaimer |
| 3 | **Events & Culture** | `/events` | Position LSC as a Lagos culture space | Hero + wide community image · programme cards (Sneaker Saturday, Rasta Roast, Creator Day, Pop-up) · media rail · RSVP CTA |
| 4 | **Stock With Us** | `/stock-with-us` | Convert African brands into stocking enquiries | Hero w/ red graphic · who it's for · how it works · "Calling African Brands" editorial · FAQ · CTA |
| 5 | **Visit Ikoyi** | `/visit` | Physical-store confidence | Hero + open status · map + address/hours table · store gallery · what to expect · CTA |
| 6 | **About** | `/about` | Brand story | Hero · "Open Everyday" image · story · three pillars · pullquote + culture mosaic · CTA |
| 7 | **Contact** | `/contact` | Simple conversion | Direct methods (WhatsApp/IG/address/hours) · form (name, phone/email, reason, message) → opens pre-filled WhatsApp |

Footer (global): brand + blurb, Shop links, club links, find-us (address/hours/WhatsApp/IG), social.

---

## 3. Homepage wireframe brief (section by section)

1. **Sticky header + announcement bar** — bar shows live open/closed status, hours, address, IG &
   WhatsApp. Header: circular logo + wordmark, nav, search→shop, bag (opens reserve drawer), WhatsApp
   button; hamburger + full-screen serif menu on mobile.
2. **Hero (first viewport)** — two-column split. Left: eyebrow, serif headline *"A hub for sneaker
   **culture** in Lagos."*, sub, `Shop sneakers` + `WhatsApp us`, and a store-meta row. Right:
   full-bleed slideshow (Open Everyday image → countdown clips → store/winners → Lavcore). Stacks with
   media on top on mobile.
3. **Value marquee** — slow horizontal loop of brand values (Open Everyday, Reserve on WhatsApp,
   Consignment, 1K Sneaker Saturday…). Pauses for reduced motion.
4. **Featured drops** — 4 product cards + "Shop all sneakers" link + the no-fake-prices note.
5. **Culture in Lagos** (dark) — Rasta Roast image + numbered list (Sneaker Saturday, Rasta Roast,
   Creator days/pop-ups) → Events.
6. **Visit the Ikoyi space** — Open Everyday image + address/hours + Directions / Visit CTAs.
7. **Stock with us** — copy + red scribble graphic, value row, "Start a stocking enquiry".
8. **Media rail** — draggable image/video tiles, arrows on desktop, links to IG.
9. **Final CTA** — dark band over a store image: Shop sneakers + Reserve on WhatsApp.

---

## 4. Shop wireframe brief + reserve flow

- **Layout** — left sticky filter rail (desktop) / bottom sheet (mobile); right toolbar (count +
  sort), active-filter chips, product grid.
- **Filters** — Brand (Nike, New Balance, Adidas, Asics, Converse, Lavcore), Type (Low-top, Runner,
  High-top, Court, Clog), UK Size 6–12, Condition (New/Used/Consignment; empty facets disabled),
  Availability (in store / low / by request). Multi-select; counts shown; "Clear all".
- **Product card** — image **or** an editorial silhouette placeholder (photography pending), tag +
  save (heart), hover quick **Reserve on WhatsApp**, brand + name, "On request / Confirm price"
  (never a fake price), selectable size chips (sold-out struck through), condition + availability,
  **Add** to bag.
- **Reserve flow** — `Add` puts the pair (with chosen size) in the **Reserve bag** drawer
  (localStorage-persisted). Drawer = line items + qty steppers + remove, a "this is a reservation,
  not a payment" note, and **Send reserve on WhatsApp** which deep-links to wa.me with a formatted,
  itemised message. Single-card hover action reserves one pair directly.

---

## 5. Style guide

**Color**
| Token | Hex | Use |
|---|---|---|
| Ink | `#0B0B0C` | text, dark sections, primary buttons |
| Charcoal / Graphite | `#16161A` / `#26262B` | dark surfaces, hovers |
| Concrete | `#6C6C70` | secondary text |
| Line / Line-2 | `#E7E5E0` / `#DCDAD4` | hairline borders |
| Paper / Paper-2 | `#F5F4F1` / `#ECEBE6` | page bg, tints |
| Surface | `#FFFFFF` | cards |
| **LSC Red** | **`#FE3231`** | the one accent (from the partner poster) |
| Red-deep | `#D7261E` | red on white-text buttons (AA contrast) |

**Type** — Display: **Fraunces** (optical serif), tight tracking, balance-wrapped. UI: **Inter**.
Eyebrows: Inter 0.72rem, 0.18em tracking, uppercase, with a short red rule. Fluid `clamp()` scale.

**Spacing/Radii** — 4→128px scale; radii 4/6/8/14px (cards 8px); container max 1320px, fluid gutter.

**Buttons** — primary (ink), red (CTA), ghost, light, outline-light; 42/50/56px heights; 1px active
nudge; focus-visible red ring.

**Cards** — white, 1px hairline, 8px radius, lift + image scale on hover. Silhouette placeholder =
charcoal tile with faint brand wordmark, sole-arc line, and colorway swatches.

**Image treatment** — 4:5 product / portrait, 16:10 wide, 1:1 graphic; object-cover; subtle scrims
over media for caption legibility; monochrome editorial photography is the north star.

---

## 6. Motion spec

| Element | Motion |
|---|---|
| Hero slideshow | 1.1s opacity crossfade; image slides ~6s, video slides ~7.2s; clickable progress dots; videos muted/looped, play only while the active slide is in view |
| Section reveals | opacity + 16px y-translate, 0.7s ease-out, light stagger via delay; **already-visible/above-the-fold content reveals immediately** (no first-paint flash) |
| Product card | image scale 1.045, lift -3px, hover **Reserve** reveal, fav fade-in |
| Nav | center-grow underline; active item underlined in red |
| Reserve drawer / menu / sheet | spring slide (~460ms `cubic-bezier(.34,1.4,.5,1)`), scrim fade, scroll-lock, Esc to close, focus moved into panel |
| Media rail | native scroll-snap + pointer drag-to-scroll, arrow controls disable at ends |
| Marquee | 36s linear loop, edge mask |
| Reduced motion | autoplay/marquee/parallax off, reveals shown statically, transitions ~0; videos hold poster frames |

Rules: transforms/opacity only; 160–460ms; ease-out / spring (no cartoon bounce); large display text
never animates in a way that hurts readability.

---

## 7. Asset placement plan (exact local paths)

All assets live under `public/assets/lsc/` (served from `/assets/lsc/...`), mapped centrally in
`src/data/assets.ts`.

| Asset | Path | Used on |
|---|---|---|
| Logo | `…/logo/lsc-profile-logo.jpg` | header, footer, favicon, placeholders |
| Open Everyday | `…/images/brand/02-open-everyday.jpg` | hero slide, home visit, Visit gallery/CTA, About hero |
| Calling African Brands **(clean crop)** | `…/images/brand/01-calling-african-brands-clean.jpg` | Stock "how it works" + CTA |
| Partner graphic **(clean tile)** | `…/images/events/01-partner-with-us-tile.jpg` | home stock band, Stock hero |
| Rasta Roast | `…/images/events/02-rasta-roast-community.jpg` | home culture, Events hero, About CTA |
| Sneaker Saturday winners | `…/images/events/03-sneaker-saturday-winners.jpg` | hero slide, Events pop-up card, CTAs, Visit gallery |
| Lavcore denim clog | `…/images/products/01-lavcore-denim-crocs.jpg` | real product photo (Lavcore), hero slide, Visit gallery |
| What's in my LSC bag / Culture fit / SS fit / Clue 3–4 | `…/images/products/0{2..6}-*.jpg` | media rail, mosaic, video posters |
| Countdown clips (1.0–1.3 MB) | `…/videos/03-…mp4`, `…/videos/04-…mp4` | hero slideshow, Events card, media rail |
| Bornstar clip (6.2 MB) | `…/videos/02-…mp4` | media rail (lazy) |

**Bearded Genius handling**
- `01-partner-with-us.jpg` and `01-calling-african-brands.jpg` (raw) contain `LSC@BEARDEDGENIUS.ORG`.
  They are **never referenced** in the UI (kept only as `*Raw` keys for provenance).
- Cropped clean variants are generated with ImageMagick (`*-clean.jpg`, `*-tile.jpg`) and verified to
  contain no email. The 15 MB Rasta Roast reel (`01-…mp4`) is intentionally unused (perf) — the image
  carries that story instead.
- `public/assets/bearded-genius/` was moved out of the build path to
  `reference/bearded-genius-EXCLUDED/` so it can never ship.

---

## 8. Implementation notes

- **Stack** — Vite + React 18 + TypeScript, one global `styles.css` design system, `lucide-react`
  icons (+ a hand-rolled WhatsApp glyph). No CSS framework; no runtime UI deps beyond React.
- **Routing** — tiny pathname router (`src/router.tsx`) with `<Link>`, history API, scroll-to-top,
  per-route `document.title`. Vite SPA fallback covers dev/preview; static hosts need a catch-all
  rewrite to `index.html`.
- **State** — `ReserveProvider` (context + `localStorage`) for the bag/drawer.
- **Motion** — `useInView` (IntersectionObserver, immediate above-the-fold reveal), `useReducedMotion`,
  `useScrollLock`, `useEscape`, `useScrolled`; `<Reveal>`, `<Slideshow>`, `<MediaRail>`, `<InViewVideo>`.
- **WhatsApp** — `src/lib/whatsapp.ts` builds all deep links (reserve bag, single product, visit,
  stock, event, contact form).
- **Performance** — fonts preconnected + `display=swap`; images `loading="lazy"` + `decoding="async"`
  (hero first slide eager); videos `muted/playsInline/preload="metadata"`, play only in view; hero
  uses the two lightest clips; CSS ~9 KB gzip, JS ~68 KB gzip.
- **A11y** — skip link, focus-visible rings, labelled icon buttons, `aria-modal` dialogs, Esc-close,
  reduced-motion, semantic headings, `body overflow-x: clip` (no scroll-container hijack).

Run: `npm install` → `npm run dev` (or `npm run build && npm run preview`).

---

## 9. "World-class" quality checklist

- [x] First screen reads like a real store (slideshow + shop/visit/WhatsApp CTAs), not a splash.
- [x] One coherent accent (LSC red), serif display + clean sans, 6–8px radii, generous whitespace.
- [x] Real ecommerce filters (brand/type/size/condition/availability) + sort + reserve drawer.
- [x] No invented prices — "Price on WhatsApp / Confirm price" throughout.
- [x] WhatsApp checkout builds an itemised, pre-filled message.
- [x] Slideshow + muted in-view video + draggable media rail + spring drawer + tasteful reveals.
- [x] Full mobile layout: stacked hero, serif menu, bottom filter sheet, icon FAB.
- [x] Reduced-motion + keyboard + focus states.
- [x] **Zero** Bearded Genius in markup, copy, or visible imagery.
- [x] `tsc` + `vite build` clean; no console errors; no horizontal overflow.

---

## 10. Inputs needed from the client (flagged placeholders)

These are reasonable first-build defaults — confirm before launch:

1. **Real inventory + photography** — branded models currently render as editorial silhouette tiles;
   swap in studio shots and real stock. Lavcore uses its real photo.
2. **Prices & size availability** — intentionally omitted; UI says "Price on WhatsApp" until supplied.
3. **Payment / delivery / returns / authenticity policy** — not stated anywhere yet; add when known.
4. **WhatsApp number** — using `+234 913 002 3762` from the IG bio. Confirm it's the sales line.
5. **Contact email** — `hello@lagossneakerclub.com` is an **unconfirmed placeholder** and is not shown
   as live copy; do **not** reuse the legacy bearded-genius address.
6. **Event dates** — the programme dates are indicative; wire to the real calendar / "confirm on IG".
7. **Map** — Google "search/embed" used (no API key); swap for the exact pin / Maps Platform key.
8. **Domain & SEO/OG image** — set final canonical URL + a branded share image.
9. **Followers/community stat** — "2.2k+" mirrors current IG; update or remove as desired.

---

## 11. Mobile & motion polish pass (v2)

A production-quality responsive + interaction pass after the first build.

**Shop / product cards (the main fix)**
- Replaced the squeezed `repeat(2,1fr)` mobile grid with a cascade: **4 → 3 (≤1180) → 2 (≤860) → 1 (≤560)**. Phones now get one roomy column instead of two 168px columns that clipped content.
- Rebuilt the card so nothing can clip at any width: `min-width:0` headings, **2-line clamped** name, non-wrapping price, a **flex-wrap-safe foot**, and a stable `.card__add` (no inline `margin-left`). Availability uses compact labels ("In store" / "Low stock" / "By request").
- Touch: hover-only "Reserve on WhatsApp" overlay is hidden on `(hover: none)`; the save heart shows by default; size chips and the Add button get ≥40–44px targets.

**Header / overflow**
- Hide the redundant search icon ≤480px so the lockup never crowds on small phones; tighter header gap.
- `scroll-margin-top` under the sticky header for anchored jumps.
- Switched `body` to `overflow-x: clip` (was `hidden`) so it never hijacks the scroll container.
- Verified **zero horizontal overflow** on all 7 pages at 390/768 (`scrollWidth === innerWidth`).

**Video sound (new)**
- `VideoSoundProvider` enforces a **single audio source** — at most one video unmuted at a time.
- YouTube-style mute/unmute control (`VideoSoundButton`, speaker icons, red "on" state, ≥44px hit area, `aria-label`/`aria-pressed`) on the hero slideshow's active video, media-rail tiles, the About feature video, and the Events card video. Safe inside links (stops propagation).
- Videos stay **muted autoplay** by default (browser policy + good UX); unmuting is a user gesture that also ensures playback. Reduced-motion holds the poster until the user opts in.

**Motion (Emil Kowalski principles)**
- Overlays (drawer / mobile menu / filter sheet) now use a **springy enter** and a **quicker ease-in exit** (split transitions), plus a subtle scrim blur for depth.
- Subtle, reduced-motion-safe **ken-burns** drift on the active hero image slide.
- Snappier card press/hover (transform on the 240ms curve), transform/opacity only throughout.

**QA result:** `tsc + vite build` clean (CSS ~9.3 KB gzip, JS ~68 KB gzip); no console errors on cold load; no clipped buttons or overlays; single-source audio verified; no Bearded Genius in the rendered DOM.
