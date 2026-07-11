import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useAudioBus } from "../lib/audioBus";
import { usePrefersReducedMotion } from "../lib/usePrefersReducedMotion";
import type { Fit } from "../data/media";

type Ratio = "9x16" | "4x5" | "1x1" | "16x9";

type Props = {
  id: string;
  src: string;
  poster: string;
  alt: string;
  ratio?: Ratio;
  fit?: Fit;
  position?: string;
  tag?: ReactNode;
  className?: string;
};

// Poster fallback + in-view muted autoplay + accessible play/mute controls.
// Only one video site-wide can be unmuted at once (via the audio bus).
export function MediaVideo({
  id,
  src,
  poster,
  alt,
  ratio = "9x16",
  fit = "cover",
  position = "center",
  tag,
  className,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { activeId, requestAudio, releaseAudio } = useAudioBus();
  const reduced = usePrefersReducedMotion();

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [inView, setInView] = useState(false);

  // In-view detection
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => setInView(e.isIntersecting)),
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Autoplay (muted) only while in view, and never under reduced motion.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (inView && !reduced) {
      v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      v.pause();
      if (!inView && !muted) {
        setMuted(true);
        releaseAudio(id);
      }
    }
  }, [inView, reduced, id, muted, releaseAudio]);

  // If another video grabs audio, mute this one.
  useEffect(() => {
    if (activeId !== id && !muted) setMuted(true);
  }, [activeId, id, muted]);

  // Reflect muted state on the element.
  useEffect(() => {
    const v = videoRef.current;
    if (v) v.muted = muted;
  }, [muted]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    setMuted(next);
    if (!next) {
      requestAudio(id);
      v.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      releaseAudio(id);
    }
  };

  const fitStyle: CSSProperties = { objectFit: fit, objectPosition: position };

  return (
    <div
      ref={wrapRef}
      className={
        "media ratio-" +
        ratio +
        (fit !== "cover" ? " media--matte" : "") +
        (playing ? " is-playing" : "") +
        (className ? " " + className : "")
      }
      role="group"
      aria-label={alt}
    >
      <div className="media__frame">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          tabIndex={-1}
          aria-label={alt}
          style={fitStyle}
        />
        <img
          className="media__poster"
          src={poster}
          alt={alt}
          loading="lazy"
          decoding="async"
          style={fitStyle}
        />
      </div>

      {tag ? <div className="media__tag">{tag}</div> : null}

      {!playing ? (
        <button className="media__play" onClick={togglePlay} aria-label={"Play video: " + alt}>
          <Play size={22} fill="currentColor" aria-hidden="true" />
        </button>
      ) : null}

      <div className="media__controls">
        <button
          className="media__btn"
          onClick={togglePlay}
          aria-label={playing ? "Pause video" : "Play video"}
        >
          {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </button>
        <button
          className="media__btn"
          onClick={toggleMute}
          aria-label={muted ? "Unmute video" : "Mute video"}
        >
          {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
