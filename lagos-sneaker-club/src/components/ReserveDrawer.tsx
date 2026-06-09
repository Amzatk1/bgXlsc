import { useEffect, useRef } from "react";
import { Info, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useReserve } from "../store/reserve";
import { useEscape, useScrollLock } from "../hooks";
import { waLink, waReserveMessage } from "../lib/whatsapp";
import { WhatsAppIcon } from "./Icons";

export function ReserveDrawer() {
  const { items, isOpen, close, remove, setQty, clear, count } = useReserve();
  const closeRef = useRef<HTMLButtonElement>(null);
  useScrollLock(isOpen);
  useEscape(isOpen, close);

  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen]);

  const checkout = waLink(
    waReserveMessage(
      items.map((it) => ({
        name: it.name,
        brand: it.brand,
        condition: it.condition,
        size: it.size ?? undefined,
        qty: it.qty,
      })),
    ),
  );

  return (
    <div className={`drawer${isOpen ? " is-open" : ""}`} aria-hidden={!isOpen}>
      <div className="drawer__scrim" onClick={close} />
      <aside className="drawer__panel" role="dialog" aria-modal="true" aria-label="Your reserve bag">
        <div className="drawer__head">
          <h3>
            <ShoppingBag size={18} />
            Reserve bag
            {count > 0 && <span className="tag tag--red">{count}</span>}
          </h3>
          <button ref={closeRef} type="button" className="iconbtn" onClick={close} aria-label="Close reserve bag">
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="drawer-empty">
            <span className="drawer-empty__icon">
              <ShoppingBag size={24} />
            </span>
            <strong>Your bag is empty</strong>
            <p className="muted">
              Add pairs to build a WhatsApp reserve message. Nothing is charged here — LSC confirms
              everything by chat.
            </p>
          </div>
        ) : (
          <div className="drawer__body">
            {items.map((it) => (
              <div className="line-item" key={it.key}>
                {it.image ? (
                  <img className="line-item__img" src={it.image} alt="" />
                ) : (
                  <span
                    className="line-item__img"
                    style={{
                      display: "grid",
                      placeItems: "center",
                      background: "var(--ink)",
                      color: "#fff",
                      fontFamily: "var(--serif)",
                      fontSize: "0.8rem",
                      letterSpacing: "0.04em",
                    }}
                    aria-hidden="true"
                  >
                    LSC
                  </span>
                )}
                <div className="line-item__info">
                  <strong>{it.name}</strong>
                  <span>
                    {it.brand} · {it.condition}
                    {it.size ? ` · ${it.size}` : ""}
                  </span>
                  <button type="button" className="line-item__remove" onClick={() => remove(it.key)}>
                    <Trash2 size={13} />
                    Remove
                  </button>
                </div>
                <div className="stepper">
                  <button type="button" onClick={() => setQty(it.key, it.qty - 1)} aria-label={`Decrease ${it.name}`}>
                    <Minus size={14} />
                  </button>
                  <span>{it.qty}</span>
                  <button type="button" onClick={() => setQty(it.key, it.qty + 1)} aria-label={`Increase ${it.name}`}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="drawer__foot">
          <p className="drawer__note">
            <Info size={15} />
            Prices, sizes and availability are confirmed by LSC staff on WhatsApp before pickup or
            delivery. This is a reservation, not a payment.
          </p>
          <a className="btn btn--red btn--block btn--lg" href={checkout} target="_blank" rel="noreferrer">
            <WhatsAppIcon size={18} />
            {items.length ? "Send reserve on WhatsApp" : "Ask about stock on WhatsApp"}
          </a>
          {items.length > 0 && (
            <button
              type="button"
              className="tlink"
              style={{ justifyContent: "center", margin: "0 auto" }}
              onClick={clear}
            >
              Clear bag
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
