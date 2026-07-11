import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, MapPin, X } from "lucide-react";
import { BRAND, NAV } from "../data/brand";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { chatLink } from "../lib/whatsapp";

export function MobileDrawer({
  open,
  onClose,
  path,
}: {
  open: boolean;
  onClose: () => void;
  path: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape + body scroll lock + focus management while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    }, 80);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(id);
    };
  }, [open, onClose]);

  // Make offscreen panel non-focusable when closed.
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (open) el.removeAttribute("inert");
    else el.setAttribute("inert", "");
  }, [open]);

  const items = [{ label: "Home", href: "#/" }, ...NAV];

  // Portal to <body> so the fixed drawer escapes the header's
  // backdrop-filter containing block and is positioned to the viewport.
  return createPortal(
    <div className={"drawer-root" + (open ? " is-open" : "")}>
      <div className="drawer-overlay" onClick={onClose} aria-hidden="true" />
      <div className="drawer" role="dialog" aria-modal="true" aria-label="Menu" ref={panelRef}>
        <div className="drawer__head">
          <span className="mono mono--ink">Factory OS · Menu</span>
          <button className="drawer__close" onClick={onClose} aria-label="Close menu">
            <X aria-hidden="true" />
          </button>
        </div>

        <nav className="drawer__nav" aria-label="Mobile">
          {items.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={"drawer__link" + (path === item.href.replace("#", "") ? " is-active" : "")}
            >
              <span className="drawer__index">{String(i).padStart(2, "0")}</span>
              {item.label}
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          ))}
        </nav>

        <div className="drawer__foot">
          <a href="#/start-an-order" onClick={onClose} className="btn btn--primary btn--block">
            Start an order
          </a>
          <a
            href={chatLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--wa btn--block"
          >
            <WhatsAppIcon /> Chat on WhatsApp
          </a>
          <p className="drawer__addr mono mono--ink">
            <MapPin size={13} aria-hidden="true" /> {BRAND.address.display}
          </p>
          <p className="drawer__hours mono">{BRAND.hours} · {BRAND.visits}</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
