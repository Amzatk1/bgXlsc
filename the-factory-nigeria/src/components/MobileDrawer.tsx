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

  // Escape + body scroll lock + contained focus, then restore focus to
  // whichever control opened the menu.
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("inert"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    const appRoot = document.getElementById("root");
    document.body.style.overflow = "hidden";
    appRoot?.setAttribute("inert", "");
    const id = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    }, 80);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      appRoot?.removeAttribute("inert");
      window.clearTimeout(id);
      previousFocus?.focus();
    };
  }, [open, onClose]);

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
