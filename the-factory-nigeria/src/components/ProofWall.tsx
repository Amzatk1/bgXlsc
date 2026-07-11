import { useMemo, useState } from "react";
import { PHOTOS, PHOTO_CATEGORIES, type PhotoCategory } from "../data/media";
import { Photo } from "./Photo";

type Filter = "All" | PhotoCategory;

export function ProofWall({
  showFilter = true,
  limit,
  only,
}: {
  showFilter?: boolean;
  limit?: number;
  only?: PhotoCategory[];
}) {
  const [active, setActive] = useState<Filter>("All");

  const base = useMemo(
    () => (only ? PHOTOS.filter((i) => only.includes(i.category)) : PHOTOS),
    [only],
  );

  const items = useMemo(() => {
    const list = active === "All" ? base : base.filter((i) => i.category === active);
    return typeof limit === "number" ? list.slice(0, limit) : list;
  }, [active, limit, base]);

  const filters: Filter[] = ["All", ...PHOTO_CATEGORIES];

  return (
    <div>
      {showFilter ? (
        <div className="filterbar" role="group" aria-label="Filter work by type">
          {filters.map((f) => (
            <button
              key={f}
              className={"filterbar__chip" + (active === f ? " is-active" : "")}
              onClick={() => setActive(f)}
              aria-pressed={active === f}
            >
              {f}
            </button>
          ))}
        </div>
      ) : null}

      <div className="wall">
        {items.map((img, i) => (
          <figure className="wall__item" key={img.name}>
            <Photo
              name={img.name}
              alt={img.alt}
              ratio={img.ratio}
              position={img.position}
              sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
            />
            <figcaption className="wall__cap">
              <span className="wall__cap-no mono">{String(i + 1).padStart(2, "0")}</span>
              <span className="wall__cap-txt">{img.caption}</span>
              <span className="wall__cap-cat mono">{img.category}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
