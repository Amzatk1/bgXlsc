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
    }
  | { ok: false; error: string };

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

/** Sample the decoded image: transparency + average tone (for contrast checks). */
function analyzeImage(img: HTMLImageElement, isPng: boolean): { hasAlpha: boolean; avgLuma: number } {
  try {
    const c = document.createElement("canvas");
    const s = 48;
    c.width = s;
    c.height = s;
    const ctx = c.getContext("2d");
    if (!ctx) return { hasAlpha: isPng, avgLuma: 0.5 };
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
    return { hasAlpha: isPng && hasAlpha, avgLuma: n ? sum / n / 255 : 0.5 };
  } catch {
    return { hasAlpha: isPng, avgLuma: 0.5 };
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
