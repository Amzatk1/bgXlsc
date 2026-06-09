/**
 * Central asset map — single source of truth for every local file path.
 * All paths resolve from /public. Curated Lagos Sneaker Club assets only.
 *
 * NOTE: `events.partner` and `brand.callingAfricanBrands` (the raw posters) carry
 * a legacy "LSC@BEARDEDGENIUS.ORG" line baked into the image. We never render the
 * raw versions in the live UI — only the `*Clean` crops, which remove that band.
 */

const BASE = "/assets/lsc";

export const ASSETS = {
  logo: `${BASE}/logo/lsc-profile-logo.jpg`,

  brand: {
    callingAfricanBrandsRaw: `${BASE}/images/brand/01-calling-african-brands.jpg`,
    callingAfricanBrands: `${BASE}/images/brand/01-calling-african-brands-clean.jpg`,
    openEveryday: `${BASE}/images/brand/02-open-everyday.jpg`,
  },

  events: {
    partnerRaw: `${BASE}/images/events/01-partner-with-us.jpg`,
    partner: `${BASE}/images/events/01-partner-with-us-clean.jpg`,
    partnerTile: `${BASE}/images/events/01-partner-with-us-tile.jpg`,
    rastaRoast: `${BASE}/images/events/02-rasta-roast-community.jpg`,
    sneakerSaturday: `${BASE}/images/events/03-sneaker-saturday-winners.jpg`,
  },

  products: {
    lavcore: `${BASE}/images/products/01-lavcore-denim-crocs.jpg`,
    lscBag: `${BASE}/images/products/02-whats-in-my-lsc-bag.jpg`,
    saturdayFit: `${BASE}/images/products/03-1k-sneaker-saturday-fit.jpg`,
    cultureFit: `${BASE}/images/products/04-culture-fit.jpg`,
    clue4: `${BASE}/images/products/05-clue-4.jpg`,
    clue3: `${BASE}/images/products/06-clue-3.jpg`,
  },

  videos: {
    rastaRoast: `${BASE}/videos/01-rasta-roast-iv-sneakerhead-edition-good-fo.mp4`,
    bornstar: `${BASE}/videos/02-bornstarng-really-said-hold-my-beer-you-re.mp4`,
    countdown4: `${BASE}/videos/03-it-s-almost-time-let-the-countdown-begin-c.mp4`,
    countdown3: `${BASE}/videos/04-we-told-you-to-keep-an-eye-out-hmm-were-yo.mp4`,
  },

  // Culture photography pulled from the live LSC Instagram (Rasta Roast IV,
  // 1K Sneaker Saturday winners, Made-in-Nigeria Lavcore). Used on the About page.
  about: {
    rastaRoast02: `${BASE}/images/about/rasta-roast-02.jpg`,
    rastaRoast03: `${BASE}/images/about/rasta-roast-03.jpg`,
    rastaRoast04: `${BASE}/images/about/rasta-roast-04.jpg`,
    rastaRoast07: `${BASE}/images/about/rasta-roast-07.jpg`,
    rastaRoast08: `${BASE}/images/about/rasta-roast-08.jpg`,
    rastaRoast09: `${BASE}/images/about/rasta-roast-09.jpg`,
    rastaRoast11: `${BASE}/images/about/rasta-roast-11.jpg`,
    winners01: `${BASE}/images/about/sneaker-saturday-winners-01.jpg`,
    winners02: `${BASE}/images/about/sneaker-saturday-winners-02.jpg`,
    winners03: `${BASE}/images/about/sneaker-saturday-winners-03.jpg`,
    lavcore02: `${BASE}/images/about/made-in-nigeria-lavcore-02.jpg`,
    storeConversation: `${BASE}/images/about/store-conversation-reel-poster.jpg`,
  },
} as const;
