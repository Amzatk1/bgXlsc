import { useMemo, useState } from "react";
import { ArrowRight, Instagram, Menu, Minus, Plus, ShoppingBag, Sparkles, X } from "lucide-react";
import { ASSETS, BRAND, GALLERY, PRODUCTS, type Product, waLink } from "./data";

type BagItem = { product: Product; size?: string; qty: number };

function reserveMessage(items: BagItem[]) {
  if (!items.length) {
    return "Hi Bearded Genius. I have a question about current stock and sizing.\n\n- sent from the website";
  }
  const lines = items.map((item, i) => {
    const size = item.size ? ` / Size: ${item.size}` : "";
    return `${i + 1}. ${item.product.name} - ${item.product.category}${size} / Qty: ${item.qty}`;
  });
  return [
    "Hi Bearded Genius. I want to reserve / confirm availability for:",
    "",
    lines.join("\n"),
    "",
    "Please confirm price, sizing and pickup/delivery.",
    "",
    "- sent from the website",
  ].join("\n");
}

function Header({ count, onOpenBag }: { count: number; onOpenBag: () => void }) {
  const [open, setOpen] = useState(false);
  const nav = ["shop", "culture", "custom", "about", "contact"];
  return (
    <>
      <div className="topbar">
        <span>{BRAND.origin}</span>
        <a href={BRAND.instagram} target="_blank" rel="noreferrer">{BRAND.instagramHandle}</a>
        <a href={waLink("Hi Bearded Genius. I have a question about the brand.")} target="_blank" rel="noreferrer">{BRAND.phoneWordmark}</a>
      </div>
      <header className="header">
        <a className="brand" href="#home" aria-label="Bearded Genius home">
          <img src={ASSETS.logo} alt="" />
          <span>
            <strong>{BRAND.name}</strong>
            <small>{BRAND.origin}</small>
          </span>
        </a>
        <nav className="nav" aria-label="Primary">
          {nav.map((item) => <a key={item} href={`#${item}`}>{item}</a>)}
        </nav>
        <div className="actions">
          <button type="button" className="iconbtn" onClick={onOpenBag} aria-label={`Open reserve bag, ${count} items`}>
            <ShoppingBag size={19} />
            {count > 0 && <span>{count}</span>}
          </button>
          <a className="btn btn--dark" href={waLink("Hi Bearded Genius. I want to shop current pieces.")} target="_blank" rel="noreferrer">WhatsApp</a>
          <button type="button" className="iconbtn menu" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={21} /></button>
        </div>
      </header>
      <div className={`mobile-menu${open ? " is-open" : ""}`} aria-hidden={!open}>
        <button className="mobile-menu__scrim" aria-label="Close menu" onClick={() => setOpen(false)} />
        <div className="mobile-menu__panel">
          <div className="mobile-menu__head">
            <span>{BRAND.name}</span>
            <button className="iconbtn" onClick={() => setOpen(false)} aria-label="Close menu"><X size={22} /></button>
          </div>
          {nav.map((item) => <a key={item} href={`#${item}`} onClick={() => setOpen(false)}>{item}<ArrowRight size={18} /></a>)}
          <a className="btn btn--red btn--block" href={waLink("Hi Bearded Genius. I want to shop current pieces.")} target="_blank" rel="noreferrer">Shop on WhatsApp</a>
        </div>
      </div>
    </>
  );
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: (product: Product, size?: string) => void }) {
  const [size, setSize] = useState(product.sizes[0]);
  return (
    <article className="product-card">
      <div className="product-card__media">
        <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
        {product.badge && <span className="badge">{product.badge}</span>}
      </div>
      <div className="product-card__body">
        <div className="product-card__top">
          <span>{product.category}</span>
          <b>{product.status}</b>
        </div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="swatch-row"><span>{product.color}</span></div>
        <div className="sizes" aria-label={`Select size for ${product.name}`}>
          {product.sizes.map((s) => (
            <button key={s} type="button" className={size === s ? "is-active" : ""} onClick={() => setSize(s)}>{s}</button>
          ))}
        </div>
        <button className="btn btn--dark btn--block" type="button" onClick={() => onAdd(product, size)}><Plus size={17} /> Add to reserve</button>
      </div>
    </article>
  );
}

function Drawer({ open, items, onClose, onClear, onQty }: { open: boolean; items: BagItem[]; onClose: () => void; onClear: () => void; onQty: (id: string, qty: number) => void }) {
  const href = useMemo(() => waLink(reserveMessage(items)), [items]);
  return (
    <div className={`drawer${open ? " is-open" : ""}`} aria-hidden={!open}>
      <button className="drawer__scrim" onClick={onClose} aria-label="Close reserve bag" />
      <aside className="drawer__panel" role="dialog" aria-modal="true" aria-label="Reserve bag">
        <div className="drawer__head">
          <h3><ShoppingBag size={18} /> Reserve bag</h3>
          <button className="iconbtn" onClick={onClose} aria-label="Close reserve bag"><X size={20} /></button>
        </div>
        <div className="drawer__body">
          {!items.length ? <p className="empty">Add pieces to build a WhatsApp reserve message.</p> : items.map((item) => (
            <div className="line" key={item.product.id + item.size}>
              <img src={item.product.image} alt="" />
              <div>
                <strong>{item.product.name}</strong>
                <span>{item.size || "Size by request"}</span>
              </div>
              <div className="stepper">
                <button onClick={() => onQty(item.product.id + item.size, item.qty - 1)} aria-label="Decrease quantity"><Minus size={13} /></button>
                <span>{item.qty}</span>
                <button onClick={() => onQty(item.product.id + item.size, item.qty + 1)} aria-label="Increase quantity"><Plus size={13} /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="drawer__foot">
          <p>Prices, sizing and delivery are confirmed by Bearded Genius on WhatsApp. This is a reservation, not payment.</p>
          <a className="btn btn--red btn--block" href={href} target="_blank" rel="noreferrer">{items.length ? "Send reserve on WhatsApp" : "Ask about stock"}</a>
          {items.length > 0 && <button className="textbtn" onClick={onClear}>Clear bag</button>}
        </div>
      </aside>
    </div>
  );
}

export default function App() {
  const [bag, setBag] = useState<BagItem[]>([]);
  const [drawer, setDrawer] = useState(false);
  const count = bag.reduce((sum, item) => sum + item.qty, 0);

  const add = (product: Product, size?: string) => {
    const key = product.id + size;
    setBag((current) => {
      const found = current.find((item) => item.product.id + item.size === key);
      if (found) return current.map((item) => item === found ? { ...item, qty: item.qty + 1 } : item);
      return [...current, { product, size, qty: 1 }];
    });
    setDrawer(true);
  };

  const setQty = (key: string, qty: number) => setBag((current) => current.flatMap((item) => {
    if (item.product.id + item.size !== key) return [item];
    return qty <= 0 ? [] : [{ ...item, qty }];
  }));

  return (
    <>
      <Header count={count} onOpenBag={() => setDrawer(true)} />
      <main id="home">
        <section className="hero">
          <div className="hero__copy">
            <span className="eyebrow"><Sparkles size={14} /> {BRAND.origin}</span>
            <h1>Rooted in culture. Crafted for the world.</h1>
            <p>Bearded Genius makes Nigerian-made streetwear and lifestyle pieces for people who want to stand out and own the room.</p>
            <div className="hero__actions">
              <a className="btn btn--dark" href="#shop">Shop pieces <ArrowRight size={18} /></a>
              <a className="btn btn--ghost" href={BRAND.instagram} target="_blank" rel="noreferrer"><Instagram size={17} /> Instagram</a>
            </div>
            <dl className="stats">
              <div><dt>Origin</dt><dd>Nigerian Made</dd></div>
              <div><dt>Line</dt><dd>Streetwear / lifestyle</dd></div>
              <div><dt>Orders</dt><dd>WhatsApp reserve</dd></div>
            </dl>
          </div>
          <div className="hero__media" aria-label="Bearded Genius campaign images">
            <img className="slide slide--1" src={ASSETS.brandPoster} alt="Bearded Genius Rooted in Culture campaign" />
            <img className="slide slide--2" src={ASSETS.afriJorts} alt="Bearded Genius Afri Jorts" />
            <img className="slide slide--3" src={ASSETS.buttonUp} alt="Bearded Genius Button-Up" />
          </div>
        </section>

        <section className="marquee" aria-label="Brand values">
          <div><span>Nigerian Made</span><span>AFRI JORTS</span><span>Custom Threads</span><span>Button-Ups</span><span>Culture First</span><span>Made To Stand Out</span></div>
        </section>

        <section className="section" id="shop">
          <div className="section-head">
            <div>
              <span className="eyebrow">Shop</span>
              <h2>Current pieces.</h2>
            </div>
            <a className="textlink" href={waLink("Hi Bearded Genius. Please send me current stock, sizes and prices.")} target="_blank" rel="noreferrer">Ask for stock <ArrowRight size={16} /></a>
          </div>
          <div className="product-grid">
            {PRODUCTS.map((product) => <ProductCard key={product.id} product={product} onAdd={add} />)}
          </div>
        </section>

        <section className="section section--dark" id="culture">
          <div className="section-head">
            <div>
              <span className="eyebrow on-dark">Culture</span>
              <h2>Made for attention, not background.</h2>
              <p>Editorial pieces, expressive prints and custom work built around Nigerian creative energy.</p>
            </div>
          </div>
          <div className="gallery">
            {GALLERY.map((item) => (
              <figure className={item.wide ? "is-wide" : ""} key={item.src}>
                <img src={item.src} alt={item.label} loading="lazy" decoding="async" />
                <figcaption>{item.label}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="section split" id="custom">
          <div>
            <span className="eyebrow">Custom</span>
            <h2>Need a uniform language for your team or project?</h2>
            <p>Bearded Genius also works on custom threads for teams, clubs, creator projects and culture-led collaborations. Share the brief, quantities and deadline over WhatsApp.</p>
            <a className="btn btn--dark" href={waLink("Hi Bearded Genius. I want to discuss a custom order for my team/project.")} target="_blank" rel="noreferrer">Start custom order</a>
          </div>
          <figure className="feature-image">
            <img src={ASSETS.customThreads} alt="Bearded Genius custom threads" loading="lazy" />
          </figure>
        </section>

        <section className="section about" id="about">
          <span className="eyebrow">About</span>
          <h2>The Genius is in the way you wear it.</h2>
          <p>Bearded Genius is a Nigerian-made fashion and lifestyle brand building pieces for people who want confidence, craft and culture in the same fit. The direction is simple: make the room look twice.</p>
        </section>

        <section className="cta" id="contact">
          <div>
            <span className="eyebrow on-dark">Contact</span>
            <h2>Shop the drop or ask for custom.</h2>
            <p>{BRAND.phoneWordmark} / {BRAND.whatsappDisplay}</p>
          </div>
          <a className="btn btn--red" href={waLink("Hi Bearded Genius. I want to shop / ask about current pieces.")} target="_blank" rel="noreferrer">Message on WhatsApp</a>
        </section>
      </main>
      <footer className="footer">
        <a className="brand" href="#home"><img src={ASSETS.logo} alt="" /><span><strong>{BRAND.name}</strong><small>{BRAND.tagline}</small></span></a>
        <div><a href={BRAND.instagram} target="_blank" rel="noreferrer">{BRAND.instagramHandle}</a><a href={waLink("Hi Bearded Genius.")} target="_blank" rel="noreferrer">WhatsApp</a></div>
      </footer>
      <Drawer open={drawer} items={bag} onClose={() => setDrawer(false)} onClear={() => setBag([])} onQty={setQty} />
    </>
  );
}
