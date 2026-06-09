import {
  ArrowRight,
  CalendarDays,
  Footprints,
  Home,
  Send,
  Shirt,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import { ASSETS } from "../data/assets";
import { Link } from "../router";
import { waEnquiries } from "../lib/whatsapp";
import { Reveal } from "../components/Reveal";
import { Faq } from "../components/Faq";
import { WhatsAppIcon } from "../components/Icons";

const AUDIENCE = [
  { icon: Shirt, title: "Fashion & accessories", desc: "Clothing, bags, jewellery and accessory labels made in Africa." },
  { icon: Sparkles, title: "Beauty & skincare", desc: "Beauty, skincare and grooming brands ready for a retail floor." },
  { icon: Home, title: "Home & lifestyle", desc: "Home décor, lifestyle goods and objects with a point of view." },
  { icon: Footprints, title: "Footwear & custom", desc: "Local footwear and custom makers — like the Lavcore denim clog." },
];

const STEPS = [
  { n: "01", title: "Send an enquiry", desc: "Message us on WhatsApp or the contact form with a few photos and your story." },
  { n: "02", title: "We review the fit", desc: "We check your products suit the LSC floor, the community and the price point." },
  { n: "03", title: "Onboard & place", desc: "Agree simple terms, drop your stock, and we merchandise it in the Ikoyi space." },
  { n: "04", title: "Sell & feature", desc: "Your brand sells in store and gets featured across events and pop-ups." },
];

const FAQS = [
  {
    q: "What kinds of brands can stock with LSC?",
    a: "African fashion, accessories, beauty, skincare, home décor, lifestyle and footwear brands. If it fits the culture and the floor, we want to see it.",
  },
  {
    q: "How do pricing and commission work?",
    a: "Terms are agreed per brand depending on category, volume and whether it's a shelf placement or a pop-up. Message us and we'll share the current structure — no surprises.",
  },
  {
    q: "Do you run pop-ups and launches?",
    a: "Yes. Alongside permanent shelf space we run seasonal pop-ups and brand takeovers so new labels can meet the community directly.",
  },
  {
    q: "Where are you located?",
    a: "73 Ademola St, Ikoyi, Lagos. Open Mon–Sat 12–6pm and Sun 12–4pm. You're welcome to visit before stocking.",
  },
];

export function StockWithUs() {
  return (
    <>
      <section className="section tight-top section--paper">
        <div className="container">
          <div className="split">
            <div className="split__copy">
              <Reveal>
                <span className="eyebrow">Stock with us</span>
              </Reveal>
              <Reveal delay={60}>
                <h1>Stock your items with us.</h1>
              </Reveal>
              <Reveal delay={120}>
                <p className="lede">
                  For African fashion, accessories, beauty, skincare, home décor and lifestyle brands
                  ready to meet Lagos sneaker culture. Place your products in the LSC space and in
                  front of our community.
                </p>
              </Reveal>
              <Reveal delay={160}>
                <div className="value-row mt-2">
                  <span className="value-row__item"><Store size={17} /> Retail shelf space</span>
                  <span className="value-row__item"><Users size={17} /> Engaged community</span>
                  <span className="value-row__item"><CalendarDays size={17} /> Pop-up slots</span>
                </div>
              </Reveal>
              <Reveal delay={200}>
                <div className="flex-wrap-gap mt-4">
                  <a className="btn btn--red btn--lg" href={waEnquiries.stock()} target="_blank" rel="noreferrer">
                    <WhatsAppIcon size={18} />
                    Start a stocking enquiry
                  </a>
                  <Link to="/contact" className="btn btn--ghost btn--lg">
                    Send full details
                    <Send size={17} />
                  </Link>
                </div>
              </Reveal>
            </div>
            <div className="split__media">
              <Reveal>
                <figure className="figure figure--square">
                  <img
                    src={ASSETS.events.partnerTile}
                    alt="Lagos Sneaker Club partner-with-us campaign graphic in red"
                    loading="lazy"
                  />
                </figure>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--white">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <div className="section-head__text">
                <span className="eyebrow">Who it's for</span>
                <h2>Brands that belong on the floor</h2>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <div className="product-grid product-grid--4">
              {AUDIENCE.map((item) => (
                <div className="feature-card" key={item.title}>
                  <span className="feature-card__icon">
                    <item.icon size={22} />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <div className="split">
            <div className="split__media">
              <Reveal>
                <figure className="figure figure--portrait">
                  <img
                    src={ASSETS.brand.callingAfricanBrands}
                    alt="Calling African Brands — Lagos Sneaker Club editorial poster"
                    loading="lazy"
                  />
                </figure>
              </Reveal>
            </div>
            <div className="split__copy">
              <Reveal>
                <span className="eyebrow on-dark">How it works</span>
              </Reveal>
              <Reveal delay={60}>
                <h2>From enquiry to the shelf.</h2>
              </Reveal>
              <Reveal delay={120}>
                <div className="flist">
                  {STEPS.map((step) => (
                    <div className="flist__item" key={step.n}>
                      <span className="flist__num">{step.n}</span>
                      <div>
                        <h4>{step.title}</h4>
                        <p>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
              <Reveal delay={160}>
                <div className="flex-wrap-gap mt-2">
                  <a className="btn btn--light" href={waEnquiries.stock()} target="_blank" rel="noreferrer">
                    <WhatsAppIcon size={18} />
                    Enquire on WhatsApp
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--paper">
        <div className="container">
          <div className="split">
            <div className="split__copy">
              <Reveal>
                <span className="eyebrow">Good to know</span>
              </Reveal>
              <Reveal delay={60}>
                <h2>Stocking questions</h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="lede">
                  A few things brands usually ask. For anything specific, message us — we'll give you
                  straight answers.
                </p>
              </Reveal>
              <Reveal delay={160}>
                <div className="flex-wrap-gap mt-2">
                  <a className="btn btn--primary" href={waEnquiries.stock()} target="_blank" rel="noreferrer">
                    <WhatsAppIcon size={18} />
                    Talk to us
                  </a>
                </div>
              </Reveal>
            </div>
            <div>
              <Reveal>
                <Faq items={FAQS} />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="section--paper" style={{ paddingBottom: "clamp(56px, 8vw, 120px)" }}>
        <div className="container">
          <Reveal>
            <div className="cta-band">
              <div className="cta-band__bg">
                <img src={ASSETS.brand.callingAfricanBrands} alt="" loading="lazy" />
              </div>
              <div className="cta-band__inner">
                <span className="eyebrow on-dark">Calling African brands</span>
                <h2>Ready to meet Lagos sneaker culture?</h2>
                <p>Start a stocking enquiry and tell us about your brand. We'll take it from there.</p>
                <div className="cta-band__actions">
                  <a className="btn btn--red btn--lg" href={waEnquiries.stock()} target="_blank" rel="noreferrer">
                    <WhatsAppIcon size={18} />
                    Start a stocking enquiry
                  </a>
                  <Link to="/contact" className="btn btn--outline-light btn--lg">
                    Use the contact form
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
