import { describe, expect, it } from "vitest";
import {
  areasForView,
  FONTS,
  PLACEMENTS,
  placementsFor,
  PRODUCTS,
  productPpi,
  STANDARD_COLORS,
  UPLOAD_LIMITS,
} from "../catalog";
import {
  applyPlacement,
  belowMinimum,
  clampLayer,
  difficultCrossings,
  emptySizes,
  estimatedDpi,
  fitLayerToArea,
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
  newTextLayer,
  parseQuantity,
  qualityLevel,
  sizeIssue,
  sizeTotal,
  snapRotation,
  straightenLayer,
  validateForSubmit,
  viewsWithDesign,
  viewSummary,
  visibleLayersForView,
  type ImageLayer,
  type TextLayer,
} from "../state";
import { buildDesignSpec, buildStudioMessage, designSidesLine, fabricLine, layerLine, sizesLine, summaryRows } from "../messages";
import { checkDimensions, precheckFile } from "../imageFile";
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
    for (const id of ["unisex-tee", "oversized-tee", "polo", "hoodie"]) {
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
  it("clamps centre, size and normalises rotation", () => {
    const a = clampLayer(imgLayer({ cx: -3, cy: 9, size: 5, rotation: 725 }));
    expect(a.cx).toBeGreaterThanOrEqual(0.02);
    expect(a.cy).toBeLessThanOrEqual(0.98);
    expect(a.size).toBeLessThanOrEqual(1.25);
    expect(a.rotation).toBeCloseTo(5, 5);
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
    st.productId = "unisex-tee";
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
  it("builds a WhatsApp message listing every layer + confirmation ask", () => {
    const msg = buildStudioMessage(completeState());
    expect(msg).toContain("New Studio enquiry");
    expect(msg).toContain("*Design:* Front and back");
    expect(msg).toContain("*Design layers:*");
    expect(msg).toContain("Number");
    expect(msg).toContain("printing method, price and production time");
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
