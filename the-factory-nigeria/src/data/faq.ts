// Plain-language FAQ. Anything not confirmed by the business is routed to
// WhatsApp rather than stated as a guarantee.

export type Faq = { q: string; a: string };

export const FAQS: Faq[] = [
  {
    q: "What is the minimum order?",
    a: "Our standard minimum order is 30 pieces. It applies across garment production, printing and most custom work. If you’re close to 30 or unsure how your order splits, send the details and we’ll advise.",
  },
  {
    q: "How do I start an order?",
    a: "Use “Start an order enquiry” on this site. Answer a few short questions and it opens WhatsApp with your details ready to send. You can also message us directly at +234 909 943 6487. This is an enquiry — we confirm the price and timing before anything is produced.",
  },
  {
    q: "Do you supply the garments, or can I bring my own?",
    a: "Both. We can make or source the garments for you, or print and embroider on items you supply. Tell us which you’d prefer in your enquiry and we’ll confirm what works.",
  },
  {
    q: "What print methods do you offer?",
    a: "Screen printing for bold, simple designs; transfer printing (also called DTF) for detailed, full-colour artwork; and embroidery for a premium finish. We’ll recommend the best one for your artwork, fabric and quantity.",
  },
  {
    q: "What artwork should I send?",
    a: "A high-quality logo or design file is ideal — a vector file, or a large, sharp image — along with where it goes and how big. If your file isn’t ready, send whatever you have and we can help get it print-ready.",
  },
  {
    q: "Can you produce for my brand or company?",
    a: "Yes. We produce for clothing brands, companies, teams, schools, creators and events — from single designs to bulk uniform orders. Share the garment, quantity and sizes to start.",
  },
  {
    q: "How much does it cost and how long does it take?",
    a: "Price and timing depend on the garment, quantity, fabric, print method and finishing, so we confirm them directly for each order. Start an enquiry and we’ll come back with a clear price.",
  },
  {
    q: "How does payment work?",
    a: "We agree payment terms with you on WhatsApp once we’ve confirmed your order, and set them out clearly before production begins.",
  },
  {
    q: "Can I visit the factory?",
    a: "Yes — visits are welcome by appointment during working hours (9am–5pm, Monday to Friday). Message us first to book a time, then come to 46 Industrial Avenue, Ilupeju, Lagos.",
  },
];
