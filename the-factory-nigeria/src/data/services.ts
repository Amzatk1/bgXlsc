// Services framed as production capabilities (not retail products).
// "send" = what the client should provide to start a quote.

export type IconKey =
  | "shirt"
  | "printer"
  | "building"
  | "scissors"
  | "gift"
  | "hardhat"
  | "layers";

export type Service = {
  id: string;
  code: string;
  title: string;
  what: string;
  send: string[];
  icon: IconKey;
  imgKey: keyof typeof import("./media").SERVICE_PHOTO;
};

export const SERVICES: Service[] = [
  {
    id: "garment-production",
    code: "SVC-01",
    title: "Garment production",
    what: "We cut and sew clothing from scratch — tees, polos, shirts, shorts, sets and more, made to your design.",
    send: ["What garment and fit", "How many, and the sizes", "Any design or reference you have", "Fabric or colour ideas"],
    icon: "shirt",
    imgKey: "garment",
  },
  {
    id: "printing",
    code: "SVC-02",
    title: "Printing services",
    // Method examples, not an equipment list — the team confirms the method
    // per order (see src/data/siteFacts.ts and FACTORY_QUESTIONS.md).
    what: "We print and embroider on garments and merch. The team recommends the best method for your artwork, fabric and quantity — for example screen print for bold, simple designs, transfer print (DTF) for detailed full-colour artwork, or embroidery for a premium finish — and confirms it with you before production.",
    send: ["Your artwork or logo (or we can help)", "Where it goes and how big", "Colours, if you know them", "The garment, if you’re supplying it"],
    icon: "printer",
    imgKey: "printing",
  },
  {
    id: "corporate-uniforms",
    code: "SVC-03",
    title: "Corporate uniforms",
    what: "Branded uniforms and workwear for companies and teams — the same look and quality across every size.",
    send: ["Your logo and brand colours", "The type of uniform", "How many people, and their sizes", "When you need it"],
    icon: "building",
    imgKey: "uniforms",
  },
  {
    id: "custom-apparel",
    code: "SVC-04",
    title: "Custom apparel",
    what: "Made-to-order pieces for brand drops and signature items — like our Afri-jorts and culture-led designs.",
    send: ["Your idea or a sketch", "Garment and fabric direction", "How many, and the sizes", "Any label or finishing details"],
    icon: "scissors",
    imgKey: "apparel",
  },
  {
    id: "merch-souvenirs",
    code: "SVC-05",
    title: "Merch & souvenirs",
    what: "Event and brand merch — tees, totes, caps and souvenirs for pop-ups, launches, conferences and campaigns.",
    send: ["Your event or brand artwork", "The items and quantities", "Sizes, where relevant", "Pickup or delivery preference"],
    icon: "gift",
    imgKey: "merch",
  },
  {
    id: "caps-jackets",
    code: "SVC-06",
    title: "Caps & jackets",
    what: "Custom caps, branded jackets and statement pieces, made from your concept.",
    send: ["A style reference", "Your branding or embroidery artwork", "How many, and the sizes", "The colourway"],
    icon: "hardhat",
    imgKey: "caps",
  },
  {
    id: "custom-aso-ebi",
    code: "SVC-07",
    title: "Custom aso-ebi",
    what: "Aso-ebi for weddings, families and events — we work with your chosen fabric and sew consistent styles across your whole group.",
    send: ["Your fabric, or your fabric direction", "The style you want", "How many people, and their sizes", "Your event date"],
    icon: "layers",
    imgKey: "asoebi",
  },
];
