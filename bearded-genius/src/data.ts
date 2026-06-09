export const BRAND = {
  name: "Bearded Genius",
  mark: "BG",
  tagline: "Rooted in culture. Crafted for the world.",
  instagram: "https://www.instagram.com/bearded_genius/",
  instagramHandle: "@bearded_genius",
  whatsapp: "2349099436487",
  whatsappDisplay: "+234 909 943 6487",
  phoneWordmark: "0909-9-GENIUS",
  origin: "Nigerian Made",
};

const A = "/assets/bearded-genius";

export const ASSETS = {
  logo: `
${A}/logo/profile-logo.jpg`.trim(),
  brandPoster: `
${A}/images/brand/rooted-in-culture.jpg`.trim(),
  culture: `
${A}/images/editorial/culture-lives-on.jpg`.trim(),
  customThreads: `
${A}/images/editorial/custom-threads.jpg`.trim(),
  afriJorts: `
${A}/images/products/afri-jorts.jpg`.trim(),
  shopSet: `
${A}/images/products/shop-now-set.jpg`.trim(),
  buttonUp: `
${A}/images/products/button-up.jpg`.trim(),
};

export type Product = {
  id: string;
  name: string;
  category: string;
  image: string;
  badge?: string;
  description: string;
  sizes: string[];
  color: string;
  status: "Available" | "Made to order" | "Limited";
};

export const PRODUCTS: Product[] = [
  {
    id: "afri-jorts",
    name: "AFRI JORTS",
    category: "Shorts",
    image: ASSETS.afriJorts,
    badge: "Signature floral print",
    description: "Relaxed silhouette, bold palette and premium construction designed to turn everyday wear into a statement.",
    sizes: ["S", "M", "L", "XL"],
    color: "Floral / Multi",
    status: "Available",
  },
  {
    id: "button-up",
    name: "BG Button-Up",
    category: "Shirt",
    image: ASSETS.buttonUp,
    badge: "Lagos born",
    description: "A button-up with main-character energy: clean cut, expressive print and easy styling for day-to-night fits.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    color: "Printed",
    status: "Available",
  },
  {
    id: "custom-threads",
    name: "Custom Threads",
    category: "Custom",
    image: ASSETS.customThreads,
    badge: "Team / group orders",
    description: "Custom-made pieces for teams, clubs, creators and culture projects that need a distinctive uniform language.",
    sizes: ["By request"],
    color: "Custom",
    status: "Made to order",
  },
  {
    id: "statement-set",
    name: "Statement Set",
    category: "Set",
    image: ASSETS.shopSet,
    badge: "Shop now",
    description: "A styled Bearded Genius look built for standing out without over-explaining the outfit.",
    sizes: ["S", "M", "L", "XL"],
    color: "Seasonal",
    status: "Limited",
  },
];

export const GALLERY = [
  { src: ASSETS.brandPoster, label: "Rooted in culture", wide: true },
  { src: ASSETS.afriJorts, label: "AFRI JORTS" },
  { src: ASSETS.buttonUp, label: "Button-up" },
  { src: ASSETS.culture, label: "The culture lives on", wide: true },
  { src: ASSETS.customThreads, label: "Custom threads" },
  { src: ASSETS.shopSet, label: "Shop the look" },
];

export function waLink(message: string) {
  return `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(message)}`;
}
