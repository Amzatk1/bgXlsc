import { useState, type FormEvent } from "react";
import { Check, Clock, Instagram, MapPin, Send } from "lucide-react";
import { SITE } from "../data/site";
import { useSettings } from "../content";
import { waLink } from "../lib/whatsapp";
import { Reveal } from "../components/Reveal";
import { WhatsAppIcon } from "../components/Icons";

const REASONS = ["Buy sneakers", "Stock products", "Book event", "Visit store", "Other"];

export function Contact() {
  const s = useSettings();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [reason, setReason] = useState(REASONS[0]);
  const [message, setMessage] = useState("");
  const [sentLink, setSentLink] = useState<string | null>(null);

  const buildLink = () =>
    waLink(
      [
        `Hi ${SITE.name} 👋`,
        `Reason: ${reason}`,
        name ? `Name: ${name}` : "",
        contact ? `Contact: ${contact}` : "",
        "",
        message,
        "",
        "— sent from lagossneakerclub.com",
      ]
        .filter(Boolean)
        .join("\n"),
    );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const link = buildLink();
    setSentLink(link);
    window.open(link, "_blank", "noopener");
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="page-hero__inner">
            <Reveal>
              <span className="eyebrow">Contact</span>
            </Reveal>
            <Reveal delay={60}>
              <h1>Let's talk.</h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="lede">
                The fastest way to reach us is WhatsApp — sizes, reservations, stocking and events.
                Send a note below and it opens a pre-filled chat.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section tight-top section--paper" style={{ paddingTop: 8 }}>
        <div className="container">
          <div className="split" style={{ alignItems: "start" }}>
            {/* Direct methods */}
            <div className="split__copy">
              <Reveal>
                <a className="btn btn--red btn--lg" href={waLink(`Hi ${SITE.name} 👋`)} target="_blank" rel="noreferrer">
                  <WhatsAppIcon size={18} />
                  {s.whatsappDisplay}
                </a>
              </Reveal>
              <Reveal delay={80}>
                <div className="info-list" style={{ marginTop: 8 }}>
                  <div className="info-row">
                    <span className="info-row__icon"><Instagram size={18} /></span>
                    <div>
                      <div className="info-row__label">Instagram</div>
                      <strong>
                        <a className="tlink" href={s.instagramUrl} target="_blank" rel="noreferrer">
                          {s.instagramHandle}
                        </a>
                      </strong>
                    </div>
                  </div>
                  <div className="info-row">
                    <span className="info-row__icon"><MapPin size={18} /></span>
                    <div>
                      <div className="info-row__label">Visit</div>
                      <strong>{s.addressFull}</strong>
                    </div>
                  </div>
                  <div className="info-row">
                    <span className="info-row__icon"><Clock size={18} /></span>
                    <div>
                      <div className="info-row__label">Hours</div>
                      <strong>{s.hoursSummary}</strong>
                    </div>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={120}>
                <p className="fineprint" style={{ marginTop: 18 }}>
                  We aim to reply within store hours. For the quickest response, message on WhatsApp.
                </p>
              </Reveal>
            </div>

            {/* Form */}
            <div>
              <Reveal>
                {sentLink ? (
                  <div className="form-success">
                    <span className="form-success__icon"><Check size={22} /></span>
                    <div>
                      <h3 style={{ fontFamily: "var(--sans)", fontSize: "1.1rem", fontWeight: 700, marginBottom: 6 }}>
                        Opening WhatsApp…
                      </h3>
                      <p className="muted" style={{ fontSize: "0.94rem" }}>
                        Your message is ready in a WhatsApp chat. If it didn't open,{" "}
                        <a className="tlink accent" href={sentLink} target="_blank" rel="noreferrer">
                          tap here to send it
                        </a>
                        .
                      </p>
                      <button type="button" className="btn btn--ghost btn--sm" style={{ marginTop: 14 }} onClick={() => setSentLink(null)}>
                        Edit message
                      </button>
                    </div>
                  </div>
                ) : (
                  <form className="form" onSubmit={onSubmit}>
                    <div className="field">
                      <label htmlFor="name">Name <span className="req">*</span></label>
                      <input
                        id="name"
                        className="input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        required
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="contact">Phone or email <span className="req">*</span></label>
                      <input
                        id="contact"
                        className="input"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="So we can reach you back"
                        required
                      />
                    </div>

                    <div className="field">
                      <label>Reason <span className="req">*</span></label>
                      <div className="radio-grid">
                        {REASONS.map((r) => (
                          <label className="radio-pill" key={r}>
                            <input
                              type="radio"
                              name="reason"
                              value={r}
                              checked={reason === r}
                              onChange={() => setReason(r)}
                            />
                            <span>{r}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="field">
                      <label htmlFor="message">Message <span className="req">*</span></label>
                      <textarea
                        id="message"
                        className="textarea"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us what you need — sizes, a reservation, a stocking enquiry, an event…"
                        required
                      />
                    </div>

                    <button type="submit" className="btn btn--primary btn--lg">
                      <Send size={17} />
                      Send via WhatsApp
                    </button>
                    <p className="fineprint">
                      This opens WhatsApp with your message pre-filled — nothing is stored on this site.
                    </p>
                  </form>
                )}
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
