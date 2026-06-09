import { useState } from "react";
import { Heart, Plus } from "lucide-react";
import { availabilityShort, productName, type Product } from "../data/products";
import { useReserve } from "../store/reserve";
import { waProductMessage } from "../lib/whatsapp";
import { ProductPlaceholder } from "./ProductPlaceholder";
import { WhatsAppIcon } from "./Icons";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useReserve();
  const [size, setSize] = useState<string | null>(null);
  const [fav, setFav] = useState(false);
  const name = productName(product);

  const addToBag = () =>
    add({
      productId: product.id,
      name,
      brand: product.brand,
      condition: product.condition,
      image: product.image,
      size,
    });

  return (
    <article className="card">
      <div className="card__media">
        {product.image ? (
          <img src={product.image} alt={`${product.brand} ${name}`} loading="lazy" decoding="async" />
        ) : (
          <ProductPlaceholder product={product} />
        )}

        <div className="card__badges">
          {product.tag ? (
            <span className={`tag ${product.tag === "Consignment" ? "tag--light" : "tag--solid"}`}>
              {product.tag}
            </span>
          ) : (
            <span />
          )}
          <button
            type="button"
            className={`card__fav${fav ? " is-on" : ""}`}
            onClick={() => setFav((v) => !v)}
            aria-pressed={fav}
            aria-label={fav ? `Saved ${name}` : `Save ${name}`}
          >
            <Heart size={15} fill={fav ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="card__quick">
          <a
            className="btn btn--light btn--sm btn--block"
            href={waProductMessage(name, product.brand, size ?? undefined)}
            target="_blank"
            rel="noreferrer"
          >
            <WhatsAppIcon size={16} />
            Reserve on WhatsApp
          </a>
        </div>
      </div>

      <div className="card__body">
        <div className="card__row">
          <div className="card__headings">
            <span className="card__brand">{product.brand}</span>
            <h3 className="card__name">{name}</h3>
          </div>
          {product.priceMode === "fixed" && product.price ? (
            <div className="card__price">
              <b>₦{product.price.toLocaleString("en-NG")}</b>
              <span>In store</span>
            </div>
          ) : product.priceMode === "hidden" ? null : (
            <div className="card__price">
              <b>On request</b>
              <span>Confirm price</span>
            </div>
          )}
        </div>

        <div className="card__sizes" role="group" aria-label="Select size">
          {product.sizes.map((s) => {
            const out = product.soldOut?.includes(s);
            return (
              <button
                key={s}
                type="button"
                className={`size-chip${size === s ? " is-sel" : ""}`}
                disabled={out}
                onClick={() => setSize((cur) => (cur === s ? null : s))}
                aria-pressed={size === s}
                aria-label={`UK size ${s.replace("UK ", "")}${out ? ", sold out" : ""}`}
              >
                {s.replace("UK ", "")}
              </button>
            );
          })}
        </div>

        <div className="card__foot">
          <span className="card__meta">
            <span>{product.condition}</span>
            <span className="dotsep" aria-hidden="true" />
            <span>{availabilityShort[product.availability]}</span>
          </span>
          <button
            type="button"
            className="btn btn--primary btn--sm card__add"
            onClick={addToBag}
            aria-label={`Add ${name} to your reserve bag`}
          >
            <Plus size={15} />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
