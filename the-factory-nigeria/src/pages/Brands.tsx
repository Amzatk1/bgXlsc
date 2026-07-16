import { Check, Factory, MessageSquare, PackageCheck, ShieldCheck } from "lucide-react";
import { BRAND } from "../data/brand";
import { PageIntro } from "../components/PageIntro";
import { SectionHeader } from "../components/SectionHeader";
import { Reveal } from "../components/Reveal";
import { SpecLine } from "../components/SpecLine";
import { ProofWall } from "../components/ProofWall";
import { Photo } from "../components/Photo";
import { ClientsStrip } from "../components/ClientsStrip";
import { CtaBand } from "../components/CtaBand";

const AUDIENCES: { t: string; d: string }[] = [
  { t: "Clothing brands", d: "Production runs for your label — cut-and-sew, prints and finishing to your design." },
  { t: "Companies & corporates", d: "Branded uniforms, staff kits and corporate merch, consistent across every size." },
  { t: "Teams & clubs", d: "Custom jerseys and kit for teams, clubs and group orders." },
  { t: "Creators & drops", d: "Limited drops and signature pieces produced from your concept." },
  { t: "Events & pop-ups", d: "Event merch and souvenirs, produced and ready for your date." },
  { t: "Schools & groups", d: "Group apparel and uniforms for schools and associations." },
];

const WHY = [
  { icon: Factory, t: "A real factory", d: "A working factory at 46 Industrial Avenue, Ilupeju. The work you see is ours — visits by appointment." },
  { icon: MessageSquare, t: "Quote-first, no surprises", d: "Scope and price are confirmed on WhatsApp before anything goes into production." },
  { icon: PackageCheck, t: "Built for bulk", d: `Set up for brand and company runs, with a minimum order of ${BRAND.bioMoq}.` },
  { icon: ShieldCheck, t: "Checked before handover", d: "The team reviews stitch, print and finishing before anything is packed." },
];

const CHECKLIST = [
  "Quantity (minimum 30 pieces)",
  "Garment / product type",
  "Artwork or logo",
  "Size breakdown",
  "Deadline window",
  "Pickup or delivery preference",
];

export function Brands() {
  return (
    <>
      <PageIntro
        compact
        eyebrow="For brands & companies"
        title="Your production partner in Lagos"
        intro="We produce for the people building things — brands, companies, teams, creators and events. Tell us what you need and we’ll confirm the right production path with you."
      >
        <SpecLine items={["Minimum order: 30 pieces", "Bulk & corporate orders", "Ilupeju, Lagos"]} />
      </PageIntro>

      {/* Lead with real corporate uniform / workwear proof */}
      <section className="section">
        <div className="container">
          <div className="unifeature">
            <Reveal className="unifeature__lead">
              <Photo
                name="WWW02028"
                alt="A finished orange and navy corporate workwear uniform produced at The Factory."
                ratio="4 / 5"
                position="center 42%"
                sizes="(max-width: 900px) 100vw, 42vw"
              />
            </Reveal>
            <Reveal delay={90} className="unifeature__body">
              <span className="eyebrow">Corporate &amp; uniforms</span>
              <h2 className="h2">Uniforms your team will actually wear</h2>
              <p className="lede">
                Workwear, staff kits, branded jackets and event merch — produced consistently across
                every size, on your logo and colours, and reviewed before handover.
              </p>
              <div className="unifeature__grid">
                <Photo name="WWW02024" alt="Fitting a workwear jacket on the form." ratio="1 / 1" position="center 26%" sizes="(max-width: 900px) 50vw, 22vw" />
                <Photo name="WWW02021" alt="Finished garments on the showroom rack." ratio="1 / 1" position="center" sizes="(max-width: 900px) 50vw, 22vw" />
              </div>
              <a className="btn btn--primary" href="#/start-an-order?service=Corporate%20uniforms">
                Start a company order
              </a>
            </Reveal>
          </div>
          <ClientsStrip />
        </div>
      </section>

      <section className="section section--paper2">
        <div className="container">
          <SectionHeader eyebrow="Who we produce for" title="Made for serious orders" />
          <div className="grid cols-3">
            {AUDIENCES.map((a, i) => (
              <Reveal delay={(i % 3) * 70} key={a.t}>
                <article className="aud">
                  <span className="aud__bar" aria-hidden="true" />
                  <h3 className="aud__t">{a.t}</h3>
                  <p className="aud__d">{a.d}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--paper2">
        <div className="container split">
          <div className="split__a">
            <SectionHeader eyebrow="Why The Factory" title="Reasons brands choose us" />
            <div className="grid cols-2 why">
              {WHY.map((w, i) => (
                <Reveal delay={(i % 2) * 70} key={w.t}>
                  <div className="why__item">
                    <span className="why__icon">
                      <w.icon size={20} strokeWidth={1.6} aria-hidden="true" />
                    </span>
                    <h3 className="why__t">{w.t}</h3>
                    <p className="why__d">{w.d}</p>
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

      {/* Proof: real uniforms, bulk and production for companies */}
      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="Proof"
            title="Corporate-ready production"
            intro="Branded uniforms, bulk runs and finished orders — made by The Factory in Ilupeju."
          />
          <ProofWall showFilter={false} only={["Uniforms", "Production"]} limit={4} />
        </div>
      </section>

      <CtaBand
        title="Producing for a company or team?"
        text="Start an order enquiry with your quantities and sizes and we’ll confirm what’s possible. Minimum order: 30 pieces."
      />
    </>
  );
}
