// =====================================================================
// CUSTOM TEE STUDIO — safe, local-only artwork intake
//
// Privacy: files never leave the browser. We read them with FileReader,
// decode with an <img>, and keep a data URL in memory/session only.
// SVG is deliberately NOT accepted (script/foreignObject injection risk
// without a proper sanitiser) — documented in the prototype report.
// =====================================================================

import { UPLOAD_LIMITS } from "./catalog";

export type IntakeResult =
  | {
      ok: true;
      src: string;
      fileName: string;
      fileKB: number;
      naturalW: number;
      naturalH: number;
      hasAlpha: boolean;
      avgLuma: number;
      /** reads as photographic / gradient artwork rather than flat spot colours */
      manyColors: boolean;
    }
  | { ok: false; error: string };

/**
 * Distinct colours after quantising to 4 bits per channel, ignoring
 * near-transparent pixels. Pure and unit-testable.
 *
 * Why it exists: screen printing is priced and limited PER COLOUR, so a
 * photograph or a gradient — effectively unlimited colours — is a different
 * production conversation from a three-colour logo. Studio never blocks on
 * this and never claims a machine limit; it just steers the customer toward
 * "usually a digital method" wording and flags it for the team.
 */
export function countQuantizedColors(data: Uint8ClampedArray): number {
  const seen = new Set<number>();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] <= 16) continue; // ignore transparent pixels
    seen.add(((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4));
  }
  return seen.size;
}

/**
 * Above this many quantised colours (in a 48×48 sample) the artwork reads as
 * photographic. Deliberately high: a flat logo with anti-aliased edges lands
 * well under it, so the note appears only when it is genuinely informative.
 */
export const MANY_COLORS_THRESHOLD = 150;

/**
 * How many quantised colours it takes to cover 80% of the (opaque) pixels.
 *
 * This is the discriminator that actually separates artwork classes: a flat
 * spot-colour logo concentrates its pixel mass in a handful of buckets — its
 * core colours carry 80% comfortably even when up to a fifth of the pixels are
 * anti-aliased edge blends — while a gradient or a photograph never
 * concentrates that much anywhere and needs dozens or hundreds of buckets. A
 * raw distinct-colour count cannot tell them apart: a smooth gradient may only
 * touch ~50 buckets, the same ballpark as a heavily anti-aliased logo.
 *
 * (80%, not 90%: at 90% the tail of AA edge pixels starts counting and a
 * clean three-colour logo can score like a gradient.)
 *
 * Nuance that falls out for free: a single-hue fade (black → white) covers its
 * mass with ≤16 grey buckets and does NOT trip this — correctly, because a
 * monochrome fade prints as one screen with halftones, not "many colours".
 */
export function colorRichness(data: Uint8ClampedArray): number {
  const freq = new Map<number, number>();
  let total = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] <= 16) continue; // ignore transparent pixels
    const key = ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4);
    freq.set(key, (freq.get(key) ?? 0) + 1);
    total++;
  }
  if (!total) return 0;
  const counts = [...freq.values()].sort((a, b) => b - a);
  let covered = 0;
  let n = 0;
  for (const c of counts) {
    covered += c;
    n++;
    if (covered >= total * 0.8) break;
  }
  return n;
}

/**
 * Richness above this = multi-colour gradient / photographic artwork.
 *
 * Calibrated against real cases, not intuition: a genuine three-stop gradient
 * measures ~20 (its colours sit on a 1-D path through colour space, so even a
 * "smooth" blend concentrates into a couple of dozen buckets), a flat logo
 * measures 2–5, a monochrome fade ~13, and photographs measure in the
 * hundreds. 15 splits all four correctly — fades stay silent (they print as
 * one halftoned screen), true multi-colour blends do not.
 */
export const RICHNESS_THRESHOLD = 15;

/** Pure pre-checks, unit-testable without a DOM. */
export function precheckFile(file: { name: string; size: number; type: string }): string | null {
  if (!file || file.size === 0) return "That file looks empty. Please choose another image.";
  if (!UPLOAD_LIMITS.allowedTypes.includes(file.type)) {
    return "Please upload a PNG or JPEG image. (SVG and other formats aren't supported in this prototype.)";
  }
  if (file.size > UPLOAD_LIMITS.maxBytes) {
    const mb = Math.round(UPLOAD_LIMITS.maxBytes / 1024 / 1024);
    return `That file is larger than ${mb} MB. Please export a smaller version.`;
  }
  return null;
}

export function checkDimensions(w: number, h: number): string | null {
  if (w < UPLOAD_LIMITS.minPixels || h < UPLOAD_LIMITS.minPixels) {
    return "That image is too small to work with. Please upload a larger version.";
  }
  if (w > UPLOAD_LIMITS.maxPixels || h > UPLOAD_LIMITS.maxPixels) {
    return "That image is unusually large. Please export it under 12,000px on each side.";
  }
  return null;
}

function sanitiseName(name: string): string {
  const clean = name.replace(/[^\w.\- ]+/g, "").trim();
  return clean.length > 60 ? clean.slice(0, 57) + "…" : clean || "artwork";
}

/** Sample the decoded image: transparency, average tone, and colour richness. */
function analyzeImage(
  img: HTMLImageElement,
  isPng: boolean,
): { hasAlpha: boolean; avgLuma: number; manyColors: boolean } {
  try {
    const c = document.createElement("canvas");
    const s = 48;
    c.width = s;
    c.height = s;
    const ctx = c.getContext("2d");
    if (!ctx) return { hasAlpha: isPng, avgLuma: 0.5, manyColors: false };
    ctx.drawImage(img, 0, 0, s, s);
    const data = ctx.getImageData(0, 0, s, s).data;
    let hasAlpha = false;
    let sum = 0;
    let n = 0;
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a < 250) hasAlpha = true;
      if (a > 16) {
        sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        n++;
      }
    }
    return {
      hasAlpha: isPng && hasAlpha,
      avgLuma: n ? sum / n / 255 : 0.5,
      // richness catches gradients AND photos; the raw count is a cheap backstop
      manyColors: colorRichness(data) > RICHNESS_THRESHOLD || countQuantizedColors(data) > MANY_COLORS_THRESHOLD,
    };
  } catch {
    return { hasAlpha: isPng, avgLuma: 0.5, manyColors: false };
  }
}

export function intakeFile(file: File): Promise<IntakeResult> {
  return new Promise((resolve) => {
    const pre = precheckFile(file);
    if (pre) return resolve({ ok: false, error: pre });

    const reader = new FileReader();
    reader.onerror = () => resolve({ ok: false, error: "We couldn't read that file. Please try another image." });
    reader.onload = () => {
      const src = String(reader.result || "");
      const img = new Image();
      img.onerror = () =>
        resolve({ ok: false, error: "That image couldn't be opened — it may be corrupt. Please try another file." });
      img.onload = () => {
        const dim = checkDimensions(img.naturalWidth, img.naturalHeight);
        if (dim) return resolve({ ok: false, error: dim });
        resolve({
          ok: true,
          src,
          fileName: sanitiseName(file.name),
          fileKB: Math.max(1, Math.round(file.size / 1024)),
          naturalW: img.naturalWidth,
          naturalH: img.naturalHeight,
          ...analyzeImage(img, file.type === "image/png"),
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}
