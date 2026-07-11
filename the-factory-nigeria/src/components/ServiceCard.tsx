import { ArrowUpRight, Check } from "lucide-react";
import type { Service } from "../data/services";
import { SERVICE_PHOTO } from "../data/media";
import { ServiceIcon } from "./ServiceIcon";
import { Photo } from "./Photo";

export function ServiceCard({ s }: { s: Service }) {
  const img = SERVICE_PHOTO[s.imgKey];
  return (
    <article className="svc reg-marks">
      <div className="svc__media">
        <Photo
          name={img.name}
          alt={img.alt}
          ratio="4 / 5"
          position={img.position}
          sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
        />
        <span className="svc__code mono">{s.code}</span>
      </div>

      <div className="svc__body">
        <div className="svc__titlerow">
          <span className="svc__icon">
            <ServiceIcon name={s.icon} />
          </span>
          <h3 className="svc__title">{s.title}</h3>
        </div>

        <p className="svc__what">{s.what}</p>

        <div className="svc__send">
          <span className="mono">You send</span>
          <ul>
            {s.send.map((item) => (
              <li key={item}>
                <Check size={14} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="svc__foot">
          <span className="chip chip--brand">
            <span className="chip__dot" aria-hidden="true" />
            Min. 30 pieces
          </span>
          <a
            className="btn btn--ghost"
            href={`#/start-an-order?service=${encodeURIComponent(s.title)}`}
          >
            <span className="btn-underline">Start an order</span>
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
