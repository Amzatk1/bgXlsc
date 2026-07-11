import { describe, expect, it } from "vitest";
import {
  AVAILABILITY_LABEL,
  colorAvailability,
  FABRIC_VISUAL_NOTICE,
  FABRICS,
  getFabricById,
  MARKET_SOURCING_NOTICE,
  PLACEMENTS,
  PRODUCTS,
  STANDARD_COLORS,
  UPLOAD_LIMITS,
} from "../catalog";
import {
  applyPlacement,
  artworkCornersIn,
  belowMinimum,
  clampArtwork,
  defaultArtworkPlacement,
  emptySizes,
  estimatedDpi,
  initialState,
  isOutOfZone,
  makeReference,
  parseQuantity,
  qualityLevel,
  sizeIssue,
  sizeTotal,
  validateForSubmit,
  type Artwork,
} from "../state";
import { buildDesignSpec, buildStudioMessage, designSidesLine, fabricLine, sizesLine, summaryRows } from "../messages";
import { checkDimensions, precheckFile } from "../imageFile";

const zone = PRODUCTS[0].zones.front;

function makeArt(over: Partial<Artwork> = {}): Artwork {
  return {
    src: "data:image/png;base64,x",
    fileName: "logo.png",
    fileKB: 120,
    naturalW: 1600,
    naturalH: 1200,
    hasAlpha: true,
    cx: 0.5,
    cy: 0.3,
    widthIn: 8,
    rotation: 0,
    ...over,
  };
}

describe("catalogue (prototype data)", () => {
  it("every product has front and back print zones with real-world sizes", () => {
    for (const p of PRODUCTS) {
      for (const v of ["front", "back"] as const) {
        expect(p.zones[v].widthIn).toBeGreaterThanOrEqual(9);
        // hoodie front is a deliberate short band above the pocket (7″)
        expect(p.zones[v].heightIn).toBeGreaterThanOrEqual(6);
      }
    }
  });
  it("standard colours are named and marked standard", () => {
    expect(STANDARD_COLORS.length).toBeGreaterThanOrEqual(8);
    for (const c of STANDARD_COLORS) {
      expect(c.name.length).toBeGreaterThan(2);
      expect(c.status).toBe("standard");
      expect(c.hex).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
  it("placements exist for both views", () => {
    expect(PLACEMENTS.some((p) => p.view === "front")).toBe(true);
    expect(PLACEMENTS.some((p) => p.view === "back")).toBe(true);
  });
  it("every product carries card copy and one of the four availability statuses", () => {
    for (const p of PRODUCTS) {
      expect(p.fit.length).toBeGreaterThan(2);
      expect(p.description.length).toBeGreaterThan(10);
      expect(p.use.length).toBeGreaterThan(5);
      expect(p.material.length).toBeGreaterThan(5);
      expect(p.thumb).toMatch(/\.webp$/);
      expect(Object.keys(AVAILABILITY_LABEL)).toContain(p.availability);
    }
  });
  it("v3 garment library includes polo and hoodie with measured zones", () => {
    const polo = PRODUCTS.find((p) => p.id === "polo")!;
    const hoodie = PRODUCTS.find((p) => p.id === "hoodie")!;
    expect(polo).toBeTruthy();
    expect(hoodie).toBeTruthy();
    // polo front print sits below the placket (zone starts lower than the tee's)
    expect(polo.zones.front.y).toBeGreaterThan(250);
    expect(polo.zones.front.widthIn).toBeLessThanOrEqual(12);
    // hoodie front zone is the short band ABOVE the kangaroo pocket
    expect(hoodie.zones.front.h).toBeLessThan(hoodie.zones.back.h);
    expect(hoodie.zones.front.heightIn).toBeLessThanOrEqual(8);
    // all zones stay inside the 600×700 stage
    for (const p of PRODUCTS) {
      for (const v of ["front", "back"] as const) {
        const z = p.zones[v];
        expect(z.x).toBeGreaterThanOrEqual(0);
        expect(z.y).toBeGreaterThanOrEqual(0);
        expect(z.x + z.w).toBeLessThanOrEqual(600);
        expect(z.y + z.h).toBeLessThanOrEqual(700);
      }
    }
  });
  it("exposes exactly the four approved availability labels", () => {
    expect(Object.values(AVAILABILITY_LABEL).sort()).toEqual(
      ["Availability to confirm", "Commonly available", "Custom request", "Special sourcing required"].sort(),
    );
    expect(colorAvailability("standard")).toBe("common");
    expect(colorAvailability("confirm")).toBe("confirm");
  });
  it("fabric catalogue: eight options with copy, weight, status and close-up", () => {
    expect(FABRICS).toHaveLength(8);
    for (const f of FABRICS) {
      expect(f.name.length).toBeGreaterThan(3);
      expect(f.description.length).toBeGreaterThan(10);
      expect(f.use.length).toBeGreaterThan(5);
      expect(["Light", "Mid", "Heavy"]).toContain(f.weight);
      expect(Object.keys(AVAILABILITY_LABEL)).toContain(f.availability);
      expect(f.img).toMatch(/fabric-.*\.webp$/);
    }
    expect(getFabricById("pique")?.name).toBe("Piqué");
    expect(getFabricById("nope")).toBeUndefined();
  });
  it("honesty notices exist and never promise stock", () => {
    expect(MARKET_SOURCING_NOTICE).toContain("depends on what can be sourced");
    expect(MARKET_SOURCING_NOTICE).toContain("closest available alternative");
    expect(FABRIC_VISUAL_NOTICE).toContain("approximate references");
    expect(MARKET_SOURCING_NOTICE).not.toMatch(/in stock|guaranteed/i);
  });
});

describe("artwork placement & constraints", () => {
  it("default placement fits inside the zone", () => {
    const d = defaultArtworkPlacement(zone, 4000, 4000);
    expect(d.widthIn).toBeLessThanOrEqual(zone.widthIn);
    expect((d.widthIn * 4000) / 4000).toBeLessThanOrEqual(zone.heightIn);
  });
  it("placement presets cap width to the zone and keep height inside", () => {
    const art = makeArt({ naturalW: 1000, naturalH: 4000 }); // very tall
    const large = PLACEMENTS.find((p) => p.id === "large-front")!;
    const placed = applyPlacement(art, large, zone);
    const heightIn = placed.widthIn * (art.naturalH / art.naturalW);
    expect(heightIn).toBeLessThanOrEqual(zone.heightIn + 0.001);
  });
  it("clamp bounds scale and normalises rotation", () => {
    const a = clampArtwork(makeArt({ widthIn: 99, rotation: 725 }), zone);
    expect(a.widthIn).toBeLessThanOrEqual(zone.widthIn * 1.15 + 0.01);
    expect(a.rotation).toBeCloseTo(5, 5);
    const b = clampArtwork(makeArt({ widthIn: 0.1, cx: -3, cy: 7 }), zone);
    expect(b.widthIn).toBeGreaterThanOrEqual(0.75);
    expect(b.cx).toBeGreaterThanOrEqual(0.02);
    expect(b.cy).toBeLessThanOrEqual(0.98);
  });
  it("corner math: unrotated corners span the printed size", () => {
    const art = makeArt({ cx: 0.5, cy: 0.5, widthIn: 8, rotation: 0 });
    const corners = artworkCornersIn(art, zone);
    const xs = corners.map((c) => c.x);
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(8, 3);
  });
  it("detects artwork leaving the print zone (and rotation can cause it)", () => {
    expect(isOutOfZone(makeArt({ widthIn: 6, cx: 0.5, cy: 0.5 }), zone)).toBe(false);
    expect(isOutOfZone(makeArt({ widthIn: 6, cx: 0.02 }), zone)).toBe(true);
    expect(isOutOfZone(makeArt({ widthIn: zone.widthIn, cy: 0.5, rotation: 0 }), zone)).toBe(false);
    expect(isOutOfZone(makeArt({ widthIn: zone.widthIn, cy: 0.5, rotation: 30 }), zone)).toBe(true);
  });
});

describe("print-quality estimate", () => {
  it("computes DPI from natural pixels and printed width", () => {
    expect(estimatedDpi(makeArt({ naturalW: 1600, widthIn: 8 }))).toBe(200);
  });
  it("classifies good / soft / low around the 150 and 100 DPI thresholds", () => {
    expect(qualityLevel(makeArt({ naturalW: 1600, widthIn: 8 }))).toBe("good"); // 200
    expect(qualityLevel(makeArt({ naturalW: 960, widthIn: 8 }))).toBe("soft"); // 120
    expect(qualityLevel(makeArt({ naturalW: 640, widthIn: 8 }))).toBe("low"); // 80
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
    const s = { ...emptySizes(), S: 5, M: 10, L: 10, XL: 5 };
    expect(sizeTotal(s)).toBe(30);
  });
  it("flags an under-allocated breakdown with the exact remainder", () => {
    const st = initialState();
    st.details.quantity = "30";
    st.details.sizes = { ...emptySizes(), S: 5, M: 10, L: 10 };
    const issue = sizeIssue(st.details)!;
    expect(issue.level).toBe("error");
    expect(issue.message).toContain("totals 25");
    expect(issue.message).toContain("30");
    expect(issue.message).toContain("remaining 5");
  });
  it("flags over-allocation and passes exact matches", () => {
    const st = initialState();
    st.details.quantity = "30";
    st.details.sizes = { ...emptySizes(), M: 35 };
    expect(sizeIssue(st.details)!.level).toBe("error");
    st.details.sizes = { ...emptySizes(), M: 30 };
    expect(sizeIssue(st.details)).toBeNull();
  });
  it("downgrades to a note when custom sizes cover the gap", () => {
    const st = initialState();
    st.details.quantity = "30";
    st.details.sizes = { ...emptySizes(), M: 25 };
    st.details.otherSizes = "3XL — 5";
    expect(sizeIssue(st.details)!.level).toBe("note");
  });
});

describe("submission validation", () => {
  it("requires artwork, quantity, name and a contact route", () => {
    const st = initialState();
    const fields = validateForSubmit(st).map((i) => i.field);
    expect(fields).toContain("artwork");
    expect(fields).toContain("quantity");
    expect(fields).toContain("name");
    expect(fields).toContain("phone");
  });
  it("passes a complete design", () => {
    const st = initialState();
    st.artworks.front = makeArt();
    st.details.quantity = "30";
    st.details.sizes = { ...emptySizes(), M: 30 };
    st.details.name = "Amzat";
    st.details.phone = "+2348000000000";
    expect(validateForSubmit(st)).toHaveLength(0);
  });
});

describe("enquiry summary & spec", () => {
  function completeState() {
    const st = initialState();
    st.artworks.front = makeArt();
    st.details.quantity = "30";
    st.details.sizes = { ...emptySizes(), S: 5, M: 10, L: 10, XL: 5 };
    st.details.name = "Amzat Karim";
    st.details.phone = "+44 7000 000000";
    st.details.deadline = "15 August";
    st.color = { id: "custom", name: "Mint", hex: "#7fd1c0", status: "confirm", custom: true };
    return st;
  }
  it("formats the sizes line like the order sheet", () => {
    expect(sizesLine(completeState())).toBe("S ×5, M ×10, L ×10, XL ×5");
  });
  it("summarises which sides carry a design", () => {
    const st = completeState();
    expect(designSidesLine(st)).toBe("Front only");
    st.artworks.back = makeArt({ fileName: "back.png" });
    expect(designSidesLine(st)).toBe("Front and back");
    delete st.artworks.front;
    expect(designSidesLine(st)).toBe("Back only");
  });
  it("tells the team what to confirm and what the shared file contains", () => {
    const msg = buildStudioMessage(completeState());
    expect(msg).toContain("*Design:* Front only");
    expect(msg).toContain("shared reference file contains the complete front and back design");
    expect(msg).toContain("final artwork size and placement, printing method, price and production time");
  });
  it("builds a structured WhatsApp message with the availability warning", () => {
    const msg = buildStudioMessage(completeState());
    expect(msg).toContain("New Studio enquiry");
    expect(msg).toContain("*Reference:* TFN-DS-");
    expect(msg).toContain("Amzat Karim");
    expect(msg).toContain("availability to confirm"); // custom colour status
    expect(msg).toContain("visual references");
    expect(msg).toContain("depends on market sourcing");
    expect(msg).toContain("closest alternative");
    expect(msg).not.toContain("Email:"); // empty fields omitted
    expect(msg).not.toContain("base64"); // never embeds image data
  });
  it("carries the fabric choice with its availability label everywhere", () => {
    const st = completeState();
    st.details.fabricId = "fleece";
    expect(fabricLine(st)).toBe("Fleece (heavy weight) — availability to confirm, confirmed by the team");
    const msg = buildStudioMessage(st);
    expect(msg).toContain("*Fabric:* Fleece");
    const rows = summaryRows(st);
    const fabricRow = rows.find((r) => r.label === "Fabric")!;
    expect(fabricRow.step).toBe(1);
    expect(fabricRow.value).toContain("Fleece");
    const spec = buildDesignSpec(st) as { fabric: { name: string; availability?: string }; availabilityNotice: string };
    expect(spec.fabric.name).toBe("Fleece");
    expect(spec.fabric.availability).toBe("Availability to confirm");
    expect(spec.availabilityNotice).toContain("closest available alternative");
  });
  it("defaults to team advice when no fabric is picked", () => {
    const st = completeState();
    expect(st.details.fabricId).toBe("");
    expect(fabricLine(st)).toBe("");
    expect(buildStudioMessage(st)).toContain("*Fabric:* No preference — please advise");
    expect(summaryRows(st).find((r) => r.label === "Fabric")!.value).toContain("team will advise");
  });
  it("summary rows tag the step that edits them", () => {
    const rows = summaryRows(completeState());
    expect(rows.find((r) => r.label === "Product")!.step).toBe(0);
    expect(rows.find((r) => r.label === "Garment colour")!.step).toBe(1);
  });
  it("design spec is marked prototype and only embeds artwork when asked", () => {
    const spec = buildDesignSpec(completeState()) as {
      prototype: boolean;
      artworks: { front?: { originalDataUrl?: string; estimatedDpi: number } };
      color: { notice?: string };
    };
    expect(spec.prototype).toBe(true);
    expect(spec.color.notice).toBeTruthy();
    expect(spec.artworks.front!.originalDataUrl).toBeUndefined();
    const full = buildDesignSpec(completeState(), true) as typeof spec;
    expect(full.artworks.front!.originalDataUrl).toBeTruthy();
  });
});

describe("upload safety prechecks", () => {
  it("rejects empty, oversized and wrong-type files with readable errors", () => {
    expect(precheckFile({ name: "a.png", size: 0, type: "image/png" })).toMatch(/empty/i);
    expect(precheckFile({ name: "a.svg", size: 100, type: "image/svg+xml" })).toMatch(/PNG or JPEG/);
    expect(
      precheckFile({ name: "a.png", size: UPLOAD_LIMITS.maxBytes + 1, type: "image/png" }),
    ).toMatch(/larger than/);
    expect(precheckFile({ name: "a.png", size: 5000, type: "image/png" })).toBeNull();
  });
  it("rejects absurd dimensions in both directions", () => {
    expect(checkDimensions(10, 10)).toMatch(/too small/i);
    expect(checkDimensions(20000, 500)).toMatch(/unusually large/i);
    expect(checkDimensions(2000, 1500)).toBeNull();
  });
});

describe("photoreal colour pipeline", () => {
  it("computes hex luminance correctly", async () => {
    const { hexLuma } = await import("../garment");
    expect(hexLuma("#ffffff")).toBeCloseTo(1, 2);
    expect(hexLuma("#000000")).toBeCloseTo(0, 2);
    expect(hexLuma("not-a-hex")).toBe(0.5);
  });
  it("converts hex to RGB for the production reference", async () => {
    const { hexToRgb } = await import("../garment");
    expect(hexToRgb("#a425a4")).toEqual({ r: 164, g: 37, b: 164 });
    expect(hexToRgb("#FFFFFF")).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb("nope")).toBeNull();
  });
  it("gives dark shirts a stronger highlight pass than light shirts", async () => {
    const { layerTuning } = await import("../garment");
    const black = layerTuning("#211f1e");
    const white = layerTuning("#f4f2ee");
    expect(black.lightOpacity).toBeGreaterThan(white.lightOpacity);
    expect(black.shadeBrightness).toBeGreaterThan(1); // luma-normalised fabric
  });
  it("every product has garment images and a measured per-garment fabric luma", async () => {
    const { GARMENT_IMG, FABRIC_LUMA, layerTuning } = await import("../garment");
    for (const p of PRODUCTS) {
      expect(GARMENT_IMG[p.id]?.front).toMatch(/\.webp$/);
      expect(GARMENT_IMG[p.id]?.back).toMatch(/\.webp$/);
      expect(FABRIC_LUMA[p.id]).toBeGreaterThan(0.3);
      expect(FABRIC_LUMA[p.id]).toBeLessThan(0.7);
    }
    // per-garment normalisation actually uses the measured luma
    const polo = layerTuning("#f4f2ee", "polo");
    expect(polo.shadeBrightness).toBeCloseTo(1 / FABRIC_LUMA["polo"], 2);
    // unknown products fall back to the default constant
    const fallback = layerTuning("#f4f2ee", "unknown-product");
    expect(fallback.shadeBrightness).toBeCloseTo(1 / 0.505, 2);
  });
});

describe("fit to print area", () => {
  it("centres and shrinks an oversized rotated artwork until it fits", async () => {
    const { fitArtworkToZone, isOutOfZone } = await import("../state");
    const art = makeArt({ widthIn: zone.widthIn * 1.1, rotation: 30, cx: 0.1, cy: 0.9 });
    expect(isOutOfZone(art, zone)).toBe(true);
    const fixed = fitArtworkToZone(art, zone);
    expect(isOutOfZone(fixed, zone)).toBe(false);
    expect(fixed.cx).toBe(0.5);
    expect(fixed.rotation).toBeCloseTo(30, 5); // rotation preserved
  });
});

describe("references", () => {
  it("generates readable unique-ish references", () => {
    expect(makeReference(1720000000000)).toMatch(/^TFN-DS-[A-Z0-9]{6}$/);
    expect(makeReference(1720000000000)).not.toBe(makeReference(1720099999999));
  });
});
