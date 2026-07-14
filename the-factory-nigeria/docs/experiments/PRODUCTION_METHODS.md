# Studio — production methods, placement freedom, and what The Factory still needs to confirm

_Written 2026-07-14, from the manager's feedback. This is the reference for **why** Studio says what it
says about how a garment is made. If any of it is wrong, fix it here first — the app reads from
`src/studio/catalog.ts`, and the tests in `src/studio/__tests__/studio.test.ts` lock the behaviour._

---

## 1. What the manager told us (the source of truth)

1. **Design placement is free.** Guides are alignment aids. They must never restrict where a design goes.
2. **Jerseys are sublimated** — not "a print on a jersey".
3. **T-shirts come in two genuinely different forms** and the customer must consciously choose:
   - **Custom-made** — sewn specifically for the customer, usually with The Factory's **towel-back fabric** option.
   - **Ready-made 100% cotton** — bought finished, then printed.

Everything below follows from those three statements.

---

## 2. What was researched

**Sublimation (dye-sublimation).** The dye turns to gas and bonds with polyester fibres, becoming part of
the fabric rather than a layer sitting on top of it. Consequences that matter to a customer:

- It needs a **polyester-based fabric** (commonly cited as ~65% polyester minimum). It does not work on cotton.
- Because there is no ink layer on the surface, the design can run **edge to edge and across seams** — panels
  are printed *before* the garment is sewn. This is what makes a full-surface jersey possible at all.
- The fabric keeps its breathability, and the print does not crack or peel.

**Printing onto a ready-made garment (screen print / DTG).** Ink is applied to the surface of a finished
garment. It suits cotton, and it is constrained by what a press can physically reach — which is why seams,
plackets, pockets and collars are awkward, and why "print areas" exist for this method at all.

**Cut-and-sew / custom-made.** The garment is made from fabric for the customer, so fit, fabric and
construction are all on the table, not just the artwork.

Sources: [Goal Sports Wear — DTG vs sublimation](https://www.goaluniform.com/sublimation-printing-vs-dtg/),
[Printful — sublimation vs screen printing](https://www.printful.com/blog/sublimation-vs-screen-printing),
[Printful — types of shirt printing](https://www.printful.com/blog/types-of-shirt-printing),
[Custom Ink — screen vs digital vs sublimation](https://www.customink.com/blog/screen-printing-vs-digital-printing-vs-sublimation-a-buyers-guide/).

**"Towel-back fabric".** The manager's term. Externally the closest match is **loopback / French terry**:
a knit with a smooth face and loops on the reverse — the loops serve the same purpose as the loops on a
towel, which is almost certainly where the name comes from
([SANVT](https://sanvt.com/blogs/journal/french-terry-loopback-cotton-the-perfect-sweatshirt-fabric),
[TREASURIE](https://blog.treasurie.com/what-is-french-terry/)).

> **We did not rename it.** The app says "towel-back fabric option" everywhere, verbatim, because that is
> the team's own word for the thing they actually buy and sew. The equivalence above is a hypothesis for
> the team to confirm — not a substitution to make on their behalf. See §5.

---

## 3. What changed in the app

**Placement is genuinely free.**
- `clampLayer()` in `src/studio/state.ts` is now the *only* positional constraint: it keeps a layer on the
  stage and keeps size/rotation finite. It does not pull a design toward a guide, shrink it to fit, or
  reject an unusual placement.
- The red "outside the print area" error state and its "Fit to area" remedy are **gone**. They implied the
  design was invalid. `isLayerOutOfArea()` still exists, but only as information — nothing acts on it.
- Image size now ranges up to 3× the stage width (full-bleed), and the size slider spans the whole garment
  rather than 1.4× a guide.
- Snapping is a toggle, and holding **Alt** bypasses it.
- "Print areas" is now **"Guides"**; presets are **"Jump to a spot (optional)"**; "Fit to area" is
  **"Fit to guide"**, offered as a convenience the customer chooses, never applied automatically.
- The editor, the design brief and the production reference all carry the manager's wording:
  _"Guides are provided to help with alignment. You can place your design anywhere on the visible garment.
  The Factory Nigeria will review the final placement and confirm how it can be produced."_

**Production method is a first-class property.** `Product.production` drives a `PRODUCTION_METHODS` record.
The method appears on the product card, in the editor, in the live summary, on the review screen, on the
production reference PNG, in the WhatsApp enquiry, and in the design brief JSON.

| Garment | Production method |
|---|---|
| Custom-made T-shirt | Custom-made (cut and sewn for you) — towel-back fabric option |
| Ready-made T-shirt (100% cotton) | Print on a ready-made garment |
| Oversized tee, polo, hoodie | Print on a ready-made garment |
| Sports jersey, basketball jersey | **Sublimation** |
| Snapback / baseball / trucker cap | Print or embroidery on a ready-made cap |

**Jerseys are designed the way they are actually made.** A new `src/studio/patterns.ts` generates the
**whole printed surface** as an SVG from a base + secondary + accent colour: solid, vertical stripes, hoops,
sash, halves, chevron, gradient fade, geometric blocks. It is dropped in as an ordinary (movable, deletable)
background layer under everything else, and the exact recipe is written into the brief and the reference so
the team can rebuild the panel precisely. Any uploaded artwork can also be scaled to **cover the whole
garment**. Generated surfaces are vector, so the app never reports a pixel DPI for them.

**Text is a first-class design element.** "Add text" is a large primary action sitting beside "Add image".
Fonts are grouped into the eight categories the manager named (Athletic, Jersey, Varsity, Bold, Condensed,
Modern, Script, General). Text is now a **block**: multi-line, with line spacing and left/centre/right
alignment, rendering identically in the editor (CSS) and in the canvas exports.

**Nothing silently destroys work.** Switching garment — including switching between the two T-shirt options
— changes only `productId`. Every layer is kept.

---

## 4. Deliberately NOT done

- **No secondary/accent colour on the garment body itself.** The garment render is a single photographed
  silhouette with one colour mask; there is no per-panel geometry to tint. Faking it would put a picture in
  front of the customer that the factory cannot reproduce. Multi-colour jerseys are therefore expressed the
  way sublimation actually expresses them — as one printed **full surface**.
- **No true left/right side camera views.** A separate side camera clashes with the flat-lay front/back
  photography that the colour compositing depends on. Sleeves, shoulders and side panels are reachable as
  placement areas instead.

---

## 5. What The Factory still needs to confirm

These are assumptions the app makes. Each one is written in the app as "to confirm", but the team should
settle them:

1. **"Towel-back fabric" — what is it exactly?** Is it loopback / French terry as §2 suggests? What weight,
   and what colours can be sourced? The app currently shows it as "Availability to confirm".
2. **Which garments can actually be sublimated?** The app claims sublimation for both jerseys. If The
   Factory sublimates anything else (or does *not* sublimate the basketball tank), correct the `production`
   field on that product.
3. **Is the ready-made tee genuinely 100% cotton**, and is it printed by screen printing, DTG, or transfer?
   The app deliberately does not name a printing technique it was not told.
4. **Minimums per method.** Sublimation and cut-and-sew usually carry different minimums from printing onto
   a ready-made shirt. Studio currently accepts requests from **1 item** for everything.
5. **Are the print-size guides right?** Every zone in `catalog.ts` was measured off the render, not off a
   real garment.
6. **The difficult areas** (collar, placket, kangaroo pocket, cap brim) are our estimate of what needs
   special handling. The team should confirm the list.

Until these are answered, every one of them is presented to the customer as something the team confirms —
never as a promise.
