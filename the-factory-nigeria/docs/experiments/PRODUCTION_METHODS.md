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

## 5. The six open questions — researched, and what came back

Four of the six turned out to be facts about **this business** (what fabric they buy, what machines they
own, who supplies their blanks, what they charge a minimum for). No amount of research answers those, and
guessing them would put a promise in front of a customer that nobody at The Factory ever made. Those stay
open, and the app keeps saying "the team confirms this".

Two of them were answerable — and answering them found a real bug in each.

### ✅ Answered by research (encoded in the app)

**Q5 — Are the print-size guides right?** Partly. Cross-checking against published standard print areas
(full front/back up to ~12″ × 16″; centre chest 8–10″; left chest 3–4″; sleeve 2–4″) showed every
tee/polo/hoodie/jersey guide sits inside the normal range. **But the three cap fronts were internally
inconsistent by 26–41%**: the snapback guide was *drawn* 4.10″ tall while its own label said 3″. The boxes
were near-square; a real cap decoration area (~4.5″ × 2.5″) is much wider than it is tall. All three are
corrected, and a test now asserts that every guide's `heightIn` agrees with its pixel box ÷ the garment's
pixels-per-inch, so a guide can never again lie about its own size.

**Q6 — Are the difficult areas right?** They were incomplete. The manager's list was *seam / pocket / zip /
collar / placket / drawstring / hem*; the app only had collar, placket, pocket, hood and cap peak. Side
seams, hems and the hood drawstring are now included, positioned from the **measured alpha silhouette of
each garment asset** rather than guessed, and placed so an ordinary chest or sleeve logo never trips them.
Industry guidance is a **1″ minimum clearance from seams**.

More importantly, the warnings are now **method-aware**. A sublimated garment is printed as **flat panels
before it is sewn**, so a design crossing a side seam is completely normal — the seam does not exist yet.
Warning about it was a false alarm. Seam and hem warnings are therefore suppressed for sublimation and kept
for printing onto a finished garment, which is the case where a seam actually fights the press.

**Bonus — a correctness bug the sublimation research exposed.** Sublimation ink is a **translucent dye**: it
can only darken what it bonds with, so it **cannot print a light colour onto a dark blank**. Sublimated
garments start from a **white** blank and get *all* their colour from the print. Studio was happily letting
people build a **black jersey with a white pattern** — not producible. It now says so, and offers the fix
that matches how the garment is really made: *keep the blank white, and put your colour into a full-surface
design*. One click does it. Sublimation also needs **polyester** (65%+ is the usual guidance; 100% cotton
will not take the ink at all), so every fabric now carries whether it can take sublimation, and choosing a
cotton fabric for a jersey is flagged.

Sources: [Goal Sports Wear](https://www.goaluniform.com/sublimation-printing-vs-dtg/),
[Printful](https://www.printful.com/blog/sublimation-vs-screen-printing),
[SanMar U](https://www.education.sanmar.com/decorator-relations/understanding-polyester-fabrics-and-dye-sublimation-compatibility/),
[ScreenPrinting.com placement standards](https://www.screenprinting.com/blogs/news/a-guide-to-industry-standard-for-screen-print-placements-and-dimensions),
[UPrinting print-size guide](https://www.uprinting.com/blog/t-shirt-print-size-guide-how-big-should-your-design-be/).

### ❓ Still only The Factory can answer (Q1–Q4)

These live in [`src/studio/factoryFacts.ts`](../../src/studio/factoryFacts.ts) as `status: "open"`. While a
question is open the app states no answer. **When the manager replies, set `status: "answered"`, fill in
`answer`, and put any minimum into `METHOD_MINIMUM` — the product cards, the review screen, the reference
sheet and the WhatsApp enquiry all read from that one file.**

1. **What is towel-back fabric, exactly?** The research points hard at **loopback / French terry** — a knit
   with a smooth face and towel-like loops on the reverse, which is almost certainly where the name comes
   from. That is a *hypothesis*, not their answer. We did not rename their fabric. Ask: is it loopback? What
   weight, and which colours can you actually source?
2. **Which garments do you sublimate?** We assume both jerseys. One thing is settled regardless: a **100%
   cotton tee can never be sublimated** — that is chemistry, not policy.
3. **Is the ready-made tee genuinely 100% cotton, and how do you print it** — screen, DTG, or transfer?
   Studio deliberately names no technique it was not told; the customer states a preference and the team
   confirms.
4. **What is the minimum per method?** Studio accepts a request from **1 item** for everything and tells the
   customer the minimum is confirmed by the team. Made-to-order methods (sublimation, cut-and-sew) are
   flagged as *often* carrying a higher minimum — an expectation, never a number we invented.

A ready-to-send version of these four is in [`FACTORY_QUESTIONS.md`](./FACTORY_QUESTIONS.md).
