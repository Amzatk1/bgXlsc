import { CalendarClock, Clock, MapPin, Navigation } from "lucide-react";
import { BRAND, MAP_DIR_URL, MAP_URL } from "../data/brand";
import { visitLink } from "../lib/whatsapp";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function VisitPanel() {
  return (
    <div className="visit">
      <a
        className="visit__map paper-grid paper-grid--soft"
        href={MAP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open The Factory Nigeria location in Google Maps"
      >
        <div className="visit__pin">
          <MapPin size={28} aria-hidden="true" />
        </div>
        <div className="visit__maptag">
          <span className="mono mono--ink">46 Industrial Avenue</span>
          <span className="mono">Ilupeju · Lagos</span>
        </div>
        <span className="visit__coords mono">
          {BRAND.address.lat}, {BRAND.address.lng}
        </span>
        <span className="visit__open mono mono--purple">Open in Google Maps →</span>
      </a>

      <div className="visit__info">
        <h3 className="h3">Visit the factory</h3>
        <ul className="visit__rows">
          <li>
            <MapPin size={17} aria-hidden="true" />
            <span>{BRAND.address.display}</span>
          </li>
          <li>
            <Clock size={17} aria-hidden="true" />
            <span>{BRAND.hours}</span>
          </li>
          <li>
            <CalendarClock size={17} aria-hidden="true" />
            <span>{BRAND.visits} — message us first to book a time.</span>
          </li>
        </ul>

        <div className="visit__actions">
          <a href={visitLink()} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
            <CalendarClock size={18} aria-hidden="true" /> Book a visit
          </a>
          <a href={MAP_DIR_URL} target="_blank" rel="noopener noreferrer" className="btn btn--outline">
            <Navigation size={18} aria-hidden="true" /> Get directions
          </a>
        </div>

        <a href={`tel:+${BRAND.whatsapp.e164}`} className="visit__phone mono mono--ink">
          <WhatsAppIcon size={16} /> {BRAND.whatsapp.display}
        </a>
      </div>
    </div>
  );
}
