import { useMemo, useState } from "react";
import { Info, SlidersHorizontal, X } from "lucide-react";
import {
  AVAILABILITIES,
  BRANDS,
  CONDITIONS,
  SIZES,
  availabilityLabel,
  type Availability,
  type Condition,
  type Product,
  type Silhouette,
} from "../data/products";
import { useEscape, useScrollLock } from "../hooks";
import { useContent } from "../content";
import { Reveal } from "../components/Reveal";
import { ProductCard } from "../components/ProductCard";

type Filters = {
  brands: string[];
  silhouettes: Silhouette[];
  sizes: string[];
  conditions: Condition[];
  availability: Availability[];
};

const EMPTY: Filters = { brands: [], silhouettes: [], sizes: [], conditions: [], availability: [] };

const SILHOUETTES: { value: Silhouette; label: string }[] = [
  { value: "low", label: "Low-top" },
  { value: "runner", label: "Runner" },
  { value: "high", label: "High-top" },
  { value: "court", label: "Court" },
  { value: "clog", label: "Clog" },
];

type SortKey = "featured" | "brand" | "new" | "availability";
const SORTS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "new", label: "New drops first" },
  { value: "brand", label: "Brand A–Z" },
  { value: "availability", label: "In store first" },
];

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

type Counts = {
  brand: Map<string, number>;
  silhouette: Map<Silhouette, number>;
  condition: Map<Condition, number>;
  availability: Map<Availability, number>;
  size: Map<string, number>;
};

function countBy<T>(list: Product[], getter: (p: Product) => T | T[]): Map<T, number> {
  const map = new Map<T, number>();
  for (const p of list) {
    const v = getter(p);
    const vals = Array.isArray(v) ? v : [v];
    for (const val of vals) map.set(val, (map.get(val) ?? 0) + 1);
  }
  return map;
}

export function Shop() {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [sort, setSort] = useState<SortKey>("featured");
  const [sheetOpen, setSheetOpen] = useState(false);
  useScrollLock(sheetOpen);
  useEscape(sheetOpen, () => setSheetOpen(false));

  const { products } = useContent();
  const counts = useMemo<Counts>(
    () => ({
      brand: countBy(products, (p) => p.brand),
      silhouette: countBy(products, (p) => p.silhouette),
      condition: countBy(products, (p) => p.condition),
      availability: countBy(products, (p) => p.availability),
      size: countBy(products, (p) => p.sizes),
    }),
    [products],
  );

  const set = (key: keyof Filters, value: string) =>
    setFilters((f) => ({ ...f, [key]: toggle(f[key] as string[], value) }) as Filters);

  const activeCount =
    filters.brands.length +
    filters.silhouettes.length +
    filters.sizes.length +
    filters.conditions.length +
    filters.availability.length;

  const filtered = useMemo(() => {
    const list = products.filter((p) => {
      if (filters.brands.length && !filters.brands.includes(p.brand)) return false;
      if (filters.silhouettes.length && !filters.silhouettes.includes(p.silhouette)) return false;
      if (filters.conditions.length && !filters.conditions.includes(p.condition)) return false;
      if (filters.availability.length && !filters.availability.includes(p.availability)) return false;
      if (filters.sizes.length && !p.sizes.some((s) => filters.sizes.includes(s))) return false;
      return true;
    });

    const byNew = (p: Product) => (p.tag === "New drop" ? 0 : 1);
    const byAvail = (p: Product) => ({ "in-store": 0, low: 1, request: 2 })[p.availability];

    return [...list].sort((a, b) => {
      if (sort === "brand") return a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model);
      if (sort === "new") return byNew(a) - byNew(b);
      if (sort === "availability") return byAvail(a) - byAvail(b);
      return Number(b.featured ?? false) - Number(a.featured ?? false);
    });
  }, [filters, sort, products]);

  const controls = (
    <FilterControls
      filters={filters}
      set={set}
      onClear={() => setFilters(EMPTY)}
      activeCount={activeCount}
      counts={counts}
    />
  );

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="page-hero__inner">
            <Reveal>
              <span className="eyebrow">The shop</span>
            </Reveal>
            <Reveal delay={60}>
              <h1>Sneakers, reserved on WhatsApp.</h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="lede">
                New pairs, core staples and consignment finds from the Ikoyi floor. Filter by brand,
                size and condition, then reserve — staff confirm price and availability before pickup
                or delivery.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section tight-top section--paper" style={{ paddingTop: 8 }}>
        <div className="container">
          <div className="shop-layout">
            <aside className="filters filters--desktop" aria-label="Product filters">
              {controls}
            </aside>

            <div>
              <div className="shop-toolbar">
                <span className="shop-toolbar__count">
                  <b>{filtered.length}</b> {filtered.length === 1 ? "pair" : "pairs"}
                </span>
                <div className="flex-wrap-gap" style={{ alignItems: "center", gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm filter-bar-mobile"
                    style={{ display: undefined }}
                    onClick={() => setSheetOpen(true)}
                  >
                    <SlidersHorizontal size={16} />
                    Filters{activeCount > 0 ? ` · ${activeCount}` : ""}
                  </button>
                  <label className="sr-only" htmlFor="sort">
                    Sort products
                  </label>
                  <select
                    id="sort"
                    className="select"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                  >
                    {SORTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {activeCount > 0 && (
                <div className="active-filters">
                  {[
                    ...filters.brands.map((v) => ({ k: "brands" as const, v, label: v })),
                    ...filters.silhouettes.map((v) => ({
                      k: "silhouettes" as const,
                      v,
                      label: SILHOUETTES.find((s) => s.value === v)?.label ?? v,
                    })),
                    ...filters.sizes.map((v) => ({ k: "sizes" as const, v, label: v })),
                    ...filters.conditions.map((v) => ({ k: "conditions" as const, v, label: v })),
                    ...filters.availability.map((v) => ({
                      k: "availability" as const,
                      v,
                      label: availabilityLabel[v],
                    })),
                  ].map(({ k, v, label }) => (
                    <span className="active-filter" key={`${k}-${v}`}>
                      {label}
                      <button type="button" onClick={() => set(k, v)} aria-label={`Remove ${label}`}>
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                  <button type="button" className="tlink accent" style={{ marginLeft: 4 }} onClick={() => setFilters(EMPTY)}>
                    Clear all
                  </button>
                </div>
              )}

              {filtered.length === 0 ? (
                <div className="empty-state">
                  <h3>No pairs match those filters</h3>
                  <p className="muted">Try fewer filters, or message us — we restock and source on request.</p>
                  <button type="button" className="btn btn--primary mt-4" onClick={() => setFilters(EMPTY)}>
                    Reset filters
                  </button>
                </div>
              ) : (
                <div className="product-grid product-grid--4">
                  {filtered.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              <div className="mt-6">
                <span className="disclaimer">
                  <Info size={15} />
                  Inventory, sizes and prices are confirmed by LSC staff on WhatsApp before any
                  pickup, delivery or reservation.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile filter sheet */}
      <div className={`sheet${sheetOpen ? " is-open" : ""}`} aria-hidden={!sheetOpen}>
        <div className="sheet__scrim" onClick={() => setSheetOpen(false)} />
        <div className="sheet__panel" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="sheet__handle" />
          <div className="sheet__head">
            <h3 style={{ fontFamily: "var(--sans)", fontSize: "1.05rem", fontWeight: 700 }}>Filters</h3>
            <button type="button" className="iconbtn" onClick={() => setSheetOpen(false)} aria-label="Close filters">
              <X size={20} />
            </button>
          </div>
          {controls}
          <div className="sheet__foot">
            <button type="button" className="btn btn--ghost" onClick={() => setFilters(EMPTY)}>
              Clear
            </button>
            <button type="button" className="btn btn--primary btn--block" onClick={() => setSheetOpen(false)}>
              Show {filtered.length} {filtered.length === 1 ? "pair" : "pairs"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function FilterControls({
  filters,
  set,
  onClear,
  activeCount,
  counts,
}: {
  filters: Filters;
  set: (key: keyof Filters, value: string) => void;
  onClear: () => void;
  activeCount: number;
  counts: Counts;
}) {
  return (
    <>
      <div className="sheet__groups">
        <div>
          <div className="filter-group__head">
            <span>Brand</span>
            {activeCount > 0 && (
              <button type="button" className="tlink accent" style={{ fontSize: "0.74rem" }} onClick={onClear}>
                Clear
              </button>
            )}
          </div>
          <div className="filter-list">
            {BRANDS.map((brand) => (
              <button
                key={brand}
                type="button"
                className={`filter-opt${filters.brands.includes(brand) ? " is-on" : ""}`}
                onClick={() => set("brands", brand)}
                aria-pressed={filters.brands.includes(brand)}
              >
                <span>{brand}</span>
                <span className="filter-opt__count">{counts.brand.get(brand) ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="filter-group__head">
            <span>Type</span>
          </div>
          <div className="chip-wrap">
            {SILHOUETTES.map((s) => {
              const count = counts.silhouette.get(s.value) ?? 0;
              return (
                <button
                  key={s.value}
                  type="button"
                  className={`fchip${filters.silhouettes.includes(s.value) ? " is-on" : ""}`}
                  onClick={() => set("silhouettes", s.value)}
                  disabled={count === 0}
                  aria-pressed={filters.silhouettes.includes(s.value)}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="filter-group__head">
            <span>UK Size</span>
          </div>
          <div className="chip-wrap">
            {SIZES.map((size) => {
              const count = counts.size.get(size) ?? 0;
              return (
                <button
                  key={size}
                  type="button"
                  className={`fchip${filters.sizes.includes(size) ? " is-on" : ""}`}
                  onClick={() => set("sizes", size)}
                  disabled={count === 0}
                  aria-pressed={filters.sizes.includes(size)}
                >
                  {size.replace("UK ", "")}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="filter-group__head">
            <span>Condition</span>
          </div>
          <div className="chip-wrap">
            {CONDITIONS.map((condition) => {
              const count = counts.condition.get(condition) ?? 0;
              return (
                <button
                  key={condition}
                  type="button"
                  className={`fchip${filters.conditions.includes(condition) ? " is-on" : ""}`}
                  onClick={() => set("conditions", condition)}
                  disabled={count === 0}
                  aria-pressed={filters.conditions.includes(condition)}
                >
                  {condition}
                  <span style={{ marginLeft: 6, opacity: 0.55, fontSize: "0.78em" }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="filter-group__head">
            <span>Availability</span>
          </div>
          <div className="filter-list">
            {AVAILABILITIES.map((a) => (
              <button
                key={a}
                type="button"
                className={`filter-opt${filters.availability.includes(a) ? " is-on" : ""}`}
                onClick={() => set("availability", a)}
                aria-pressed={filters.availability.includes(a)}
              >
                <span>{availabilityLabel[a]}</span>
                <span className="filter-opt__count">{counts.availability.get(a) ?? 0}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
