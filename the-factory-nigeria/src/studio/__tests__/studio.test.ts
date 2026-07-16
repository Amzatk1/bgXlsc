import { describe, expect, it } from "vitest";
import {
  areasForView,
  avoidAreasForView,
  DIFFICULT_AREA_NOTICE,
  fabricGroupsFor,
  FABRICS,
  fabricMethodIssue,
  FONT_CATEGORIES,
  FONTS,
  fontsByCategory,
  getProductionMethod,
  GUIDES_NOTICE,
  isSublimated,
  methodChoicesFor,
  PLACEMENTS,
  placementsFor,
  productGroups,
  PRODUCTION_METHODS,
  PRODUCTS,
  productPpi,
  STANDARD_COLORS,
  TOWEL_BACK_NOTE,
  UPLOAD_LIMITS,
} from "../catalog";
import { BLOCKING_QUESTIONS, FACTORY_QUESTIONS, minimumFor, OPEN_QUESTIONS } from "../factoryFacts";
import {
  applyPlacement,
  backgroundLayer,
  belowMinimum,
  blankTooDarkForSublimation,
  clampLayer,
  coverSize,
  difficultCrossings,
  emptySizes,
  estimatedDpi,
  fitLayerToArea,
  fullSurfaceOnNonSublimated,
  hasAnyDesign,
  homeArea,
  initialState,
  isLayerOutOfArea,
  layerBox,
  layerCorners,
  layerLabel,
  layersForView,
  layerWidthIn,
  makeReference,
  newImageLayer,
  newPatternLayer,
  newTextLayer,
  parseQuantity,
  qualityLevel,
  reconcileDetailsForProduct,
  restylePatternLayer,
  sizeIssue,
  sizeTotal,
  snapRotation,
  straightenLayer,
  textBlockScale,
  textLines,
  validateForSubmit,
  viewsWithDesign,
  viewSummary,
  visibleLayersForView,
  type ImageLayer,
  type TextLayer,
} from "../state";
import { DEFAULT_PATTERN, JERSEY_PATTERNS, patternSummary, renderPatternSvg } from "../patterns";
import { buildDesignSpec, buildStudioMessage, designSidesLine, fabricLine, layerLine, readinessChecklist, sizesLine, summaryRows } from "../messages";
import { artworkFileLabel, artworkFileName } from "../exporter";
import { checkDimensions, colorRichness, countQuantizedColors, MANY_COLORS_THRESHOLD, precheckFile, RICHNESS_THRESHOLD } from "../imageFile";
import { deserializeDesign, isWorthSaving, serializeDesign } from "../persist";
import { savedAgo } from "../deviceStore";

const tee = PRODUCTS[0];

function imgLayer(over: Partial<ImageLayer> = {}): ImageLayer {
  return clampLayer({
    id: "t1",
    kind: "image",
    view: "front",
    cx: 0.5,
    cy: 0.4,
    size: 0.3,
    rotation: 0,
    src: "data:image/png;base64,x",
    fileName: "logo.png",
    fileKB: 120,
    naturalW: 1600,
    naturalH: 1200,
    hasAlpha: true,
    ...over,
  }) as ImageLayer;
}

describe("catalogue (prototype data)", () => {
  it("every product has front and back print zones with real-world sizes", () => {
    for (const p of PRODUCTS) {
      // caps print small; tops print large
      const minW = p.family === "headwear" ? 3 : 6;
      const minH = p.family === "headwear" ? 2 : 6;
      for (const v of ["front", "back"] as const) {
        expect(p.zones[v].widthIn).toBeGreaterThanOrEqual(minW);
        expect(p.zones[v].heightIn).toBeGreaterThanOrEqual(minH);
      }
    }
  });
  it("short-sleeve garments expose left+right sleeve print areas on the front", () => {
    for (const id of ["tee-custom", "tee-readymade", "oversized-tee", "polo", "hoodie"]) {
      const p = PRODUCTS.find((x) => x.id === id)!;
      const ids = areasForView(p, "front").map((a) => a.id);
      expect(ids).toContain("torso");
      expect(ids).toContain("left-sleeve");
      expect(ids).toContain("right-sleeve");
    }
  });
  it("placements resolve to real areas for each garment/view", () => {
    for (const p of PRODUCTS) {
      for (const v of ["front", "back"] as const) {
        const areaIds = new Set(areasForView(p, v).map((a) => a.id));
        for (const pl of placementsFor(p, v)) expect(areaIds.has(pl.areaId)).toBe(true);
      }
    }
    expect(PLACEMENTS.some((p) => p.areaId === "left-sleeve")).toBe(true);
  });
  it("standard colours are named and marked standard", () => {
    expect(STANDARD_COLORS.length).toBeGreaterThanOrEqual(8);
    for (const c of STANDARD_COLORS) {
      expect(c.name.length).toBeGreaterThan(2);
      expect(c.hex).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
  it("offers production-ready fonts, each with a licence", () => {
    expect(FONTS.length).toBeGreaterThanOrEqual(5);
    for (const f of FONTS) {
      expect(f.stack).toContain(",");
      expect(f.license.length).toBeGreaterThan(3);
    }
    expect(FONTS.some((f) => f.id === "teko")).toBe(true); // jersey number font
  });
  it("includes the basketball jersey garment", () => {
    const bb = PRODUCTS.find((p) => p.id === "basketball");
    expect(bb).toBeTruthy();
    expect(bb!.zones.front.widthIn).toBeGreaterThan(6);
  });
  it("exposes more placement surfaces (shoulders, upper/lower, centre back)", () => {
    const ids = new Set(PLACEMENTS.map((p) => p.id));
    for (const id of ["upper-front", "lower-front", "left-shoulder", "right-shoulder", "centre-back", "lower-back"]) {
      expect(ids.has(id)).toBe(true);
    }
  });
});

describe("difficult-area warnings + hidden layers", () => {
  it("warns (non-blocking) when a layer crosses a difficult region", () => {
    const polo = PRODUCTS.find((p) => p.id === "polo")!;
    // a wide centre design over the button placket should be flagged
    const over = imgLayer({ view: "front", cx: 0.5, cy: 0.28, size: 0.4 });
    expect(difficultCrossings(over, polo).join(" ")).toMatch(/placket|collar/);
    // a small left-chest logo should be clear
    const clear = imgLayer({ view: "front", cx: 0.74, cy: 0.35, size: 0.12 });
    expect(difficultCrossings(clear, polo)).toEqual([]);
  });
  it("hidden layers stay in the list but leave the preview + counts", () => {
    const st = initialState();
    st.layers = [imgLayer({ id: "a" }), imgLayer({ id: "b", hidden: true, view: "front" })];
    expect(layersForView(st, "front").length).toBe(2);
    expect(visibleLayersForView(st, "front").length).toBe(1);
    st.layers = [imgLayer({ id: "b", hidden: true })];
    expect(hasAnyDesign(st)).toBe(false);
  });
});

describe("side panels, summaries + heavy layer stacks", () => {
  it("jerseys expose left/right side-panel print areas", () => {
    for (const id of ["jersey", "basketball"]) {
      const p = PRODUCTS.find((x) => x.id === id)!;
      const ids = areasForView(p, "front").map((a) => a.id);
      expect(ids).toContain("left-panel");
      expect(ids).toContain("right-panel");
    }
    expect(PLACEMENTS.some((p) => p.areaId === "left-panel")).toBe(true);
  });
  it("summarises what's on each surface", () => {
    const st = initialState();
    expect(viewSummary(st, "front")).toBe("No design");
    st.layers = [newTextLayer("name", tee, "front"), newTextLayer("number", tee, "front")];
    expect(viewSummary(st, "front")).toBe("Name, Number");
    st.layers = [imgLayer({ id: "1" }), imgLayer({ id: "2" }), imgLayer({ id: "3" }), imgLayer({ id: "4" })];
    expect(viewSummary(st, "front")).toBe("4 elements");
  });
  it("handles 10 image layers on one side without dropping any", () => {
    const st = initialState();
    st.layers = Array.from({ length: 10 }, (_, i) => imgLayer({ id: "img" + i, cx: 0.2 + i * 0.06 }));
    expect(visibleLayersForView(st, "front").length).toBe(10);
    expect(viewSummary(st, "front")).toBe("10 elements");
  });
  it("locked flag is carried on layers (canvas gestures gate on it in the editor)", () => {
    const l = imgLayer({ locked: true });
    expect(l.locked).toBe(true);
  });
});

describe("headwear (caps)", () => {
  const capIds = ["cap-snapback", "cap-baseball", "cap-trucker"];
  it("adds three distinct cap garments in the headwear family", () => {
    for (const id of capIds) {
      const p = PRODUCTS.find((x) => x.id === id)!;
      expect(p).toBeTruthy();
      expect(p.family).toBe("headwear");
      expect(p.zones.front.widthIn).toBeGreaterThan(3);
      expect(p.zones.front.widthIn).toBeLessThan(6); // caps print small
    }
    // still have the shirt/jersey range too
    expect(PRODUCTS.length).toBeGreaterThanOrEqual(9);
  });
  it("caps show cap-panel placements, not chest/back-shirt presets", () => {
    const cap = PRODUCTS.find((p) => p.id === "cap-snapback")!;
    const frontIds = placementsFor(cap, "front").map((p) => p.id);
    expect(frontIds).toContain("cap-front-centre");
    expect(frontIds).toContain("cap-front-left");
    expect(frontIds).not.toContain("left-chest");
    expect(frontIds).not.toContain("full-front");
    expect(placementsFor(cap, "back").map((p) => p.id)).toContain("cap-back");
  });
  it("shirts keep their chest/back presets (and never show cap presets)", () => {
    const front = placementsFor(tee, "front").map((p) => p.id);
    expect(front).toContain("left-chest");
    expect(front).not.toContain("cap-front-centre");
  });
  it("a logo dropped on a cap lands inside the front panel", () => {
    const cap = PRODUCTS.find((p) => p.id === "cap-baseball")!;
    const l = newImageLayer({ src: "x", fileName: "logo.png", fileKB: 5, naturalW: 600, naturalH: 400, hasAlpha: true }, cap, "front");
    expect(isLayerOutOfArea(l, cap)).toBe(false);
    expect(homeArea(l, cap).id).toBe("torso");
  });
});

describe("layer geometry (stage space)", () => {
  it("image layer box spans the requested fraction of the stage width", () => {
    const l = imgLayer({ size: 0.5 });
    expect(layerBox(l).w).toBeCloseTo(0.5 * 600, 3);
    expect(layerBox(l).h).toBeCloseTo(0.5 * 600 * (1200 / 1600), 3);
  });
  it("keeps a layer on the stage and normalises rotation — without capping it to a guide", () => {
    const a = clampLayer(imgLayer({ cx: -3, cy: 9, size: 5, rotation: 725 }));
    expect(a.cx).toBeGreaterThanOrEqual(0.02);
    expect(a.cy).toBeLessThanOrEqual(0.98);
    expect(a.rotation).toBeCloseTo(5, 5);
    // A design may exceed the guide (full-bleed / sublimation). The only size
    // limit is a sanity bound far beyond the garment — never a print box.
    expect(a.size).toBeGreaterThan(1);
    expect(a.size).toBeLessThanOrEqual(3);
  });
  it("unrotated corners span the box width", () => {
    const l = imgLayer({ size: 0.4, rotation: 0 });
    const xs = layerCorners(l).map((c) => c.x);
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(0.4 * 600, 2);
  });
  it("detects a layer leaving its nearest print area (rotation can cause it)", () => {
    const inside = newImageLayer({ src: "x", fileName: "a.png", fileKB: 1, naturalW: 800, naturalH: 800, hasAlpha: false }, tee, "front");
    expect(isLayerOutOfArea(inside, tee)).toBe(false);
    expect(isLayerOutOfArea({ ...inside, cx: 0.02 }, tee)).toBe(true);
    expect(isLayerOutOfArea({ ...inside, size: inside.size, rotation: 40, cy: 0.9 }, tee)).toBe(true);
  });
  it("fit-to-area centres and shrinks until inside", () => {
    const l = imgLayer({ cx: 0.05, cy: 0.95, size: 1.1, rotation: 30 });
    expect(isLayerOutOfArea(l, tee)).toBe(true);
    const fixed = fitLayerToArea(l, tee);
    expect(isLayerOutOfArea(fixed, tee)).toBe(false);
    expect(fixed.rotation).toBeCloseTo(30, 5); // rotation preserved
  });
});

describe("place anywhere: sleeves + placements", () => {
  it("a layer over a sleeve reports that sleeve as its home area", () => {
    const sleeve = areasForView(tee, "front").find((a) => a.id === "left-sleeve")!;
    const l = imgLayer({ cx: (sleeve.x + sleeve.w / 2) / 600, cy: (sleeve.y + sleeve.h / 2) / 700, size: 0.08 });
    expect(homeArea(l, tee).id).toBe("left-sleeve");
  });
  it("applying a sleeve placement moves the layer onto the sleeve", () => {
    const pl = placementsFor(tee, "front").find((p) => p.id === "left-sleeve")!;
    const placed = applyPlacement(imgLayer(), pl, tee);
    expect(homeArea(placed, tee).id).toBe("left-sleeve");
    expect(isLayerOutOfArea(placed, tee)).toBe(false);
  });
  it("snaps rotation to right angles only when close; straighten resets", () => {
    expect(snapRotation(2)).toBe(0);
    expect(snapRotation(88)).toBe(90);
    expect(snapRotation(45)).toBe(45);
    expect(straightenLayer(imgLayer({ rotation: 33 })).rotation).toBe(0);
  });
});

describe("layer factories", () => {
  it("new image layer lands inside the torso print area", () => {
    const l = newImageLayer({ src: "x", fileName: "logo.png", fileKB: 10, naturalW: 1200, naturalH: 900, hasAlpha: true }, tee, "front");
    expect(l.kind).toBe("image");
    expect(homeArea(l, tee).id).toBe("torso");
    expect(isLayerOutOfArea(l, tee)).toBe(false);
  });
  it("new text layers carry role defaults", () => {
    expect((newTextLayer("number", tee, "back") as TextLayer).text).toBe("10");
    expect((newTextLayer("number", tee, "back") as TextLayer).outline).not.toBe("");
    expect((newTextLayer("name", tee, "back") as TextLayer).role).toBe("name");
    expect(layerLabel(newTextLayer("name", tee, "back"))).toContain("Name");
  });
});

describe("print-quality estimate (image layers)", () => {
  it("computes DPI from natural pixels and printed width", () => {
    const l = imgLayer({ size: 0.3, naturalW: 1600 });
    const dpi = estimatedDpi(l, tee);
    expect(dpi).toBe(Math.round(1600 / layerWidthIn(l, tee)));
  });
  it("classifies good / soft / low as printed size grows", () => {
    expect(qualityLevel(imgLayer({ size: 0.28, naturalW: 1600 }), tee)).toBe("good");
    expect(qualityLevel(imgLayer({ size: 0.7, naturalW: 1200 }), tee)).toBe("low");
  });
});

describe("quantity & size breakdown", () => {
  it("parses quantities and flags below-minimum", () => {
    expect(parseQuantity("50 pcs")).toBe(50);
    expect(parseQuantity("not sure")).toBeNull();
    expect(belowMinimum("12")).toBe(true);
    expect(belowMinimum("30")).toBe(false);
  });
  it("sizeTotal sums the breakdown", () => {
    expect(sizeTotal({ ...emptySizes(), S: 5, M: 10, L: 10, XL: 5 })).toBe(30);
  });
  it("flags an under-allocated breakdown with the exact remainder", () => {
    const st = initialState();
    st.details.quantity = "30";
    st.details.sizes = { ...emptySizes(), S: 5, M: 10, L: 10 };
    const issue = sizeIssue(st.details)!;
    expect(issue.level).toBe("error");
    expect(issue.message).toContain("totals 25");
    expect(issue.message).toContain("remaining 5");
  });
  it("passes exact matches and downgrades when custom sizes cover the gap", () => {
    const st = initialState();
    st.details.quantity = "30";
    st.details.sizes = { ...emptySizes(), M: 30 };
    expect(sizeIssue(st.details)).toBeNull();
    st.details.sizes = { ...emptySizes(), M: 25 };
    st.details.otherSizes = "3XL — 5";
    expect(sizeIssue(st.details)!.level).toBe("note");
  });
});

describe("submission validation", () => {
  it("requires a design layer, quantity, name and a contact route", () => {
    const fields = validateForSubmit(initialState()).map((i) => i.field);
    expect(fields).toContain("artwork");
    expect(fields).toContain("quantity");
    expect(fields).toContain("name");
    expect(fields).toContain("phone");
  });
  it("passes a complete design", () => {
    const st = initialState();
    st.layers = [imgLayer()];
    st.details.quantity = "30";
    st.details.sizes = { ...emptySizes(), M: 30 };
    st.details.name = "Amzat";
    st.details.phone = "+2348000000000";
    expect(validateForSubmit(st)).toHaveLength(0);
  });
});

describe("enquiry summary & spec (multi-layer)", () => {
  function completeState() {
    const st = initialState();
    st.productId = "tee-readymade";
    st.layers = [
      imgLayer({ id: "front-logo", view: "front", fileName: "logo.png" }),
      newTextLayer("name", tee, "back"),
      newTextLayer("number", tee, "back"),
    ];
    st.details.quantity = "12";
    st.details.sizes = { ...emptySizes(), S: 2, M: 4, L: 4, XL: 2 };
    st.details.name = "Amzat Karim";
    st.details.phone = "+44 7000 000000";
    st.details.fabricId = "performance";
    st.color = { id: "royal", name: "Royal blue", hex: "#2b4f9e", status: "standard" };
    return st;
  }
  it("summarises which sides carry a design", () => {
    expect(viewsWithDesign(completeState())).toEqual(["front", "back"]);
    expect(designSidesLine(completeState())).toBe("Front and back");
  });
  it("formats the sizes line and a fabric line", () => {
    expect(sizesLine(completeState())).toBe("S ×2, M ×4, L ×4, XL ×2");
    expect(fabricLine(completeState())).toContain("Performance polyester");
  });
  it("describes image and text layers for the factory", () => {
    const st = completeState();
    const front = st.layers[0];
    expect(layerLine(front, tee)).toContain("logo.png");
    expect(layerLine(front, tee)).toContain("DPI");
    const number = st.layers[2];
    expect(layerLine(number, tee)).toContain("Number");
    expect(layerLine(number, tee)).toContain("Back"); // number was added to the back view
  });
  it("builds a SHORT human WhatsApp message — layer geometry stays in the reference/JSON", () => {
    const msg = buildStudioMessage(completeState());
    expect(msg).toContain("*Studio enquiry*");
    expect(msg).toContain(completeState().reference.slice(0, 7)); // TFN-DS-…
    expect(msg).toContain("*Design:* Front and back");
    expect(msg).toContain("*Quantity:* 12");
    expect(msg).toContain("Please confirm availability, minimum, price and timing");
    // scannable by a human, triage-able by staff: no per-layer geometry dump,
    // no wall of disclaimers, nothing a customer can't read at a glance
    expect(msg).not.toContain("Design layers");
    expect(msg).not.toContain("DPI");
    expect(msg.split("\n").length).toBeLessThanOrEqual(14);
    expect(msg.length).toBeLessThan(700);
    expect(msg).not.toContain("base64"); // never embeds image data
  });
  it("summary rows tag the step that edits them", () => {
    const rows = summaryRows(completeState());
    expect(rows.find((r) => r.label === "Product")!.step).toBe(0);
    expect(rows.find((r) => r.label === "Garment colour")!.step).toBe(1);
    expect(rows.find((r) => r.label === "Front design")!.value).toContain("logo.png");
  });
  it("design spec is preview-flagged, lists layers, embeds artwork only on request", () => {
    const spec = buildDesignSpec(completeState()) as {
      prototype: boolean;
      generator: string;
      layers: { kind: string; originalDataUrl?: string }[];
    };
    expect(spec.prototype).toBe(true);
    expect(spec.generator).toContain("Studio preview");
    expect(spec.generator).not.toContain("experimental");
    expect(spec.layers.length).toBe(3);
    const img = spec.layers.find((l) => l.kind === "image")!;
    expect(img.originalDataUrl).toBeUndefined();
    const full = buildDesignSpec(completeState(), true) as typeof spec;
    expect(full.layers.find((l) => l.kind === "image")!.originalDataUrl).toBeTruthy();
  });
});

describe("upload safety prechecks", () => {
  it("rejects empty, oversized and wrong-type files with readable errors", () => {
    expect(precheckFile({ name: "a.png", size: 0, type: "image/png" })).toMatch(/empty/i);
    expect(precheckFile({ name: "a.svg", size: 100, type: "image/svg+xml" })).toMatch(/PNG or JPEG/);
    expect(precheckFile({ name: "a.png", size: UPLOAD_LIMITS.maxBytes + 1, type: "image/png" })).toMatch(/larger than/);
    expect(precheckFile({ name: "a.png", size: 5000, type: "image/png" })).toBeNull();
  });
  it("rejects absurd dimensions in both directions", () => {
    expect(checkDimensions(10, 10)).toMatch(/too small/i);
    expect(checkDimensions(20000, 500)).toMatch(/unusually large/i);
    expect(checkDimensions(2000, 1500)).toBeNull();
  });
});

describe("photoreal colour pipeline", () => {
  it("computes hex luminance + RGB correctly", async () => {
    const { hexLuma, hexToRgb } = await import("../garment");
    expect(hexLuma("#ffffff")).toBeCloseTo(1, 2);
    expect(hexLuma("#000000")).toBeCloseTo(0, 2);
    expect(hexToRgb("#a425a4")).toEqual({ r: 164, g: 37, b: 164 });
    expect(hexToRgb("nope")).toBeNull();
  });
  it("gives dark shirts a stronger highlight pass than light shirts", async () => {
    const { layerTuning } = await import("../garment");
    expect(layerTuning("#211f1e").lightOpacity).toBeGreaterThan(layerTuning("#f4f2ee").lightOpacity);
    expect(layerTuning("#211f1e").shadeBrightness).toBeGreaterThan(1);
  });
  it("measures text aspect as width over font size", async () => {
    const { measureTextAspect } = await import("../garment");
    // jsdom has no real text metrics → falls back to a length heuristic
    expect(measureTextAspect("10", "Archivo", 800)).toBeGreaterThan(0);
  });

  it("greys and normalises pixels exactly like the CSS filter it replaces", async () => {
    // Safari/WebKit accepts ctx.filter but silently ignores it, so exports
    // fall back to this pixel math — it must match grayscale/brightness/
    // contrast to the letter or Safari exports drift from Chrome's.
    const { grayscaleAdjust } = await import("../garment");

    // pure red → CSS luminance grey (0.2126 × 255 ≈ 54), alpha untouched
    const red = new Uint8ClampedArray([255, 0, 0, 200]);
    grayscaleAdjust(red);
    expect(red[0]).toBe(red[1]);
    expect(red[1]).toBe(red[2]);
    expect(Math.abs(red[0] - 54)).toBeLessThanOrEqual(1);
    expect(red[3]).toBe(200);

    // brightness(2) doubles the grey; clamped at 255
    const mid = new Uint8ClampedArray([100, 100, 100, 255]);
    grayscaleAdjust(mid, 2);
    expect(Math.abs(mid[0] - 200)).toBeLessThanOrEqual(1);
    const hot = new Uint8ClampedArray([220, 220, 220, 255]);
    grayscaleAdjust(hot, 2);
    expect(hot[0]).toBe(255);

    // contrast(1.15) pushes values away from mid-grey in both directions
    const dark = new Uint8ClampedArray([60, 60, 60, 255]);
    const light = new Uint8ClampedArray([200, 200, 200, 255]);
    grayscaleAdjust(dark, 1, 1.15);
    grayscaleAdjust(light, 1, 1.15);
    expect(dark[0]).toBeLessThan(60);
    expect(light[0]).toBeGreaterThan(200);
    // and mid-grey is the fixed point
    const pivot = new Uint8ClampedArray([127, 128, 128, 255]);
    grayscaleAdjust(pivot, 1, 1.15);
    expect(Math.abs(pivot[0] - 127.5)).toBeLessThanOrEqual(1);
  });
});

describe("design persistence (save on device / .json file)", () => {
  function richState() {
    const st = initialState();
    st.productId = "basketball";
    st.color = { id: "royal", name: "Royal blue", hex: "#2b4f9e", status: "standard" };
    st.layers = [
      imgLayer({ id: "logo", view: "front", fileName: "crest.png" }),
      { ...(newTextLayer("number", tee, "back") as TextLayer), text: "23", locked: true },
      { ...(newTextLayer("name", tee, "back") as TextLayer), text: "ADEYEMI", hidden: true, name: "Player name" },
    ];
    st.selectedId = "logo";
    st.details.quantity = "12";
    st.details.name = "Coach";
    return st;
  }
  it("round-trips a complex design losslessly", () => {
    const st = richState();
    const restored = deserializeDesign(serializeDesign(st))!;
    expect(restored).toBeTruthy();
    expect(restored.productId).toBe("basketball");
    expect(restored.color.hex).toBe("#2b4f9e");
    expect(restored.layers.length).toBe(3);
    expect(restored.selectedId).toBe("logo");
    expect(restored.details.quantity).toBe("12");
    const num = restored.layers.find((l) => l.kind === "text" && l.role === "number");
    expect(num && "text" in num && num.text).toBe("23");
    expect(num?.locked).toBe(true);
    expect(restored.layers.find((l) => l.id !== "logo" && l.hidden)).toBeTruthy();
  });
  it("serialised form is plain JSON (no data loss through stringify)", () => {
    const saved = serializeDesign(richState());
    const trip = deserializeDesign(JSON.parse(JSON.stringify(saved)))!;
    expect(trip.layers.length).toBe(3);
    expect(saved.app).toBe("the-factory-studio");
    expect(typeof saved.savedAt).toBe("number");
  });
  it("rejects junk and falls back safely", () => {
    expect(deserializeDesign(null)).toBeNull();
    expect(deserializeDesign(42)).toBeNull();
    expect(deserializeDesign({})).toBeNull();
    // unknown product → default; malformed layers dropped
    const weird = deserializeDesign({ state: { productId: "nope", layers: [{ kind: "image" }, { kind: "text", text: "hi", fontId: "anton" }, 5] } })!;
    expect(weird.productId).toBe(PRODUCTS[0].id);
    expect(weird.layers.length).toBe(1); // the valid text layer only
    expect(weird.layers[0].kind).toBe("text");
  });
  it("only saves when there's something worth saving", () => {
    expect(isWorthSaving(initialState())).toBe(false);
    const withLayer = initialState();
    withLayer.layers = [imgLayer()];
    expect(isWorthSaving(withLayer)).toBe(true);
    const withName = initialState();
    withName.details.name = "Ada";
    expect(isWorthSaving(withName)).toBe(true);
  });
  it("formats 'saved ago' labels", () => {
    const now = 1_000_000_000_000;
    expect(savedAgo(now, now)).toBe("just now");
    expect(savedAgo(now - 5 * 60000, now)).toBe("5 mins ago");
    expect(savedAgo(now - 2 * 3600_000, now)).toBe("2 hours ago");
    expect(savedAgo(now - 3 * 86400_000, now)).toBe("3 days ago");
  });
});

describe("references + ppi", () => {
  it("generates readable unique-ish references", () => {
    expect(makeReference(1720000000000)).toMatch(/^TFN-DS-[A-Z0-9]{6}$/);
    expect(makeReference(1720000000000)).not.toBe(makeReference(1720099999999));
  });
  it("derives stage-pixels-per-inch from the front torso zone", () => {
    expect(productPpi(tee)).toBeCloseTo(tee.zones.front.w / tee.zones.front.widthIn, 5);
  });
});

// layersForView is exercised across the suite; guard its basic contract too.
describe("layersForView", () => {
  it("filters by view", () => {
    const st = initialState();
    st.layers = [imgLayer({ id: "a", view: "front" }), imgLayer({ id: "b", view: "back" })];
    expect(layersForView(st, "front").map((l) => l.id)).toEqual(["a"]);
  });
});

// =====================================================================
// The Factory's requirements, locked down as tests. These encode
// decisions the team made about how their garments are really produced —
// if one of these fails, the app is lying to a customer.
// =====================================================================

describe("guides are alignment aids, never restrictions", () => {
  it("a design placed far outside its guide is still a valid, submittable design", () => {
    const st = initialState();
    // deliberately absurd: huge, rotated, hanging off the shoulder
    const wild = imgLayer({ cx: 0.12, cy: 0.12, size: 1.2, rotation: 47 });
    st.layers = [wild];
    st.details.quantity = "5";
    st.details.sizes = { ...emptySizes(), M: 5 };
    st.details.name = "Amzat";
    st.details.phone = "+2348000000000";

    expect(isLayerOutOfArea(wild, tee)).toBe(true); // it IS outside — that's information
    expect(validateForSubmit(st)).toHaveLength(0); // …and it changes nothing
  });

  it("clamping never pulls a design back toward a guide or shrinks it to fit", () => {
    const off = imgLayer({ cx: 0.9, cy: 0.88, size: 0.9, rotation: 33 });
    const clamped = clampLayer(off);
    expect(clamped.cx).toBeCloseTo(0.9, 6);
    expect(clamped.cy).toBeCloseTo(0.88, 6);
    expect(clamped.size).toBeCloseTo(0.9, 6);
    expect(clamped.rotation).toBeCloseTo(33, 6);
    expect(isLayerOutOfArea(clamped, tee)).toBe(true); // still outside, untouched
  });

  it("fitting to a guide only ever happens when the customer asks for it", () => {
    const l = imgLayer({ cx: 0.05, cy: 0.95, size: 1.1, rotation: 30 });
    // the layer is untouched until fitLayerToArea is called explicitly
    expect(clampLayer(l).cx).toBeCloseTo(0.05, 6);
    const fitted = fitLayerToArea(l, tee);
    expect(isLayerOutOfArea(fitted, tee)).toBe(false);
    expect(l.cx).toBeCloseTo(0.05, 6); // original not mutated
  });

  it("crossing a seam or pocket warns in the team's words, and still submits", () => {
    const hoodie = PRODUCTS.find((p) => p.id === "hoodie")!;
    const overPocket = imgLayer({ view: "front", cx: 0.5, cy: 0.72, size: 0.5 });
    expect(difficultCrossings(overPocket, hoodie).join(" ")).toMatch(/pocket/);

    const st = initialState();
    st.productId = "hoodie";
    st.layers = [overPocket];
    st.details.quantity = "2";
    st.details.sizes = { ...emptySizes(), L: 2 };
    st.details.name = "Amzat";
    st.details.phone = "+2348000000000";
    expect(validateForSubmit(st)).toHaveLength(0);

    expect(DIFFICULT_AREA_NOTICE).toContain("You can continue with your idea");
    expect(GUIDES_NOTICE).toContain("place your design anywhere on the visible garment");
  });
});

describe("two T-shirt options — never merged into one vague 'T-shirt'", () => {
  const custom = PRODUCTS.find((p) => p.id === "tee-custom")!;
  const ready = PRODUCTS.find((p) => p.id === "tee-readymade")!;

  it("offers a custom-made (towel-back) tee and a ready-made 100% cotton tee", () => {
    expect(custom.tshirtOption).toBe("custom-made");
    expect(ready.tshirtOption).toBe("ready-made");
    expect(custom.production).toBe("custom-made");
    expect(ready.production).toBe("ready-made-print");
    // the team's own wording, kept verbatim
    expect(custom.tshirtOptionLabel).toContain("towel-back fabric option");
    expect(ready.tshirtOptionLabel).toContain("Ready-made 100% cotton");
    expect(TOWEL_BACK_NOTE).toContain("towel-back fabric");
    // no product may be a nameless "T-shirt"
    expect(PRODUCTS.filter((p) => p.name.trim() === "T-shirt")).toHaveLength(0);
  });

  it("carries the chosen option into the enquiry and the design brief", () => {
    const st = initialState();
    st.productId = "tee-custom";
    st.layers = [imgLayer()];
    st.details.name = "Amzat";
    st.details.phone = "+2348000000000";
    st.details.quantity = "3";

    const msg = buildStudioMessage(st);
    expect(msg).toContain("Custom-made (cut and sewn for you)"); // in the product line
    expect(msg).toContain("towel-back fabric option");

    const rows = summaryRows(st);
    expect(rows.find((r) => r.label === "Production method")!.value).toContain("Custom-made");
    expect(rows.find((r) => r.label === "T-shirt option")!.value).toContain("towel-back");

    const spec = buildDesignSpec(st) as { product: { productionMethod: string; tshirtOption?: string } };
    expect(spec.product.tshirtOption).toBe("custom-made");
    expect(spec.product.productionMethod).toContain("Custom-made");
  });

  it("switching between the two options never deletes the customer's work", () => {
    const st = initialState();
    st.productId = "tee-custom";
    st.layers = [imgLayer({ id: "keep-me" }), newTextLayer("text", tee, "front")];
    // switching product is a productId change only — layers are not touched
    const switched = { ...st, productId: "tee-readymade" };
    expect(switched.layers).toHaveLength(2);
    expect(switched.layers[0].id).toBe("keep-me");
    expect(hasAnyDesign(switched)).toBe(true);
  });

  it("an old saved design that still says 'unisex-tee' is migrated, not discarded", () => {
    const restored = deserializeDesign({
      state: { productId: "unisex-tee", layers: [{ kind: "text", text: "KEEP", fontId: "anton" }] },
    })!;
    expect(restored.productId).toBe("tee-readymade");
    expect(restored.layers).toHaveLength(1);
  });
});

describe("jerseys are sublimated, not printed", () => {
  it("both jerseys declare sublimation; ready-made garments do not", () => {
    for (const id of ["jersey", "basketball"]) {
      const p = PRODUCTS.find((x) => x.id === id)!;
      expect(p.production).toBe("sublimation");
      expect(isSublimated(p)).toBe(true);
      expect(getProductionMethod(p).label).toBe("Sublimation");
    }
    expect(isSublimated(PRODUCTS.find((p) => p.id === "tee-readymade")!)).toBe(false);
    expect(PRODUCTION_METHODS.sublimation.designNote).toMatch(/whole garment|edge to edge/);
  });

  it("says 'Sublimation' in the enquiry and the brief", () => {
    const st = initialState();
    st.productId = "jersey";
    st.layers = [newTextLayer("number", tee, "back")];
    st.details.name = "Coach";
    st.details.phone = "+2348000000000";
    st.details.quantity = "16";

    expect(buildStudioMessage(st)).toContain("— Sublimation"); // in the product line
    expect(summaryRows(st).find((r) => r.label === "Production method")!.value).toBe("Sublimation");
    const spec = buildDesignSpec(st) as { product: { productionMethod: string; sublimationNote?: string } };
    expect(spec.product.productionMethod).toBe("Sublimation");
    expect(spec.product.sublimationNote).toBeTruthy();
  });

  it("builds a full-surface design that covers the whole garment", () => {
    const layer = newPatternLayer({ ...DEFAULT_PATTERN, id: "stripes" }, "front");
    expect(layer.kind).toBe("image");
    expect(layer.generated).toBe(true);
    expect(layer.pattern!.id).toBe("stripes");
    expect(layer.src.startsWith("data:image/svg+xml")).toBe(true);
    expect(layer.cx).toBeCloseTo(0.5, 6);
    expect(layer.cy).toBeCloseTo(0.5, 6);
    // it must cover the full 600×700 stage, not sit in a chest box
    const box = layerBox(layer);
    expect(box.w).toBeGreaterThanOrEqual(600);
    expect(box.h).toBeGreaterThanOrEqual(700 - 0.5);
  });

  it("restyling a full-surface design keeps its identity and records the recipe", () => {
    const layer = newPatternLayer(DEFAULT_PATTERN, "front");
    const restyled = restylePatternLayer(layer, { ...DEFAULT_PATTERN, id: "chevron", accent: "#00ff00" });
    expect(restyled.id).toBe(layer.id); // same layer, new look
    expect(restyled.pattern!.id).toBe("chevron");
    expect(restyled.pattern!.accent).toBe("#00ff00");
    expect(restyled.src).not.toBe(layer.src);

    const st = initialState();
    st.productId = "jersey";
    st.layers = [restyled];
    expect(backgroundLayer(st, "front")!.id).toBe(layer.id);
    expect(layerLine(restyled, tee)).toContain("Full-surface design (sublimation)");
    expect(patternSummary(restyled.pattern!)).toContain("#00FF00");
  });

  it("every pattern renders valid, self-contained SVG with the chosen colours", () => {
    for (const p of JERSEY_PATTERNS) {
      const svg = renderPatternSvg({ id: p.id, base: "#112233", secondary: "#445566", accent: "#778899" });
      expect(svg.startsWith("<svg")).toBe(true);
      expect(svg).toContain("#112233");
      expect(svg).not.toContain("http://external");
    }
    // a junk colour can never be injected into the markup
    const dirty = renderPatternSvg({ id: "solid", base: '"><script>x</script>', secondary: "#fff", accent: "#000" });
    expect(dirty).not.toContain("<script>");
  });

  it("an uploaded image can be scaled to cover the garment", () => {
    expect(coverSize(1200, 1400)).toBeCloseTo(1, 3); // stage-shaped art → exactly covers
    expect(coverSize(2000, 500)).toBeGreaterThan(1); // wide art must grow to cover the height
  });

  it("never reports a pixel DPI for a vector full surface (it has none)", () => {
    const st = initialState();
    st.productId = "jersey";
    st.layers = [newPatternLayer(DEFAULT_PATTERN, "front")];
    st.details.name = "Coach";
    st.details.phone = "+1";
    st.details.quantity = "10";
    const spec = buildDesignSpec(st) as {
      layers: { vector?: boolean; estimatedDpi?: number; quality?: string }[];
    };
    expect(spec.layers[0].vector).toBe(true);
    expect(spec.layers[0].estimatedDpi).toBeUndefined();
    expect(spec.layers[0].quality).toBeUndefined();
    // and the enquiry line describes the surface, not a resolution
    expect(layerLine(st.layers[0], tee)).not.toMatch(/DPI/);
  });
});

describe("text is a first-class design element", () => {
  it("groups fonts into the categories the team asked for", () => {
    const groups = fontsByCategory();
    expect(groups.length).toBeGreaterThanOrEqual(6);
    for (const g of groups) expect(FONT_CATEGORIES).toContain(g.category);
    // every font lands in exactly one named category
    expect(groups.flatMap((g) => g.fonts)).toHaveLength(FONTS.length);
    const names = groups.map((g) => g.category);
    for (const c of ["Athletic", "Jersey", "Varsity", "Script"]) expect(names).toContain(c);
  });

  it("multi-line text grows the block instead of overlapping itself", () => {
    const one = { ...(newTextLayer("text", tee, "front") as TextLayer), text: "ONE", lineHeight: 1.1 };
    const three = { ...one, text: "ONE\nTWO\nTHREE" };
    expect(textLines(three.text)).toHaveLength(3);
    expect(textBlockScale(one)).toBeCloseTo(1.1, 5);
    expect(textBlockScale(three)).toBeCloseTo(3.3, 5);
    // same font size, three times the block height
    expect(layerBox(three).h).toBeCloseTo(layerBox(one).h * 3, 4);
  });

  it("records line spacing and alignment for the factory", () => {
    const st = initialState();
    const t = { ...(newTextLayer("text", tee, "front") as TextLayer), text: "TOP\nBOTTOM", align: "left" as const };
    st.layers = [t];
    st.details.name = "A";
    st.details.phone = "+1";
    st.details.quantity = "1";
    const spec = buildDesignSpec(st) as { layers: { lines?: string[]; align?: string; lineHeight?: number }[] };
    expect(spec.layers[0].lines).toEqual(["TOP", "BOTTOM"]);
    expect(spec.layers[0].align).toBe("left");
    expect(spec.layers[0].lineHeight).toBeGreaterThan(0);
    expect(layerLine(t, tee)).toContain("2 lines");
  });

  it("a text-only design is a complete design", () => {
    const st = initialState();
    st.layers = [newTextLayer("text", tee, "front")];
    st.details.quantity = "1";
    st.details.sizes = { ...emptySizes(), M: 1 };
    st.details.name = "Amzat";
    st.details.phone = "+2348000000000";
    expect(hasAnyDesign(st)).toBe(true);
    expect(validateForSubmit(st)).toHaveLength(0);
  });

  it("survives a save/load round-trip with its line breaks intact", () => {
    const st = initialState();
    st.productId = "jersey";
    st.layers = [
      { ...(newTextLayer("text", tee, "front") as TextLayer), text: "LINE ONE\nLINE TWO", align: "right", lineHeight: 1.4 },
    ];
    const back = deserializeDesign(JSON.parse(JSON.stringify(serializeDesign(st))))!;
    const t = back.layers[0] as TextLayer;
    expect(t.text).toBe("LINE ONE\nLINE TWO");
    expect(t.align).toBe("right");
    expect(t.lineHeight).toBeCloseTo(1.4, 5);
    expect(back.productId).toBe("jersey");
  });
});

describe("what the process can physically do", () => {
  const jersey = PRODUCTS.find((p) => p.id === "jersey")!;
  const readyTee = PRODUCTS.find((p) => p.id === "tee-readymade")!;

  it("a guide never lies about its own size", () => {
    // heightIn must agree with the pixel box and the garment's pixels-per-inch,
    // or the box drawn on screen is not the size printed on its label.
    for (const p of PRODUCTS) {
      const ppi = productPpi(p);
      for (const v of ["front", "back"] as const) {
        const z = p.zones[v];
        const impliedHeightIn = z.h / ppi;
        const drift = Math.abs(impliedHeightIn - z.heightIn) / z.heightIn;
        expect(drift, `${p.id} ${v}: box implies ${impliedHeightIn.toFixed(2)}″ but says ${z.heightIn}″`).toBeLessThan(
          0.05,
        );
      }
    }
  });

  it("cap decoration areas are wider than they are tall, like a real cap", () => {
    for (const p of PRODUCTS.filter((x) => x.family === "headwear")) {
      expect(p.zones.front.widthIn).toBeGreaterThan(p.zones.front.heightIn);
      expect(p.zones.front.heightIn).toBeLessThanOrEqual(3); // standard cap front
    }
  });

  it("sublimation cannot print a light design onto a dark blank", () => {
    // physics: the dye is translucent, so it can only darken what it bonds with
    expect(blankTooDarkForSublimation(jersey, "#211f1e")).toBe(true); // black
    expect(blankTooDarkForSublimation(jersey, "#232f45")).toBe(true); // navy
    expect(blankTooDarkForSublimation(jersey, "#f4f2ee")).toBe(false); // white blank
    // it is only a sublimation constraint — you can print white ink on a black tee
    expect(blankTooDarkForSublimation(readyTee, "#211f1e")).toBe(false);
  });

  it("sublimation ink does not bond with cotton", () => {
    const cotton = FABRICS.find((f) => f.id === "cotton-mid")!;
    const poly = FABRICS.find((f) => f.id === "performance")!;
    const blend = FABRICS.find((f) => f.id === "cotton-poly")!;
    expect(fabricMethodIssue(jersey, cotton)).toMatch(/does not bond with cotton/);
    expect(fabricMethodIssue(jersey, poly)).toBeNull();
    expect(fabricMethodIssue(jersey, blend)).toMatch(/depends on how much polyester/);
    // a printed cotton tee is a completely normal thing to ask for
    expect(fabricMethodIssue(readyTee, cotton)).toBeNull();
  });

  it("a seam is only difficult when the garment is already sewn", () => {
    // A sublimated garment is printed as FLAT PANELS before it is sewn, so a
    // full-bleed design crossing a side seam is normal — not a difficulty.
    const fullBleed = { cx: 0.5, cy: 0.5, size: 1.6, rotation: 0 };
    const onJersey = imgLayer({ ...fullBleed, view: "front" });
    const onTee = imgLayer({ ...fullBleed, view: "front" });

    const jerseyCrossings = difficultCrossings(onJersey, jersey);
    expect(jerseyCrossings.join(" ")).not.toMatch(/seam|hem/);

    // …but printing that same design ONTO a finished tee really does fight the seams
    const teeCrossings = difficultCrossings(onTee, readyTee);
    expect(teeCrossings.join(" ")).toMatch(/seam/);
    expect(teeCrossings.join(" ")).toMatch(/hem/);
  });

  it("an ordinary chest logo is never nagged about seams or hems", () => {
    const chest = imgLayer({ view: "front", cx: 0.5, cy: 0.42, size: 0.3 });
    expect(difficultCrossings(chest, readyTee)).toEqual([]);
    // and a sleeve logo is not mistaken for a side-seam crossing
    const sleeve = areasForView(readyTee, "front").find((a) => a.id === "left-sleeve")!;
    const onSleeve = imgLayer({
      view: "front",
      cx: (sleeve.x + sleeve.w / 2) / 600,
      cy: (sleeve.y + sleeve.h / 2) / 700,
      size: 0.1,
    });
    expect(difficultCrossings(onSleeve, readyTee)).toEqual([]);
  });

  it("carries the manager's full list of awkward areas", () => {
    const hoodie = PRODUCTS.find((p) => p.id === "hoodie")!;
    const names = [...avoidAreasForView(hoodie, "front"), ...avoidAreasForView(readyTee, "front")]
      .map((a) => a.name)
      .join(" ");
    for (const thing of ["collar", "pocket", "drawstring", "hem", "seam"]) {
      expect(names).toContain(thing);
    }
    expect(avoidAreasForView(PRODUCTS.find((p) => p.id === "polo")!, "front").map((a) => a.name).join(" ")).toContain(
      "placket",
    );
  });

  it("never invents a minimum order The Factory has not given", () => {
    for (const p of PRODUCTS) {
      const m = minimumFor(p);
      expect(m.confirmed).toBe(false); // nothing is confirmed yet
      expect(m.min).toBe(1); // so Studio still accepts a single item
      expect(m.note).toMatch(/confirmed by The Factory Nigeria/);
    }
    // made-to-order methods warn that the real minimum is often higher
    expect(minimumFor(jersey).note).toMatch(/higher minimum/);
    expect(minimumFor(readyTee).note).not.toMatch(/higher minimum/);
  });

  it("tells the factory what still needs settling, in the brief", () => {
    const st = initialState();
    st.productId = "jersey";
    st.color = { id: "black", name: "Black", hex: "#211f1e", status: "standard" };
    st.details.fabricId = "cotton-mid";
    st.layers = [imgLayer()];
    st.details.name = "Coach";
    st.details.phone = "+1";
    st.details.quantity = "1";
    const spec = buildDesignSpec(st) as {
      productionChecks: { minimum: { confirmed: boolean }; fabricIssue: string | null; blankTooDarkForSublimation: boolean };
    };
    expect(spec.productionChecks.blankTooDarkForSublimation).toBe(true);
    expect(spec.productionChecks.fabricIssue).toMatch(/cotton/);
    expect(spec.productionChecks.minimum.confirmed).toBe(false);
    expect(buildStudioMessage(st)).toMatch(/confirm availability, minimum/);
  });

  it("flags a full-surface design stranded on a garment that isn't sublimated — but keeps it", () => {
    const st = initialState();
    st.productId = "jersey";
    st.layers = [newPatternLayer(DEFAULT_PATTERN, "front")];
    expect(fullSurfaceOnNonSublimated(st)).toBe(false);

    // the customer switches to a cap — the work must survive, but it is no
    // longer reproducible as drawn, and we must say so rather than pretend
    const onCap = { ...st, productId: "cap-snapback" };
    expect(onCap.layers).toHaveLength(1); // nothing deleted
    expect(fullSurfaceOnNonSublimated(onCap)).toBe(true);
  });

  it("keeps every open question open until The Factory answers it — each with a provisional answer", () => {
    expect(OPEN_QUESTIONS.length).toBe(FACTORY_QUESTIONS.length);
    for (const q of FACTORY_QUESTIONS) {
      expect(q.status).toBe("open");
      expect(q.answer).toBeUndefined();
      expect(q.question.length).toBeGreaterThan(20);
      expect(q.assumption.length).toBeGreaterThan(20);
      expect(q.whyItMatters.length).toBeGreaterThan(20);
      // Every question carries Studio's best working answer ("most likely …"),
      // so the manager confirms or corrects instead of composing from scratch.
      expect(q.provisional.length, `provisional answer missing for ${q.id}`).toBeGreaterThan(30);
    }
    // Every assumption the app makes about The Factory's business must be here.
    // If you add a capability or an availability claim to the app, add it here too.
    const ids = FACTORY_QUESTIONS.map((q) => q.id);
    for (const id of [
      // can you actually DO it?
      "decoration-methods",
      "sublimation-scope",
      "all-over-on-readymade",
      "cap-decoration",
      "print-colour-limit",
      // can you actually GET it?
      "towel-back",
      "garment-range",
      "colour-range",
      "fabric-availability",
      // what do you need from us?
      "artwork-format",
      "colour-standard",
      "sizes",
      // commercial
      "minimums",
      "general-minimum",
      "ready-made-tee",
      // sanity-check our researched call
      "print-sizes",
      "difficult-areas",
      "artwork-resolution",
    ]) {
      expect(ids, `missing open question: ${id}`).toContain(id);
    }
  });

  it("knows which questions are the app making an unconfirmed claim", () => {
    // These are the ones where Studio currently implies a capability or an
    // availability that nobody at The Factory has actually confirmed.
    // (sublimation-scope is no longer blocking: the manager's own feedback —
    // "jerseys are sublimated" — settled its core; only "anything else?" is open.)
    expect(BLOCKING_QUESTIONS.length).toBeGreaterThanOrEqual(8);
    const blocking = BLOCKING_QUESTIONS.map((q) => q.id);
    expect(blocking).toContain("decoration-methods"); // we offer 4 machines in a dropdown
    expect(blocking).toContain("colour-range"); // we assigned every colour's status
    expect(blocking).toContain("fabric-availability"); // we assigned all 11 fabric statuses
    expect(blocking).toContain("garment-range"); // we chose all 10 garments
    expect(blocking).not.toContain("sublimation-scope"); // settled by the manager's own words
  });

  it("only ever downgrades its own invented availability claims", () => {
    const byId = Object.fromEntries(STANDARD_COLORS.map((c) => [c.id, c.status]));
    // staples stay standard — genuinely the easiest tee colours to source
    for (const id of ["white", "black", "navy", "grey", "red", "royal", "green"]) {
      expect(byId[id], id).toBe("standard");
    }
    // fashion tints were downgraded to "confirm" — under-promising is the only
    // direction Studio may move an availability claim on its own
    expect(byId.cream).toBe("confirm");
    expect(byId.brown).toBe("confirm");
    // the blend fabric was downgraded too (ratio varies roll to roll)
    expect(FABRICS.find((f) => f.id === "cotton-poly")!.availability).toBe("confirm");
  });

  it("detects many-colour / gradient artwork without ever blocking it", () => {
    // flat colour → one bucket, far under the threshold
    const flat = new Uint8ClampedArray(48 * 48 * 4);
    for (let i = 0; i < flat.length; i += 4) {
      flat[i] = 200; flat[i + 1] = 30; flat[i + 2] = 30; flat[i + 3] = 255;
    }
    expect(countQuantizedColors(flat)).toBe(1);

    // deterministic pseudo-noise (photograph-like) → hundreds of buckets
    const noisy = new Uint8ClampedArray(48 * 48 * 4);
    for (let p = 0; p < 48 * 48; p++) {
      const h = (p * 2654435761) >>> 0;
      noisy[p * 4] = h & 255;
      noisy[p * 4 + 1] = (h >> 8) & 255;
      noisy[p * 4 + 2] = (h >> 16) & 255;
      noisy[p * 4 + 3] = 255;
    }
    expect(countQuantizedColors(noisy)).toBeGreaterThan(MANY_COLORS_THRESHOLD);
    expect(colorRichness(noisy)).toBeGreaterThan(RICHNESS_THRESHOLD);

    // transparent pixels are ignored entirely
    const ghost = new Uint8ClampedArray(48 * 48 * 4); // alpha 0 everywhere
    expect(countQuantizedColors(ghost)).toBe(0);
    expect(colorRichness(ghost)).toBe(0);

    // a smooth multi-colour GRADIENT: only ~50 distinct buckets (a raw count
    // misses it) but the pixel mass is spread thin — richness catches it
    const grad = new Uint8ClampedArray(48 * 48 * 4);
    for (let y = 0; y < 48; y++) {
      for (let x = 0; x < 48; x++) {
        const i = (y * 48 + x) * 4;
        grad[i] = Math.round((x / 47) * 255); // red sweeps left→right
        grad[i + 1] = Math.round((y / 47) * 255); // green sweeps top→bottom
        grad[i + 2] = 128;
        grad[i + 3] = 255;
      }
    }
    expect(colorRichness(grad)).toBeGreaterThan(RICHNESS_THRESHOLD);

    // the HARD case that broke the first threshold: a realistic THREE-stop
    // gradient — its colours sit on a path through colour space, so it only
    // touches a few dozen buckets, but the mass is spread along the path
    // (measured ~20 on a real canvas gradient)
    const threeStop = new Uint8ClampedArray(48 * 48 * 4);
    for (let p = 0; p < 48 * 48; p++) {
      const t = p / (48 * 48 - 1);
      const i = p * 4;
      if (t < 0.5) {
        const u = t * 2; // red → green
        threeStop[i] = Math.round((1 - u) * 255);
        threeStop[i + 1] = Math.round(u * 255);
        threeStop[i + 2] = 64;
      } else {
        const u = (t - 0.5) * 2; // green → blue
        threeStop[i] = 0;
        threeStop[i + 1] = Math.round((1 - u) * 255);
        threeStop[i + 2] = Math.round(64 + u * 191);
      }
      threeStop[i + 3] = 255;
    }
    expect(colorRichness(threeStop)).toBeGreaterThan(RICHNESS_THRESHOLD);

    // …but a simple TWO-stop fade stays silent on purpose: an A→B blend is a
    // classic screen-printing technique (split fountain / halftone), so the
    // "many colours" note would be a false alarm there
    const twoStop = new Uint8ClampedArray(48 * 48 * 4);
    for (let p = 0; p < 48 * 48; p++) {
      const t = p / (48 * 48 - 1);
      twoStop[p * 4] = Math.round(t * 255);
      twoStop[p * 4 + 1] = Math.round((1 - t) * 255);
      twoStop[p * 4 + 2] = 64;
      twoStop[p * 4 + 3] = 255;
    }
    expect(colorRichness(twoStop)).toBeLessThanOrEqual(RICHNESS_THRESHOLD);

    // a flat 3-colour logo with anti-aliased edges: ~12% of pixels are edge
    // blends spread across many buckets, but the mass sits in 3 — no flag
    const logo = new Uint8ClampedArray(48 * 48 * 4);
    for (let p = 0; p < 48 * 48; p++) {
      const i = p * 4;
      if (p % 100 < 88) {
        // solid brand colours carry the mass
        const c = p % 3;
        logo[i] = c === 0 ? 220 : 20;
        logo[i + 1] = c === 1 ? 220 : 20;
        logo[i + 2] = c === 2 ? 220 : 20;
      } else {
        // anti-aliased edge pixels: varied blends, thin minority
        const h = (p * 40503) >>> 0;
        logo[i] = h & 255;
        logo[i + 1] = (h >> 4) & 255;
        logo[i + 2] = (h >> 8) & 255;
      }
      logo[i + 3] = 255;
    }
    expect(colorRichness(logo)).toBeLessThanOrEqual(RICHNESS_THRESHOLD);

    // …and the flag flows through save/load and into the design brief
    const st = initialState();
    st.productId = "tee-readymade";
    st.layers = [imgLayer({ manyColors: true })];
    st.details.name = "A";
    st.details.phone = "+1";
    st.details.quantity = "1";
    const back = deserializeDesign(JSON.parse(JSON.stringify(serializeDesign(st))))!;
    expect((back.layers[0] as ImageLayer).manyColors).toBe(true);
    const spec = buildDesignSpec(st) as { layers: { manyColorArtwork?: boolean }[] };
    expect(spec.layers[0].manyColorArtwork).toBe(true);
    // information, never a verdict: the design still validates
    st.details.sizes = { ...emptySizes(), M: 1 };
    expect(validateForSubmit(st)).toHaveLength(0);
  });
});

describe("workbench redesign: contextual questions, honest files, grouped catalogue", () => {
  const jersey = PRODUCTS.find((p) => p.id === "jersey")!;
  const readyTee = PRODUCTS.find((p) => p.id === "tee-readymade")!;
  const cap = PRODUCTS.find((p) => p.id === "cap-snapback")!;

  it("never asks a sublimated-jersey customer to pick a print method", () => {
    expect(methodChoicesFor(jersey)).toHaveLength(0);
    expect(methodChoicesFor(PRODUCTS.find((p) => p.id === "basketball")!)).toHaveLength(0);
    // printed garments keep the full preference list (still a preference,
    // never a claim about machines — factoryFacts.ts)
    expect(methodChoicesFor(readyTee).map((m) => m.label)).toContain("Screen printing");
    expect(methodChoicesFor(cap).length).toBeGreaterThan(3);
  });

  it("drops a stale method preference when the garment becomes sublimated", () => {
    const details = { ...initialState().details, method: "Direct-to-garment (DTG)" };
    const reconciled = reconcileDetailsForProduct(details, jersey);
    expect(reconciled.method).toBe("");
    // and everything else survives untouched
    expect(reconcileDetailsForProduct(details, readyTee).method).toBe("Direct-to-garment (DTG)");
    // so the review and the enquiry can never carry a fake DTG claim on a jersey
    const st = initialState();
    st.productId = "jersey";
    st.details = reconciled;
    expect(summaryRows(st).find((r) => r.label === "Method preference")).toBeUndefined();
  });

  it("leads with fabrics that suit how the garment is made — and deletes none", () => {
    const j = fabricGroupsFor(jersey);
    expect(j.suggested.map((f) => f.id).sort()).toEqual(["interlock", "performance", "sports-mesh"]);
    expect(j.suggested.every((f) => f.sublimation === "yes")).toBe(true);

    const c = fabricGroupsFor(cap);
    expect(c.suggested.map((f) => f.id)).toEqual(["twill"]);

    const t = fabricGroupsFor(readyTee);
    expect(t.suggested.some((f) => f.id === "cotton-mid")).toBe(true);
    expect(t.other.map((f) => f.id).sort()).toEqual(["interlock", "performance", "sports-mesh"]);

    // nothing is ever removed from the catalogue by the split
    for (const g of [j, c, t]) {
      expect([...g.suggested, ...g.other]).toHaveLength(FABRICS.length);
      expect(g.reason.length).toBeGreaterThan(20);
    }
  });

  it("groups the ten products into four families, each product exactly once", () => {
    const groups = productGroups();
    expect(groups.map((g) => g.id)).toEqual(["tees", "tops", "sports", "caps"]);
    const ids = groups.flatMap((g) => g.products.map((p) => p.id));
    expect(ids).toHaveLength(PRODUCTS.length);
    expect(new Set(ids).size).toBe(PRODUCTS.length);
    expect(groups.find((g) => g.id === "tees")!.products).toHaveLength(3);
    expect(groups.find((g) => g.id === "sports")!.products.every((p) => p.production === "sublimation")).toBe(true);
    // the two-kinds-of-T-shirt truth lives on the group, said once
    expect(groups.find((g) => g.id === "tees")!.note).toMatch(/towel-back/);
  });

  it("never calls Studio-generated output the customer's original artwork", () => {
    const generated = { ...newPatternLayer(DEFAULT_PATTERN, "front") };
    const uploaded = imgLayer({ fileName: "crest.png" });
    expect(artworkFileLabel(generated)).toContain("Studio-generated");
    expect(artworkFileLabel(generated)).not.toContain("riginal");
    expect(artworkFileLabel(uploaded)).toContain("Original");
    expect(artworkFileLabel(uploaded)).toContain("untouched");
    expect(artworkFileName("TFN-DS-X", generated)).toContain("studio-generated");
    expect(artworkFileName("TFN-DS-X", uploaded)).toContain("original");
  });

  it("review readiness: says what the team will confirm, never blocks", () => {
    // a complete jersey design → sides OK + provisional sourcing to confirm
    const st = initialState();
    st.productId = "jersey";
    st.layers = [newPatternLayer(DEFAULT_PATTERN, "front")];
    const items = readinessChecklist(st);
    expect(items[0].level).toBe("ok");
    expect(items[0].text).toMatch(/front only/i);
    expect(items.some((i) => i.text.includes("Sourcing to confirm"))).toBe(true);

    // an empty design → the one real gap is named
    const empty = initialState();
    expect(readinessChecklist(empty)[0].level).toBe("check");
    expect(readinessChecklist(empty)[0].text).toMatch(/No design/);

    // low-res upload → flagged as reviewable, not fatal
    const low = initialState();
    low.productId = "tee-readymade";
    low.layers = [imgLayer({ size: 0.9, naturalW: 400, naturalH: 300 })];
    const lowItems = readinessChecklist(low);
    expect(lowItems.some((i) => i.level === "check" && /low resolution/.test(i.text))).toBe(true);
    expect(lowItems.every((i) => !/cannot|blocked|must not/i.test(i.text))).toBe(true);
  });
});

describe("real designs: many layers, mixed media", () => {
  it("carries 10 mixed image + text layers through preview, enquiry and brief", () => {
    const st = initialState();
    st.productId = "jersey";
    const layers = [
      newPatternLayer(DEFAULT_PATTERN, "front"),
      ...Array.from({ length: 5 }, (_, i) => imgLayer({ id: "logo" + i, view: "front", cx: 0.2 + i * 0.12, size: 0.1 })),
      { ...(newTextLayer("name", tee, "front") as TextLayer), text: "ADEYEMI" },
      { ...(newTextLayer("number", tee, "front") as TextLayer), text: "23" },
      { ...(newTextLayer("text", tee, "front") as TextLayer), text: "SPONSOR\nLTD" },
      imgLayer({ id: "sleeve", view: "front", cx: 0.15, cy: 0.36, size: 0.08 }),
    ];
    st.layers = layers;
    st.details.quantity = "18";
    st.details.sizes = { ...emptySizes(), M: 9, L: 9 };
    st.details.name = "Coach";
    st.details.phone = "+2348000000000";

    expect(visibleLayersForView(st, "front")).toHaveLength(10);
    expect(viewSummary(st, "front")).toBe("10 elements");
    expect(validateForSubmit(st)).toHaveLength(0);

    // the chat message stays a short human summary…
    const msg = buildStudioMessage(st);
    expect(msg).toContain("*Design:* Front only");
    expect(msg).not.toContain("ADEYEMI"); // per-layer detail lives in the files
    expect(msg).not.toContain("base64"); // artwork is never inlined into a message

    // …while the BRIEF carries every layer, and the reference line still
    // describes the full surface for the team
    expect(layerLine(st.layers[0], PRODUCTS.find((p) => p.id === "jersey")!)).toContain(
      "Full-surface design (sublimation)",
    );
    const spec = buildDesignSpec(st) as { layers: unknown[]; placementNotice: string };
    expect(spec.layers).toHaveLength(10);
    expect(spec.placementNotice).toBe(GUIDES_NOTICE);
  });
});
