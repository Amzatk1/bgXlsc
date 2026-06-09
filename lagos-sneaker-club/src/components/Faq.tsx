import { useState } from "react";
import { Plus } from "lucide-react";

export type QA = { q: string; a: string };

export function Faq({ items, defaultOpen = 0 }: { items: QA[]; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <div className="faq">
      {items.map((item, i) => (
        <div className={`faq__item${open === i ? " is-open" : ""}`} key={i}>
          <button
            type="button"
            className="faq__q"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            {item.q}
            <Plus size={20} />
          </button>
          <div className="faq__a">
            <div>
              <p>{item.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
