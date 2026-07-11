import { useEffect, useRef } from "react";

// Lightweight scroll reveal. Adds `.is-visible` once on first intersection.
// Falls back to visible if IntersectionObserver is unavailable.
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("is-visible");
            obs.unobserve(el);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px", ...options },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return ref;
}
