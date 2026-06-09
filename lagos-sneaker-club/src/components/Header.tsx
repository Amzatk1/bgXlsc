import { useState } from "react";
import { ArrowUpRight, Clock, MapPin, Menu, Search, ShoppingBag, X } from "lucide-react";
import { NAV, SITE } from "../data/site";
import { Link, useRoute } from "../router";
import { useReserve } from "../store/reserve";
import { useEscape, useScrolled, useScrollLock } from "../hooks";
import { waEnquiries } from "../lib/whatsapp";
import { Brand } from "./Brand";
import { WhatsAppIcon } from "./Icons";

function isActive(path: string, to: string) {
  return to === "/" ? path === "/" : path.startsWith(to);
}

export function Header() {
  const path = useRoute();
  const { count, open } = useReserve();
  const stuck = useScrolled(6);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className={`header${stuck ? " is-stuck" : ""}`}>
        <div className="container header__inner">
          <Brand />

          <nav className="header__nav" aria-label="Primary">
            {NAV.map((item) => (
              <Link key={item.to} to={item.to} className={isActive(path, item.to) ? "is-active" : ""}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="header__actions">
            <Link to="/shop" className="iconbtn iconbtn--search" aria-label="Search the shop">
              <Search size={19} />
            </Link>
            <button
              type="button"
              className="iconbtn"
              onClick={open}
              aria-label={`Open reserve bag, ${count} item${count === 1 ? "" : "s"}`}
            >
              <ShoppingBag size={19} />
              {count > 0 && <span className="iconbtn__count">{count}</span>}
            </button>
            <a
              className="btn btn--primary btn--sm"
              href={waEnquiries.general()}
              target="_blank"
              rel="noreferrer"
            >
              <WhatsAppIcon size={16} />
              WhatsApp
            </a>
            <button
              type="button"
              className="iconbtn header__menu-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} path={path} />
    </>
  );
}

function MobileMenu({ open, onClose, path }: { open: boolean; onClose: () => void; path: string }) {
  useScrollLock(open);
  useEscape(open, onClose);

  const links = [{ label: "Home", to: "/" }, ...NAV, { label: "Contact", to: "/contact" }];

  return (
    <div className={`mobile-menu${open ? " is-open" : ""}`} aria-hidden={!open}>
      <div className="mobile-menu__scrim" onClick={onClose} />
      <div className="mobile-menu__panel" role="dialog" aria-modal="true" aria-label="Menu">
        <div className="mobile-menu__top">
          <Brand onClick={onClose} />
          <button type="button" className="iconbtn" onClick={onClose} aria-label="Close menu">
            <X size={22} />
          </button>
        </div>

        <nav className="mobile-menu__nav">
          {links.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={isActive(path, item.to) ? "is-active" : ""}
              onClick={onClose}
            >
              {item.label}
              <ArrowUpRight size={18} />
            </Link>
          ))}
        </nav>

        <div className="mobile-menu__foot">
          <a className="btn btn--red btn--block btn--lg" href={waEnquiries.general()} target="_blank" rel="noreferrer">
            <WhatsAppIcon size={18} />
            WhatsApp us
          </a>
          <a className="btn btn--ghost btn--block" href={SITE.mapsDirections} target="_blank" rel="noreferrer">
            <MapPin size={17} />
            {SITE.address.street}
          </a>
          <div className="mobile-menu__meta">
            <span>
              <Clock size={14} /> {SITE.hoursSummary}
            </span>
            <a href={SITE.instagram.url} target="_blank" rel="noreferrer">
              {SITE.instagram.handle}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
