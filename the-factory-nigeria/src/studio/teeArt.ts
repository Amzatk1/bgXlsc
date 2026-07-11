// =====================================================================
// CUSTOM TEE STUDIO — original garment artwork (no third-party mockups)
//
// A flat-lay T-shirt drawn as SVG, tinted by fill colour. Shading and
// seams are semi-transparent overlays so they read on light AND dark
// fabrics. The same markup feeds the on-screen stage (React) and the
// canvas exporter (serialised SVG), so previews always match.
// =====================================================================

import type { PrintZone, ViewId } from "./catalog";

export const STAGE_W = 600;
export const STAGE_H = 700;

type Cut = "regular" | "oversized";

const SILHOUETTE: Record<Cut, string> = {
  regular:
    "M218,124 C246,113 354,113 382,124 L432,140 C471,157 503,196 522,238 " +
    "C512,254 490,268 468,278 C448,287 434,272 424,258 " +
    "C425,290 428,420 428,628 C428,636 424,640 416,641 " +
    "C340,650 260,650 184,641 C176,640 172,636 172,628 " +
    "C172,420 175,290 176,258 C166,272 152,287 132,278 " +
    "C110,268 88,254 78,238 C97,196 129,157 168,140 Z",
  oversized:
    "M206,128 C240,116 360,116 394,128 L450,146 C492,164 524,204 542,246 " +
    "C530,262 506,276 482,286 C460,295 446,280 438,264 " +
    "C439,300 440,430 440,630 C440,638 436,642 428,643 " +
    "C344,652 256,652 172,643 C164,642 160,638 160,630 " +
    "C160,430 161,300 162,264 C154,280 140,295 118,286 " +
    "C94,276 70,262 58,246 C76,204 108,164 150,146 Z",
};

// Sleeve-cuff seam pairs [left, right] per cut
const CUFF_SEAMS: Record<Cut, [string, string]> = {
  regular: ["M122,244 C138,262 156,272 172,278", "M478,244 C462,262 444,272 428,278"],
  oversized: ["M104,252 C122,270 142,281 160,287", "M496,252 C478,270 458,281 440,287"],
};

const HEM_SEAM: Record<Cut, string> = {
  regular: "M182,630 C260,640 340,640 418,630",
  oversized: "M170,632 C256,642 344,642 430,632",
};

// Neck opening (lens shape) + collar curve per view
const NECK: Record<Cut, Record<ViewId, { hole: string; rib: string }>> = {
  regular: {
    front: {
      hole: "M236,124 C262,172 338,172 364,124 C338,142 262,142 236,124 Z",
      rib: "M236,124 C262,172 338,172 364,124",
    },
    back: {
      hole: "M238,123 C266,143 334,143 362,123 C334,133 266,133 238,123 Z",
      rib: "M238,123 C266,143 334,143 362,123",
    },
  },
  oversized: {
    front: {
      hole: "M226,128 C254,178 346,178 374,128 C346,147 254,147 226,128 Z",
      rib: "M226,128 C254,178 346,178 374,128",
    },
    back: {
      hole: "M228,127 C258,148 342,148 372,127 C342,137 258,137 228,127 Z",
      rib: "M228,127 C258,148 342,148 372,127",
    },
  },
};

/** Inner SVG markup (defs + garment). Safe constant strings only. */
export function teeInnerMarkup(cut: Cut, view: ViewId, colorHex: string): string {
  const body = SILHOUETTE[cut];
  const [cuffL, cuffR] = CUFF_SEAMS[cut];
  const neck = NECK[cut][view];
  return `
  <defs>
    <linearGradient id="tee-sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.13"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="tee-shade-l" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#14110f" stop-opacity="0.11"/>
      <stop offset="1" stop-color="#14110f" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="tee-shade-r" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="#14110f" stop-opacity="0.11"/>
      <stop offset="1" stop-color="#14110f" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="tee-clip"><path d="${body}"/></clipPath>
  </defs>
  <ellipse cx="300" cy="664" rx="215" ry="15" fill="#14110f" opacity="0.08"/>
  <path d="${body}" fill="${colorHex}"/>
  <g clip-path="url(#tee-clip)">
    <rect x="60" y="110" width="480" height="120" fill="url(#tee-sheen)"/>
    <rect x="160" y="250" width="52" height="390" fill="url(#tee-shade-l)"/>
    <rect x="388" y="250" width="52" height="390" fill="url(#tee-shade-r)"/>
    <ellipse cx="176" cy="268" rx="26" ry="14" fill="#14110f" opacity="0.07"/>
    <ellipse cx="424" cy="268" rx="26" ry="14" fill="#14110f" opacity="0.07"/>
  </g>
  <path d="${body}" fill="none" stroke="#14110f" stroke-opacity="0.28" stroke-width="2.5"/>
  <path d="${cuffL}" fill="none" stroke="#14110f" stroke-opacity="0.20" stroke-width="2" stroke-dasharray="1 5" stroke-linecap="round"/>
  <path d="${cuffR}" fill="none" stroke="#14110f" stroke-opacity="0.20" stroke-width="2" stroke-dasharray="1 5" stroke-linecap="round"/>
  <path d="${HEM_SEAM[cut]}" fill="none" stroke="#14110f" stroke-opacity="0.18" stroke-width="2" stroke-dasharray="1 5" stroke-linecap="round"/>
  <path d="${HEM_SEAM[cut]}" fill="none" stroke="#ffffff" stroke-opacity="0.14" stroke-width="1" stroke-dasharray="1 5" stroke-linecap="round" transform="translate(0,2)"/>
  <path d="${neck.hole}" fill="#14110f" opacity="0.5"/>
  <path d="${neck.rib}" fill="none" stroke="#14110f" stroke-opacity="0.30" stroke-width="9"/>
  <path d="${neck.rib}" fill="none" stroke="#ffffff" stroke-opacity="0.16" stroke-width="5"/>
  <path d="${neck.rib}" fill="none" stroke="${colorHex}" stroke-width="3"/>`;
}

/** Full standalone SVG document string (for canvas export). */
export function teeSvgDocument(cut: Cut, view: ViewId, colorHex: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${STAGE_W} ${STAGE_H}" width="${STAGE_W * 2}" height="${STAGE_H * 2}">` +
    `<rect width="${STAGE_W}" height="${STAGE_H}" fill="#f7f3ec"/>` +
    teeInnerMarkup(cut, view, colorHex) +
    `</svg>`
  );
}

/** Convert stage coords ↔ print-zone inch space. */
export function pxPerInch(zone: PrintZone): number {
  return zone.w / zone.widthIn;
}
