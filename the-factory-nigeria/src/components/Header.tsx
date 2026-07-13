import { useCallback, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { BRAND, NAV } from "../data/brand";
import { LOGO } from "../data/media";
import { useHashRoute } from "../lib/router";
import { MobileDrawer } from "./MobileDrawer";

export function Header() {
  const path = useHashRoute();
  const [scrolled, setScrolled] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const closeDrawer = useCallback(() => setDrawer(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={"header" + (scrolled ? " is-scrolled" : "")}>
      <div className="container header__inner">
        <a href="#/" className="brandmark" aria-label={BRAND.name + " — home"}>
          <img className="brandmark__logo" src={LOGO} alt="" width={60} height={30} />
          <span className="brandmark__text">
            <span className="brandmark__name">THE FACTORY</span>
            <span className="brandmark__sub">NG · Lagos</span>
          </span>
        </a>

        <nav className="header__nav" aria-label="Primary">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={"header__link" + (path === item.href.replace("#", "") ? " is-active" : "")}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header__actions">
          <a href="#/start-an-order" className="btn btn--primary header__cta">
            Start an order
          </a>
          <button
            className="header__burger"
            onClick={() => setDrawer(true)}
            aria-label="Open menu"
            aria-expanded={drawer}
          >
            <Menu aria-hidden="true" />
          </button>
        </div>
      </div>

      {drawer && <MobileDrawer open onClose={closeDrawer} path={path} />}
    </header>
  );
}
