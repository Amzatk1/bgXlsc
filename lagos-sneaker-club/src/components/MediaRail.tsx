import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import type { MediaItem } from "../data/media";
import { InViewVideo } from "./InViewVideo";
import { VideoSoundButton } from "./VideoSoundButton";

type Props = {
  items: MediaItem[];
  eyebrow?: string;
  title?: ReactNode;
  cta?: ReactNode;
};

export function MediaRail({ items, eyebrow, title, cta }: Props) {
  const railRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });
  const [dragging, setDragging] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateArrows = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = railRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  const nudge = (dir: number) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.82, behavior: "smooth" });
  };

  const onPointerDown = (e: PointerEvent) => {
    const el = railRef.current;
    if (!el || e.pointerType === "touch") return;
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: 0 };
  };
  const onPointerMove = (e: PointerEvent) => {
    const el = railRef.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
    if (Math.abs(dx) > 4 && !dragging) setDragging(true);
    el.scrollLeft = drag.current.startScroll - dx;
  };
  const endDrag = () => {
    drag.current.active = false;
    window.setTimeout(() => setDragging(false), 0);
  };

  return (
    <div>
      {(eyebrow || title || cta) && (
        <div className="section-head">
          <div className="section-head__text">
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            {title && <h2>{title}</h2>}
          </div>
          <div className="flex-wrap-gap" style={{ alignItems: "center" }}>
            {cta}
            <div className="rail-controls">
              <button
                type="button"
                className="rail-btn"
                onClick={() => nudge(-1)}
                disabled={!canPrev}
                aria-label="Scroll left"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                type="button"
                className="rail-btn"
                onClick={() => nudge(1)}
                disabled={!canNext}
                aria-label="Scroll right"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        ref={railRef}
        className={`rail${dragging ? " is-drag" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        {items.map((item) => (
          <div className="rail__item" key={item.id}>
            <a
              className="media-tile"
              href={item.href}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                if (drag.current.moved > 6) e.preventDefault();
              }}
            >
              {item.type === "video" ? (
                <InViewVideo src={item.src} poster={item.poster} soundId={`rail:${item.id}`} />
              ) : (
                <img src={item.src} alt={item.caption} loading="lazy" decoding="async" />
              )}
              {item.type === "video" && <VideoSoundButton id={`rail:${item.id}`} />}
              <div className="media-tile__scrim" />
              <div className="media-tile__cap">
                <span>{item.caption}</span>
                {item.type === "video" && (
                  <span className="media-tile__play" aria-hidden="true">
                    <Play size={13} fill="currentColor" />
                  </span>
                )}
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
