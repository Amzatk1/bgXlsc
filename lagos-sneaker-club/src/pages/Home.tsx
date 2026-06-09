import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Clock,
  MapPin,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import { ASSETS } from "../data/assets";
import { SITE } from "../data/site";
import { useContent } from "../content";
import { Link } from "../router";
import { waEnquiries } from "../lib/whatsapp";
import { Brand } from "../components/Brand";
import { Reveal } from "../components/Reveal";
import { Slideshow } from "../components/Slideshow";
import { ProductCard } from "../components/ProductCard";
import { MediaRail } from "../components/MediaRail";
import { WhatsAppIcon } from "../components/Icons";

const STRIP = [
  "Open Everyday",
  "Sneaker retail",
  "Reserve on WhatsApp",
  "Consignment",
  "1K Sneaker Saturday",
  "Calling African Brands",
  "Ikoyi, Lagos",
  "A Hub for Culture",
];

export function Home() {
  const { featured, heroSlides, mediaRail } = useContent();
  return (
    <>
      {/* 1 — Editorial retail first screen */}
      <section className="hero">
        <div className="hero__grid">
          <div className="hero__copy">
            <Reveal>
              <span className="eyebrow on-dark">Lagos Sneaker Club · Ikoyi</span>
            </Reveal>
            <Reveal delay={60}>
              <h1 className="hero__title">
                A hub for sneaker <em>culture</em> in&nbsp;Lagos.
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="hero__sub">
                Shop drops, reserve pairs, visit the Ikoyi space, and pull up for community events.
                Real store, real culture — confirmed on WhatsApp.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div className="hero__cta">
                <Link to="/shop" className="btn btn--light btn--lg">
                  Shop sneakers
                  <ArrowRight size={18} />
                </Link>
                <a
                  className="btn btn--outline-light btn--lg"
                  href={waEnquiries.general()}
                  target="_blank"
                  rel="noreferrer"
                >
                  <WhatsAppIcon size={18} />
                  WhatsApp us
                </a>
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div className="hero__meta">
                <div className="hero__meta-item">
                  <strong>73 Ademola St</strong>
                  <span>Ikoyi, Lagos</span>
                </div>
                <div className="hero__meta-item">
                  <strong>Mon–Sat 12–6</strong>
                  <span>Sun 12–4</span>
                </div>
                <div className="hero__meta-item">
                  <strong>{SITE.instagram.handle}</strong>
                  <span>2.2k+ community</span>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="hero__media">
            <Slideshow slides={heroSlides} />
          </div>
        </div>
      </section>

      {/* Brand value marquee */}
      <div className="brandstrip" aria-hidden="true">
        <div className="marquee">
          <div className="marquee__track">
            {[...STRIP, ...STRIP].map((item, i) => (
              <span className="brandstrip__item" key={i}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2 — Featured drops */}
      <section className="section section--paper">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <div className="section-head__text">
                <span className="eyebrow">In store now</span>
                <h2>Featured drops</h2>
                <p>
                  A snapshot of what's on the shelves. Pick a size, add to your bag, and reserve the
                  pair on WhatsApp — staff confirm price and availability before pickup.
                </p>
              </div>
              <Link to="/shop" className="tlink">
                Shop all sneakers
                <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>

          <Reveal>
            <div className="product-grid product-grid--4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </Reveal>

          <Reveal>
            <div className="mt-5">
              <span className="disclaimer">
                <Sparkles size={15} />
                Prices and stock are confirmed on WhatsApp — no fake prices here.
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3 — Culture in Lagos */}
      <section className="section section--dark">
        <div className="container">
          <div className="split">
            <div className="split__media">
              <Reveal>
                <figure className="figure figure--portrait">
                  <span className="figure__tag">
                    <span className="tag tag--light">Rasta Roast</span>
                  </span>
                  <img src={ASSETS.events.rastaRoast} alt="LSC Rasta Roast community dinner in Ikoyi" loading="lazy" />
                </figure>
              </Reveal>
            </div>
            <div className="split__copy">
              <Reveal>
                <span className="eyebrow on-dark">Culture in Lagos</span>
              </Reveal>
              <Reveal delay={60}>
                <h2>More than a shop. It's where the culture meets.</h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="lede" style={{ color: "var(--d-text)" }}>
                  Sneaker Saturdays, community dinners, creator days and pop-ups — LSC is the room
                  where Lagos sneakerheads, designers and brands actually link up.
                </p>
              </Reveal>
              <Reveal delay={160}>
                <div className="flist">
                  <div className="flist__item">
                    <span className="flist__num">01</span>
                    <div>
                      <h4>1K Sneaker Saturday</h4>
                      <p>Monthly clue hunt and meet-up — solve it, pull up, win a pair for 1K.</p>
                    </div>
                  </div>
                  <div className="flist__item">
                    <span className="flist__num">02</span>
                    <div>
                      <h4>Rasta Roast dinners</h4>
                      <p>Long-table community nights under the hanging-sneaker ceiling.</p>
                    </div>
                  </div>
                  <div className="flist__item">
                    <span className="flist__num">03</span>
                    <div>
                      <h4>Creator days &amp; pop-ups</h4>
                      <p>Open studio for creators and rotating African brand takeovers.</p>
                    </div>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={200}>
                <div className="flex-wrap-gap mt-2">
                  <Link to="/events" className="btn btn--light">
                    See events &amp; culture
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 4 — Visit the Ikoyi space */}
      <section className="section section--white">
        <div className="container">
          <div className="split split--media-left">
            <div className="split__media">
              <Reveal>
                <figure className="figure figure--portrait">
                  <img src={ASSETS.brand.openEveryday} alt="Inside the Lagos Sneaker Club store in Ikoyi" loading="lazy" />
                </figure>
              </Reveal>
            </div>
            <div className="split__copy">
              <Reveal>
                <span className="eyebrow">Visit the space</span>
              </Reveal>
              <Reveal delay={60}>
                <h2>Open everyday in Ikoyi.</h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="lede">
                  Come try pairs on, talk sneakers, and see the hanging-sneaker room in person.
                  Walk-ins welcome — or message ahead to hold a pair.
                </p>
              </Reveal>
              <Reveal delay={160}>
                <div className="info-list" style={{ marginTop: 8 }}>
                  <div className="info-row">
                    <span className="info-row__icon">
                      <MapPin size={18} />
                    </span>
                    <div>
                      <div className="info-row__label">Address</div>
                      <strong>{SITE.address.full}</strong>
                    </div>
                  </div>
                  <div className="info-row">
                    <span className="info-row__icon">
                      <Clock size={18} />
                    </span>
                    <div>
                      <div className="info-row__label">Opening hours</div>
                      <strong>{SITE.hoursSummary}</strong>
                    </div>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={200}>
                <div className="flex-wrap-gap mt-2">
                  <a className="btn btn--primary" href={SITE.mapsDirections} target="_blank" rel="noreferrer">
                    <MapPin size={18} />
                    Get directions
                  </a>
                  <Link to="/visit" className="btn btn--ghost">
                    Visit page
                    <ArrowUpRight size={18} />
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 5 — Stock with us */}
      <section className="section section--paper">
        <div className="container">
          <div className="split">
            <div className="split__copy">
              <Reveal>
                <span className="eyebrow">Stock with us</span>
              </Reveal>
              <Reveal delay={60}>
                <h2>Calling African brands.</h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="lede">
                  For African fashion, accessories, beauty, skincare, home décor and lifestyle brands
                  ready to meet Lagos sneaker culture. Place your products in the LSC space and our
                  community.
                </p>
              </Reveal>
              <Reveal delay={160}>
                <div className="value-row mt-2">
                  <span className="value-row__item">
                    <Store size={17} /> Retail shelf space
                  </span>
                  <span className="value-row__item">
                    <Users size={17} /> Engaged community
                  </span>
                  <span className="value-row__item">
                    <CalendarDays size={17} /> Pop-up slots
                  </span>
                </div>
              </Reveal>
              <Reveal delay={200}>
                <div className="flex-wrap-gap mt-4">
                  <Link to="/stock-with-us" className="btn btn--primary">
                    Start a stocking enquiry
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </Reveal>
            </div>
            <div className="split__media">
              <Reveal>
                <figure className="figure figure--square">
                  <img
                    src={ASSETS.events.partnerTile}
                    alt="Lagos Sneaker Club partner-with-us campaign graphic"
                    loading="lazy"
                  />
                </figure>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 6 — Instagram / editorial wall */}
      <section className="section section--white">
        <div className="container">
          <Reveal>
            <MediaRail
              eyebrow="From the feed"
              title="Lagos, in motion"
              cta={
                <a className="tlink" href={SITE.instagram.url} target="_blank" rel="noreferrer">
                  {SITE.instagram.handle}
                  <ArrowUpRight size={16} />
                </a>
              }
              items={mediaRail}
            />
          </Reveal>
        </div>
      </section>

      {/* 7 — Final CTA */}
      <section className="section--paper" style={{ paddingBottom: "clamp(56px, 8vw, 120px)" }}>
        <div className="container">
          <Reveal>
            <div className="cta-band">
              <div className="cta-band__bg">
                <img src={ASSETS.events.sneakerSaturday} alt="" loading="lazy" />
              </div>
              <div className="cta-band__inner">
                <span className="eyebrow on-dark">Pull up</span>
                <h2>Shop a drop, reserve a pair, or just pull up to the space.</h2>
                <p>
                  Message us on WhatsApp for stock, sizes and reservations — or come find us at 73
                  Ademola St, Ikoyi. Open everyday.
                </p>
                <div className="cta-band__actions">
                  <Link to="/shop" className="btn btn--light btn--lg">
                    Shop sneakers
                    <ArrowRight size={18} />
                  </Link>
                  <a className="btn btn--red btn--lg" href={waEnquiries.general()} target="_blank" rel="noreferrer">
                    <WhatsAppIcon size={18} />
                    Reserve on WhatsApp
                  </a>
                </div>
                <div style={{ marginTop: 22 }}>
                  <Brand />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
