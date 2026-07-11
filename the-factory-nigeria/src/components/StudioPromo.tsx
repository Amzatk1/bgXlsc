import { ArrowUpRight } from "lucide-react";
import { GARMENT_IMG, layerTuning } from "../studio/garment";
import { Reveal } from "./Reveal";

// Homepage introduction for The Shirt Studio. The visual is the REAL
// studio garment render (same layers as the editor) — not a mock UI.
export function StudioPromo({ compact = false }: { compact?: boolean }) {
  const img = GARMENT_IMG["unisex-tee"].front;
  const hex = "#a425a4"; // brand purple tee for the promo render
  const tuning = layerTuning(hex);

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
            <span className="eyebrow">The Shirt Studio</span>
            <h2 className="h2">Design your shirt before we make it</h2>
            <p className="lede">
              Choose your garment, pick a colour, upload your logo or artwork, place it on the front
              and back, then send the finished design straight to The Factory for review and a quote.
            </p>
            <ul className="spromo__points">
              <li>Start from just 1 shirt</li>
              <li>Real fabric preview, front and back</li>
              <li>Your quantities and sizes, your deadline</li>
              <li>Sent to the team on WhatsApp — no payment online</li>
            </ul>
            <a className="btn btn--primary btn--lg" href="#/experiments/custom-tee-studio">
              Open The Shirt Studio <ArrowUpRight size={17} aria-hidden="true" />
            </a>
            <p className="spromo__note">
              The preview is approximate — final colours, materials, placement, pricing and timing
              are confirmed before production.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
