# Bearded Genius — Design System & Build Plan

Relume / Claude-Design-first plan for a minimal, premium, culture-led **Bearded Genius** storefront.
Nigerian-made streetwear. WhatsApp-led reservations. **Bearded Genius only — no Lagos Sneaker Club
copy, assets, or sections in the live UI** (LSC-context files stay quarantined as reference).

---

## 1. Relume prompt (paste-ready)

> Design a minimal, premium, culture-led storefront for **Bearded Genius**, a Nigerian-made
> streetwear and lifestyle brand. Editorial, expressive, confident — built for people who want to
> stand out and own the room. Orders happen over WhatsApp (`0909-9-GENIUS`, +234 909 943 6487,
> Instagram `@bearded_genius`). Single-page storefront with anchored sections: Home, Shop, Culture,
> Custom Threads, About, Contact.
>
> The first screen must read as a real shop, not a marketing splash: brand lockup, a calm hero
> slideshow (campaign images + a short vertical "Built to stand out" reel), confident one-line copy,
> and immediate Shop / WhatsApp actions. Below it: a brand-value marquee, a Shop grid of editorial
> product cards with per-product image galleries and a WhatsApp reserve action, a Culture section
> with an editorial image rhythm and a community/media rail, a Custom Threads service flow
> (brief → quantity → deadline → WhatsApp, with the Guildford City FC custom jersey as proof), a
> short About, and a Contact block where WhatsApp is primary and Instagram secondary.
>
> Visual system: warm ink-black, warm off-white/cream, chalk-stone neutral, with a single restrained
> **terracotta/ochre** accent pulled from the AFRI JORTS floral print. Refined serif display
> (Fraunces) for editorial headings, a clean grotesk (Archivo) for UI. Sharp cards (≤8px radius),
> thin warm borders, no nested cards, no gradient orbs, generous-but-dense editorial whitespace.
> Use the real Instagram garments, people and campaign shots — cropped and sequenced intentionally.
>
> Motion is quiet and purposeful (Emil-Kowalski style): fast UI timing (<300ms), custom ease-out for
> entrances, origin-aware menus/galleries, transform/opacity only, spring-curve drawer, hero
> crossfade with slight scale drift, sparse section reveals, single-source muted-autoplay video with
> a 44px mute toggle, and full `prefers-reduced-motion` support.

---

## 2. Sitemap (single-page, anchored sections)

| # | Section | Anchor | Goal | Description (drives the wireframe) |
|---|---------|--------|------|------------------------------------|
| 1 | **Home / Hero** | `#home` | Read as a real storefront in one screen | Split editorial hero: left = eyebrow (Nigerian Made), serif headline, one-line copy, `Shop pieces` + `WhatsApp`, brand stat row. Right = slideshow of campaign images + the "Built to stand out" reel with progress thumbnails + mute control. |
| 2 | **Value marquee** | — | Set brand vocabulary | Slow loop: Nigerian Made · AFRI JORTS · Custom Threads · Members Only · Built To Stand Out. Pauses for reduced motion. |
| 3 | **Shop** | `#shop` | Make reserving real | Section head + "ask for stock" link. Responsive product grid (1/2/3 cols). Each card: image **gallery** (dots/arrows), category + status, name, short copy, colour, ≥40px size chips, "Add to reserve". |
| 4 | **Culture** | `#culture` | Show the brand is lived-in | Dark editorial band: big "genius in the making" campaign image + short copy, supporting "culture lives on" group shots, and a draggable media rail incl. the reel. The way people wear BG. |
| 5 | **Custom Threads** | `#custom` | Convert custom/team orders | Service flow: 3 steps (brief → quantity & deadline → WhatsApp) beside the Guildford City FC custom jersey. Clear "Start a custom order" CTA. |
| 6 | **About** | `#about` | Brand story, short & confident | One statement + a couple of supporting lines. Nigerian made, expressive prints, built to stand out. |
| 7 | **Contact** | `#contact` | WhatsApp conversion | Human-friendly phone (`0909-9-GENIUS` / +234 909 943 6487), WhatsApp primary CTA, Instagram secondary. |
| — | **Footer** | — | Wrap + links | Brand, IG, WhatsApp, quick anchors. |

Reserve flow (global): Add → spring drawer → itemised pre-filled WhatsApp message. Reservation, not payment.

---

## 3. Style guide tokens

**Palette (warm — distinct from any other brand)**
| Token | Value | Use |
|---|---|---|
| `--ink` | `#15110b` | warm near-black: text, dark sections, primary buttons |
| `--ink-2` / `--coal` | `#211b12` / `#2c2418` | dark surfaces, hovers |
| `--taupe` | `#6f6253` | secondary warm text |
| `--stone` | `#cdc4b3` | neutral detail |
| `--line` / `--line-2` | `#e6dfd1` / `#d9d0bf` | warm hairlines |
| `--paper` / `--paper-2` | `#f4f0e7` / `#ebe4d6` | warm off-white page / tints |
| `--surface` | `#fdfbf5` | warm-white cards |
| `--accent` | `#c2602f` | terracotta/ochre (eyebrows, active, marquee, small lines) |
| `--accent-deep` | `#a4481f` | terracotta for white-text CTAs (AA) |

**Type** — Display: **Fraunces** (opsz serif) for editorial headings. UI: **Archivo** grotesk.
Fluid but **clamped** scale (no `vw` body text). Eyebrows: Archivo 0.72rem, 0.16em tracking, caps,
short terracotta rule.

**Spacing** 4→128 scale · **Radii** 4/6/8/12 (cards 8) · container 1280, fluid gutter.

**Buttons** — dark (ink), accent (terracotta, white text), cream (on dark), ghost (border). Heights
44/50/56. Press `scale(.97)`. Focus-visible terracotta ring. ≥40–44px touch targets.

**Cards** — warm-white, 1px warm border, 8px radius, hover lift + image scale (hover devices only),
per-product **image gallery** with dot/arrow controls. No nested cards.

**Media cards / rail** — fixed aspect ratios (4:5 product, 9:16 reel) to prevent layout shift; muted
in-view video with a 44px sound toggle.

**Drawer/sheet** — right slide, scrim fade, spring curve, scroll-lock, Esc, focus moved in.

---

## 4. Asset placement plan (exact paths, live only)

Base: `/assets/bearded-genius/instagram-2026-06-09`

| Asset | Path | Placement |
|---|---|---|
| Logo | `/assets/bearded-genius/logo/profile-logo.jpg` | header, footer, favicon |
| Genius in the making | `…/images/brand/genius-in-the-making.jpg` | hero slide 1, culture anchor |
| Built to stand out (reel + poster) | `…/videos/built-to-stand-out.mp4` + `…/posters/built-to-stand-out-poster.jpg` | hero slide (video), culture rail |
| Culture lives on 01/02 | `…/images/editorial/culture-lives-on-0{1,2}.jpg` | culture supporting + rail |
| Custom threads (Guildford) | `…/images/editorial/custom-threads-guildford.jpg` | Custom section primary |
| AFRI JORTS 01/02 | `…/images/products/afri-jorts-0{1,2}.jpg` | Afri Jorts product gallery, hero |
| Button-Up 01/02/03 | `…/images/products/button-up-0{1,2,3}.jpg` | Button-Up gallery, hero |
| Statement Set 01–04 | `…/images/products/shop-now-set-0{1..4}.jpg` | Statement Set gallery |

**Quarantined (never rendered live):** `posters/lsc-bag-bg-reference-*`, `videos/*-reference.mp4`,
`reference/lsc-context/shabang-*`. These mention LSC and stay reference-only.

---

## 5. Motion spec (Emil-Kowalski applied)

Tokens: `--ease-out-strong: cubic-bezier(.16,1,.3,1)` · `--ease-in-soft: cubic-bezier(.32,0,.67,0)` ·
`--ease-sheet: cubic-bezier(.32,.72,0,1)` · durations 160 / 240 / 420 / 620ms.

| Element | Motion |
|---|---|
| Hero slideshow | 620ms opacity crossfade + slight scale-drift on image slides (reduced-motion off); video plays only while in view; CTA never moves |
| Hero thumbnails | active thumbnail fills a progress bar; click switches origin-aware |
| Product gallery | crossfade/translate between images; dots + edge arrows; touch swipe; no hover dependency |
| Cards | hover lift `-3px` + image `scale(1.04)` on hover-capable only; press `scale(.97)` |
| Buttons/icon-btns | press `scale(.97)`, 160ms |
| Drawer / mobile menu | scrim fade + panel slide on `--ease-sheet` (enter ~420ms) / quick ease-in exit; scroll-lock; Esc; focus in |
| Section reveals | opacity + 14px translateY, ease-out-strong, light stagger, once |
| Marquee | 32s linear loop, edge mask, paused for reduced motion |
| Video sound | single audible source; 44px toggle, aria-label, stops propagation; muted autoplay default |
| Reduced motion | no drift/parallax/marquee/autoplay; reveals shown; transitions ~0 |

---

## 6. Responsive QA plan

Widths: **390 / 430 / 768 / 1024 / 1440**. On each:
- `document.documentElement.scrollWidth <= window.innerWidth` (no horizontal overflow).
- Shop grid: **1 col ≤640 · 2 col ≤1024 · 3 col >1024**; no clipped cards/buttons/text.
- Size chips & icon buttons ≥40px (44px on touch); hero CTA visible, not under sticky header.
- Drawer, mobile menu, gallery controls, and video mute reachable on phone.
- Hero/cards/video use fixed aspect ratios (no layout shift); type is clamped, never `vw`.
- No LSC text in rendered DOM; no console errors on cold reload.

---

## 7. Implementation plan

1. `index.html` already loads Archivo + Fraunces — keep; warm `theme-color`.
2. `src/styles.css` → full warm design system (tokens, type, components, motion, responsive).
3. `src/data.ts` → `BRAND`, `MEDIA` (new IG map), `PRODUCTS` with `gallery: string[]`, `HERO_SLIDES`,
   `CULTURE_MEDIA`, `waLink`. No invented prices.
4. Extract small components (Header, Hero, ProductCard, Drawer, Culture, Custom, Contact, Footer,
   Reveal, VideoSoundButton, MediaRail) + hooks (`useReveal/useReducedMotion/useScrollLock/useEscape`)
   + a single-source `VideoSound` context. Keep Vite/React/TS, lucide-react icons.
5. Production pass: real interactions, media perf (lazy, posters, in-view video), motion, responsive.
6. `npm run build` + QA sweep + screenshots.

---

## 8. Owner handoff (everything editable in `src/data.ts`)

- **WhatsApp number / phone** → `BRAND.whatsapp` (digits) + `BRAND.whatsappDisplay` + `phoneWordmark`.
- **Add a product** → push to `PRODUCTS` with `gallery: [..paths]`, `sizes`, `status`, `color`. No price needed — copy stays "Confirm on WhatsApp".
- **Swap/extend images** → drop files under `/assets/bearded-genius/...` and reference in `MEDIA` / a product `gallery`.
- **Hero media** → edit `HERO_SLIDES` (image or video + poster).
- **Sizes / availability** → per product `sizes` + `status` (`Available` / `Made to order` / `Limited`).
- **Never** reference the quarantined LSC-context files in live data.
