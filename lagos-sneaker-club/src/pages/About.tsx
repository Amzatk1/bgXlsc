import { type CSSProperties } from "react";
import { ArrowRight, ArrowUpRight, Recycle, Store, Users } from "lucide-react";
import { ASSETS } from "../data/assets";
import { SITE } from "../data/site";
import { Link } from "../router";
import { waEnquiries } from "../lib/whatsapp";
import { Reveal } from "../components/Reveal";
import { InViewVideo } from "../components/InViewVideo";
import { VideoSoundButton } from "../components/VideoSoundButton";
import { WhatsAppIcon } from "../components/Icons";

const PILLARS = [
  {
    icon: Store,
    title: "A real store",
    desc: "A physical sneaker shop in Ikoyi — new pairs, core staples and curated consignment, all reservable on WhatsApp.",
  },
  {
    icon: Users,
    title: "A community",
    desc: "Sneaker Saturdays, dinners, creator days and pop-ups that turn customers into a real Lagos community.",
  },
  {
    icon: Recycle,
    title: "A platform",
    desc: "Consignment and stocking for African fashion, beauty and lifestyle brands ready to meet the culture.",
  },
];

type GalleryCell = { src: string; ar: number; alt: string; cap: string; wide?: boolean };

/** Asymmetrical, justified-row culture wall — shot on the floor in Ikoyi. */
const CULTURE_ROWS: GalleryCell[][] = [
  [
    {
      src: ASSETS.about.winners01,
      ar: 0.8,
      alt: "1K Sneaker Saturday winners holding their pairs inside the Lagos Sneaker Club store",
      cap: "Sneaker Saturday winners",
    },
    {
      src: ASSETS.about.rastaRoast08,
      ar: 0.8,
      alt: "Friends in their fits at a Lagos Sneaker Club Rasta Roast dinner",
      cap: "Rasta Roast IV",
    },
    {
      src: ASSETS.about.rastaRoast03,
      ar: 1.5,
      alt: "The long community table at the Rasta Roast dinner in Ikoyi",
      cap: "The long table",
      wide: true,
    },
  ],
  [
    {
      src: ASSETS.about.rastaRoast07,
      ar: 0.8,
      alt: "A guest laughing at the Rasta Roast community night",
      cap: "Community night",
    },
    {
      src: ASSETS.about.lavcore02,
      ar: 0.75,
      alt: "Hands holding the Nigerian-made Lavcore denim clog",
      cap: "Made in Lagos · Lavcore",
    },
    {
      src: ASSETS.about.rastaRoast09,
      ar: 0.8,
      alt: "Plates being served at the Rasta Roast community dinner",
      cap: "Good food, right people",
    },
    {
      src: ASSETS.about.winners02,
      ar: 0.8,
      alt: "A winner with his Nike box at 1K Sneaker Saturday",
      cap: "1K Sneaker Saturday",
    },
  ],
];

export function About() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="page-hero__inner">
            <Reveal>
              <span className="eyebrow">About</span>
            </Reveal>
            <Reveal delay={60}>
              <h1>A hub for culture.</h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="lede">
                Lagos Sneaker Club is a sneaker retail and culture space in Ikoyi. We sell and reserve
                pairs, host the community, and give African brands a place to land — all under one
                hanging-sneaker ceiling.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="container">
        <Reveal>
          <figure className="figure figure--wide">
            <span className="figure__tag">
              <span className="tag tag--light tag--dot">Open Everyday · Ikoyi</span>
            </span>
            <img src={ASSETS.brand.openEveryday} alt="Inside Lagos Sneaker Club, Ikoyi" loading="lazy" />
          </figure>
        </Reveal>
      </section>

      <section className="section section--paper">
        <div className="container">
          <div className="split">
            <div className="split__copy">
              <Reveal>
                <span className="eyebrow">The story</span>
              </Reveal>
              <Reveal delay={60}>
                <h2>Built around the sneakers — and the people.</h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="body-lg">
                  LSC started with a simple idea: Lagos deserves a proper home for sneakers and the
                  culture around them. Not a faceless shop — a room where heads, designers and brands
                  link up.
                </p>
              </Reveal>
              <Reveal delay={160}>
                <p className="body-lg">
                  Today that means a curated wall of pairs, consignment for sellers, a stage for
                  African brands, and a calendar of community moments. Affiliated to the wider sneaker
                  club network, rooted firmly in Lagos.
                </p>
              </Reveal>
              <Reveal delay={200}>
                <div className="flex-wrap-gap mt-2">
                  <Link to="/shop" className="btn btn--primary">
                    Shop the wall
                    <ArrowRight size={18} />
                  </Link>
                  <Link to="/visit" className="btn btn--ghost">
                    Visit the space
                  </Link>
                </div>
              </Reveal>
            </div>
            <div className="split__media">
              <Reveal>
                <figure className="figure figure--portrait">
                  <InViewVideo
                    src={ASSETS.videos.countdown4}
                    poster={ASSETS.products.clue4}
                    soundId="about:story"
                  />
                  <VideoSoundButton id="about:story" />
                  <div className="slide__scrim" />
                  <span className="figure__tag" style={{ top: "auto", bottom: 14, left: 14 }}>
                    <span className="tag tag--light tag--dot">1K Sneaker Saturday</span>
                  </span>
                </figure>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--white">
        <div className="container">
          <Reveal>
            <div className="cols-3">
              {PILLARS.map((p) => (
                <div className="feature-card" key={p.title}>
                  <span className="feature-card__icon"><p.icon size={22} /></span>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <div className="section-head__text">
                <span className="eyebrow on-dark">In the room</span>
                <h2>This is the room.</h2>
                <p>
                  Rasta Roast dinners, 1K Sneaker Saturday winners, and the African brands we back —
                  shot on the floor in Ikoyi.
                </p>
              </div>
              <a className="tlink on-dark" href={SITE.instagram.url} target="_blank" rel="noreferrer">
                {SITE.instagram.handle}
                <ArrowUpRight size={16} />
              </a>
            </div>
          </Reveal>
          <Reveal>
            <div className="gallery">
              {CULTURE_ROWS.map((row, ri) => (
                <div className="gallery__row" key={ri}>
                  {row.map((cell) => (
                    <figure
                      className={`gallery__cell${cell.wide ? " is-wide" : ""}`}
                      style={{ "--ar": cell.ar } as CSSProperties}
                      key={cell.src}
                    >
                      <img src={cell.src} alt={cell.alt} loading="lazy" decoding="async" />
                      <figcaption className="gallery__cap">{cell.cap}</figcaption>
                    </figure>
                  ))}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section--paper" style={{ paddingBlock: "clamp(56px, 8vw, 120px)" }}>
        <div className="container">
          <Reveal>
            <div className="cta-band">
              <div className="cta-band__bg">
                <img src={ASSETS.events.rastaRoast} alt="" loading="lazy" />
              </div>
              <div className="cta-band__inner">
                <span className="eyebrow on-dark">Join the club</span>
                <h2>Shop, visit, or build with us.</h2>
                <p>Reserve a pair, pull up to the space, or bring your brand into the room.</p>
                <div className="cta-band__actions">
                  <Link to="/shop" className="btn btn--light btn--lg">
                    Shop sneakers
                    <ArrowRight size={18} />
                  </Link>
                  <a className="btn btn--red btn--lg" href={waEnquiries.general()} target="_blank" rel="noreferrer">
                    <WhatsAppIcon size={18} />
                    WhatsApp us
                  </a>
                </div>
                <p className="fineprint" style={{ marginTop: 18, color: "var(--d-text-2)" }}>
                  {SITE.instagram.handle} · {SITE.address.full}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
