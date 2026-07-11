import { Clock, Instagram, MapPin } from "lucide-react";
import { BRAND, MAP_URL, NAV } from "../data/brand";
import { LOGO, LOGO_BG } from "../data/media";
import { chatLink } from "../lib/whatsapp";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <a href="#/" className="brandmark brandmark--dark" aria-label={BRAND.name + " — home"}>
              <img className="brandmark__logo" src={LOGO} alt="The Factory Nigeria" width={84} height={42} />
              <span className="brandmark__text">
                <span className="brandmark__name">THE FACTORY</span>
                <span className="brandmark__sub">NG · Lagos</span>
              </span>
            </a>
            <p className="footer__bio">
              Garment production &amp; printing factory in Lagos. From an idea to a finished garment for
              brands, companies, teams, creators and events. Minimum order: {BRAND.bioMoq}.
            </p>
            <a
              href={chatLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--wa"
            >
              <WhatsAppIcon /> {BRAND.whatsapp.display}
            </a>
          </div>

          <nav className="footer__col" aria-label="Footer">
            <span className="mono footer__label">Site</span>
            <a href="#/">Home</a>
            {NAV.map((n) => (
              <a key={n.href} href={n.href}>
                {n.label}
              </a>
            ))}
          </nav>

          <div className="footer__col">
            <span className="mono footer__label">Visit</span>
            <p className="footer__line">
              <MapPin size={15} aria-hidden="true" />
              <a href={MAP_URL} target="_blank" rel="noopener noreferrer">
                {BRAND.address.display}
              </a>
            </p>
            <p className="footer__line">
              <Clock size={15} aria-hidden="true" />
              {BRAND.hours}
            </p>
            <p className="footer__note mono">{BRAND.visits}</p>
            <p className="footer__line">
              <Instagram size={15} aria-hidden="true" />
              <a href={BRAND.instagram} target="_blank" rel="noopener noreferrer">
                @{BRAND.username}
              </a>
            </p>
          </div>
        </div>

        <div className="footer__eco">
          <span className="mono">Part of the</span>
          <img className="footer__eco-logo" src={LOGO_BG} alt="Bearded Genius" width={130} height={56} />
          <span className="mono">creative network</span>
        </div>

        <div className="footer__bottom">
          <span className="mono">
            © {new Date().getFullYear()} The Factory Nigeria · All rights reserved
          </span>
          <span className="mono footer__coords">
            LAT {BRAND.address.lat} · LNG {BRAND.address.lng}
          </span>
        </div>
      </div>
    </footer>
  );
}
