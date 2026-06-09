import { ASSETS } from "./assets";

export type Condition = "New" | "Used" | "Consignment";
export type Availability = "in-store" | "low" | "request";
export type Silhouette = "low" | "runner" | "high" | "court" | "clog";
export type Category = "Sneakers" | "Accessories";

export type Product = {
  id: string;
  brand: string;
  model: string;
  colorway: string;
  category: Category;
  condition: Condition;
  silhouette: Silhouette;
  sizes: string[];
  soldOut?: string[];
  image: string | null;
  availability: Availability;
  tag?: string;
  featured?: boolean;
  origin?: string;
  /** "whatsapp" → "On request"; "fixed" → show `price`; "hidden" → no price shown. */
  priceMode?: "whatsapp" | "fixed" | "hidden";
  price?: number;
};

const ukRange = (from: number, to: number): string[] => {
  const out: string[] = [];
  for (let n = from; n <= to; n += 1) out.push(`UK ${n}`);
  return out;
};

/**
 * Seed inventory — editable placeholders from PROMPT_FOR_CLAUDE.md.
 * No prices are invented; the UI shows "Price on WhatsApp" until LSC confirms
 * real stock and pricing. Product photography is pending (see DESIGN.md) so
 * branded models render as editorial silhouette tiles; Lavcore uses its real shot.
 */
export const PRODUCTS: Product[] = [
  {
    id: "nike-dunk-low-panda",
    brand: "Nike",
    model: "Dunk Low Retro",
    colorway: "Panda — Black/White",
    category: "Sneakers",
    condition: "New",
    silhouette: "low",
    sizes: ukRange(7, 11),
    soldOut: ["UK 11"],
    image: null,
    availability: "in-store",
    tag: "New drop",
    featured: true,
  },
  {
    id: "nb-550-white-green",
    brand: "New Balance",
    model: "550",
    colorway: "White / Green",
    category: "Sneakers",
    condition: "New",
    silhouette: "court",
    sizes: ukRange(6, 10),
    image: null,
    availability: "in-store",
    tag: "Restock",
  },
  {
    id: "adidas-campus-00s",
    brand: "Adidas",
    model: "Campus 00s",
    colorway: "Green / Cloud White",
    category: "Sneakers",
    condition: "New",
    silhouette: "court",
    sizes: ukRange(7, 12),
    image: null,
    availability: "in-store",
    tag: "New drop",
    featured: true,
  },
  {
    id: "asics-gel-kayano-14",
    brand: "Asics",
    model: "Gel-Kayano 14",
    colorway: "Cream / Black",
    category: "Sneakers",
    condition: "New",
    silhouette: "runner",
    sizes: ukRange(6, 11),
    soldOut: ["UK 6", "UK 7"],
    image: null,
    availability: "low",
    tag: "Last pairs",
  },
  {
    id: "nike-air-max-1-wheat",
    brand: "Nike",
    model: "Air Max 1 '87",
    colorway: "Wheat",
    category: "Sneakers",
    condition: "Consignment",
    silhouette: "runner",
    sizes: ukRange(7, 10),
    image: null,
    availability: "request",
    tag: "Consignment",
  },
  {
    id: "converse-chuck-70-black",
    brand: "Converse",
    model: "Chuck 70 Hi",
    colorway: "Black",
    category: "Sneakers",
    condition: "New",
    silhouette: "high",
    sizes: ukRange(6, 12),
    image: null,
    availability: "in-store",
  },
  {
    id: "nb-2002r-protection-grey",
    brand: "New Balance",
    model: "2002R Protection Pack",
    colorway: "Rain Cloud / Grey",
    category: "Sneakers",
    condition: "Consignment",
    silhouette: "runner",
    sizes: ukRange(8, 11),
    image: null,
    availability: "request",
    tag: "Consignment",
  },
  {
    id: "nike-air-force-1-white",
    brand: "Nike",
    model: "Air Force 1 '07",
    colorway: "Triple White",
    category: "Sneakers",
    condition: "New",
    silhouette: "low",
    sizes: ukRange(6, 12),
    image: null,
    availability: "in-store",
    tag: "Core",
    featured: true,
  },
  {
    id: "lavcore-denim-crocs",
    brand: "Lavcore",
    model: "Denim Clog",
    colorway: "Washed Indigo",
    category: "Sneakers",
    condition: "New",
    silhouette: "clog",
    sizes: ukRange(6, 11),
    image: ASSETS.products.lavcore,
    availability: "in-store",
    tag: "Made in Lagos",
    featured: true,
    origin: "Nigerian-made · custom",
  },
];

export const productName = (p: Product) => `${p.model} ${p.colorway}`;

export const availabilityLabel: Record<Availability, string> = {
  "in-store": "Available in store",
  low: "Low stock",
  request: "By request",
};

/** Compact labels for tight product-card layouts. */
export const availabilityShort: Record<Availability, string> = {
  "in-store": "In store",
  low: "Low stock",
  request: "By request",
};

export const BRANDS = ["Nike", "New Balance", "Adidas", "Asics", "Converse", "Lavcore"];
export const CONDITIONS: Condition[] = ["New", "Used", "Consignment"];
export const SIZES = ukRange(6, 12);
export const AVAILABILITIES: Availability[] = ["in-store", "low", "request"];

export const featuredProducts = PRODUCTS.filter((p) => p.featured);
