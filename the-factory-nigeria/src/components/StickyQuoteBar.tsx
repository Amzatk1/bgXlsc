import { BRAND } from "../data/brand";
import { chatLink } from "../lib/whatsapp";
import { WhatsAppIcon } from "./WhatsAppIcon";

// Mobile-only sticky conversion bar (hidden ≥ 860px via CSS).
export function StickyQuoteBar() {
  return (
    <div className="stickybar" role="region" aria-label="Start an order">
      <div className="stickybar__meta">
        <span className="stickybar__moq mono">Min. 30 pcs</span>
        <span className="stickybar__hrs mono">{BRAND.hoursShort}</span>
      </div>
      <div className="stickybar__actions">
        <a href="#/start-an-order" className="btn btn--primary stickybar__cta">
          Start an order
        </a>
        <a
          href={chatLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="stickybar__wa"
          aria-label={"Chat on WhatsApp at " + BRAND.whatsapp.display}
        >
          <WhatsAppIcon size={22} />
        </a>
      </div>
    </div>
  );
}
