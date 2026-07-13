import { useHashQuery } from "../lib/router";
import { chatLink } from "../lib/whatsapp";
import { PageIntro } from "../components/PageIntro";
import { EnquiryFlow } from "../components/EnquiryFlow";
import { SectionHeader } from "../components/SectionHeader";
import { SpecLine } from "../components/SpecLine";
import { StudioRouteNote } from "../components/StudioRouteNote";

const AFTER = [
  "We read your enquiry and check what’s possible.",
  "We ask any follow-up questions we need.",
  "We confirm the specification, price and production timing.",
  "You approve the details and the agreed payment terms.",
  "Production begins on our floor in Ilupeju.",
  "The finished order is quality-checked and prepared for pickup or agreed delivery.",
];

export function StartOrder() {
  const service = useHashQuery("service");

  return (
    <>
      <PageIntro
        eyebrow="Start an order"
        title="Start an order enquiry"
        intro="Answer a few short questions and we’ll open WhatsApp with your details ready to send. This is an enquiry — not a confirmed order or price. The team replies to confirm what’s possible."
      >
        <SpecLine items={["Minimum order: 30 pieces", "Takes about a minute", "Ends in WhatsApp"]} />
      </PageIntro>

      <section className="section section--tight">
        <div className="container container--narrow">
          <StudioRouteNote compact />
          <EnquiryFlow key={service || "general"} initialService={service || undefined} />
        </div>
      </section>

      <section className="section section--paper2">
        <div className="container container--narrow">
          <SectionHeader
            eyebrow="What happens next"
            title="What happens after you enquire?"
            intro="No surprises. Here’s the path from your message to a finished order."
          />
          <ol className="afterlist">
            {AFTER.map((t, i) => (
              <li className="afteritem" key={i}>
                <span className="afteritem__n mono">{String(i + 1).padStart(2, "0")}</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
          <p className="afternote">
            Prefer to ask a question first?{" "}
            <a href={chatLink()} target="_blank" rel="noopener noreferrer">
              Message us on WhatsApp →
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
