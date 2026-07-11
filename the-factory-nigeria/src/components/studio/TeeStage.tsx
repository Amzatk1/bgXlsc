import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import type { PrintZone, ViewId } from "../../studio/catalog";
import { PREVIEW_DISCLAIMER } from "../../studio/catalog";
import { clampArtwork, isOutOfZone, type Artwork } from "../../studio/state";
import { pxPerInch, STAGE_H, STAGE_W, teeInnerMarkup } from "../../studio/teeArt";

type Props = {
  cut: "regular" | "oversized";
  view: ViewId;
  colorHex: string;
  zone: PrintZone;
  artwork?: Artwork;
  onArtworkChange: (art: Artwork) => void;
  showZone?: boolean;
};

type Gesture =
  | { kind: "drag"; startX: number; startY: number; cx0: number; cy0: number }
  | { kind: "scale"; d0: number; w0: number }
  | { kind: "rotate"; a0: number; r0: number }
  | {
      kind: "pinch";
      d0: number;
      a0: number;
      w0: number;
      r0: number;
    };

// The visual editor. Pointer events unify mouse + touch; every change is
// clamped and mirrored by keyboard + numeric controls for accessibility.
export function TeeStage({ cut, view, colorHex, zone, artwork, onArtworkChange, showZone = true }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<Gesture | null>(null);
  const [k, setK] = useState(1); // rendered px per stage unit

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setK(el.clientWidth / STAGE_W);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const inner = useMemo(() => teeInnerMarkup(cut, view, colorHex), [cut, view, colorHex]);

  const out = artwork ? isOutOfZone(artwork, zone) : false;

  // ---- geometry helpers (stage units) ----
  const artStage = useMemo(() => {
    if (!artwork) return null;
    const ppi = pxPerInch(zone);
    const w = artwork.widthIn * ppi;
    const h = w * (artwork.naturalH / artwork.naturalW);
    const x = zone.x + artwork.cx * zone.w;
    const y = zone.y + artwork.cy * zone.h;
    return { w, h, x, y };
  }, [artwork, zone]);

  function stagePoint(e: { clientX: number; clientY: number }) {
    const rect = wrapRef.current!.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / k, y: (e.clientY - rect.top) / k };
  }

  function commit(next: Artwork) {
    onArtworkChange(clampArtwork(next, zone));
  }

  // ---- pointer gestures ----
  function onPointerDown(e: React.PointerEvent, mode: "move" | "scale" | "rotate") {
    if (!artwork || !artStage) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    const p = stagePoint(e);
    pointers.current.set(e.pointerId, p);

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = {
        kind: "pinch",
        d0: Math.hypot(b.x - a.x, b.y - a.y),
        a0: Math.atan2(b.y - a.y, b.x - a.x),
        w0: artwork.widthIn,
        r0: artwork.rotation,
      };
      return;
    }
    if (mode === "move") {
      gesture.current = { kind: "drag", startX: p.x, startY: p.y, cx0: artwork.cx, cy0: artwork.cy };
    } else if (mode === "scale") {
      gesture.current = { kind: "scale", d0: Math.hypot(p.x - artStage.x, p.y - artStage.y), w0: artwork.widthIn };
    } else {
      gesture.current = {
        kind: "rotate",
        a0: Math.atan2(p.y - artStage.y, p.x - artStage.x),
        r0: artwork.rotation,
      };
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!artwork || !artStage || !gesture.current) return;
    if (!pointers.current.has(e.pointerId)) return;
    e.preventDefault();
    const p = stagePoint(e);
    pointers.current.set(e.pointerId, p);
    const g = gesture.current;

    if (g.kind === "pinch" && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(b.x - a.x, b.y - a.y);
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      commit({
        ...artwork,
        widthIn: g.w0 * (d / Math.max(1, g.d0)),
        rotation: g.r0 + ((ang - g.a0) * 180) / Math.PI,
      });
      return;
    }
    if (g.kind === "drag") {
      commit({
        ...artwork,
        cx: g.cx0 + (p.x - g.startX) / zone.w,
        cy: g.cy0 + (p.y - g.startY) / zone.h,
      });
    } else if (g.kind === "scale") {
      const d = Math.hypot(p.x - artStage.x, p.y - artStage.y);
      commit({ ...artwork, widthIn: g.w0 * (d / Math.max(1, g.d0)) });
    } else if (g.kind === "rotate") {
      const a = Math.atan2(p.y - artStage.y, p.x - artStage.x);
      let rot = g.r0 + ((a - g.a0) * 180) / Math.PI;
      // gentle snapping near the compass points
      for (const snap of [0, 90, 180, 270, 360]) {
        if (Math.abs(((rot % 360) + 360) % 360 - snap) < 4) rot = snap;
      }
      commit({ ...artwork, rotation: rot });
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) gesture.current = null;
  }

  // keyboard: arrows move · +/- scale · [ ] rotate
  function onKeyDown(e: React.KeyboardEvent) {
    if (!artwork) return;
    const step = e.shiftKey ? 0.05 : 0.012;
    const map: Record<string, () => Artwork> = {
      ArrowLeft: () => ({ ...artwork, cx: artwork.cx - step }),
      ArrowRight: () => ({ ...artwork, cx: artwork.cx + step }),
      ArrowUp: () => ({ ...artwork, cy: artwork.cy - step }),
      ArrowDown: () => ({ ...artwork, cy: artwork.cy + step }),
      "+": () => ({ ...artwork, widthIn: artwork.widthIn + 0.25 }),
      "=": () => ({ ...artwork, widthIn: artwork.widthIn + 0.25 }),
      "-": () => ({ ...artwork, widthIn: artwork.widthIn - 0.25 }),
      "[": () => ({ ...artwork, rotation: artwork.rotation - (e.shiftKey ? 15 : 2) }),
      "]": () => ({ ...artwork, rotation: artwork.rotation + (e.shiftKey ? 15 : 2) }),
    };
    const fn = map[e.key];
    if (fn) {
      e.preventDefault();
      commit(fn());
    }
  }

  return (
    <div className="stage-wrap">
      <div
        ref={wrapRef}
        className="stage"
        style={{ aspectRatio: `${STAGE_W} / ${STAGE_H}` }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <svg className="stage__tee" viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} aria-hidden="true">
          <g dangerouslySetInnerHTML={{ __html: inner }} />
          {showZone && (
            <rect
              className="stage__zone"
              x={zone.x}
              y={zone.y}
              width={zone.w}
              height={zone.h}
              rx={6}
            />
          )}
        </svg>

        {artwork && artStage && (
          <div
            className={"stage__art" + (out ? " is-out" : "")}
            role="img"
            aria-label={`Artwork ${artwork.fileName}. Use arrow keys to move, plus and minus to resize, square brackets to rotate.`}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerDown={(e) => onPointerDown(e, "move")}
            style={{
              left: artStage.x * k,
              top: artStage.y * k,
              width: artStage.w * k,
              height: artStage.h * k,
              transform: `translate(-50%, -50%) rotate(${artwork.rotation}deg)`,
            }}
          >
            <img src={artwork.src} alt="" draggable={false} />
            <span className="stage__box" aria-hidden="true" />
            <button
              type="button"
              className="stage__handle stage__handle--rotate"
              aria-label="Rotate artwork"
              onPointerDown={(e) => onPointerDown(e, "rotate")}
            >
              <RotateCw size={13} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="stage__handle stage__handle--scale"
              aria-label="Resize artwork"
              onPointerDown={(e) => onPointerDown(e, "scale")}
            />
          </div>
        )}

        {out && (
          <p className="stage__warn" role="status">
            <AlertTriangle size={14} aria-hidden="true" />
            Part of your design is outside the recommended print area — drag it back in or shrink it.
          </p>
        )}
      </div>
      <p className="stage__note">{PREVIEW_DISCLAIMER}</p>
    </div>
  );
}
