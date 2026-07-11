import { PageIntro } from "../components/PageIntro";
import { FaqAccordion } from "../components/FaqAccordion";
import { CtaBand } from "../components/CtaBand";
import { SpecLine } from "../components/SpecLine";

export function Faq() {
  return (
    <>
      <PageIntro
        eyebrow="FAQ & payment"
        title="Good questions, straight answers"
        intro="The essentials on minimum order, hours, visits, artwork, and how pricing and payment work. Anything specific is confirmed with you on WhatsApp."
      >
        <SpecLine items={["Minimum order: 30 pieces", "Mon–Fri · 9–5", "By appointment"]} />
      </PageIntro>

      <section className="section">
        <div className="container container--narrow">
          <FaqAccordion />
        </div>
      </section>

      <CtaBand title="Still have a question?" text="Message us on WhatsApp — we’re happy to help you scope your order." />
    </>
  );
}
