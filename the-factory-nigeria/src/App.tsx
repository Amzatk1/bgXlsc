import { useEffect } from "react";
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
import { StudioExperiment } from "./pages/StudioExperiment";

const PAGES: Record<Path, () => JSX.Element> = {
  "/": Home,
  "/services": Services,
  "/process": Process,
  "/work": Work,
  "/brands": Brands,
  "/visit": Visit,
  "/faq": Faq,
  "/start-an-order": StartOrder,
  "/experiments/custom-tee-studio": StudioExperiment,
};

export default function App() {
  const path = useHashRoute();

  useEffect(() => {
    document.title = TITLES[path];
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [path]);

  const Page = PAGES[path] ?? Home;
  // The Shirt Studio has its own sticky step navigation and accepts
  // 1-shirt requests — the site-wide "Min. 30 pcs" bar would cover the
  // studio's primary action on phones and contradict its minimum.
  const showQuoteBar = path !== "/experiments/custom-tee-studio";

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <StatusBar />
      <Header />
      <main id="main" tabIndex={-1}>
        <Page />
      </main>
      <Footer />
      {showQuoteBar && <StickyQuoteBar />}
    </>
  );
}
