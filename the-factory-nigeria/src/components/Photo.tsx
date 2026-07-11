import type { CSSProperties } from "react";

// Responsive image for the manager-supplied professional photography.
// Serves WebP with a JPEG fallback across 4 widths, keeps a stable aspect
// ratio (no layout shift), and honours a per-use focal point so subjects
// are never awkwardly cropped. See MDN object-position + web.dev srcset.

const BASE = "/assets/the-factory-nigeria/manager-supplied";
const WIDTHS = [480, 768, 1280, 1920];

type Props = {
  name: string; // e.g. "WWW01988"
  alt: string;
  ratio?: string; // CSS aspect-ratio for the frame; omit to fill the parent
  position?: string; // object-position focal point
  sizes?: string; // responsive sizes hint
  priority?: boolean; // eager-load (hero only)
  className?: string;
  style?: CSSProperties;
};

export function Photo({
  name,
  alt,
  ratio,
  position = "center",
  sizes = "100vw",
  priority = false,
  className,
  style,
}: Props) {
  const set = (ext: string) => WIDTHS.map((w) => `${BASE}/${name}-${w}.${ext} ${w}w`).join(", ");

  return (
    <div
      className={"photo" + (ratio ? "" : " photo--fill") + (className ? " " + className : "")}
      style={{ ...(ratio ? { aspectRatio: ratio } : null), ...style }}
    >
      <picture>
        <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
        <img
          src={`${BASE}/${name}-1280.jpg`}
          srcSet={set("jpg")}
          sizes={sizes}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          style={{ objectPosition: position }}
        />
      </picture>
    </div>
  );
}
