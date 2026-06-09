import { useEffect, useRef } from "react";
import { useReducedMotion } from "../hooks";
import { useVideoSound } from "../store/videoSound";

type Props = {
  src: string;
  poster?: string;
  className?: string;
  /** When set, this video participates in the single-source audio system. */
  soundId?: string;
};

/**
 * Muted, looped, inline video that plays only while in the viewport and pauses
 * otherwise. With reduced-motion it never autoplays — the poster frame shows
 * until the user unmutes (which also starts playback). If `soundId` is the
 * active audio source, the video plays with sound.
 */
export function InViewVideo({ src, poster, className, soundId }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const { isOn } = useVideoSound();
  const on = soundId ? isOn(soundId) : false;

  // Autoplay (muted) while in view, unless reduced motion is preferred.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced || typeof IntersectionObserver === "undefined") return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.35 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      el.pause();
    };
  }, [reduced]);

  // Sync sound: unmute + ensure playback when this is the active source.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = !on;
    if (on) {
      el.volume = 1;
      el.play().catch(() => {});
    }
  }, [on]);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      tabIndex={-1}
    />
  );
}
