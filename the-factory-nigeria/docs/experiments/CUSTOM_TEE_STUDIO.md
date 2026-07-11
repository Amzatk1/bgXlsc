# Custom Tee Studio — experimental prototype

---

# v3 — Garment & fabric library + availability honesty + editor re-layout

## Garment library (Task A)

**Generated with Higgsfield MCP** (`marketing_studio_image`, 16:9, 2k), same
front+back-in-one-frame method as v2. **Credit constraint shaped this session:**
the account held 6 credits on the free plan and each generation costs 2 credits
(the per-batch cost preflight was misleading — `count:2` bills per image), so
the plan (polo, hoodie, long-sleeve, sweatshirt) was cut to the two most
valuable garments. Long-sleeve tee and crewneck sweatshirt are **deferred, not
rejected** — the pipeline below makes adding them a ~1-hour job once credits
exist. The billing "auto-refill" recovery flow suggested by the MCP was **not**
invoked (no-payments rail).

- **Polo shirt** — 2 candidates. Candidate B kept (calmer drape, cleaner chest
  print area, crisper placket, better front/back match). Candidate A rejected:
  busier hem/chest folds that would fight artwork.
- **Pullover hoodie** — 1 candidate (credits exhausted the second). Kept after
  one retouch: a tiny woven neck label inside the hood (unreadable marks, ~40px)
  violated the no-labels rule — removed by cloning the adjacent plain lining
  over it (feathered patch), standard product-photo cleanup.
- QA against the v2 rejection list on both: collars/sleeves/seams/hem symmetric,
  no text/logos/body parts, no perspective distortion, matched pairs. Pass.

**Keying pipeline (evolved from v2):** split frame → 4-corner flood-fill key.
Fuzz 9% left halo bands from the renders' soft contact shadows; final recipe is
**fuzz 20% + alpha erode 2px + blur 0.6 + level 12/88%**, plus targeted
threshold-in-rectangle kills for shadow islands the corner fill can't reach
(enclosed sleeve/body pockets, under-hem strips — hoodie back needed most).
Normalised to the same 1200×1400 frame as the tees (garment fit to 1200×1240,
centred), exported WebP: polo 65+51 KB, hoodie 59+65 KB, plus 4 product thumbs
(~6 KB each).

**Per-garment fabric luma measured** (alpha-weighted mean): polo **0.507**,
hoodie **0.506** (tees 0.505). `FABRIC_LUMA` is now a per-product map in
`garment.ts`; `layerTuning(colorHex, productId)` normalises each photo by its
own measurement.

**Print zones measured** from the processed assets (stage units = asset px ÷ 2):

| Garment | Front | Back |
|---|---|---|
| Polo | 170,295 260×275 → 10″ × 10.5″ (below the 3-button placket, y placket-bottom ≈ 560 asset px) | 170,130 260×415 → 10″ × 16″ |
| Hoodie | 160,280 280×170 → 12″ × 7″ (band **above the kangaroo pocket**; pocket top seam measured at asset y≈922, x 440–760) | 160,300 280×280 → 12″ × 12″ (below the resting hood) |

**Colour masking verified on every kept garment** (in-app editor + full-res
ImageMagick composites): White, Black, Factory Purple #a425a4, and a mid colour
(polo: royal blue; hoodie: navy). Black keeps visible folds via the screen pass;
purple renders clean on both.

## Fabric & textile selection (Task B)

8 fabrics in `catalog.ts` (`FABRICS`): lightweight/midweight/heavyweight cotton,
cotton-poly blend, performance polyester, piqué, french terry, fleece — each
with plain-language description, typical use, weight chip (Light/Mid/Heavy),
availability status and a close-up tile.

**Close-up visuals under the zero-credit constraint:** tiles are macro crops of
THIS project's own Higgsfield garment photography (tee assets → cotton family,
polo → piqué + performance knit, hoodie → fleece family), cropped strictly
inside the measured print zones (guaranteed plain fabric). Where the reference
is a *family* stand-in rather than the exact weave (cotton-poly, performance
polyester, french terry), the card carries an explicit `refNote` (e.g. "french
terry has visible loops inside"). Every fabric surface shows the
`FABRIC_VISUAL_NOTICE` ("approximate references… confirmed using available
market samples"). Fresh dedicated texture generations are the first follow-up
once credits exist.

- Combined step 2 = **"Colour & fabric"** (flow stays 6 steps).
- "No preference — team advises" is the default and an explicit card.
- **"Help me choose"** disclosure: lightweight vs heavyweight, cotton vs
  polyester, smooth vs textured — no textile jargon.
- Fabric flows into `OrderDetails.fabricId` → review row, WhatsApp message,
  JSON brief (id/name/weight/availability), reference sheet fact. The free-text
  "fabric preference" field was **removed** (notes remain the escape hatch; the
  order-details step shows the chosen fabric read-only).
- Fabric choice never changes the garment render, and the UI says so on the
  step and in the editor rail.

## Availability honesty (the non-negotiable theme)

- Exactly four statuses exist (`AVAILABILITY_LABEL`): **Commonly available ·
  Availability to confirm · Special sourcing required · Custom request**.
  Always text labels (badge = text + border tone, never colour alone).
- Every garment card, fabric card, colour (via `colorAvailability`), editor
  live-summary row, review row, WhatsApp line, JSON brief field and reference
  sheet fact carries a status.
- `MARKET_SOURCING_NOTICE` (sourced-in-market / closest-alternative / team
  confirms before any order) appears on: homepage promo, product step, fabric
  step, editor live summary, review screen, WhatsApp message (first person:
  "I understand…"), design brief (`availabilityNotice`), reference sheet footer
  (two wrapped lines added to the disclaimers).
- No stock claims, no prices, no turnaround promises anywhere.

## Editor re-layout (Task C — Mobbin-informed)

Research (Mobbin MCP): Nike By You web customiser, Depop photo-editor bottom
sheet, Instacart preference sheet, UNIQLO swatch sheet, GOAT bottom bar.

**Adopted:** dominant stage with compact controls (Nike By You); selected-name
labels next to swatches (Nike/UNIQLO); mobile bottom sheet = one task at a time
with segmented tabs + big touch targets (Depop); option cards with image +
description (Instacart); persistent sticky primary action (GOAT; already ours).
**Rejected:** full-screen takeover editing (breaks the 6-step wizard + shared
banner); Nike's part-stepper ("Swoosh 4/13" — we have no part sequence);
physics/draggable sheets (JS weight + conflicts with stage pinch gestures — a
fixed docked tab bar is deliberate); dark sheet theme (clashes with Factory OS
paper/ink tokens).

- **Desktop ≥1100px** — three-zone grid (280 / flex / 320): left rail = garment
  mini-switcher (thumbs), colour dots, fabric mini-list, upload/replace/remove +
  undo/redo; centre = stage with front/back tabs and workspace tools; right
  rail = placement presets, width/DPI + rotation sliders, quality & contrast
  warnings, **live request summary** with availability badges + notice.
  `.studio__body:has(.ed)` widens the container to 1360px.
- **Tablet 861–1099px** — large stage left, right column with a **sticky
  segmented tab bar** (Artwork / Position / Garment & colour) showing one
  control group at a time.
- **Mobile ≤860px** — stage on top, docked bottom-sheet-style tab bar above the
  sticky step nav, one task per tab, 42px+ targets. The desktop layout is never
  squeezed onto phones.
- Garment switching mid-design re-clamps artwork to the new product's zones
  (`setProductId`); colour/fabric selections persist across garment switches.
- **All v2 behaviour preserved**: pointer drag/pinch/rotate, rAF batching,
  keyboard alternatives (arrows/+−/[ ]), undo/redo (buttons + Ctrl/Cmd+Z/⇧Z),
  zoom, print-area + fabric-preview toggles, DPI/out-of-zone/low-contrast
  warnings, fit-to-zone remedy, front/back preservation.

**Bug found & fixed during viewport QA:** the site-wide mobile
`StickyQuoteBar` ("Min. 30 pcs · Start an order") sat on top of the studio's
sticky Continue at ≤720px — hiding the primary action AND contradicting the
studio's 1-shirt minimum. It is now suppressed on the studio route only
(`App.tsx`); every other page keeps it.

## Verification (Task D)

- **Unit tests: 35 passing** (27 v2 + 8 new: product-card copy + four-status
  vocabulary, polo/hoodie zone geometry incl. above-pocket band and stage
  bounds, fabric catalogue integrity, fabric line/summary/brief content,
  team-advises default, honesty-notice wording, per-garment luma tuning +
  fallback, GARMENT_IMG coverage).
- **Build:** tsc strict + vite clean — **89.93 KB gzip JS** (v2: 84.9;
  +5.0 KB for fabric picker, product cards, re-layout). CSS 12.03 KB gzip.
  New assets: 4 garment views (~240 KB), 4 thumbs + 8 fabric tiles (~50 KB),
  lazy-loaded on the studio route.
- **End-to-end (desktop 1440):** polo → black → piqué → front crest PNG upload
  (drag-drop) → left-chest preset (3.5″ @ 257 DPI) → out-of-zone + fit remedy →
  keyboard nudge + Ctrl+Z undo → back view + second artwork → review rows
  (product/colour/fabric each with availability) → 1-shirt order, size M=1
  ("All 1 shirt has been assigned.") → DTG, date, contact → send step: WhatsApp
  message with fabric + first-person availability acknowledgement, reference
  sheet regenerated with fabric row + two-line footer → package created →
  reference sheet + design brief downloaded → wa.me link verified (not sent).
  **Zero console errors across the whole session.**
- **Viewports (no horizontal overflow, steps 1–3 probed):** 320×568, 360×800,
  375×667, 390×844, 412×915, 430×932, 640×360 (=200% zoom of 1280), 768×1024,
  812×375 (landscape), 820×1180, 1024×768, 1280×720, 1366×768, 1440×900,
  1920×1080 (3-zone capped at 1360px). Reduced-motion CSS rules verified
  present. Grid columns measured per breakpoint (mobile stack / 566+340 tablet
  / 280+flex+320 desktop).
- Mobile tab switching, editor artwork flows and homepage promo (updated
  points + market notice) verified in-browser.

## v3 limitations / follow-ups

- Long-sleeve tee + crewneck sweatshirt deferred (credits) — pipeline ready.
- Dedicated fabric-texture generations to replace the family-crop stand-ins
  (cards already disclose this per-tile).
- Firefox rendering still assumed from spec (Chromium-verified only).
- Keyboard flow: artwork controls + native inputs re-verified; a full
  tab-order-only walkthrough of all 6 steps remains a manual QA item.
- The four-status vocabulary includes "Custom request", currently unused by
  catalogue data (custom colours map to "Availability to confirm") — reserved
  for future custom-garment requests.

---

# v2 — Visual & interaction refinement pass

**Before → after:** v1 rendered a hand-drawn flat SVG tee (clean but obviously illustrated).
v2 renders a **real photographed garment** with natural folds, ribbed collar and fabric drape,
tinted deterministically per colour. The editor gained a workspace toolbar (zoom, print-area
toggle, fabric/clean preview), drag-and-drop upload with a guided empty state, undo/redo,
rAF-batched gestures, and a one-click "Fit to print area" remedy.

## Garment-asset pipeline (Higgsfield)

- **Generated with Higgsfield MCP**, model `marketing_studio_image`, 16:9, two candidates.
  Prompt (retained): *"Professional e-commerce catalog photography: a plain medium-grey
  heavyweight cotton crew-neck t-shirt shown in TWO views side by side on one pure white
  seamless studio background. LEFT: the front… RIGHT: the back of the exact same t-shirt,
  identical size, identical framing, identical soft even studio lighting. Natural subtle fabric
  folds, realistic ribbed crew collar… No model, no text, no logos, no props…"*
  Generating front+back **in one frame** guarantees a matched pair (same session/lighting).
- **Selection:** candidate A (crisper folds) → standard tee; candidate B (boxier drape) →
  oversized tee. Both reviewed against the rejection checklist (collars, sleeves, seams,
  no text/logos/limbs) — no rejects needed. Jobs `72b3b0d0…` and `a7ca405e…`.
- **Post-processing (ImageMagick, local):** crop halves → corner flood-fill background removal
  (fuzz 9%, preserves interior highlights) → trim → normalise to a 1200×1400 frame →
  **alpha WebP ~50 KB per view** (4 assets, ~200 KB total, lazy-loaded on the studio route only).
  Grey fabric measured at mean luma **0.505** → bakes the multiply-normalisation constant.
- **OpenAI image generation:** not used — no authorised OpenAI image tool was configured in
  this environment; Higgsfield output met the bar. No runtime AI calls exist anywhere.
- **Permitted use:** generated on the operator's Higgsfield account for this prototype;
  treat as prototype material pending founder sign-off for production.

## Colour rendering (deterministic, per §8)

One photograph per view serves as silhouette mask + shading + highlights:
flat colour masked by the garment alpha → artwork (clipped to the garment in fabric mode) →
photo as **multiply** layer (folds; brightness-normalised by 1/0.505) → photo as **screen**
layer whose opacity scales with colour darkness (black 0.5 → white 0.08), so black keeps
visible folds and white keeps form. Identical geometry/lighting/print-zone across ALL colours;
the same math runs in CSS (editor) and Canvas 2D (exports). A "Fabric preview / clean" toggle
switches between subtle fabric integration and exact-colour artwork (clean mode is authoritative
for accuracy; exports keep the disclaimer footer).

## Editor & UX changes

Workspace toolbar (zoom ×1/×1.4/×1.8, print-area toggle, fabric toggle) · print-zone label with
real inches · out-of-zone warning now includes **Fit to print area** (centres + shrinks,
preserves rotation — unit-tested) · drag-and-drop upload + 4-step empty state · **undo/redo**
(buttons + Ctrl/Cmd+Z / Shift+Z, 40-step history) · gestures now write to a ref and paint via
`requestAnimationFrame`, committing to React only on release (no per-move re-renders) ·
review/confirm previews use the same photoreal layers.

## QA performed (scripted against the dev build)

Layers mount with correct per-product assets (front/back swap verified) · black tint fill +
custom-colour notice · upload → drag moved exactly (40, 28) px via the rAF path · pinch with two
pointers grew artwork +143 px · undo restored the pre-drag position, redo reapplied · clean/fabric
mode toggles class correctly · full journey to the send step regenerates the reference sheet with
the photoreal renderer (~900 KB PNG, 2200×1560) · fit-to-zone clears the warning · mobile 375px:
no horizontal overflow, all controls touch-sized · **no console errors** · desktop + mobile
screenshots captured during the run.

**Two real bugs found and fixed by this QA:** (1) history mutations lived inside `setState`
updaters — React StrictMode double-invokes those, corrupting undo; moved side effects out.
(2) `setPointerCapture` can throw for edge-case pointers; now guarded.

## Measurements

- Bundle: **84.9 KB gzip JS** (v1: 83.8 KB — +1.1 KB despite the new editor; the SVG garment
  module was removed and realism moved into images).
- Garment images: 4 × ~50 KB WebP, loaded only on the studio route, cached via a shared decoder.
- Tests: **27 passing** (24 v1 + colour-pipeline luma/tuning + fit-to-zone).
- Export: reference sheet regenerates in ~1–2 s on a laptop (measured in the scripted run).

## Known limitations (v2)

- Workspace pinch-zoom is button-based; two-finger workspace zoom is deliberately reserved for
  artwork manipulation. · Oversized tee uses its own photo pair but shares the flat-lay style;
  a true drop-shoulder shoot would be better. · Firefox `mask-image`/blend rendering assumed from
  spec support, not directly tested (Chromium-based verification only — stated honestly).
  · The browser-pane session was shared with the user, so extended multi-viewport passes beyond
  375/desktop were not re-captured for v2; v1 matrix + unchanged responsive CSS still apply.

---


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
