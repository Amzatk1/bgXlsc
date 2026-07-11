import { useEffect, useState } from "react";

// Minimal, dependency-free hash router. Bulletproof on static hosting and
// in `vite preview` (survives hard refresh on any sub-path).

export type Path =
  | "/"
  | "/services"
  | "/process"
  | "/work"
  | "/brands"
  | "/visit"
  | "/faq"
  | "/start-an-order"
  | "/experiments/custom-tee-studio";

const KNOWN: Path[] = [
  "/",
  "/services",
  "/process",
  "/work",
  "/brands",
  "/visit",
  "/faq",
  "/start-an-order",
  "/experiments/custom-tee-studio",
];

export function getPath(): Path {
  const raw = window.location.hash.replace(/^#/, "").split("?")[0];
  const clean = ("/" + raw.replace(/^\/+/, "")).replace(/\/+$/, "") || "/";
  return (KNOWN.includes(clean as Path) ? clean : "/") as Path;
}

// Read a query value from the hash, e.g. #/start-an-order?service=Printing
export function getHashQuery(key: string): string {
  const q = window.location.hash.split("?")[1] || "";
  try {
    return new URLSearchParams(q).get(key) || "";
  } catch {
    return "";
  }
}

export function useHashRoute(): Path {
  const [path, setPath] = useState<Path>(() =>
    typeof window === "undefined" ? "/" : getPath(),
  );

  useEffect(() => {
    const onChange = () => {
      // Ignore in-page anchors (e.g. "#main") so they scroll natively.
      const raw = window.location.hash;
      if (raw && !raw.startsWith("#/")) return;
      setPath(getPath());
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return path;
}

export const TITLES: Record<Path, string> = {
  "/": "The Factory Nigeria — Garment Production & Printing in Lagos",
  "/services": "Services — The Factory Nigeria",
  "/process": "How it works — The Factory Nigeria",
  "/work": "Our work — The Factory Nigeria",
  "/brands": "Brands & companies — The Factory Nigeria",
  "/visit": "Contact & visit — The Factory Nigeria",
  "/faq": "FAQs — The Factory Nigeria",
  "/start-an-order": "Start an order enquiry — The Factory Nigeria",
  "/experiments/custom-tee-studio": "Studio — The Factory Nigeria",
};
