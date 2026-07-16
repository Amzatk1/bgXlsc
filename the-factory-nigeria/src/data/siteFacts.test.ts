// =====================================================================
// Truth-consistency guards. These tests exist so an unresolved business
// assumption can never quietly become a customer-facing fact again.
// The internal question list lives in docs/experiments/FACTORY_QUESTIONS.md
// and src/studio/factoryFacts.ts; this file guards the PUBLIC copy.
// =====================================================================
import { describe, expect, it } from "vitest";
import {
  ARTWORK_WORDING,
  METHOD_EXAMPLES,
  METHOD_FAQ_ANSWER,
  METHOD_WORDING,
  MOQ_GENERAL,
  MOQ_VS_STUDIO,
  PRODUCTION_WORDING,
  QUALITY_WORDING,
} from "./siteFacts";
import { FAQS } from "./faq";
import { SERVICES } from "./services";
import { STEPS } from "./process";
import { BRAND } from "./brand";

describe("site truth consistency", () => {
  it("decoration methods are review-first examples, never an equipment list", () => {
    // the wording must put the team's review BEFORE any method name
    expect(METHOD_FAQ_ANSWER.indexOf("team confirms")).toBeGreaterThan(-1);
    expect(METHOD_FAQ_ANSWER.indexOf("team confirms")).toBeLessThan(METHOD_FAQ_ANSWER.indexOf("screen printing"));
    expect(METHOD_WORDING).toMatch(/recommends|confirms/);
    // examples exist so the site stays helpful, not vague
    expect(METHOD_EXAMPLES.length).toBeGreaterThanOrEqual(3);
  });

  it("the FAQ print-method answer IS the shared fact (no drift possible)", () => {
    const faq = FAQS.find((f) => /print methods/i.test(f.q))!;
    expect(faq.a).toBe(METHOD_FAQ_ANSWER);
  });

  it("the printing service names methods only as team recommendations", () => {
    const printing = SERVICES.find((s) => s.id === "printing")!;
    expect(printing.what).toMatch(/team recommends/);
    expect(printing.what).toMatch(/confirms it with you/);
    // it must not open with an unconditional "We'll suggest the best method:" list
    expect(printing.what).not.toMatch(/We.ll suggest the best method:/);
  });

  it('no public step or page data claims "every stage happens on our floor"', () => {
    for (const s of STEPS) {
      expect(s.detail, s.title).not.toMatch(/our floor/i);
    }
    expect(PRODUCTION_WORDING).not.toMatch(/every stage/i);
    expect(PRODUCTION_WORDING).toMatch(/team confirms/);
  });

  it("quality language describes a practice, not a categorical guarantee", () => {
    expect(QUALITY_WORDING).toMatch(/team reviews/);
    expect(QUALITY_WORDING).not.toMatch(/^Every/);
  });

  it("artwork guidance is help, not an acceptance rule", () => {
    expect(ARTWORK_WORDING).toMatch(/send whatever you have/i);
    expect(ARTWORK_WORDING).not.toMatch(/must|required|only accept/i);
  });

  it("keeps the two enquiry lanes distinct and consistent", () => {
    expect(MOQ_GENERAL).toBe(30);
    expect(MOQ_VS_STUDIO).toContain("30 pieces");
    expect(MOQ_VS_STUDIO).toContain("one item");
    expect(MOQ_VS_STUDIO).toMatch(/confirms/);
    // the FAQ says the same thing
    const moqFaq = FAQS.find((f) => /minimum order/i.test(f.q))!;
    expect(moqFaq.a).toContain(String(MOQ_GENERAL));
    const studioFaq = FAQS.find((f) => /Studio the same/i.test(f.q))!;
    expect(studioFaq.a).toMatch(/one item/);
    // and the brand kit agrees
    expect(BRAND.bioMoq).toContain("30");
  });
});
