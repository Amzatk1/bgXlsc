// =====================================================================
// STUDIO — design persistence (pure, framework-free, unit-tested)
//
// Serialises a DesignState to a plain JSON-safe object and back, with strict
// validation on the way in (a saved file or on-device copy is untrusted). Used
// by BOTH the on-device auto-save (deviceStore.ts, IndexedDB) and the "save /
// load design file" (.json) feature. Everything stays on the customer's own
// device — nothing is ever uploaded.
// =====================================================================

import { PRODUCTS, STANDARD_COLORS, type ViewId } from "./catalog";
import {
  clamp,
  clampLayer,
  emptySizes,
  initialState,
  makeReference,
  SIZE_KEYS,
  type ColorChoice,
  type DesignState,
  type Layer,
  type OrderDetails,
  type SizeBreakdown,
} from "./state";

export const PERSIST_SCHEMA = 2;

export type SavedDesign = {
  schema: number;
  savedAt: number; // epoch ms
  app: "the-factory-studio";
  state: DesignState;
};

const isNum = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);
const isStr = (s: unknown): s is string => typeof s === "string";
const num = (n: unknown, fallback: number): number => (isNum(n) ? n : fallback);
const str = (s: unknown, fallback = ""): string => (isStr(s) ? s : fallback);

/** JSON-safe snapshot of the current design (deep-copied, no functions). */
export function serializeDesign(state: DesignState): SavedDesign {
  return {
    schema: PERSIST_SCHEMA,
    savedAt: Date.now(),
    app: "the-factory-studio",
    state: JSON.parse(JSON.stringify(state)) as DesignState,
  };
}

function validColor(c: unknown): ColorChoice {
  const o = (c ?? {}) as Record<string, unknown>;
  const hex = str(o.hex);
  if (/^#[0-9a-f]{6}$/i.test(hex) && isStr(o.name)) {
    const status = o.status === "confirm" ? "confirm" : "standard";
    return { id: str(o.id, "custom"), name: str(o.name, "Custom colour"), hex, status, ...(o.custom ? { custom: true } : {}) };
  }
  return { ...STANDARD_COLORS[0] };
}

function validLayer(raw: unknown): Layer | null {
  const o = (raw ?? {}) as Record<string, unknown>;
  const view: ViewId = o.view === "back" ? "back" : "front";
  const base = {
    id: str(o.id) || "L" + Math.random().toString(36).slice(2, 9),
    view,
    cx: clamp(num(o.cx, 0.5), 0, 1),
    cy: clamp(num(o.cy, 0.4), 0, 1),
    size: num(o.size, 0.3),
    rotation: num(o.rotation, 0),
    ...(o.name && isStr(o.name) ? { name: o.name } : {}),
    ...(o.hidden ? { hidden: true } : {}),
    ...(o.locked ? { locked: true } : {}),
  };
  if (o.kind === "image") {
    const src = str(o.src);
    if (!src || !isNum(o.naturalW) || !isNum(o.naturalH) || o.naturalW <= 0 || o.naturalH <= 0) return null;
    const pat = (o.pattern ?? null) as Record<string, unknown> | null;
    return clampLayer({
      ...base,
      kind: "image",
      src,
      fileName: str(o.fileName, "artwork.png"),
      fileKB: num(o.fileKB, 0),
      naturalW: o.naturalW,
      naturalH: o.naturalH,
      hasAlpha: !!o.hasAlpha,
      ...(isNum(o.avgLuma) ? { avgLuma: o.avgLuma } : {}),
      ...(o.generated ? { generated: true } : {}),
      ...(pat && isStr(pat.id)
        ? {
            pattern: {
              id: pat.id,
              base: /^#[0-9a-f]{6}$/i.test(str(pat.base)) ? str(pat.base) : "#232f45",
              secondary: /^#[0-9a-f]{6}$/i.test(str(pat.secondary)) ? str(pat.secondary) : "#f4f2ee",
              accent: /^#[0-9a-f]{6}$/i.test(str(pat.accent)) ? str(pat.accent) : "#a5252b",
            },
          }
        : {}),
    } as Layer);
  }
  if (o.kind === "text") {
    // Text is a block: allow newlines, cap total length and line count.
    const raw = str(o.text).slice(0, 160);
    const text = raw.split("\n").slice(0, 6).join("\n") || "TEXT";
    return clampLayer({
      ...base,
      kind: "text",
      role: o.role === "name" || o.role === "number" ? o.role : "text",
      text,
      fontId: str(o.fontId, "archivo"),
      color: /^#[0-9a-f]{6}$/i.test(str(o.color)) ? str(o.color) : "#ffffff",
      outline: /^#[0-9a-f]{6}$/i.test(str(o.outline)) ? str(o.outline) : "",
      outlineWidth: clamp(num(o.outlineWidth, 0), 0, 0.4),
      letterSpacing: clamp(num(o.letterSpacing, 0), -0.2, 0.6),
      lineHeight: clamp(num(o.lineHeight, 1.1), 0.7, 2.5),
      align: o.align === "left" || o.align === "right" ? o.align : "center",
      aspect: Math.max(0.15, num(o.aspect, 3)),
    } as Layer);
  }
  return null;
}

function validDetails(raw: unknown): OrderDetails {
  const o = (raw ?? {}) as Record<string, unknown>;
  const sizesRaw = (o.sizes ?? {}) as Record<string, unknown>;
  const sizes: SizeBreakdown = emptySizes();
  for (const k of SIZE_KEYS) sizes[k] = Math.max(0, Math.round(num(sizesRaw[k], 0)));
  return {
    quantity: str(o.quantity),
    sizes,
    otherSizes: str(o.otherSizes),
    sameDesign: o.sameDesign === "yes" ? "yes" : o.sameDesign === "no" ? "no" : "",
    method: str(o.method),
    fabricId: str(o.fabricId),
    deadline: str(o.deadline),
    deliveryLocation: str(o.deliveryLocation),
    notes: str(o.notes),
    name: str(o.name),
    phone: str(o.phone),
    email: str(o.email),
  };
}

/** Validate an untrusted saved object back into a usable DesignState, or null. */
export function deserializeDesign(saved: unknown): DesignState | null {
  const s = (saved ?? {}) as Record<string, unknown>;
  const stateObj = (s.state ?? (s.layers ? s : null)) as Record<string, unknown> | null;
  if (!stateObj || typeof stateObj !== "object") return null;

  const base = initialState();
  // Designs saved before the T-shirt was split into its two real production
  // options carry the old id. Map them onto the ready-made tee (the closest
  // match to the old "standard" tee) rather than silently discarding the design.
  const LEGACY_PRODUCT_IDS: Record<string, string> = { "unisex-tee": "tee-readymade" };
  const rawProductId = str(stateObj.productId);
  const mappedId = LEGACY_PRODUCT_IDS[rawProductId] ?? rawProductId;
  const productId = PRODUCTS.some((p) => p.id === mappedId) ? mappedId : base.productId;
  const layers = Array.isArray(stateObj.layers)
    ? (stateObj.layers.map(validLayer).filter(Boolean) as Layer[])
    : [];
  const selectedId = layers.some((l) => l.id === stateObj.selectedId) ? (stateObj.selectedId as string) : null;

  return {
    productId,
    view: stateObj.view === "back" ? "back" : "front",
    color: validColor(stateObj.color),
    layers,
    selectedId,
    details: validDetails(stateObj.details),
    reference: str(stateObj.reference) || makeReference(),
  };
}

/** Is there anything worth saving? (avoids storing an empty session) */
export function isWorthSaving(state: DesignState): boolean {
  if (state.layers.length > 0) return true;
  const d = state.details;
  return !!(d.quantity || d.name || d.phone || d.email || d.notes || d.fabricId);
}
