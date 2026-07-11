// =====================================================================
// Media manifest — The Factory Nigeria.
//
// PRIMARY imagery is now the manager's professional photo shoot (37 Sony
// frames, optimised to responsive WebP/JPEG in /manager-supplied). The
// <Photo> component consumes `name` + `ratio` + focal `position`.
// Real Instagram videos are kept where motion adds value (Work, Process).
// =====================================================================

const BASE = "/assets/the-factory-nigeria";
const V = `${BASE}/videos`;
const P = `${BASE}/posters`;

// Official logo (replaces the old IG square). Secondary ecosystem mark too.
export const LOGO = `${BASE}/logo/the-factory-ng-logo.png`;
export const LOGO_BG = `${BASE}/logo/bearded-genius-logo.png`;

export type Fit = "cover" | "contain" | "scale-down";

// ---------------------------------------------------------------------
// VIDEO (real IG motion, muted autoplay + poster fallback)
// ---------------------------------------------------------------------
export type VideoItem = {
  id: string;
  src: string;
  poster: string;
  alt: string;
  label: string;
  ratio: "9x16" | "4x5" | "1x1" | "16x9";
  fit?: Fit;
  position?: string;
};

export const VIDEOS: Record<string, VideoItem> = {
  howToWork: {
    id: "how-to-work",
    src: `${V}/10-DYuVeerDa8q-here-s-exactly-how-to-work-with-the-factor.mp4`,
    poster: `${P}/10-DYuVeerDa8q-here-s-exactly-how-to-work-with-the-factor-poster.jpg`,
    alt: "Walkthrough of how to work with The Factory, from brief to finished order.",
    label: "How to work with us",
    ratio: "4x5",
    position: "center 22%",
  },
  craft: {
    id: "craft-pov",
    src: `${V}/27-DWTc7YGkxQc-how-we-craft-your-favorite-piece-pov.mp4`,
    poster: `${P}/27-DWTc7YGkxQc-how-we-craft-your-favorite-piece-pov-poster.jpg`,
    alt: "A sewing machine stitching fabric on the production floor.",
    label: "Sewing & craft",
    ratio: "9x16",
  },
  strongStitch: {
    id: "strong-stitch",
    src: `${V}/14-DXzAarQkRNA-strong-stitch-stronger-wear-the-best-cus.mp4`,
    poster: `${P}/14-DXzAarQkRNA-strong-stitch-stronger-wear-the-best-cus-poster.jpg`,
    alt: "Close detail of machine stitching — strong stitch, stronger wear.",
    label: "Stitch detail",
    ratio: "9x16",
  },
  print: {
    id: "print-finished",
    src: `${V}/16-DXofciljzwE-when-quality-finally-matches-your-vision.mp4`,
    poster: `${P}/16-DXofciljzwE-when-quality-finally-matches-your-vision-poster.jpg`,
    alt: "A finished printed tee — print quality matching the brief.",
    label: "Finished print",
    ratio: "9x16",
  },
  bulkBts: {
    id: "bulk-bts",
    src: `${V}/26-DWYq0_0j6pE-behind-the-scenes-take-a-look-bulk-orders.mp4`,
    poster: `${P}/26-DWYq0_0j6pE-behind-the-scenes-take-a-look-bulk-orders-poster.jpg`,
    alt: "A bulk order folded, stacked and packed for dispatch.",
    label: "Bulk orders",
    ratio: "9x16",
  },
  details: {
    id: "details",
    src: `${V}/12-DYNQZVnNBIm-built-in-the-details-texture-structure.mp4`,
    poster: `${P}/12-DYNQZVnNBIm-built-in-the-details-texture-structure-poster.jpg`,
    alt: "Texture and structure detail of a finished garment.",
    label: "Built in the details",
    ratio: "9x16",
  },
};

// ---------------------------------------------------------------------
// PROFESSIONAL PHOTOGRAPHY (manager shoot)
// ---------------------------------------------------------------------
export type PhotoCategory = "Production" | "Uniforms" | "Finished" | "Team";
export type PhotoItem = {
  name: string;
  alt: string;
  caption: string;
  category: PhotoCategory;
  ratio: string;
  position?: string;
};

// Hero — a real operator running the embroidery machines.
export const HERO_PHOTO = {
  name: "WWW01937",
  alt: "An operator running a multi-head embroidery machine on the floor at The Factory Nigeria, Ilupeju.",
  position: "center 34%",
};

// Production photo-essay (Home): design → sew → print → embroider → finish.
export type SeqItem = { name: string; step: string; label: string; alt: string; ratio: string; position?: string };
export const SEQUENCE: SeqItem[] = [
  { name: "WWW02081", step: "01", label: "Design & artwork", alt: "Preparing print-ready artwork at the design desk.", ratio: "4 / 3", position: "center" },
  { name: "WWW01972", step: "02", label: "Cut & sew", alt: "A garment being sewn on the production floor.", ratio: "4 / 5", position: "center 42%" },
  { name: "WWW01938", step: "03", label: "Print", alt: "Screen printing on the multi-station carousel press.", ratio: "4 / 3", position: "center 45%" },
  { name: "WWW01931", step: "04", label: "Embroidery / monogram", alt: "Embroidery and monogram work being stitched onto a garment.", ratio: "4 / 5", position: "center 45%" },
  { name: "WWW02028", step: "05", label: "Finish", alt: "A finished orange and navy workwear uniform.", ratio: "4 / 5", position: "center 42%" },
];

// Service-card art — the most accurate real photo per service.
export type ServiceImg = { name: string; alt: string; position?: string };
export const SERVICE_PHOTO: Record<string, ServiceImg> = {
  garment: { name: "WWW01972", alt: "Cut-and-sew production on the floor.", position: "center 42%" },
  printing: { name: "WWW01938", alt: "Screen printing on the carousel press.", position: "center 45%" },
  uniforms: { name: "WWW02028", alt: "A finished corporate workwear uniform.", position: "center 42%" },
  apparel: { name: "WWW02030", alt: "A finished custom-printed tee.", position: "center 32%" },
  merch: { name: "WWW02021", alt: "Finished garments on the showroom rack.", position: "center" },
  caps: { name: "WWW02024", alt: "Fitting a custom workwear jacket on the form.", position: "center 28%" },
  // aso-ebi fabric at the sewing machine
  asoebi: { name: "WWW02018", alt: "Aso-ebi fabric being sewn on the production floor.", position: "center 42%" },
};

// Process journey (Process page) — a photo per step.
export type ProcessPhoto = { n: string; title: string; name: string; alt: string; position?: string };
export const PROCESS_PHOTOS: ProcessPhoto[] = [
  { n: "01", title: "Brief & quote", name: "WWW02040", alt: "Reviewing a design proof for a client order.", position: "center 22%" },
  { n: "02", title: "Design & artwork", name: "WWW02081", alt: "Preparing print-ready artwork at the design desk.", position: "center" },
  { n: "03", title: "Materials & prep", name: "WWW02018", alt: "Thread and materials staged for a production run.", position: "center 40%" },
  { n: "04", title: "Print, sew & embroider", name: "WWW01938", alt: "Production underway on the print carousel.", position: "center 45%" },
  { n: "05", title: "Quality check", name: "WWW01980", alt: "Finishing and checking garments before dispatch.", position: "center 40%" },
  { n: "06", title: "Finished & collection", name: "WWW02021", alt: "Finished garments ready on the showroom rack.", position: "center" },
];

// Proof gallery (Work + Home preview + mobile rail). Production-led.
export const PHOTOS: PhotoItem[] = [
  { name: "WWW01988", alt: "The sewing floor in full flow at The Factory.", caption: "On the floor", category: "Production", ratio: "3 / 2", position: "center 45%" },
  { name: "WWW01938", alt: "Screen printing on the multi-station press.", caption: "Screen printing", category: "Production", ratio: "4 / 3", position: "center 45%" },
  { name: "WWW02028", alt: "A finished orange and navy workwear uniform.", caption: "Workwear uniform", category: "Uniforms", ratio: "4 / 5", position: "center 42%" },
  { name: "WWW01931", alt: "Embroidery and monogram work stitched onto a garment on the machine.", caption: "Embroidery / monogram", category: "Production", ratio: "4 / 3", position: "center" },
  { name: "WWW01972", alt: "A garment being sewn on the floor.", caption: "Cut & sew", category: "Production", ratio: "4 / 5", position: "center 42%" },
  { name: "WWW02024", alt: "Fitting a custom workwear piece on the form.", caption: "Uniform fitting", category: "Uniforms", ratio: "4 / 5", position: "center 28%" },
  { name: "WWW02021", alt: "Finished garments on the showroom rack.", caption: "Showroom", category: "Finished", ratio: "3 / 2", position: "center" },
  { name: "WWW01937", alt: "An operator at the multi-head embroidery machine.", caption: "Embroidery machine", category: "Production", ratio: "5 / 4", position: "center 34%" },
  { name: "WWW02030", alt: "A finished custom-printed tee.", caption: "Custom print", category: "Finished", ratio: "4 / 5", position: "center 32%" },
  { name: "WWW02018", alt: "Aso-ebi fabric being worked at the sewing machine.", caption: "Aso-ebi making", category: "Production", ratio: "4 / 3", position: "center 40%" },
  { name: "WWW02036", alt: "Screen printing at the carousel press.", caption: "At the press · screen printing", category: "Production", ratio: "4 / 3", position: "center 45%" },
  { name: "WWW02004", alt: "The tailoring team at The Factory, in front of the studio wall.", caption: "The tailoring team", category: "Team", ratio: "3 / 2", position: "center 40%" },
  { name: "WWW01964", alt: "A wider look across the sewing floor.", caption: "The workshop", category: "Production", ratio: "3 / 2", position: "center 50%" },
  { name: "WWW02000", alt: "An overlock machine finishing a seam.", caption: "Overlock", category: "Production", ratio: "4 / 3", position: "center 40%" },

  // ---- Finished work (studio product shoot — client garments) ----
  { name: "DSC8600", alt: "A finished chore jacket with contrast pockets, produced for Bearded Genius.", caption: "Chore jacket", category: "Finished", ratio: "4 / 5", position: "center 45%" },
  { name: "DSC8570", alt: "A finished green jacket on the rack.", caption: "Statement jacket", category: "Finished", ratio: "4 / 5", position: "center 45%" },
  { name: "DSC8562", alt: "A printed vest with back artwork, produced for Bearded Genius.", caption: "Printed vest", category: "Finished", ratio: "4 / 5", position: "center 45%" },
  { name: "DSC8514", alt: "A printed sweatshirt, produced for Bearded Genius.", caption: "Printed sweatshirt", category: "Finished", ratio: "4 / 5", position: "center 45%" },
  { name: "DSC8556", alt: "A matching sweatshirt and trouser set in red.", caption: "Matching set", category: "Finished", ratio: "4 / 5", position: "center 45%" },
  { name: "DSC8587", alt: "A black utility vest with patch pockets.", caption: "Utility vest", category: "Finished", ratio: "4 / 5", position: "center 45%" },
  { name: "DSC8633", alt: "A run of printed graphic tees on the rail.", caption: "Graphic tees", category: "Finished", ratio: "4 / 5", position: "center 45%" },
  { name: "DSC8599", alt: "An olive cargo set with patchwork details.", caption: "Cargo set", category: "Finished", ratio: "4 / 5", position: "center 45%" },
  { name: "DSC8606", alt: "A chore coat finished with woven aso-oke trim.", caption: "Woven-trim jacket", category: "Finished", ratio: "4 / 5", position: "center 45%" },
];

export const PHOTO_CATEGORIES: PhotoCategory[] = ["Production", "Uniforms", "Finished", "Team"];

// Visit — a real wide floor image; plus showroom + team singles.
export const FACTORY_FLOOR = {
  name: "WWW01964",
  alt: "Inside The Factory Nigeria — the sewing floor in Ilupeju, Lagos.",
  position: "center 48%",
};
export const SHOWROOM = { name: "WWW02021", alt: "The showroom rack of finished garments.", position: "center" };
export const TEAM_PHOTO = { name: "WWW02004", alt: "The team at The Factory Nigeria.", position: "center 38%" };

// The brand's REAL artwork-prep guides (text graphics) — shown whole
// (object-fit:contain) on a matte so the text is never cropped.
const I = `${BASE}/images`;
export type FilePrepItem = { src: string; title: string; note: string };
export const FILE_PREP: FilePrepItem[] = [
  { src: `${I}/process/31-DV0ntd0DdVg-getting-the-perfect-print-starts-with-the-01.jpg`, title: "Start print-ready", note: "Getting the perfect print starts with the file." },
  { src: `${I}/process/31-DV0ntd0DdVg-getting-the-perfect-print-starts-with-the-03.jpg`, title: "Right file format", note: "PNG, CDR, PSD or PDF — vector where possible." },
  { src: `${I}/process/31-DV0ntd0DdVg-getting-the-perfect-print-starts-with-the-05.jpg`, title: "Correct colours", note: "CMYK for print accuracy, not screen RGB." },
  { src: `${I}/process/31-DV0ntd0DdVg-getting-the-perfect-print-starts-with-the-06.jpg`, title: "Transparent background", note: "Clean placement on any fabric." },
];
