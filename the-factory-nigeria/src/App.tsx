import { lazy, Suspense, useEffect, type ComponentType } from "react";
import { TITLES, useHashRoute, type Path } from "./lib/router";
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

  // Take over scroll handling from the browser: its automatic restoration
  // otherwise fights our scroll-to-top and jumps the page down once a route's
  // lazy-loaded media finishes loading and changes the page height.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  }, []);

  useEffect(() => {
    document.title = TITLES[path];
    window.scrollTo({ top: 0, behavior: "auto" });
    // Re-assert after layout settles (lazy pages/media can shift height).
    const raf = requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
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
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<PageLoading />}>
          <Page />
        </Suspense>
      </main>
      <Footer />
      {showQuoteBar && <StickyQuoteBar />}
    </>
  );
}
