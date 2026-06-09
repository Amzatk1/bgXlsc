import { ArrowRight, ArrowUpRight, Clock, MapPin } from "lucide-react";
import { ASSETS } from "../data/assets";
import { SITE } from "../data/site";
import { useContent } from "../content";
import { Link } from "../router";
import { waEnquiries } from "../lib/whatsapp";
import { Reveal } from "../components/Reveal";
import { MediaRail } from "../components/MediaRail";
import { InViewVideo } from "../components/InViewVideo";
import { VideoSoundButton } from "../components/VideoSoundButton";
import { WhatsAppIcon } from "../components/Icons";

export function Events() {
  const { events, mediaRail } = useContent();
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="page-hero__inner">
            <Reveal>
              <span className="eyebrow">Events &amp; culture</span>
            </Reveal>
            <Reveal delay={60}>
              <h1>Where Lagos sneaker culture gathers.</h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="lede">
                LSC runs the meet-ups, dinners, creator days and pop-ups that bring the community
                together under one roof in Ikoyi. Pull up, link up, and keep it locked.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="container">
        <Reveal>
          <figure className="figure figure--wide">
            <span className="figure__tag">
              <span className="tag tag--light tag--dot">Rasta Roast IV · Sneakerhead edition</span>
            </span>
            <img src={ASSETS.events.rastaRoast} alt="Community gathering at a Lagos Sneaker Club Rasta Roast dinner" loading="lazy" />
          </figure>
        </Reveal>
      </section>

      <section className="section section--paper">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <div className="section-head__text">
                <span className="eyebrow">The programme</span>
                <h2>What's coming up</h2>
                <p>
                  Dates are indicative — confirm the next date on WhatsApp or{" "}
                  <a className="tlink accent" href={SITE.instagram.url} target="_blank" rel="noreferrer">
                    {SITE.instagram.handle}
                  </a>
                  .
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="cols-2">
              {events.map((event) => (
                <article className="event-card" key={event.id}>
                  <div className="event-card__media">
                    {event.date && (
                      <div className="event-card__date">
                        <b>{event.date.d}</b>
                        <span>{event.date.m}</span>
                      </div>
                    )}
                    {event.media.type === "video" ? (
                      <>
                        <InViewVideo
                          src={event.media.src}
                          poster={event.media.poster}
                          soundId={`event:${event.id}`}
                        />
                        <VideoSoundButton id={`event:${event.id}`} />
                      </>
                    ) : (
                      <img src={event.media.src} alt={event.title} loading="lazy" />
                    )}
                  </div>
                  <div className="event-card__body">
                    <span className="eyebrow neutral no-rule" style={{ letterSpacing: "0.12em" }}>
                      {event.kind}
                    </span>
                    <h3>{event.title}</h3>
                    <p className="muted" style={{ fontSize: "0.94rem" }}>
                      {event.blurb}
                    </p>
                    <div className="event-card__meta">
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <MapPin size={14} /> LSC, Ikoyi
                      </span>
                      {event.time && (
                        <>
                          <span className="dotsep" aria-hidden="true" />
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <Clock size={14} /> {event.when} · {event.time}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex-wrap-gap" style={{ marginTop: 6 }}>
                      <a className="btn btn--primary btn--sm" href={waEnquiries.event(event.title)} target="_blank" rel="noreferrer">
                        <WhatsAppIcon size={15} />
                        RSVP / details
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section--white">
        <div className="container">
          <Reveal>
            <MediaRail
              eyebrow="From the community"
              title="Moments from the floor"
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

      <section className="section--paper" style={{ paddingBottom: "clamp(56px, 8vw, 120px)" }}>
        <div className="container">
          <Reveal>
            <div className="cta-band">
              <div className="cta-band__bg">
                <img src={ASSETS.events.sneakerSaturday} alt="" loading="lazy" />
              </div>
              <div className="cta-band__inner">
                <span className="eyebrow on-dark">Pull up</span>
                <h2>Want in on the next one?</h2>
                <p>
                  RSVP for an event, host your own at the space, or partner on a pop-up. Message us
                  and we'll sort the details.
                </p>
                <div className="cta-band__actions">
                  <a className="btn btn--red btn--lg" href={waEnquiries.event()} target="_blank" rel="noreferrer">
                    <WhatsAppIcon size={18} />
                    RSVP on WhatsApp
                  </a>
                  <Link to="/visit" className="btn btn--outline-light btn--lg">
                    Visit the space
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
