# Custom Tee Studio — experimental prototype

**Status:** Prototype on branch `feature/custom-tee-studio-prototype`. Not deployed, not merged,
not linked from production navigation. Test mode only.

**Route:** `#/experiments/custom-tee-studio` (hash route; not in nav, not in any sitemap; the page
carries a permanent "Experimental prototype — test mode" banner).

---

## 1. Problem statement

Customers ask The Factory for custom tees by describing designs in chat. Misunderstandings about
placement, size, colour and quantities cost back-and-forth time and create production risk. A
visual design studio lets the customer show exactly what they want, and gives the team a structured,
production-ready reference before quoting.

## 2. Customer opportunity

- Brands/creators can mock a tee in minutes and send a complete brief.
- The Factory receives structured enquiries (reference number, placement in inches, size breakdown)
  instead of loose chat messages.
- Rare/custom colours become a captured lead ("availability to confirm") instead of a lost one.

## 3. Research findings (what shaped the build)

- **Printful/Custom Ink patterns:** dashed *safe print area* on the canvas; ~**150 DPI** minimum
  guidance for garment printing with soft warnings rather than hard blocks; PNG-with-transparency
  as the preferred upload; quote-vs-checkout separation for custom manufacturing.
  (Printful help: safe print areas; DPI & print-file guidance.)
- **Editor libraries:** Fabric.js (full design-editor object model, heavier) vs Konva (lighter,
  strong touch support) vs native. For **one movable artwork per view on a fixed stage**, both are
  oversized. This codebase is deliberately dependency-light (hand-rolled router, no UI framework,
  ~69 KB gzip JS), so the editor is built on **Pointer Events + CSS transforms**, with **native
  Canvas 2D** used only at export time. Decision details in §9.
- **Quote-commerce:** matches the live site's existing model — no cart, no prices, WhatsApp handoff.

## 4. World-class reference patterns adopted

| Pattern | Source inspiration | Implementation |
|---|---|---|
| Dashed print-safe zone | Printful Design Maker | `stage__zone` overlay + out-of-zone warning |
| DPI estimate with honest wording | Printful/Custom Ink | good ≥150 / soft ≥100 / low <100, never blocks |
| Placement presets | Custom Ink | left chest 3.5″, centre chest 8″, large front 11″, upper/large back |
| Step-based mobile flow | Canva/Printify mobile | 6-step wizard, one concern per screen |
| Review-before-send | GOV.UK "check your answers" | review screen with per-row Edit links |
| Size-grid ordering | Custom Ink group orders | XS–XXL steppers + live total vs quantity validation |
| Approximate-preview honesty | all quote-based manufacturers | persistent disclaimer + on-export footer |

## 5. Existing website integration points

- Reuses the Factory OS design system: tokens, `field`/`choices`/`chip`/`btn`/`enquiry` patterns.
- Reuses `BRAND.whatsapp` (single source of truth for the number).
- Route added to the existing hash router; **no production page or nav was modified**.
- Future home: a "Design studio" card under Services once approved.

## 6. Proposed workflow

`customise → review design → guided order details → confirm package (test mode) →
customer sends WhatsApp message + attaches generated files → Factory confirms fabric, method,
quantity, price, delivery → approval → production`

## 7. Prototype scope

**In:** 2 garments (standard/oversized tee), front+back views, 9 standard colours + custom colour
with confirmation status, PNG/JPEG upload (10 MB), drag/pinch/rotate/resize with keyboard + slider
fallbacks, presets, DPI feedback, out-of-zone warning, guided order form with size-breakdown
validation, review screen, generated production reference sheet + mockup PNG + JSON brief +
preserved originals, WhatsApp message preview with explicit confirmation, Web Share API where
supported.

**Deliberately excluded:** sleeve prints, polos/caps, text/clipart tools, multi-artwork layers,
accounts/saved designs, payments, real prices, backend storage, automated sending, SVG uploads
(sanitisation risk), fabric-texture simulation.

## 8. Technical architecture

```
src/studio/
  catalog.ts        prototype data: products, zones (inches), colours, placements, limits
  state.ts          pure design state: placement math, constraints, DPI, validation
  messages.ts       summary rows, structured WhatsApp text, JSON design spec
  imageFile.ts      safe local-only intake: type/size/dimension checks, alpha detection
  teeArt.ts         original SVG garment (single source for stage AND export)
  exporter.ts       canvas compositing, mockup PNG, downloads, Web Share
  referenceSheet.ts labelled production order-sheet PNG (2200×1560)
src/components/studio/TeeStage.tsx   pointer-gesture editor (drag/pinch/rotate/handles/keyboard)
src/pages/StudioExperiment.tsx       6-step flow + confirmation
src/studio.css                       scoped styles on existing tokens
```

Business logic is framework-free and unit-tested; React components stay presentational.

## 9. Library decision (canvas vs SVG vs libraries)

| Option | Verdict |
|---|---|
| **Fabric.js** | Rejected — full editor object model (multi-object scenes, SVG parsing) we don't need; largest bundle; would double the site's JS for one draggable image. |
| **Konva** | Rejected — excellent touch/canvas layer, but still a large dependency for a single-object stage; the site's philosophy is dependency-free where practical. |
| **Native (chosen)** | Pointer Events unify mouse/touch (incl. 2-pointer pinch/rotate); CSS transforms give 60fps manipulation; SVG garment tints per colour and serialises into Canvas 2D for pixel-perfect exports; zero new runtime dependencies; ~15 KB gzip added total. |

## 10. Data model

`DesignState = { productId, view, color{name,hex,status}, artworks{front?,back?}, details, reference }`
Artwork stores **normalised centre (cx,cy in the print zone)**, **printed width in inches**,
rotation degrees, natural pixel size and alpha flag — everything production needs to reproduce
placement. The JSON brief includes a `status: "draft"` field with documented future statuses
(submitted → awaiting-review → quoted → approved → in-production → completed/cancelled).

## 11. Colour-availability model

- `standard` — prototype list of 9 common shirt colours (**placeholder — founder must confirm**).
- `confirm` — any custom-picked colour. The UI, WhatsApp message, JSON spec and reference sheet all
  carry: *"This colour requires availability confirmation… confirm fabric options, minimum
  quantity, pricing, and production time."* Status is text + badge, never colour alone.

## 12. Artwork-upload safety

PNG/JPEG only; 10 MB cap; decode verification (corrupt files rejected); dimension bounds
(50–12,000 px) against decompression bombs; filename sanitisation; transparency preserved and
detected via canvas sampling. **SVG excluded** — safe sanitisation (scripts, `foreignObject`,
external refs) is out of prototype scope; documented so production can add a sanitiser later.

## 13. Mobile experience

Step-based flow; editor canvas is full-width with `touch-action: none` gestures (1-finger drag,
2-finger pinch scale + rotate); 30 px+ handles; controls stack below the stage; steppers ≥34 px,
buttons ≥40 px; no horizontal overflow (grids collapse at 860/640/560 px).

## 14. Accessibility

Artwork is focusable with an instruction label: **arrows move (Shift = faster), + / − resize,
[ ] rotate**; sliders mirror size/rotation numerically; radio groups in real `fieldset/legend`;
statuses use text + `role="status"`; errors use `role="alert"` with exact remediation wording;
visible focus rings throughout; `prefers-reduced-motion` respected.

## 15. Privacy

Artwork never leaves the browser: FileReader → in-memory data URL; no uploads, no analytics, no
logging of file contents; state clears on refresh/new-design; exports are user-initiated local
downloads. Users must own or have permission to use uploaded artwork (to be stated in production
terms). WhatsApp URL carries **text only** — never image data.

## 16. Test plan & results

- **Unit (vitest, 24 passing):** catalogue integrity; placement/constraint/corner math; out-of-zone
  incl. rotation; DPI thresholds; quantity parsing & minimum flag; size-total and mismatch messages
  (exact wording incl. remainder); custom-size downgrade-to-note; submission validation;
  sizes line/summary/WhatsApp message content (empty-field omission, no base64); spec
  prototype-flag and opt-in artwork embedding; upload prechecks; dimension bounds; reference format.
- **Browser (driven end-to-end on the dev server):** step navigation; black-swatch tint
  (`#211f1e` fill verified); custom-colour confirmation notice; PNG upload via DataTransfer;
  artwork render; ~49 DPI → "low" warning; pointer drag moved exactly (40, 30) px; left-chest
  preset → 3.5″ @ ~128 DPI; max-size → out-of-zone warning, reset clears; review rows + preview;
  guided form; size mismatch error and fix; reference sheet generated (PNG data URL); package list;
  confirmation screen; `wa.me/2349099436487` link; 4 download actions.
- **Build:** `tsc` strict + Vite — clean. Site bundle 83.8 KB gzip (+15 KB for the studio).
- **Known limitation:** the shared browser pane was taken over by the user mid-session, so the final
  scripted mobile-width screenshot pass wasn't captured; mobile behaviour is covered by the
  responsive CSS breakpoints and the touch-gesture implementation, and should be re-checked by the
  founder on a phone (instructions below).

## 17. Production requirements (gap analysis)

**Required before launch:** founder-confirmed colours/garments/placements; secure artwork upload +
storage (signed URLs, retention policy); backend enquiry record with reference; privacy policy +
artwork-ownership terms; consent checkbox; rate limiting + server-side file scanning; WhatsApp
Business handoff decision; remove prototype banner/test mode.
**Recommended:** staff review screen; email notification; design versioning; error monitoring;
analytics (privacy-safe); moderation for uploaded imagery.
**Can follow:** saved designs/accounts; more garments (polos, caps, jerseys); sleeve prints;
status tracking for customers.
**Optional future:** payments/deposits; instant pricing rules; DTF/embroidery visual simulation.

## 18. Open questions → see founder checklist below.

## 19. Risks

1. **Expectation gap** — customers may read the mockup as exact; mitigated by persistent
   disclaimers, but production must always confirm before printing.
2. **Colour accuracy** — screen hex ≠ fabric dye; the rare-colour flow mitigates, terms must state it.
3. **Artwork rights** — no infringement check is possible client-side; needs terms + human review.
4. **File handoff friction** — WhatsApp URLs can't attach files; production should add secure
   upload + enquiry link (§17) rather than relying on manual attachment.

## 20. Recommendation

Strategically strong for The Factory (differentiates from every Lagos competitor still quoting via
chat), prototype is founder-testable today, and the smallest launchable version is: **one tee,
standard colours + confirm-flow, front/back, upload+place, guided enquiry, backend package upload,
WhatsApp summary link.**

## 21. Screenshots

Captured during the QA run (design step with black tee + colour step verified visually in the
browser pane). Regenerate anytime via the local instructions below.

## 22. Local testing instructions

```bash
cd /Users/ayooluwakarim/bgxlsc-worktrees/custom-tee-studio/the-factory-nigeria
npm install
npm test          # 24 unit tests
npm run dev       # then open:
# http://127.0.0.1:5173/#/experiments/custom-tee-studio
```
Test on a phone via your LAN IP (`npm run dev -- --host`), or run `npm run build && npm run preview`.

---

## Founder review checklist

- [ ] Confirm the **standard colour list** (currently 9 prototype colours)
- [ ] Confirm the **special/rare colour policy** (min quantity, sourcing surcharge wording)
- [ ] Confirm **minimum order** applies to studio orders (currently 30 pieces)
- [ ] Confirm available **T-shirt types** for launch (standard / oversized / polo?)
- [ ] Confirm **printing methods** to offer in the picker (screen / DTG / heat transfer / embroidery)
- [ ] Confirm **embroidery** availability for studio artwork
- [ ] Confirm **size range** (XS–XXL? 3XL? kids?)
- [ ] Typical **production lead times** to display (currently none shown)
- [ ] **Artwork requirements** to publish (formats, min resolution, ownership statement)
- [ ] **Pricing method** (per-quote only, or banded estimates later?)
- [ ] Confirm the **WhatsApp number** for studio enquiries (+234 909 943 6487)
- [ ] Who receives enquiries internally, and where should packages be stored?
- [ ] Approve **storage/privacy policy** for uploaded artwork
- [ ] Decide whether **online payment** is ever added after quoting
