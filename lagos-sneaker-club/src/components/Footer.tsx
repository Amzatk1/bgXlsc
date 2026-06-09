import { Clock, Instagram, MapPin } from "lucide-react";
import { SITE } from "../data/site";
import { useSettings } from "../content";
import { Link } from "../router";
import { waEnquiries } from "../lib/whatsapp";
import { Brand } from "./Brand";
import { WhatsAppIcon } from "./Icons";

export function Footer() {
  const s = useSettings();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <Brand />
            <p>
              A hub for sneaker culture in Lagos. Shop and reserve drops, visit the Ikoyi space, and
              pull up for community events.
            </p>
            <div className="footer__social">
              <a href={s.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href={waEnquiries.general()} target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <WhatsAppIcon size={18} />
              </a>
            </div>
          </div>

          <div className="footer__col">
            <h5>Shop</h5>
            <ul>
              <li><Link to="/shop">All sneakers</Link></li>
              <li><Link to="/shop">New drops</Link></li>
              <li><Link to="/shop">Consignment</Link></li>
              <li><Link to="/stock-with-us">Stock with us</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h5>The club</h5>
            <ul>
              <li><Link to="/events">Events &amp; culture</Link></li>
              <li><Link to="/visit">Visit Ikoyi</Link></li>
              <li><Link to="/about">About LSC</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h5>Find us</h5>
            <ul>
              <li>
                <a href={s.mapsDirections} target="_blank" rel="noreferrer">
                  <MapPin size={15} />
                  {s.addressFull}
                </a>
              </li>
              <li>
                <span>
                  <Clock size={15} />
                  {s.hoursSummary}
                </span>
              </li>
              <li>
                <a href={waEnquiries.general()} target="_blank" rel="noreferrer">
                  <WhatsAppIcon size={15} />
                  {s.whatsappDisplay}
                </a>
              </li>
              <li>
                <a href={s.instagramUrl} target="_blank" rel="noreferrer">
                  <Instagram size={15} />
                  {s.instagramHandle}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Lagos Sneaker Club · All rights reserved.</span>
          <span>Ikoyi, Lagos — {SITE.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
