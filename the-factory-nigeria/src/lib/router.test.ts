import { describe, expect, it } from "vitest";
import { getHashQueryValue, resolvePath } from "./router";

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

  it("reads service values when only the hash query changes", () => {
    expect(getHashQueryValue("#/start-an-order?service=Printing%20services", "service")).toBe(
      "Printing services",
    );
    expect(getHashQueryValue("#/start-an-order?service=Custom%20aso-ebi", "service")).toBe(
      "Custom aso-ebi",
    );
  });
});
