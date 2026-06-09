import { waEnquiries } from "../lib/whatsapp";
import { WhatsAppIcon } from "./Icons";

export function WhatsAppFab() {
  return (
    <a
      className="wa-fab"
      href={waEnquiries.general()}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Lagos Sneaker Club on WhatsApp"
    >
      <WhatsAppIcon size={22} />
      <span className="wa-fab__label">WhatsApp us</span>
    </a>
  );
}
