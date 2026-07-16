import { lazy, Suspense, useEffect, useRef, type ComponentType } from "react";
import { TITLES, useHashRoute, type Path } from "./lib/router";
import { BRAND } from "./data/brand";
import { StatusBar } from "./components/StatusBar";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { StickyQuoteBar } from "./components/StickyQuoteBar";
import { Home } from "./pages/Home";
import { Services } from "./pages/Services";
import { Process } from "./pages/Process";
import { Work } from "./pages/Work";
import { Brands } from "./pages/Brands";
import { Visit } from "./pages/Visit";
import { Faq } from "./pages/Faq";
import { StartOrder } from "./pages/StartOrder";
import { NotFound } from "./pages/NotFound";

const Studio = lazy(() =>
  import("./pages/StudioExperiment").then(({ StudioExperiment }) => ({ default: StudioExperiment })),
);

const PAGES: Record<Path, ComponentType> = {
  "/": Home,
  "/services": Services,
  "/process": Process,
  "/work": Work,
  "/brands": Brands,
  "/visit": Visit,
  "/faq": Faq,
  "/start-an-order": StartOrder,
  "/studio": Studio,
  "/404": NotFound,
};

// Truthful, route-specific descriptions — confirmed facts only.
const DESCRIPTIONS: Record<Path, string> = {
  "/": "Garment production & printing factory in Lagos — custom clothing, uniforms and merch for brands, companies, teams and events. Minimum order 30 pieces.",
  "/services":
    "What The Factory produces: garment production, printing and embroidery requests, uniforms, custom apparel, merch and aso-ebi. Method and price are confirmed per order.",
  "/process": "How an order works at The Factory Nigeria — enquiry and quote on WhatsApp, then production, checks and pickup in Ilupeju, Lagos.",
  "/work": "Real production work from The Factory Nigeria — garments, prints, uniforms and merch made in Ilupeju, Lagos.",
  "/brands": "A production partner for brands, companies, teams and events in Lagos. Bulk and corporate orders from 30 pieces.",
  "/visit": "Visit The Factory Nigeria — 46 Industrial Avenue, Ilupeju, Lagos. Open 9am–5pm Monday to Friday, visits by appointment.",
  "/faq": "Answers about minimum orders, printing requests, artwork, pricing and factory visits at The Factory Nigeria.",
  "/start-an-order": "Start an order enquiry with The Factory Nigeria — answer a few questions and continue on WhatsApp. Minimum order 30 pieces.",
  "/studio": "Design a garment in Studio and send it to The Factory Nigeria as a visual request — from one item; availability and pricing confirmed by the team.",
  "/404": "Page not found — The Factory Nigeria.",
};

function setMetaTag(name: string, content: string | null) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (content === null) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

/** LocalBusiness structured data — confirmed address/hours/contact only. */
function injectBusinessSchema() {
  if (document.getElementById("tfn-ldjson")) return;
  const el = document.createElement("script");
  el.type = "application/ld+json";
  el.id = "tfn-ldjson";
  el.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: BRAND.name,
    description: BRAND.fullName,
    telephone: "+" + BRAND.whatsapp.e164,
    address: {
      "@type": "PostalAddress",
      streetAddress: BRAND.address.street,
      addressLocality: "Lagos",
      addressCountry: "NG",
    },
    geo: { "@type": "GeoCoordinates", latitude: BRAND.address.lat, longitude: BRAND.address.lng },
    openingHours: "Mo-Fr 09:00-17:00",
    sameAs: [BRAND.instagram],
  });
  document.head.appendChild(el);
}

function PageLoading() {
  return (
    <section className="route-loading container" role="status" aria-live="polite">
      <span className="route-loading__mark" aria-hidden="true" />
      <p className="mono mono--ink">Preparing Studio…</p>
    </section>
  );
}

export default function App() {
  const path = useHashRoute();
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  // Take over scroll handling from the browser: its automatic restoration
  // otherwise fights our scroll-to-top and jumps the page down once a route's
  // lazy-loaded media finishes loading and changes the page height.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    injectBusinessSchema();
  }, []);

  useEffect(() => {
    document.title = TITLES[path];
    setMetaTag("description", DESCRIPTIONS[path]);
    // The fallback route should never be indexed; real routes carry no robots tag.
    setMetaTag("robots", path === "/404" ? "noindex" : null);
    window.scrollTo({ top: 0, behavior: "auto" });
    // Re-assert after layout settles (lazy pages/media can shift height).
    const raf = requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
    // Route-change focus: send keyboard/screen-reader context to the new page
    // content — but never on initial load, and never during same-page work.
    if (firstRender.current) {
      firstRender.current = false;
    } else {
      mainRef.current?.focus({ preventScroll: true });
    }
    return () => cancelAnimationFrame(raf);
  }, [path]);

  const Page = PAGES[path];
  // Studio has its own sticky step navigation and accepts
  // 1-shirt requests — the site-wide "Min. 30 pcs" bar would cover the
  // studio's primary action on phones and contradict its minimum.
  const showQuoteBar = path !== "/studio" && path !== "/start-an-order";

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <StatusBar />
      <Header />
      <main id="main" tabIndex={-1} ref={mainRef}>
        <Suspense fallback={<PageLoading />}>
          <Page />
        </Suspense>
      </main>
      <Footer />
      {showQuoteBar && <StickyQuoteBar />}
    </>
  );
}
