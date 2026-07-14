// =====================================================================
// STUDIO — the things only The Factory Nigeria can tell us
//
// Some questions cannot be answered by research, because they are facts about
// THIS business: what fabric they buy, what machines they own, who supplies
// their blank tees, what they will accept as a minimum order.
//
// Guessing them would be the one thing this project must never do — it would
// put a promise in front of a customer that nobody at The Factory ever made.
// So every one of them lives here as an OPEN question, and while it is open the
// app says "the team confirms this" rather than stating an answer.
//
// When the manager answers, set `status: "answered"`, fill in `answer`, and (for
// minimums) put the number in METHOD_MINIMUM. Nothing else has to change — the
// copy, the review screen, the reference sheet and the enquiry all read from here.
//
// ⚠ A NOTE ON THE AVAILABILITY LABELS. The founder gave us the four labels
// (Commonly available / Availability to confirm / Special sourcing required /
// Custom request). They did NOT tell us which label belongs to which colour,
// fabric or garment — WE assigned those. Every one of those assignments is an
// open question below, and the global market-sourcing notice hedges them until
// they are answered.
// =====================================================================

import { PRODUCTION_METHODS, STUDIO_MIN_ORDER, type Product, type ProductionMethodId } from "./catalog";

/**
 * blocking — the app currently implies a capability or an availability that
 *            nobody at The Factory has confirmed. Answer these first.
 * handover — affects whether the production file we hand over is actually usable.
 * commercial — money and minimums.
 * check — we have made a defensible, researched call; just sanity-check it.
 */
export type QuestionPriority = "blocking" | "handover" | "commercial" | "check";

export type OpenQuestion = {
  id: string;
  priority: QuestionPriority;
  /** Ask The Factory exactly this. */
  question: string;
  /** Why the answer changes what a customer sees. */
  whyItMatters: string;
  /** What Studio does while the question is open. Never shown as a promise. */
  assumption: string;
  status: "open" | "answered";
  answer?: string;
};

export const FACTORY_QUESTIONS: OpenQuestion[] = [
  // -------------------------------------------------------------------
  // A. CAN YOU ACTUALLY DO IT? — capability claims the app makes today
  // -------------------------------------------------------------------
  {
    id: "decoration-methods",
    priority: "blocking",
    question:
      "Which decoration methods do you actually have in-house? Studio offers the customer a choice of Screen printing, Direct-to-garment (DTG), Heat transfer and Embroidery. Do you do all four? Is there anything we are missing (DTF, vinyl, puff, flock)?",
    whyItMatters:
      "This is the most exposed guess in the app. Offering DTG in a dropdown implies you own a DTG machine. If you don't, a customer will ask for it and we will have wasted their time.",
    assumption:
      "Studio lists all four as a customer PREFERENCE and says the team confirms what suits the artwork. It does not promise any of them. Any method you do not have should simply be removed from the list.",
    status: "open",
  },
  {
    id: "sublimation-scope",
    priority: "blocking",
    question:
      "Which garments do you sublimate? Studio currently sublimates the sports jersey and the basketball jersey. Is that right, and is there anything else you sublimate?",
    whyItMatters:
      "Sublimation is the only method that lets a design cover the whole garment, so it decides which products get the full-surface designer.",
    assumption:
      "Both jerseys are sublimated; everything else is printed onto a ready-made garment or cut and sewn. One thing is settled regardless: sublimation ink only bonds with polyester, so a 100% cotton tee can never be sublimated.",
    status: "open",
  },
  {
    id: "all-over-on-readymade",
    priority: "blocking",
    question:
      "Can you do an all-over / full-bleed print on a READY-MADE garment (for example a DTF or all-over transfer on a finished tee)? Or is a full-surface design only possible on a sublimated jersey?",
    whyItMatters:
      "A customer can drag a design so it covers a whole tee. Right now we tell them you will confirm how much of it can be reproduced. If you simply cannot do it, we should say so up front instead.",
    assumption:
      "Full-surface designs are treated as a sublimation idea. On a non-sublimated garment Studio keeps the design (it never deletes work) and flags that the team will confirm how much can be reproduced.",
    status: "open",
  },
  {
    id: "cap-decoration",
    priority: "blocking",
    question:
      "Do you embroider caps in-house, or only print them? If you embroider: what is the maximum embroidery area, and is there a limit on stitch count or number of thread colours?",
    whyItMatters:
      "Studio says caps are 'printed or embroidered — the team confirms which'. That is a placeholder for an answer we do not have.",
    assumption:
      "Caps are decorated on the front and back panels using a ~4.5″ × 2.5″ area (the standard structured-cap front), method unspecified.",
    status: "open",
  },
  {
    id: "print-colour-limit",
    priority: "blocking",
    question:
      "For screen printing, is there a maximum number of colours in a design — and does the colour count change the price?",
    whyItMatters:
      "Studio lets a customer upload a photograph or use a gradient, which is effectively unlimited colours. Screen printing is normally priced and limited per colour, so a design that looks free on screen may be expensive or impossible.",
    assumption:
      "No limit is stated or enforced. Studio does not count the colours in a design, and does not warn about them.",
    status: "open",
  },

  // -------------------------------------------------------------------
  // B. CAN YOU ACTUALLY GET IT? — availability claims WE assigned
  // -------------------------------------------------------------------
  {
    id: "towel-back",
    priority: "blocking",
    question:
      "What exactly is the towel-back fabric? Is it a loopback / French-terry style knit (smooth face, towel-like loops on the reverse)? What weight is it, and which colours can you reliably source?",
    whyItMatters:
      "It is the fabric of the custom-made T-shirt. The customer is choosing it, so the description on the card should be yours, not our guess.",
    assumption:
      "Studio shows the team's own words — “towel-back fabric option” — and marks it Availability to confirm. It does not claim a composition or a weight.",
    status: "open",
  },
  {
    id: "garment-range",
    priority: "blocking",
    question:
      "Do you actually offer all ten garments Studio shows — custom-made tee, ready-made tee, oversized tee, polo, pullover hoodie, sports jersey, basketball jersey, snapback, curved-peak cap, trucker cap? Any that you do not do, or anything obvious we have left out?",
    whyItMatters:
      "The garment list is the first screen a customer sees. Every item on it is an implicit 'yes, we make this'.",
    assumption:
      "All ten are offered. We chose the range; you did not.",
    status: "open",
  },
  {
    id: "colour-range",
    priority: "blocking",
    question:
      "Studio shows nine standard colours — White, Black, Navy, Heather grey, Red, Royal blue, Forest green, Cream, Chocolate brown — and marks every one of them 'Commonly available'. Which colours can you genuinely source, and is 'commonly available' true for each? (A customer can also pick any custom colour, which we already mark as needing confirmation.)",
    whyItMatters:
      "WE wrote that colour list and WE marked them all commonly available. The founder gave us the labels, not the assignments.",
    assumption:
      "Nine standard colours, all marked Commonly available, hedged by the market-sourcing notice. The on-screen hex values are our approximation of each colour, not a matched fabric.",
    status: "open",
  },
  {
    id: "fabric-availability",
    priority: "blocking",
    question:
      "Studio lists eleven fabrics and assigns each one an availability status (for example: lightweight cotton = Commonly available, French terry = Special sourcing required). Which of these do you actually source, and what is the true status of each?",
    whyItMatters:
      "Same problem as the colours: we invented the status of every fabric. A customer reading 'Commonly available' will assume you can get it this week.",
    assumption:
      "Eleven fabrics with statuses we assigned. Several of the close-up images are honest macro crops of our own garment renders, disclosed on the card.",
    status: "open",
  },

  // -------------------------------------------------------------------
  // C. WHAT DO YOU NEED FROM US? — production handover
  // -------------------------------------------------------------------
  {
    id: "artwork-format",
    priority: "handover",
    question:
      "What do you actually want to RECEIVE to produce a job? Studio sends a production reference PNG, the untouched original artwork, and a JSON design brief. Do you need vector artwork (AI / EPS / PDF)? Artwork supplied at actual print size? Colour separations for screen printing?",
    whyItMatters:
      "This decides whether the file we hand you is usable or whether you have to redraw the design. It is the single biggest thing that could make Studio useless in practice.",
    assumption:
      "A 2200×1980 reference PNG (mockups, placements, sizes in inches, colours, fonts with licences), the original uploaded artwork untouched, and a JSON brief with every layer's exact position, size and rotation.",
    status: "open",
  },
  {
    id: "colour-standard",
    priority: "handover",
    question:
      "Do you work to a colour standard — Pantone, Pantone TCX, or something else? Should the production reference carry a Pantone code rather than just a hex and RGB value?",
    whyItMatters:
      "Screen colours are not fabric colours. Right now we hand you a hex value and a disclaimer. A Pantone reference would let you match a colour properly.",
    assumption:
      "The reference sheet gives the colour name, hex and RGB, with a note that screen colours are approximate and you confirm the final match.",
    status: "open",
  },
  {
    id: "sizes",
    priority: "handover",
    question:
      "Do you offer XS through XXL on every garment? What are the actual measurements — is there a size chart we can show? And for the custom-made T-shirt, is it made to measure instead of sized S/M/L?",
    whyItMatters:
      "Studio asks a customer to split their order across XS–XXL but never tells them what those sizes mean. If you do not stock XS or XXL, we are collecting an order you cannot fill.",
    assumption:
      "Six sizes, XS to XXL, with a free-text box for anything else. No size chart is shown anywhere, because we do not have your measurements.",
    status: "open",
  },

  // -------------------------------------------------------------------
  // D. COMMERCIAL
  // -------------------------------------------------------------------
  {
    id: "minimums",
    priority: "commercial",
    question:
      "What is the minimum order for each method — sublimated jerseys, custom-made (cut and sewn), printing onto a ready-made garment, and caps?",
    whyItMatters:
      "Studio accepts a request for a single item. If a sublimated jersey really needs 10 or 20, the customer should learn that from you, early, not after they have designed one.",
    assumption:
      "Studio accepts a request from 1 item for every method, and tells the customer the minimum is confirmed by the team before any order is accepted. Made-to-order methods are flagged as often carrying a higher minimum — an expectation, never a number we invented.",
    status: "open",
  },
  {
    id: "general-minimum",
    priority: "commercial",
    question:
      "The main site still says the minimum for a general manufacturing enquiry is 30 pieces. Is that still right?",
    whyItMatters:
      "It is on the live site and it contradicts Studio's 1-item minimum, so a customer can meet both numbers on the same visit and be confused.",
    assumption:
      "General enquiries: 30 pieces. Studio: from 1 item. Both are shown, and Studio explains it accepts single-item requests.",
    status: "open",
  },
  {
    id: "ready-made-tee",
    priority: "commercial",
    question:
      "Is the ready-made T-shirt genuinely 100% cotton, and how do you print it — screen printing, DTG, or heat transfer?",
    whyItMatters:
      "Studio tells the customer what they are buying and how it will be decorated. It should not name a technique you did not choose.",
    assumption:
      "Studio says “ready-made 100% cotton, purchased and then customised with your requested print” and deliberately does NOT name a printing technique.",
    status: "open",
  },

  // -------------------------------------------------------------------
  // E. WE HAVE MADE A RESEARCHED CALL — just sanity-check it
  // -------------------------------------------------------------------
  {
    id: "print-sizes",
    priority: "check",
    question:
      "Are the print sizes right? Studio's guides were measured off the garment renders and cross-checked against industry-standard print areas — not off a real garment on your table.",
    whyItMatters:
      "The guides tell a customer roughly how big a design will be in inches. They are advisory, but they should not be misleading.",
    assumption:
      "Tee/jersey guides sit within the standard adult ranges (full front/back up to about 12″ × 16″; left chest 3–4″; sleeve 2–4″). Cap fronts use the standard ~4.5″ × 2.5″ decoration area.",
    status: "open",
  },
  {
    id: "difficult-areas",
    priority: "check",
    question:
      "Is our list of awkward areas right — collar, placket, kangaroo pocket, hood drawstring, side seams, hems, cap peak? Is there anything else your press or embroidery machine cannot sit flat on, or anything we are nagging about that you can produce perfectly well?",
    whyItMatters:
      "These drive the soft warning a customer sees. Too few and we mislead them; too many and we nag them about designs you can make.",
    assumption:
      "The list above, with a 1″ clearance from seams as the industry norm. Seam and hem warnings are suppressed for sublimated garments, because those panels are printed flat before they are sewn. No warning is ever a block.",
    status: "open",
  },
  {
    id: "artwork-resolution",
    priority: "check",
    question:
      "Studio warns a customer when their uploaded artwork works out below ~150 DPI at the size they have placed it (and strongly below 100). Do those thresholds match what your press actually needs?",
    whyItMatters:
      "Too strict and we scare people off good artwork; too loose and you receive files you cannot print cleanly.",
    assumption:
      "150 DPI = good, 100–150 = may look soft, below 100 = low but still submittable, with the team reviewing before anything is printed. These are common industry figures.",
    status: "open",
  },
];

export const OPEN_QUESTIONS = FACTORY_QUESTIONS.filter((q) => q.status === "open");

export function questionsByPriority(p: QuestionPriority): OpenQuestion[] {
  return FACTORY_QUESTIONS.filter((q) => q.priority === p && q.status === "open");
}

/** The ones where the app currently implies something nobody has confirmed. */
export const BLOCKING_QUESTIONS = questionsByPriority("blocking");

// ---------------------------------------------------------------------
// Minimum order per production method.
//
// `null` means The Factory has not told us yet — so Studio accepts a request
// from a single item and SAYS the minimum is confirmed by the team. Put a real
// number here the moment they give you one.
// ---------------------------------------------------------------------
export const METHOD_MINIMUM: Record<ProductionMethodId, number | null> = {
  sublimation: null,
  "custom-made": null,
  "ready-made-print": null,
  "headwear-print": null,
};

/** Methods that are made to order, and so typically carry a higher minimum. */
const MADE_TO_ORDER: ProductionMethodId[] = ["sublimation", "custom-made"];

export type MinimumInfo = { min: number; confirmed: boolean; note: string };

export function minimumFor(product: Product): MinimumInfo {
  const method = PRODUCTION_METHODS[product.production];
  const confirmedMin = METHOD_MINIMUM[product.production];

  if (confirmedMin !== null) {
    return {
      min: confirmedMin,
      confirmed: true,
      note: `The minimum for ${method.label.toLowerCase()} is ${confirmedMin} item${confirmedMin === 1 ? "" : "s"}.`,
    };
  }

  const madeToOrder = MADE_TO_ORDER.includes(product.production);
  return {
    min: STUDIO_MIN_ORDER,
    confirmed: false,
    note:
      `You can send a request for a single item. The minimum for ${method.label.toLowerCase()} is confirmed by The Factory Nigeria before any order is accepted` +
      (madeToOrder
        ? " — a garment made to order like this often carries a higher minimum than printing onto a ready-made shirt."
        : "."),
  };
}
