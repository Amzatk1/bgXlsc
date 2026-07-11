import { Plus } from "lucide-react";
import { FAQS } from "../data/faq";

export function FaqAccordion() {
  return (
    <div className="faq">
      {FAQS.map((f, i) => (
        <details className="faq__item" key={i}>
          <summary className="faq__q">
            <span className="faq__qtext">{f.q}</span>
            <span className="faq__icon" aria-hidden="true">
              <Plus size={18} />
            </span>
          </summary>
          <div className="faq__a">
            <p>{f.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
