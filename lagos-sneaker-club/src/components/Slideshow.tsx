import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useInView, useReducedMotion } from "../hooks";
import { useVideoSound } from "../store/videoSound";
import { VideoSoundButton } from "./VideoSoundButton";
import type { Slide } from "../data/media";

const soundIdFor = (id: string) => `hero:${id}`;

function SlideVideo({
  src,
  poster,
  active,
  soundId,
}: {
  src: string;
  poster?: string;
  active: boolean;
  soundId: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const { isOn } = useVideoSound();
  const on = isOn(soundId);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active) {
      el.play().catch(() => {});
    } else {
      el.pause();
      el.currentTime = 0;
    }
  }, [active]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = !(active && on);
    if (active && on) {
      el.volume = 1;
      el.play().catch(() => {});
    }
  }, [active, on]);

  return (
    <video ref={ref} src={src} poster={poster} muted loop playsInline preload="metadata" tabIndex={-1} />
  );
}

export function Slideshow({ slides }: { slides: Slide[] }) {
  const [active, setActive] = useState(0);
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0.2 });
  const reduced = useReducedMotion();

  const current = slides[active];
  const duration = current.type === "video" ? 7200 : current.duration ?? 6000;

  useEffect(() => {
    if (reduced || !inView) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % slides.length), duration);
    return () => window.clearTimeout(id);
  }, [active, inView, reduced, duration, slides.length]);

  return (
    <div className="slideshow" ref={ref} style={{ "--slide-dur": `${duration}ms` } as CSSProperties}>
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`slide${i === active ? " is-active" : ""}`}
          aria-hidden={i !== active}
        >
          {slide.type === "video" ? (
            <SlideVideo
              src={slide.src}
              poster={slide.poster}
              active={i === active && inView && !reduced}
              soundId={soundIdFor(slide.id)}
            />
          ) : (
            <img src={slide.src} alt={slide.label} loading={i === 0 ? "eager" : "lazy"} decoding="async" />
          )}
          <div className="slide__scrim" />
          <div className="slide__caption">
            <span className="slide__label">
              {slide.type === "video" && <span className="live" aria-hidden="true" />}
              {slide.label}
            </span>
          </div>
        </div>
      ))}

      {current.type === "video" && (
        <VideoSoundButton id={soundIdFor(current.id)} className="v-sound--hero" />
      )}

      <div className="slideshow__dots" role="tablist" aria-label="Slideshow controls">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={`slideshow__dot${i === active ? " is-active" : ""}`}
            onClick={() => setActive(i)}
            aria-label={`Show ${slide.label}`}
          >
            <span />
          </button>
        ))}
      </div>
    </div>
  );
}
