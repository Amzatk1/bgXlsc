import { Volume2, VolumeX } from "lucide-react";
import { useVideoSound } from "../store/videoSound";

/**
 * Mute/unmute toggle for a single video. Safe to place inside links — it stops
 * propagation so it never triggers the parent's navigation.
 */
export function VideoSoundButton({ id, className = "" }: { id: string; className?: string }) {
  const { isOn, toggle } = useVideoSound();
  const on = isOn(id);

  return (
    <button
      type="button"
      className={`v-sound${className ? ` ${className}` : ""}`}
      aria-label={on ? "Mute video" : "Unmute video"}
      aria-pressed={on}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {on ? <Volume2 size={16} /> : <VolumeX size={16} />}
    </button>
  );
}
