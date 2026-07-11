# Factory OS / Production Desk — design system

The Factory Nigeria is staged as a **production console**: you view the factory
through its operating system. Every object is operational — order/quote tickets,
status chips, a process board, spec sheets, a proof wall, a checkout-style quote
builder. The dominant surface is warm **paper + ink** (an atelier worktable);
the brand **violet** is a sharp structural signal, never a gradient wash.

## How it differs from Lagos Sneaker Club & Bearded Genius

| | LSC | Bearded Genius | The Factory NG |
|---|---|---|---|
| Model | Sneaker retail / hype | Streetwear / lifestyle | **B2B production OS — quote, no cart** |
| Core object | Product cards | Product/lookbook | **Production tickets, process board, quote console** |
| Action | Shop / cart | Shop over WhatsApp | **Request a structured WhatsApp quote** |
| Type | Retail system | Archivo + Fraunces | **Bricolage Grotesque + Hanken Grotesk + Space Mono** |
| Motifs | Merchandising | Editorial | **Stitch lines, perforated tickets, ruler ticks, mono spec data** |

## Colour

| Token | Value | Use |
|---|---|---|
| `--ink` | `#14110F` | text, dark sections, status bar, footer |
| `--paper` / `--paper-2` | `#F7F3EC` / `#EFE9DE` | dominant background |
| `--steel` / `--line` | `#C9C6BD` / `#DAD6CC` | borders, ticket edges, technical lines |
| `--purple` / `--purple-700` / `--purple-deep` | `#8D21D8` / `#6F1AB0` / `#4E1196` | brand signal, CTAs, active states |
| `--lilac` / `--lilac-tint` | `#D8B7EF` / `#EFE2FA` | soft fills, icon chips |
| `--green` | `#3F8F58` | WhatsApp + "ready/confirmed" status |
| `--amber` | `#C98A1B` | "in-production / caution" status (sparingly) |

Dominant paper/ink, sharp violet accent, green/amber for status only.

## Type

- **Display:** Bricolage Grotesque (700/800) — headlines, ticket/board titles
- **UI/body:** Hanken Grotesk (400–700)
- **Spec/labels:** Space Mono (uppercase, tracked) — order codes, MOQ, coords, ticket fields

Scale: H1 `clamp(2.6rem, 7vw, 5.4rem)`, H2 `clamp(1.9rem, 4.2vw, 3.2rem)`,
body `1rem–1.125rem`, mono-label `~0.7rem`.

## Spacing & shape

4px base. Container `1280px`, gutter `clamp(20px, 5vw, 48px)`, section padding
`clamp(64px, 9vw, 132px)`. Card/ticket radius `10px`, chips `999px`. Motifs:
dashed "stitch" dividers, perforated ticket notches, cutting-table paper grid,
corner registration marks.

## Components

StatusBar (live open/closed in Africa/Lagos) · Header + portal MobileDrawer ·
Ticker · Production-Desk hero · ServiceCard (what it is / **you send** / MOQ /
quote) · ProcessBoard (8 steps + status chips) · ProofWall (filterable real
media, masonry) · MediaVideo (poster + in-view muted autoplay + one-at-a-time
audio + accessible mute/play) · QuoteConsole (checkout-style → WhatsApp message)
· StickyQuoteBar (mobile) · VisitPanel (map link + appointment) · FaqAccordion.

## Motion (Emil Kowalski-style)

- Tokens: `--dur-fast 160ms`, `--dur-ui 240ms`, `--dur-sheet 420ms`;
  `--ease-out cubic-bezier(.16,1,.3,1)`, `--ease-sheet cubic-bezier(.32,.72,0,1)`.
- Transform/opacity only. Section reveals: IntersectionObserver, `translateY(16px)`
  + opacity, ease-out, small stagger via `transition-delay`.
- Drawer/sheet: `transform .42s var(--ease-sheet)`, origin-aware (slides from right).
- Button press `scale(.97)`; never start from `scale(0)`.
- Video: poster→video opacity fade. Ticker marquee paused on reduced motion/hover.
- `prefers-reduced-motion: reduce` disables reveals, marquee and video autoplay
  while keeping all content and controls usable.

## Accessibility

Semantic landmarks + skip link; `focus-visible` violet ring on every control;
≥44–48px tap targets; labelled form fields; drawer is a portal `dialog` with
Escape, scroll-lock, focus move and `inert` when closed; video controls have
dynamic aria-labels; alt text on all media; status colours paired with text +
dots (not colour-only).

## Media policy

Real Instagram media only. Videos: muted autoplay in-view, poster fallback,
single-source audio, visible mute/unmute. **No AI-generated support assets were
needed or used** — if any are ever added they must be non-deceptive textures
only and logged here + in `claude-factory-kit/ASSET_MANIFEST.md`.

## Responsive QA (verified)

390 / 430 / 768 / 1024 / 1440 — no horizontal overflow on any of the 7 pages;
header, drawer, sticky quote bar, quote form, video controls and contact all
usable; `npm run build` passes with no TS/Vite errors; no console errors on cold
load.

## Owner inputs still needed

- Confirmed/expanded **services** list and exact print methods offered
- **Payment** terms (currently "confirmed on WhatsApp")
- **Turnaround** windows and **delivery** zones (currently unspecified by design)
- Any **approved portfolio** captions / which posts may be shown as client work
- Optional: confirm whether the live open/closed indicator should be shown
