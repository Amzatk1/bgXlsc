# The Shirt Studio — v3 Session Prompt (Garment & Fabric Library + Editor Re-layout)

You are continuing work on **The Shirt Studio**, the experimental custom-apparel
designer for The Factory Nigeria. Execute this document fully. It is the agreed
scope for this session — the founder has already approved this plan.

---

## 0. Context — read this first, do not rediscover it

### WHERE TO WORK — do this before anything else

**ALL work happens inside The Factory folder (the studio worktree):**

```
/Users/ayooluwakarim/bgxlsc-worktrees/custom-tee-studio/the-factory-nigeria/
```

Every file read, edit, build, test, asset export and git command runs inside that
directory. Your session may open in a different working directory (e.g.
`~/sneaker-genius-store`) — that is NOT the project. Do not create or edit any
project file outside the worktree. Before your first edit, verify you are in the
right place:

```bash
cd /Users/ayooluwakarim/bgxlsc-worktrees/custom-tee-studio/the-factory-nigeria
git branch --show-current   # MUST print: feature/custom-tee-studio-prototype
git log --oneline -3        # newest should include 44b9d01 / 13f3afe
```

If the branch check prints anything else, STOP and report — do not edit.

There is also a second checkout of this repo at
`/Users/ayooluwakarim/brand-codebases/the-factory-nigeria/` — that is the
PRODUCTION checkout on `main` (live at thefactorynigeria.com). **Never edit,
build into, or commit from that folder in this session.**

### Project facts

- **Worktree:** `/Users/ayooluwakarim/bgxlsc-worktrees/custom-tee-studio/the-factory-nigeria/`
- **Branch:** `feature/custom-tee-studio-prototype` (NEVER merge to `main`, NEVER deploy)
- **Main branch:** `e22401f` — the live site at thefactorynigeria.com. Do not touch it.
- **Latest studio commits:** `893706c` (final polish), `e7cd986` (journey polish), `13f3afe` (homepage section 4 + availability wording)
- **Dev server:** launch config `tee-studio-dev` in `/Users/ayooluwakarim/sneaker-genius-store/.claude/launch.json` → port 5174. Studio route: `#/experiments/custom-tee-studio`.
- **Stack:** Vite 6 + React 18 + TypeScript, zero UI frameworks, hash router, vitest (27 tests passing).

### Key files (the whole studio)

| File | What it is |
|---|---|
| `src/studio/catalog.ts` | PRODUCTS (with measured print zones), STANDARD_COLORS, PLACEMENTS, UPLOAD_LIMITS, DPI_THRESHOLDS, `STUDIO_MIN_ORDER = 1`, `MIN_ORDER = 30` (general enquiries) |
| `src/studio/garment.ts` | Stage 600×700, `GARMENT_IMG` per product/view, `FABRIC_LUMA = 0.505`, `hexLuma`, `layerTuning`, `drawGarment` canvas compositor |
| `src/studio/state.ts` | Pure state: placement/clamp/fit, DPI quality, size breakdown + `sizeIssue` wording, `validateForSubmit` |
| `src/studio/imageFile.ts` | Local-only artwork intake (PNG/JPEG, 10MB, no SVG), `analyzeImage` → hasAlpha + avgLuma |
| `src/studio/messages.ts` | WhatsApp message + design-brief text |
| `src/studio/exporter.ts` / `referenceSheet.ts` | Mockup PNG + 2200×1560 production reference sheet — always BOTH sides, "NO DESIGN ADDED" labels |
| `src/components/studio/TeeStage.tsx` | Photoreal editor stage: pointer gestures (drag/pinch/rotate), rAF-batched, keyboard alternatives, zoom, print-area toggle |
| `src/pages/StudioExperiment.tsx` | The 6-step flow (Product → Colour → Design → Review → Order details → Send) |
| `src/components/StudioPromo.tsx` | Homepage flagship section (position 4 on desktop AND mobile) |
| `src/studio.css` | All studio styles |
| `src/studio/__tests__/studio.test.ts` | 27 unit tests |
| `docs/experiments/CUSTOM_TEE_STUDIO.md` | Full experiment report incl. the v2 Higgsfield pipeline that produced the current tee assets |

### The proven garment-asset pipeline (from v2 — reuse it)

1. Higgsfield MCP `marketing_studio_image`: generate **front AND back in ONE frame**
   (side by side) so lighting/geometry match. Grey garment (#8c8c8c-ish) on pure
   white background, straight-on, no model, no logos/text/props.
2. ImageMagick: split the frame, corner flood-fill to remove the white background
   (keeps interior highlights), trim, resize to stage proportions, export WebP
   (~50KB each) to `public/assets/the-factory-nigeria/studio/`.
3. Measure the garment's average fabric luma (ImageMagick `-format "%[fx:mean]"`
   over the garment pixels) — per-garment `FABRIC_LUMA` for multiply normalisation.
4. Measure the print zone (x, y, w, h in stage pixels + real inches) and add the
   product to `catalog.ts` with its `GARMENT_IMG` entries in `garment.ts`.
5. Reject any render with: distorted collar, unequal sleeves, impossible seams,
   warped hem, text/logos, body parts, strong perspective, front/back mismatch,
   plastic-looking fabric. Regenerate instead of settling.

---

## 1. THE NON-NEGOTIABLE THEME: fabric availability honesty

This is the founder's most emphasised requirement. **Fabric may not be available
sometimes, and customers must bear this in mind.** Every garment, fabric, textile
and colour surface in the Studio must carry this framing:

> Garment, fabric, textile and colour availability depends on what can be sourced
> in the market at the time of your request. If the selected option is available,
> The Factory Nigeria can produce it. If it is not, the team will suggest the
> closest available alternative. Availability, minimum quantity, pricing and
> production time are always confirmed before any order is accepted.

Rules:
- Every fabric and garment option displays an availability status. Use exactly
  these four: **Commonly available** · **Availability to confirm** ·
  **Special sourcing required** · **Custom request**.
- Never use the word "available" as a guarantee. Never show live-stock language.
- Statuses must not be communicated by colour alone (text label always present).
- The review screen, WhatsApp message, design brief and reference sheet must all
  restate that fabric/colour availability is confirmed by the team.
- Fabric close-up visuals carry the notice: *"Fabric visuals are approximate
  references. The exact material, weight, texture and colour will be confirmed
  using available market samples before production."*
- AI-generated textures must never be implied to be the exact final fabric.

---

## 2. Task A — Higgsfield garment library (the biggest job, do it first)

Use Higgsfield MCP (development-time only — NEVER a runtime dependency, and
NEVER send customer artwork to it) to expand from 2 tees to a commercially
sensible set. Generate, QA against the rejection list, and integrate:

1. **Polo shirt** (piqué collar visible) — the factory genuinely makes these
2. **Hoodie** (front pocket, hood down) — print zone above pocket
3. **Long-sleeve tee**
4. **Sweatshirt (crewneck)**
5. Optional if quality holds: **sports jersey**, **fitted tee**

Do NOT add every garment automatically — only keep renders that pass QA. Two or
three excellent additions beat six mediocre ones. For each kept garment:
front+back single-frame generation → keying → per-garment fabric luma → zone
measurement → `catalog.ts` + `garment.ts` entries → verify colour masking looks
right across White, Black, Factory Purple (#a425a4) and a mid colour.

Each product card gets: realistic thumbnail (the actual asset), name, fit, short
plain-language description, typical use, **material reference** (e.g. "Midweight
cotton jersey"), and **availability status** (polos/hoodies likely "Availability
to confirm").

## 3. Task B — Fabric & textile selection

Add a fabric/textile choice to the flow (combine with the colour step if that is
simpler — recommended: "Colour & fabric" as one step so the flow stays 6 steps).

- Generate Higgsfield close-up texture references for: lightweight cotton,
  midweight cotton, heavyweight cotton, cotton-polyester blend, performance
  polyester, piqué, french terry, fleece. Small square WebPs (~20-30KB).
- Each fabric shows: name, close-up visual, one-sentence plain description,
  typical use, weight category, availability status (per §1).
- Add a **"Help me choose"** disclosure explaining lightweight vs heavyweight,
  cotton vs polyester, smooth vs textured — plain language, no textile jargon.
- Fabric choice flows into: state (`OrderDetails`), WhatsApp message, design
  brief, review screen, reference sheet. It REPLACES the current free-text
  "fabric preference" field (keep a notes escape hatch).
- Fabric selection must NOT change the garment render (be honest — the preview
  shows the garment shape/colour, not the exact weave). Say so in the UI.

## 4. Task C — Editor re-layout (Mobbin-informed)

Research first with Mobbin MCP (product configurators, mobile editors, bottom
sheets — Nike By You, Canva, Apple configurator patterns; document what you
adopt/reject), then:

- **Desktop (≥1100px):** three-zone workspace — left: garment/fabric/colour/
  upload controls; centre: large garment stage; right: placement, artwork
  quality checks, live request summary.
- **Tablet:** large stage, collapsible controls, sticky progress.
- **Mobile:** garment preview on top, bottom-sheet controls (one task at a
  time), sticky primary action (already exists — keep), large touch targets.
  Do NOT squeeze the desktop layout onto phones.
- Preserve ALL existing behaviour: gestures, keyboard alternatives, undo/redo,
  zoom, print-area toggle, warnings (DPI, out-of-zone, low contrast), front/back
  preservation. This is a re-arrangement, not a rewrite of working logic.

## 5. Task D — Full verification matrix

- Viewports: 320×568, 360×800, 375×667, 390×844, 412×915, 430×932, 768×1024,
  820×1180, 1024×768, 1280×720, 1366×768, 1440×900, 1920×1080; portrait +
  landscape spot-checks; 200% zoom; reduced motion.
- No horizontal overflow, no clipped controls, no hidden primary action, no
  console errors, keyboard path through the whole flow.
- Extend unit tests (fabric state, availability statuses in messages, new
  garment zones). Keep all 27 existing tests green.
- Full end-to-end run as a real customer: 1-shirt order, front+back design,
  fabric selected, package downloaded, WhatsApp preview checked.

## 6. Safety rails (unchanged, absolute)

- No merge to `main`. No deploy. Commit/push ONLY to `feature/custom-tee-studio-prototype`.
- No payments, no auto-sent messages, no customer artwork to Higgsfield or any
  third party, no API keys in the repo, no new backend/storage.
- No invented business facts: no prices, no turnaround promises, no stock claims.
- Do not break the live-site pages (Home/MobileHome are shared with main's design).

## 7. Definition of done — verify every line before reporting

- [ ] Working directory was the worktree for every change; production checkout untouched
- [ ] At least 2 new garments generated, QA'd against the rejection list, integrated with measured zones + per-garment fabric luma
- [ ] Colour masking verified on every kept garment (White, Black, #a425a4, one mid colour)
- [ ] Fabric selection step live with close-up references + "Help me choose"
- [ ] Availability status (one of the four labels) visible on EVERY garment and fabric option — text, never colour alone
- [ ] The market-sourcing notice appears on: homepage promo, garment step, fabric step, review screen, WhatsApp message, design brief, reference sheet
- [ ] Fabric visuals carry the "approximate references… confirmed using available market samples" notice
- [ ] Editor re-layout done for desktop/tablet/mobile; all existing gestures, warnings, undo/redo, keyboard paths still work
- [ ] Full customer end-to-end run completed (1 shirt, front+back, fabric chosen, package downloaded, WhatsApp preview checked)
- [ ] All viewports in Task D checked; no overflow/clipped controls/console errors
- [ ] All existing tests green + new tests for fabric state, availability labels in messages, new garment zones
- [ ] `npm run build` clean; bundle size reported
- [ ] `docs/experiments/CUSTOM_TEE_STUDIO.md` updated with a v3 section (assets kept/rejected, decisions)
- [ ] Committed + pushed to `feature/custom-tee-studio-prototype` ONLY; nothing merged, nothing deployed

## 8. Final report format

Report: garments generated vs kept vs rejected (with reasons); fabric visuals
generated; availability wording locations; Mobbin patterns adopted/rejected;
layout changes per device; tests (count + result); build size; viewports tested;
branch + commit + push status; explicit confirmation nothing was merged or
deployed; and a strict founder-readiness verdict with the biggest remaining risk.

End state: The Shirt Studio feels like a flagship Factory Nigeria service —
premium, smooth, honest about market sourcing — ready for founder sign-off.
