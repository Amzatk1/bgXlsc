import { ArrowUpRight, CalendarCheck, Clock, MapPin, ShoppingBag, Users } from "lucide-react";
import { ASSETS } from "../data/assets";
import { openStatus } from "../data/site";
import { useSettings } from "../content";
import { waEnquiries } from "../lib/whatsapp";
import { Reveal } from "../components/Reveal";
import { WhatsAppIcon } from "../components/Icons";

const EXPECT = [
  { icon: ShoppingBag, title: "Try before you buy", desc: "Handle the pairs, check the sizing, and get honest advice from the floor." },
  { icon: CalendarCheck, title: "Reserve & pickup", desc: "Hold a pair on WhatsApp and collect it in store — no queues, no stress." },
  { icon: Users, title: "Events & community", desc: "Sneaker Saturdays, dinners and pop-ups happen right here in the space." },
];

export function Visit() {
  const s = useSettings();
  const { row, isOpen, closesAt } = openStatus(new Date(), s.hours);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="page-hero__inner">
            <Reveal>
              <span className="eyebrow">Visit</span>
            </Reveal>
            <Reveal delay={60}>
              <h1>Visit the Ikoyi space.</h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="lede">
                Find the hanging-sneaker room at 73 Ademola St. Walk in, try pairs on, and feel the
                culture in person — or message ahead and we'll hold your size.
              </p>
            </Reveal>
            <Reveal delay={160}>
              <span className="disclaimer" style={{ alignSelf: "flex-start" }}>
                <span className="announce__dot" aria-hidden="true" />
                {isOpen ? `Open now · until ${closesAt} today` : `Opening hours · ${s.hoursSummary}`}
              </span>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section tight-top section--paper" style={{ paddingTop: 8 }}>
        <div className="container">
          <div className="split">
            <div className="split__media">
              <Reveal>
                <div className="map-card">
                  <iframe
                    src={s.mapEmbed}
                    title="Map to Lagos Sneaker Club, 73 Ademola St, Ikoyi"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                  <a className="map-card__open" href={s.mapsDirections} target="_blank" rel="noreferrer">
                    Open in Maps
                    <ArrowUpRight size={15} />
                  </a>
                </div>
              </Reveal>
            </div>
            <div className="split__copy">
              <Reveal>
                <div className="info-list">
                  <div className="info-row">
                    <span className="info-row__icon"><MapPin size={18} /></span>
                    <div>
                      <div className="info-row__label">Address</div>
                      <strong>{s.addressFull}</strong>
                    </div>
                  </div>
                  <div className="info-row">
                    <span className="info-row__icon"><WhatsAppIcon size={18} /></span>
                    <div>
                      <div className="info-row__label">WhatsApp</div>
                      <strong>{s.whatsappDisplay}</strong>
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={80}>
                <div style={{ marginTop: 24 }}>
                  <div className="info-row__label" style={{ marginBottom: 6 }}>
                    <Clock size={13} style={{ verticalAlign: "-2px", marginRight: 6 }} />
                    Opening hours
                  </div>
                  <div className="hours-table">
                    {s.hours.map((h) => (
                      <div className={`hours-row${h.dow === row.dow ? " is-today" : ""}`} key={h.dow}>
                        <span className="hours-row__day">{h.day}</span>
                        <span className="hours-row__time">{h.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={120}>
                <div className="flex-wrap-gap mt-5">
                  <a className="btn btn--primary" href={s.mapsDirections} target="_blank" rel="noreferrer">
                    <MapPin size={18} />
                    Get directions
                  </a>
                  <a className="btn btn--ghost" href={waEnquiries.visit()} target="_blank" rel="noreferrer">
                    <WhatsAppIcon size={18} />
                    Message the store
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--white">
        <div className="container">
          <Reveal>
            <div className="cols-3" style={{ marginBottom: "clamp(28px,4vw,48px)" }}>
              <figure className="figure figure--portrait">
                <img src={ASSETS.brand.openEveryday} alt="LSC store interior with hanging sneakers" loading="lazy" />
              </figure>
              <figure className="figure figure--portrait">
                <img src={ASSETS.events.sneakerSaturday} alt="Customers at Lagos Sneaker Club in Ikoyi" loading="lazy" />
              </figure>
              <figure className="figure figure--portrait">
                <img src={ASSETS.products.lavcore} alt="Lavcore denim clog at Lagos Sneaker Club" loading="lazy" />
              </figure>
            </div>
          </Reveal>

          <Reveal>
            <div className="section-head">
              <div className="section-head__text">
                <span className="eyebrow">In the room</span>
                <h2>What to expect</h2>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <div className="cols-3">
              {EXPECT.map((item) => (
                <div className="feature-card" key={item.title}>
                  <span className="feature-card__icon"><item.icon size={22} /></span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section--paper" style={{ paddingBottom: "clamp(56px, 8vw, 120px)" }}>
        <div className="container">
          <Reveal>
            <div className="cta-band">
              <div className="cta-band__bg">
                <img src={ASSETS.brand.openEveryday} alt="" loading="lazy" />
              </div>
              <div className="cta-band__inner">
                <span className="eyebrow on-dark">Open everyday</span>
                <h2>Come find us in Ikoyi.</h2>
                <p>{s.addressFull} · {s.hoursSummary}</p>
                <div className="cta-band__actions">
                  <a className="btn btn--light btn--lg" href={s.mapsDirections} target="_blank" rel="noreferrer">
                    <MapPin size={18} />
                    Get directions
                  </a>
                  <a className="btn btn--red btn--lg" href={waEnquiries.visit()} target="_blank" rel="noreferrer">
                    <WhatsAppIcon size={18} />
                    WhatsApp the store
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
