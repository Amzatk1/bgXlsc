// The production board: enquiry → pickup or delivery.
// "status" is a short visual label for the board, not a live order state.

export type Step = {
  n: string;
  title: string;
  detail: string;
  status: "Start here" | "Confirm" | "Make" | "Check" | "Pickup";
};

export const STEPS: Step[] = [
  {
    n: "01",
    title: "Enquiry",
    detail:
      "Tell us what you need — the service, roughly how many, the garment and when you need it. The enquiry form on this site does this for you. Minimum order: 30 pieces.",
    status: "Start here",
  },
  {
    n: "02",
    title: "Quote",
    detail:
      "We read your enquiry and reply on WhatsApp to confirm what’s possible and the price. Price is always confirmed directly — never assumed.",
    status: "Confirm",
  },
  {
    n: "03",
    title: "Artwork & design",
    detail:
      "Send your artwork or a rough sketch. We check the files, placement and colours so the print comes out clean. No file ready? We can help.",
    status: "Confirm",
  },
  {
    n: "04",
    title: "Materials & garments",
    detail:
      "We agree the fabric or garments and any finishing, and advise what suits your budget and how the pieces will be used.",
    status: "Confirm",
  },
  {
    n: "05",
    title: "Sample or proof",
    detail:
      "Where it helps, we agree a sample or a printed proof before the full run, so the result matches what you expect.",
    status: "Make",
  },
  {
    n: "06",
    title: "Production",
    detail:
      "Your order goes into production on our floor — cut, sewn, printed and assembled to the agreed specification.",
    status: "Make",
  },
  {
    n: "07",
    title: "Quality check",
    detail:
      "Every piece is checked for stitching, print and finishing before anything is packed. Details matter.",
    status: "Check",
  },
  {
    n: "08",
    title: "Pickup or delivery",
    detail:
      "Packed and ready. Collect from 46 Industrial Avenue, Ilupeju, or we arrange delivery — confirmed with you directly.",
    status: "Pickup",
  },
];
