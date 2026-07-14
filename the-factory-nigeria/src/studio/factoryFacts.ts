// =====================================================================
// STUDIO — the things only The Factory Nigeria can tell us
//
// Some questions cannot be answered by research, because they are facts about
// THIS business: what fabric they actually buy, what machines they own, who
// supplies their blank tees, what they will accept as a minimum order.
//
// Guessing them would be the one thing this project must never do — it would
// put a promise in front of a customer that nobody at The Factory ever made.
// So every one of them lives here as an OPEN question, and while it is open the
// app says "the team confirms this" rather than stating an answer.
//
// When the manager answers, set `status: "answered"`, fill in `answer`, and (for
// minimums) put the number in METHOD_MINIMUM. Nothing else has to change — the
// copy, the review screen, the reference sheet and the enquiry all read from here.
// =====================================================================

import { PRODUCTION_METHODS, STUDIO_MIN_ORDER, type Product, type ProductionMethodId } from "./catalog";

export type OpenQuestion = {
  id: string;
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
  {
    id: "towel-back",
    question:
      "What exactly is the towel-back fabric? Is it a loopback / French-terry style knit (smooth face, towel-like loops on the reverse)? What weight is it, and which colours can you reliably source?",
    whyItMatters:
      "It is the fabric of the custom-made T-shirt. The customer is choosing it, so the description on the card should be yours, not our guess.",
    assumption:
      "Studio shows the team's own words — \"towel-back fabric option\" — and marks it Availability to confirm. It does not claim a composition or a weight.",
    status: "open",
  },
  {
    id: "sublimation-scope",
    question:
      "Which garments do you sublimate? Studio currently sublimates both jerseys. Is that right, and is there anything else you sublimate?",
    whyItMatters:
      "Sublimation is the only method that lets a design cover the whole garment, so it decides which products get the full-surface designer.",
    assumption:
      "Sports jersey and basketball jersey are sublimated; everything else is printed onto a ready-made garment or cut and sewn. Note that sublimation physically cannot be done on cotton, so a 100% cotton tee can never be sublimated whatever the answer.",
    status: "open",
  },
  {
    id: "ready-made-tee",
    question:
      "Is the ready-made T-shirt genuinely 100% cotton, and how do you print it — screen printing, DTG, or heat transfer?",
    whyItMatters:
      "Studio tells the customer what they are buying and how it will be decorated. It should not name a technique you did not choose.",
    assumption:
      "Studio says \"ready-made 100% cotton, purchased and then customised with your requested print\" and deliberately does NOT name a printing technique. The customer can state a preference, and the team confirms.",
    status: "open",
  },
  {
    id: "minimums",
    question:
      "What is the minimum order for each method — sublimated jerseys, custom-made (cut and sewn), printing onto a ready-made garment, and caps?",
    whyItMatters:
      "Studio accepts a request for a single item. If a sublimated jersey really needs 10 or 20, the customer should learn that from you, early, not after they have designed one.",
    assumption:
      "Studio accepts a request from 1 item for every method, and tells the customer the minimum is confirmed by the team before any order is accepted.",
    status: "open",
  },
  {
    id: "print-sizes",
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
    question:
      "Is our list of awkward areas right — collar, placket, kangaroo pocket, hood drawstring, side seams, hems, cap peak? Is there anything else your press or your embroidery machine cannot sit flat on?",
    whyItMatters:
      "These drive the soft warning a customer sees. Too few and we mislead them; too many and we nag them about designs you can produce perfectly well.",
    assumption:
      "The list above, with a 1″ clearance from seams as the industry norm. Seam and hem warnings are suppressed for sublimated garments, because those panels are printed flat before they are sewn. No warning is ever a block.",
    status: "open",
  },
];

export const OPEN_QUESTIONS = FACTORY_QUESTIONS.filter((q) => q.status === "open");

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
