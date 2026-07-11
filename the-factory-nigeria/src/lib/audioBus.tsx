import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

// Ensures only one video can be audible at a time across the whole site.
type AudioBus = {
  activeId: string | null;
  requestAudio: (id: string) => void;
  releaseAudio: (id: string) => void;
};

const Ctx = createContext<AudioBus | null>(null);

export function AudioBusProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const requestAudio = useCallback((id: string) => setActiveId(id), []);
  const releaseAudio = useCallback(
    (id: string) => setActiveId((cur) => (cur === id ? null : cur)),
    [],
  );

  return <Ctx.Provider value={{ activeId, requestAudio, releaseAudio }}>{children}</Ctx.Provider>;
}

export function useAudioBus(): AudioBus {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAudioBus must be used within AudioBusProvider");
  return ctx;
}
