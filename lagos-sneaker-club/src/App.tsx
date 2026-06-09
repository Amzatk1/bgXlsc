import { useEffect, type ComponentType } from "react";
import { Link, RouterProvider, useRoute } from "./router";
import { ContentProvider } from "./content";
import { ReserveProvider } from "./store/reserve";
import { VideoSoundProvider } from "./store/videoSound";
import { AnnouncementBar } from "./components/AnnouncementBar";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ReserveDrawer } from "./components/ReserveDrawer";
import { WhatsAppFab } from "./components/WhatsAppFab";
import { Home } from "./pages/Home";
import { Shop } from "./pages/Shop";
import { Events } from "./pages/Events";
import { StockWithUs } from "./pages/StockWithUs";
import { Visit } from "./pages/Visit";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";

const ROUTES: Record<string, ComponentType> = {
  "/": Home,
  "/shop": Shop,
  "/events": Events,
  "/stock-with-us": StockWithUs,
  "/visit": Visit,
  "/about": About,
  "/contact": Contact,
};

const TITLES: Record<string, string> = {
  "/": "Lagos Sneaker Club — A Hub for Sneaker Culture in Lagos",
  "/shop": "Shop Sneakers — Lagos Sneaker Club",
  "/events": "Events & Culture — Lagos Sneaker Club",
  "/stock-with-us": "Stock With Us — Lagos Sneaker Club",
  "/visit": "Visit Ikoyi — Lagos Sneaker Club",
  "/about": "About — Lagos Sneaker Club",
  "/contact": "Contact — Lagos Sneaker Club",
};

function NotFound() {
  return (
    <section className="section" style={{ minHeight: "58vh", display: "grid", placeItems: "center" }}>
      <div className="container" style={{ textAlign: "center" }}>
        <span className="eyebrow" style={{ justifyContent: "center" }}>
          404
        </span>
        <h1 style={{ margin: "14px 0" }}>Page not found</h1>
        <p className="lede" style={{ marginInline: "auto" }}>
          That page isn't here. Head back to the shop or the homepage.
        </p>
        <div className="flex-wrap-gap" style={{ justifyContent: "center", marginTop: 24 }}>
          <Link to="/" className="btn btn--primary">
            Back home
          </Link>
          <Link to="/shop" className="btn btn--ghost">
            Shop sneakers
          </Link>
        </div>
      </div>
    </section>
  );
}

function Routed() {
  const path = useRoute();
  const Page = ROUTES[path] ?? NotFound;

  useEffect(() => {
    document.title = TITLES[path] ?? "Lagos Sneaker Club";
  }, [path]);

  return (
    <main id="main">
      <Page />
    </main>
  );
}

export default function App() {
  return (
    <ContentProvider>
      <ReserveProvider>
        <VideoSoundProvider>
          <RouterProvider>
            <a className="skip-link" href="#main">
              Skip to content
            </a>
        <AnnouncementBar />
        <Header />
        <Routed />
        <Footer />
        <ReserveDrawer />
        <WhatsAppFab />
          </RouterProvider>
        </VideoSoundProvider>
      </ReserveProvider>
    </ContentProvider>
  );
}
