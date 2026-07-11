import { describe, expect, it } from "vitest";
import { PLACEMENTS, PRODUCTS, STANDARD_COLORS, UPLOAD_LIMITS } from "../catalog";
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
import { buildDesignSpec, buildStudioMessage, sizesLine, summaryRows } from "../messages";
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
        expect(p.zones[v].widthIn).toBeGreaterThan(6);
        expect(p.zones[v].heightIn).toBeGreaterThan(10);
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
    expect(sizesLine(completeState())).toBe("S — 5, M — 10, L — 10, XL — 5");
  });
  it("builds a structured WhatsApp message with the confirmation warning", () => {
    const msg = buildStudioMessage(completeState());
    expect(msg).toContain("New custom T-shirt enquiry");
    expect(msg).toContain("*Reference:* TFN-DS-");
    expect(msg).toContain("Amzat Karim");
    expect(msg).toContain("requires confirmation");
    expect(msg).toContain("confirm fabric availability");
    expect(msg).not.toContain("Email:"); // empty fields omitted
    expect(msg).not.toContain("base64"); // never embeds image data
  });
  it("summary rows tag the step that edits them", () => {
    const rows = summaryRows(completeState());
    expect(rows.find((r) => r.label === "Product")!.step).toBe(0);
    expect(rows.find((r) => r.label === "Shirt colour")!.step).toBe(1);
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
  it("gives dark shirts a stronger highlight pass than light shirts", async () => {
    const { layerTuning } = await import("../garment");
    const black = layerTuning("#211f1e");
    const white = layerTuning("#f4f2ee");
    expect(black.lightOpacity).toBeGreaterThan(white.lightOpacity);
    expect(black.shadeBrightness).toBeGreaterThan(1); // luma-normalised fabric
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
