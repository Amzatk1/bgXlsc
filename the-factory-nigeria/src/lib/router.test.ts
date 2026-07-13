import { describe, expect, it } from "vitest";
import { resolvePath } from "./router";

describe("hash route resolution", () => {
  it("resolves public routes and ignores query values", () => {
    expect(resolvePath("#/studio")).toBe("/studio");
    expect(resolvePath("#/start-an-order?service=Printing")).toBe("/start-an-order");
  });

  it("keeps the old Studio link working", () => {
    expect(resolvePath("#/experiments/custom-tee-studio")).toBe("/studio");
  });

  it("sends unknown application routes to the not-found page", () => {
    expect(resolvePath("#/missing-page")).toBe("/404");
  });

  it("treats native in-page anchors as home on a fresh load", () => {
    expect(resolvePath("#main")).toBe("/");
  });
});
