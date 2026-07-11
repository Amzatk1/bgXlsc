import { ArrowRight, ArrowUpRight } from "lucide-react";
import { BRAND } from "../data/brand";
import { SERVICES } from "../data/services";
import { HERO_PHOTO, SEQUENCE } from "../data/media";
import { useMediaQuery } from "../lib/useMediaQuery";
import { Reveal } from "../components/Reveal";
import { MobileHome } from "../components/MobileHome";
import { StatusChip } from "../components/StatusChip";
import { SectionHeader } from "../components/SectionHeader";
import { Photo } from "../components/Photo";
import { Ticket } from "../components/Ticket";
import { Ticker } from "../components/Ticker";
import { ServiceCard } from "../components/ServiceCard";
import { ProofWall } from "../components/ProofWall";
import { VisitPanel } from "../components/VisitPanel";
import { ClientsStrip } from "../components/ClientsStrip";
import { CtaBand } from "../components/CtaBand";

export function Home() {
  const isMobile = useMediaQuery("(max-width: 760px)");

  return (
    <>
      {/* ---------- HERO: PRODUCTION DESK ---------- */}
      <section className="hero paper-grid">
        <div className="container hero__grid">
          <div className="hero__left">
            <Reveal>
              <span className="eyebrow">Garment production &amp; printing · Lagos</span>
            </Reveal>
            <Reveal delay={70}>
              <h1 className="display hero__title">
                From an idea to a <span className="hero__mark">finished garment</span>, produced in
                Lagos.
              </h1>
            </Reveal>
            <Reveal delay={130}>
              <p className="lede">
                Custom clothing, uniforms, printing, embroidery and merch for brands, companies,
                teams and events. Minimum order: 30 pieces.
              </p>
            </Reveal>
            <Reveal delay={190}>
              <div className="hero__cta">
                <a className="btn btn--primary btn--lg" href="#/start-an-order">
                  Start an order enquiry
                </a>
                <a className="btn btn--outline btn--lg" href="#/work">
                  View our work
                </a>
              </div>
            </Reveal>
            <Reveal delay={250}>
              <div className="hero__meta">
                <StatusChip tone="brand">Min. order {BRAND.bioMoq}</StatusChip>
                <StatusChip>Mon–Fri · 9–5</StatusChip>
                <StatusChip>Ilupeju, Lagos</StatusChip>
                <StatusChip tone="ready">Visits by appointment</StatusChip>
              </div>
            </Reveal>
          </div>

          <Reveal delay={160} className="hero__right">
            <div className="hero__stage">
              <div className="hero__photo">
                <Photo
                  name={HERO_PHOTO.name}
                  alt={HERO_PHOTO.alt}
                  ratio="4 / 5"
                  position={HERO_PHOTO.position}
                  sizes="(max-width: 760px) 100vw, 42vw"
                  priority
                />
                <span className="hero__tag chip chip--dark">
                  <span className="chip__dot chip__dot--pulse" aria-hidden="true" />
                  On the floor · Ilupeju
                </span>
              </div>
              {!isMobile && (
                <div className="hero__ticket">
                  <Ticket
                    perf
                    code="QUOTE TICKET · SAMPLE"
                    status={
                      <span className="chip chip--brand">
                        <span className="chip__dot" aria-hidden="true" />
                        Template
                      </span>
                    }
                    rows={[
                      { label: "Service", value: "Production & printing" },
                      { label: "Min. order", value: BRAND.bioMoq },
                      { label: "Location", value: "Ilupeju, Lagos" },
                    ]}
                    footer={
                      <a className="ticket__cta" href="#/start-an-order">
                        Start an order <ArrowRight size={15} aria-hidden="true" />
                      </a>
                    }
                  />
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {isMobile ? (
        <MobileHome />
      ) : (
        <>
          <Ticker />

          {/* ---------- PRODUCTION SEQUENCE (photo essay) ---------- */}
          <section className="section">
            <div className="container">
              <SectionHeader
                eyebrow="Inside the factory"
                title="From artwork to finished garment"
                intro="Every stage happens on our floor in Ilupeju — designed, cut, sewn, printed, embroidered and finished."
                action={
                  <a className="btn btn--ghost" href="#/process">
                    <span className="btn-underline">See the full process</span>
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                }
              />
              <div className="sequence" role="list">
                {SEQUENCE.map((it, i) => (
                  <Reveal delay={i * 60} key={it.name} className="sequence__item">
                    <figure className="seqfig" role="listitem">
                      <Photo
                        name={it.name}
                        alt={it.alt}
                        ratio={it.ratio}
                        position={it.position}
                        sizes="(max-width: 1000px) 40vw, 20vw"
                      />
                      <figcaption className="seqfig__cap">
                        <span className="seqfig__n mono">{it.step}</span>
                        <span className="seqfig__label">{it.label}</span>
                      </figcaption>
                    </figure>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ---------- SERVICES PREVIEW ---------- */}
          <section className="section section--paper2">
            <div className="container">
              <SectionHeader
                eyebrow="What we make"
                title="Production, built around your brief"
                intro="Six core capabilities. Each one tells you exactly what to send so we can quote fast."
                action={
                  <a className="btn btn--ghost" href="#/services">
                    <span className="btn-underline">All services</span>
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                }
              />
              <div className="grid cols-3">
                {SERVICES.map((s) => (
                  <ServiceCard key={s.id} s={s} />
                ))}
              </div>
            </div>
          </section>

          {/* ---------- PROOF PREVIEW ---------- */}
          <section className="section">
            <div className="container">
              <SectionHeader
                eyebrow="Selected work"
                title="Real production, off our floor"
                intro="Finished pieces, uniforms and production moments — shot on-site at The Factory."
                action={
                  <a className="btn btn--ghost" href="#/work">
                    <span className="btn-underline">See more work</span>
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                }
              />
              <ProofWall showFilter={false} limit={9} />
              <ClientsStrip />
            </div>
          </section>

          {/* ---------- VISIT BAND ---------- */}
          <section className="section section--ink">
            <div className="container">
              <SectionHeader
                eyebrow="Visit / contact"
                title="Come see the factory"
                intro="We’re at 46 Industrial Avenue, Ilupeju. Factory visits are by appointment — message us first and we’ll set a time."
              />
              <VisitPanel />
            </div>
          </section>

          <CtaBand />
        </>
      )}
    </>
  );
}
