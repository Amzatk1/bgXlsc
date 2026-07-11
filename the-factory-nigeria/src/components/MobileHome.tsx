import { ArrowUpRight, CalendarClock, Navigation } from "lucide-react";
import { BRAND, MAP_DIR_URL } from "../data/brand";
import { SERVICES } from "../data/services";
import { PHOTOS } from "../data/media";
import { chatLink, visitLink } from "../lib/whatsapp";
import { ServiceIcon } from "./ServiceIcon";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { Photo } from "./Photo";
import { ClientsStrip } from "./ClientsStrip";
import { Reveal } from "./Reveal";

// Compact 4-step summary of the full 8-step process board on /process.
const MSTEPS = [
  { n: "01", t: "Send brief", d: "Service, quantity, garment, deadline." },
  { n: "02", t: "Confirm quote", d: "Scope and price, on WhatsApp." },
  { n: "03", t: "Produce", d: "Made to spec on our floor." },
  { n: "04", t: "Check & collect", d: "Checked, packed, ready to collect." },
];

// A curated, intentionally short mobile homepage. Full depth lives on the
// inner pages (/services, /process, /work, /visit) — this is a fast summary
// and conversion path. Rendered only at <= 760px (see Home.tsx).
export function MobileHome() {
  const proof = PHOTOS.slice(0, 6);

  return (
    <>
      {/* Static fact strip — replaces the moving ticker on mobile */}
      <div className="mfacts">
        <span>Min. 30 pieces</span>
        <span>Production &amp; printing</span>
        <span>Visits by appointment</span>
      </div>

      {/* Quick proof — horizontal rail of the strongest real photos */}
      <section className="section--tight">
        <div className="container">
          <h2 className="sr-only">Selected work</h2>
          <div className="mhead">
            <span className="eyebrow" aria-hidden="true">Selected work</span>
            <a className="mhead__link" href="#/work">
              See all <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
          <div className="mrail" role="group" aria-label="Selected work">
            {proof.map((img) => (
              <figure className="mrail__item" key={img.name}>
                <Photo
                  name={img.name}
                  alt={img.alt}
                  ratio="4 / 5"
                  position={img.position}
                  sizes="72vw"
                />
                <figcaption className="mrail__cap mono">{img.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Services summary — compact picker, not six full cards */}
      <section className="section--tight section--paper2">
        <div className="container">
          <h2 className="sr-only">What we make</h2>
          <div className="mhead">
            <span className="eyebrow" aria-hidden="true">What we make</span>
            <a className="mhead__link" href="#/services">
              All services <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
          <div className="mpick">
            {SERVICES.map((s) => (
              <a className="mpick__item" href="#/services" key={s.id}>
                <span className="mpick__icon">
                  <ServiceIcon name={s.icon} size={18} />
                </span>
                <span className="mpick__name">{s.title}</span>
                <ArrowUpRight size={15} className="mpick__arr" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Process summary — 4 tight steps */}
      <section className="section--tight">
        <div className="container">
          <h2 className="sr-only">How it works</h2>
          <div className="mhead">
            <span className="eyebrow" aria-hidden="true">How it works</span>
            <a className="mhead__link" href="#/process">
              Full process <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
          <ol className="msteps">
            {MSTEPS.map((s) => (
              <li className="mstep" key={s.n}>
                <span className="mstep__n mono">{s.n}</span>
                <div className="mstep__body">
                  <h3 className="mstep__t">{s.t}</h3>
                  <p className="mstep__d">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Brands we've produced for */}
      <section className="section--tight">
        <div className="container">
          <ClientsStrip />
        </div>
      </section>

      {/* Visit summary — compact contact strip */}
      <section className="section--tight section--paper2">
        <div className="container">
          <Reveal className="mvisit">
            <h2 className="sr-only">Contact and visit</h2>
            <span className="eyebrow" aria-hidden="true">Visit / contact</span>
            <p className="mvisit__addr">{BRAND.address.display}</p>
            <p className="mvisit__note mono">Visits by appointment · {BRAND.hoursShort}</p>
            <div className="mvisit__btns">
              <a className="btn btn--primary" href={visitLink()} target="_blank" rel="noopener noreferrer">
                <CalendarClock size={17} aria-hidden="true" /> Book visit
              </a>
              <a className="btn btn--outline" href={MAP_DIR_URL} target="_blank" rel="noopener noreferrer">
                <Navigation size={17} aria-hidden="true" /> Directions
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Enquiry CTA — the full form lives on /start-an-order */}
      <section className="section--tight section--ink">
        <div className="container">
          <Reveal className="mqcta">
            <span className="eyebrow">Start an order</span>
            <h2 className="mqcta__title">Ready to start?</h2>
            <p className="lede">
              Answer a few short questions and we’ll open WhatsApp with your details ready to send.
              Minimum order: 30 pieces.
            </p>
            <div className="mqcta__btns">
              <a className="btn btn--primary btn--lg btn--block" href="#/start-an-order">
                Start an order enquiry
              </a>
              <a
                className="btn btn--wa btn--lg btn--block"
                href={chatLink()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon /> Chat on WhatsApp
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
