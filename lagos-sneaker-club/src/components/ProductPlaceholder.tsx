import type { Product } from "../data/products";
import { SoleArc } from "./Icons";

const COLOR_MAP: Record<string, string> = {
  black: "#141417",
  panda: "#141417",
  white: "#f4f4f2",
  triple: "#f4f4f2",
  cream: "#ece2cf",
  cloud: "#e7e8ea",
  green: "#3f6b45",
  grey: "#8c8c92",
  gray: "#8c8c92",
  rain: "#9aa3ad",
  wheat: "#d8b577",
  indigo: "#3a4a73",
  washed: "#7d93b8",
  blue: "#3a4a73",
};

function swatches(colorway: string): string[] {
  const words = colorway.toLowerCase().replace(/[^a-z ]/g, " ").split(/\s+/);
  const out: string[] = [];
  for (const w of words) {
    const hex = COLOR_MAP[w];
    if (hex && !out.includes(hex)) out.push(hex);
  }
  return out.length ? out.slice(0, 3) : ["#f4f4f2"];
}

/** Editorial stand-in for products awaiting studio photography. */
export function ProductPlaceholder({ product }: { product: Product }) {
  return (
    <div className="ph" aria-hidden="true">
      <div className="ph__watermark">
        <span>{product.brand}</span>
      </div>
      <SoleArc className="ph__arc" />
      <span className="ph__label">{product.brand}</span>
      <div className="ph__foot">
        <span className="ph__sw">
          {swatches(product.colorway).map((c, i) => (
            <i key={i} style={{ background: c }} />
          ))}
        </span>
        <span className="ph__cw">{product.model}</span>
      </div>
    </div>
  );
}
