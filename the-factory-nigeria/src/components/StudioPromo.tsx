import { ArrowUpRight } from "lucide-react";
import { DEFAULT_PRODUCT_ID, garmentImg, layerTuning } from "../studio/garment";
import { Reveal } from "./Reveal";

// Homepage introduction for Studio. The visual is the REAL
// studio garment render (same layers as the editor) — not a mock UI.
export function StudioPromo({ compact = false }: { compact?: boolean }) {
  const img = garmentImg(DEFAULT_PRODUCT_ID, "front");
  const hex = "#a425a4"; // brand purple tee for the promo render
  const tuning = layerTuning(hex, DEFAULT_PRODUCT_ID);

  return (
    <section className={"section" + (compact ? "--tight" : " section--paper2")}>
      <div className="container">
        <div className="spromo">
          <Reveal className="spromo__visual" aria-hidden="true">
            <div className="gstage mode-fabric spromo__stage" style={{ aspectRatio: "600 / 700" }}>
              <div
                className="gstage__color"
                style={{ backgroundColor: hex, WebkitMaskImage: `url(${img})`, maskImage: `url(${img})` }}
              />
              <img
                className="gstage__shade"
                src={img}
                alt=""
                loading="lazy"
                style={{ filter: `grayscale(1) brightness(${tuning.shadeBrightness})` }}
              />
              <img
                className="gstage__light"
                src={img}
                alt=""
                loading="lazy"
                style={{ opacity: tuning.lightOpacity, filter: "grayscale(1) contrast(1.15)" }}
              />
            </div>
          </Reveal>
          <Reveal delay={80} className="spromo__body">
            <span className="eyebrow">Studio</span>
            <h2 className="h2">Design it in Studio. We will help you make it.</h2>
            <p className="lede">
              Choose a garment or jersey, explore fabrics and colours, and place artwork or text
              across the front, back and sleeves before sending a clear production request.
            </p>
            <ul className="spromo__points">
              <li>Requests can start from one item</li>
              <li>Tees, polos, hoodies, football and basketball jerseys</li>
              <li>Front, back, sleeve and jersey-panel customisation</li>
              <li>Garments, fabrics and colours depend on market availability</li>
              <li>Preview, sizes and artwork references stay together</li>
            </ul>
            <a className="btn btn--primary btn--lg" href="#/studio">
              Open Studio <ArrowUpRight size={17} aria-hidden="true" />
            </a>
            <p className="spromo__note">
              Options shown are visual references, not live stock. Garment, fabric and colour
              availability depends on what can be sourced in the market at the time of your request —
              the team confirms availability, minimum quantity, pricing and production time before
              any order is accepted.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
