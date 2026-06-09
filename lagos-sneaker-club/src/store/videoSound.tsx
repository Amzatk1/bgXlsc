import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * Single-source video audio. At most one video may have sound at a time
 * (`soundId`). Videos default to muted (browser autoplay policy + good UX);
 * the user opts in per video via a mute/unmute control.
 */
type VideoSoundValue = {
  soundId: string | null;
  toggle: (id: string) => void;
  isOn: (id: string) => boolean;
};

const VideoSoundContext = createContext<VideoSoundValue>({
  soundId: null,
  toggle: () => {},
  isOn: () => false,
});

export function VideoSoundProvider({ children }: { children: ReactNode }) {
  const [soundId, setSoundId] = useState<string | null>(null);

  // Unmuting one video mutes whatever was unmuted before — only one source plays sound.
  const toggle = useCallback((id: string) => {
    setSoundId((current) => (current === id ? null : id));
  }, []);

  const isOn = useCallback((id: string) => soundId === id, [soundId]);

  const value = useMemo(() => ({ soundId, toggle, isOn }), [soundId, toggle, isOn]);

  return <VideoSoundContext.Provider value={value}>{children}</VideoSoundContext.Provider>;
}

export function useVideoSound() {
  return useContext(VideoSoundContext);
}
