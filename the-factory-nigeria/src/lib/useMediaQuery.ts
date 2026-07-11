import { useEffect, useState } from "react";

// Matches a CSS media query. Initialised synchronously so the first paint
// is already correct (no desktop->mobile flash). Used to render a genuinely
// different (shorter) homepage tree on mobile rather than CSS-hiding a
// second copy — so screen readers never see both.
export function useMediaQuery(query: string): boolean {
  const read = () =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(query).matches
      : false;

  const [matches, setMatches] = useState(read);

  useEffect(() => {
    const mq = window.matchMedia(query);
    // Re-read fresh on both the media-query change AND window resize.
    // (Some environments don't fire matchMedia "change" on programmatic
    // viewport changes; resize covers that and is robust in production.)
    const update = () => setMatches(window.matchMedia(query).matches);
    update();
    mq.addEventListener?.("change", update);
    window.addEventListener("resize", update);
    return () => {
      mq.removeEventListener?.("change", update);
      window.removeEventListener("resize", update);
    };
  }, [query]);

  return matches;
}
