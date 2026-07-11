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

/** Detect any transparency by sampling the decoded image on a small canvas. */
function detectAlpha(img: HTMLImageElement, isPng: boolean): boolean {
  if (!isPng) return false;
  try {
    const c = document.createElement("canvas");
    const s = 48;
    c.width = s;
    c.height = s;
    const ctx = c.getContext("2d");
    if (!ctx) return isPng;
    ctx.drawImage(img, 0, 0, s, s);
    const data = ctx.getImageData(0, 0, s, s).data;
    for (let i = 3; i < data.length; i += 4) if (data[i] < 250) return true;
    return false;
  } catch {
    return isPng;
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
          hasAlpha: detectAlpha(img, file.type === "image/png"),
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}
