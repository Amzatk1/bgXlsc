import { Check } from "lucide-react";
import { SERVICES } from "../data/services";
import { METHOD_EXAMPLES, METHOD_WORDING, ARTWORK_WORDING } from "../data/siteFacts";
import { FILE_PREP } from "../data/media";
import { PageIntro } from "../components/PageIntro";
import { ServiceCard } from "../components/ServiceCard";
import { SectionHeader } from "../components/SectionHeader";
import { Reveal } from "../components/Reveal";
import { CtaBand } from "../components/CtaBand";
import { SpecLine } from "../components/SpecLine";
import { StudioRouteNote } from "../components/StudioRouteNote";

const CHECKLIST = [
  "Quantity (minimum 30 pieces)",
  "Garment / product type",
  "Artwork or logo (if printing)",
  "Size breakdown",
  "Deadline window",
  "Pickup or delivery preference",
];

// Method EXAMPLES from the shared facts layer — the team confirms the method
// per order; this is never presented as a settled equipment list.

export function Services() {
  return (
    <>
      <PageIntro
        eyebrow="Services"
        title="What The Factory produces"
        intro="Seven core capabilities for clothing brands, companies, teams, creators and events. Every card tells you what to send so we can quote fast on WhatsApp."
      >
        <SpecLine items={["Minimum order: 30 pieces", "Production & printing", "Start an order enquiry"]} />
      </PageIntro>

      <section className="section">
        <div className="container">
          <div className="grid cols-3">
            {SERVICES.map((s) => (
              <ServiceCard key={s.id} s={s} />
            ))}
          </div>
          <StudioRouteNote />
        </div>
      </section>

      <section className="section section--paper2">
        <div className="container split">
          <div className="split__a">
            <SectionHeader
              eyebrow="Print methods"
              title="The right print for the job"
              intro={`${METHOD_WORDING} These are the common recommendations — not sure? Send what you have and we’ll advise.`}
            />
            <div className="grid cols-3 methods">
              {METHOD_EXAMPLES.map((m, i) => (
                <Reveal delay={i * 70} key={m.t}>
                  <div className="method">
                    <h3 className="method__t">{m.t}</h3>
                    <p className="method__d">{m.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal className="split__b">
            <div className="ticket ticket--perf checklist">
              <div className="ticket__head">
                <span className="ticket__code">WHAT TO SEND</span>
                <span className="chip chip--brand">
                  <span className="chip__dot" aria-hidden="true" />
                  Quote inputs
                </span>
              </div>
              <ul className="checklist__list">
                {CHECKLIST.map((c) => (
                  <li key={c}>
                    <Check size={16} aria-hidden="true" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Real artwork-prep guides from the brand — shown whole (contain). */}
      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="Artwork & files"
            title="Send your artwork like this"
            intro={`These are the same guides we share with clients — match them where you can. ${ARTWORK_WORDING}`}
          />
          <Reveal>
            <div className="fileprep">
              {FILE_PREP.map((f) => (
                <figure className="fileprep__card" key={f.src}>
                  <div className="fileprep__art">
                    <img src={f.src} alt={f.title + " — artwork guide from The Factory"} loading="lazy" decoding="async" />
                  </div>
                  <figcaption className="fileprep__cap">
                    <span className="mono mono--purple">{f.title}</span>
                    <p>{f.note}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand
        title="Found what you need?"
        text="Pick a service above, or start an order enquiry and tell us what you’re making. Minimum order: 30 pieces."
      />
    </>
  );
}
