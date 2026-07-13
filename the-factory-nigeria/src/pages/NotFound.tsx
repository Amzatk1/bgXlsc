import { ArrowLeft, MessageCircle } from "lucide-react";
import { chatLink } from "../lib/whatsapp";

export function NotFound() {
  return (
    <section className="notfound paper-grid">
      <div className="container notfound__inner">
        <span className="eyebrow">404 · Off pattern</span>
        <h1 className="display">This page is not on the cutting table.</h1>
        <p className="lede">
          The link may be old or incomplete. Return home, or ask The Factory team where to find what
          you need.
        </p>
        <div className="notfound__actions">
          <a className="btn btn--primary btn--lg" href="#/">
            <ArrowLeft size={17} aria-hidden="true" /> Back to home
          </a>
          <a className="btn btn--outline btn--lg" href={chatLink()} target="_blank" rel="noreferrer">
            <MessageCircle size={17} aria-hidden="true" /> Ask on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
