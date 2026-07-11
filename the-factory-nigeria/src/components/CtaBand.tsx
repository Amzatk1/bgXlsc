import { chatLink } from "../lib/whatsapp";
import { Reveal } from "./Reveal";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function CtaBand({
  title = "Ready to start?",
  text,
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="ctaband section--ink">
      <div className="container ctaband__inner">
        <Reveal className="ctaband__copy">
          <h2 className="h2">{title}</h2>
          <p className="lede">
            {text ??
              "Answer a few short questions and we’ll open WhatsApp with your details ready to send. Minimum order: 30 pieces."}
          </p>
        </Reveal>
        <Reveal delay={90} className="ctaband__btns">
          <a className="btn btn--primary btn--lg" href="#/start-an-order">
            Start an order enquiry
          </a>
          <a
            className="btn btn--wa btn--lg"
            href={chatLink()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon /> Chat on WhatsApp
          </a>
        </Reveal>
      </div>
    </section>
  );
}
