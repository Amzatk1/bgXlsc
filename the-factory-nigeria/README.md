# The Factory Nigeria — website

Production-grade marketing/quote site for **The Factory Nigeria**, a garment
production & printing factory in Ilupeju, Lagos. Built as **quote-commerce**:
the goal is to convert brands, companies, teams, creators and event buyers into
**WhatsApp production quotes** (MOQ 30pcs) — not a retail cart.

Design system: **Factory OS / Production Desk** (see `FACTORY_OS_DESIGN.md`).

## Stack

- Vite 6 + React 18 + TypeScript
- `lucide-react` icons
- No CSS framework — a hand-authored design system in `src/index.css` + `src/ui.css`
- Hash router (`src/lib/router.ts`) — zero dependencies, works on any static host

## Run

```bash
npm install
npm run dev      # http://127.0.0.1:5173
npm run build    # tsc + vite build → dist/
npm run preview  # serve the production build
```

## Structure

```
src/
  data/        brand facts, curated media manifest, services, process, faq
  lib/         audio bus, whatsapp builder, reveal + reduced-motion hooks, router, open-status
  components/  StatusBar, Header, MobileDrawer, Footer, Ticker, MediaVideo,
               Ticket, ServiceCard, ProcessBoard, ProofWall, QuoteConsole,
               StickyQuoteBar, VisitPanel, FaqAccordion, …
  pages/       Home, Services, Process, Work, Brands, Visit, Faq
public/assets/the-factory-nigeria/   real Instagram media (videos, posters, images, logo)
```

## Media

All photography/video is the brand's **real Instagram media**, copied from
`claude-factory-kit/assets/` into `public/`. No AI-generated or stock imagery is
used. Videos run muted with poster frames and only one can be audible at a time.

## Verified brand facts (do not invent beyond these)

- WhatsApp: **+234 909 943 6487** (`wa.me/2349099436487`)
- Address: **46 Industrial Avenue, Ilupeju, Lagos** · `6.54003, 3.35868`
- Hours: **9am–5pm, Mon–Fri** · Factory visits **by appointment**
- MOQ: **30 pieces**
- Instagram: **@thefactorynigeria_**

No pricing, turnaround, delivery or payment terms are stated anywhere — those are
routed to WhatsApp ("we confirm scope & price with you directly").

## Source material

The brief, profile data and media live in `claude-factory-kit/` (see
`CLAUDE_FACTORY_PROMPT.md`).

## Owner inputs still needed

See the bottom of `FACTORY_OS_DESIGN.md` — confirmed services list, payment
terms, turnaround windows, delivery zones, and any approved portfolio captions.
