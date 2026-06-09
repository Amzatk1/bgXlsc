import { ASSETS } from "./assets";
import { SITE } from "./site";

const ig = (shortcode?: string) =>
  shortcode ? `https://www.instagram.com/p/${shortcode}/` : SITE.instagram.url;

export type Slide = {
  id: string;
  type: "image" | "video";
  src: string;
  poster?: string;
  label: string;
  duration?: number;
};

/** Hero slideshow — lighter video clips are preferred here for fast first paint. */
export const HERO_SLIDES: Slide[] = [
  {
    id: "open-everyday",
    type: "image",
    src: ASSETS.brand.openEveryday,
    label: "Open Everyday — Ikoyi",
    duration: 6000,
  },
  {
    id: "sneaker-saturday-clip",
    type: "video",
    src: ASSETS.videos.countdown4,
    poster: ASSETS.products.clue4,
    label: "1K Sneaker Saturday",
  },
  {
    id: "winners",
    type: "image",
    src: ASSETS.events.sneakerSaturday,
    label: "Inside the space",
    duration: 5600,
  },
  {
    id: "countdown-clip",
    type: "video",
    src: ASSETS.videos.countdown3,
    poster: ASSETS.products.clue3,
    label: "Keep an eye out",
  },
  {
    id: "lavcore",
    type: "image",
    src: ASSETS.products.lavcore,
    label: "Lavcore — Made in Lagos",
    duration: 5600,
  },
];

export type MediaItem = {
  id: string;
  type: "image" | "video";
  src: string;
  poster?: string;
  caption: string;
  href: string;
};

/** Editorial / Instagram wall — draggable rail. */
export const MEDIA_RAIL: MediaItem[] = [
  {
    id: "rasta-roast",
    type: "image",
    src: ASSETS.events.rastaRoast,
    caption: "Rasta Roast IV",
    href: ig("DZHhjrdtL12"),
  },
  {
    id: "ss-clip",
    type: "video",
    src: ASSETS.videos.countdown4,
    poster: ASSETS.products.clue4,
    caption: "1K Sneaker Saturday",
    href: ig("DY7UT3Vs-nA"),
  },
  {
    id: "winners",
    type: "image",
    src: ASSETS.events.sneakerSaturday,
    caption: "Saturday winners",
    href: ig(),
  },
  {
    id: "lavcore",
    type: "image",
    src: ASSETS.products.lavcore,
    caption: "Lavcore denim",
    href: ig("DZFa5SJiCTp"),
  },
  {
    id: "clue3-clip",
    type: "video",
    src: ASSETS.videos.countdown3,
    poster: ASSETS.products.clue3,
    caption: "Clue 3, lessgo",
    href: ig("DY4o8ymIzLD"),
  },
  {
    id: "culture-fit",
    type: "image",
    src: ASSETS.products.cultureFit,
    caption: "Culture fit",
    href: ig(),
  },
  {
    id: "lsc-bag",
    type: "image",
    src: ASSETS.products.lscBag,
    caption: "What's in my LSC bag",
    href: ig(),
  },
  {
    id: "bornstar-clip",
    type: "video",
    src: ASSETS.videos.bornstar,
    poster: ASSETS.products.saturdayFit,
    caption: "In the chillest fits",
    href: ig("DZFKrdHOPwF"),
  },
];

export type MosaicItem = {
  id: string;
  type: "image" | "video";
  src: string;
  poster?: string;
  label: string;
  span?: boolean;
};

/** Culture mosaic — used on the Events & Culture and About pages. */
export const CULTURE_MOSAIC: MosaicItem[] = [
  { id: "m1", type: "image", src: ASSETS.events.rastaRoast, label: "Rasta Roast", span: true },
  { id: "m2", type: "image", src: ASSETS.products.saturdayFit, label: "Saturday fit" },
  { id: "m3", type: "image", src: ASSETS.products.cultureFit, label: "Culture" },
  {
    id: "m4",
    type: "video",
    src: ASSETS.videos.countdown3,
    poster: ASSETS.products.clue3,
    label: "Countdown",
  },
  { id: "m5", type: "image", src: ASSETS.events.sneakerSaturday, label: "Winners" },
  { id: "m6", type: "image", src: ASSETS.products.lscBag, label: "In the bag" },
];
