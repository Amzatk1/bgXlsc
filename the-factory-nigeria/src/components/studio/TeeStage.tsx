import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Eye, EyeOff, RotateCw, Shrink, Sparkles, ZoomIn, ZoomOut } from "lucide-react";
import type { PrintZone, ViewId } from "../../studio/catalog";
import { PREVIEW_DISCLAIMER } from "../../studio/catalog";
import { clampArtwork, fitArtworkToZone, isOutOfZone, type Artwork } from "../../studio/state";
import { GARMENT_IMG, layerTuning, STAGE_H, STAGE_W } from "../../studio/garment";

type Props = {
  productId: string;
  view: ViewId;
  colorHex: string;
  zone: PrintZone;
  artwork?: Artwork;
  onArtworkChange: (art: Artwork) => void;
  compact?: boolean; // hides workspace toolbar (colour step)
};

type Gesture =
  | { kind: "drag"; startX: number; startY: number; cx0: number; cy0: number }
  | { kind: "scale"; d0: number; w0: number }
  | { kind: "rotate"; a0: number; r0: number }
  | { kind: "pinch"; d0: number; a0: number; w0: number; r0: number };

const ZOOMS = [1, 1.4, 1.8];

// Photoreal garment stage: real photographed tee (colour-masked, multiply
// folds + screen highlights) with a live artwork layer. Gestures write to a
// ref and paint via requestAnimationFrame; React state commits on release.
export function TeeStage({ productId, view, colorHex, zone, artwork, onArtworkChange, compact = false }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<Gesture | null>(null);
  const live = useRef<Artwork | null>(null);
  const raf = useRef(0);
  const [k, setK] = useState(1); // rendered px per stage unit
  const [zoomI, setZoomI] = useState(0);
  const [zoneVisible, setZoneVisible] = useState(true);
  const [fabricMode, setFabricMode] = useState(true);
  const [dragOut, setDragOut] = useState(false);

  const img = (GARMENT_IMG[productId] ?? GARMENT_IMG["unisex-tee"])[view];
  const tuning = useMemo(() => layerTuning(colorHex, productId), [colorHex, productId]);
  const zoom = ZOOMS[zoomI];

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const update = () => setK(el.clientWidth / STAGE_W);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const committedOut = artwork ? isOutOfZone(artwork, zone) : false;
  const out = gesture.current ? dragOut : committedOut;

  // ---- geometry (stage units) ----
  function artBox(a: Artwork) {
    const ppi = zone.w / zone.widthIn;
    const w = a.widthIn * ppi;
    return {
      w,
      h: w * (a.naturalH / a.naturalW),
      x: zone.x + a.cx * zone.w,
      y: zone.y + a.cy * zone.h,
    };
  }

  function paint(a: Artwork) {
    const el = artRef.current;
    if (!el) return;
    const b = artBox(a);
    el.style.left = b.x * k + "px";
    el.style.top = b.y * k + "px";
    el.style.width = b.w * k + "px";
    el.style.height = b.h * k + "px";
    el.style.transform = `translate(-50%, -50%) rotate(${a.rotation}deg)`;
  }

  function schedule(a: Artwork) {
    live.current = a;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      if (live.current) {
        paint(live.current);
        setDragOut(isOutOfZone(live.current, zone));
      }
    });
  }

  function stagePoint(e: { clientX: number; clientY: number }) {
    const rect = stageRef.current!.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / (k * zoom), y: (e.clientY - rect.top) / (k * zoom) };
  }

  // ---- gestures ----
  function onPointerDown(e: React.PointerEvent, mode: "move" | "scale" | "rotate") {
    if (!artwork) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      /* synthetic or already-released pointer — gesture still works via bubbling */
    }
    const p = stagePoint(e);
    pointers.current.set(e.pointerId, p);
    const a = live.current ?? artwork;

    if (pointers.current.size === 2) {
      const [m, n] = [...pointers.current.values()];
      gesture.current = {
        kind: "pinch",
        d0: Math.hypot(n.x - m.x, n.y - m.y),
        a0: Math.atan2(n.y - m.y, n.x - m.x),
        w0: a.widthIn,
        r0: a.rotation,
      };
      return;
    }
    const b = artBox(a);
    if (mode === "move") gesture.current = { kind: "drag", startX: p.x, startY: p.y, cx0: a.cx, cy0: a.cy };
    else if (mode === "scale") gesture.current = { kind: "scale", d0: Math.hypot(p.x - b.x, p.y - b.y), w0: a.widthIn };
    else gesture.current = { kind: "rotate", a0: Math.atan2(p.y - b.y, p.x - b.x), r0: a.rotation };
    live.current = a;
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!artwork || !gesture.current || !pointers.current.has(e.pointerId)) return;
    e.preventDefault();
    const p = stagePoint(e);
    pointers.current.set(e.pointerId, p);
    const g = gesture.current;
    const a = live.current ?? artwork;

    if (g.kind === "pinch" && pointers.current.size >= 2) {
      const [m, n] = [...pointers.current.values()];
      const d = Math.hypot(n.x - m.x, n.y - m.y);
      const ang = Math.atan2(n.y - m.y, n.x - m.x);
      schedule(
        clampArtwork(
          { ...a, widthIn: g.w0 * (d / Math.max(1, g.d0)), rotation: g.r0 + ((ang - g.a0) * 180) / Math.PI },
          zone,
        ),
      );
      return;
    }
    if (g.kind === "drag") {
      schedule(clampArtwork({ ...a, cx: g.cx0 + (p.x - g.startX) / zone.w, cy: g.cy0 + (p.y - g.startY) / zone.h }, zone));
    } else if (g.kind === "scale") {
      const b = artBox(a);
      const d = Math.hypot(p.x - b.x, p.y - b.y);
      schedule(clampArtwork({ ...a, widthIn: g.w0 * (d / Math.max(1, g.d0)) }, zone));
    } else if (g.kind === "rotate") {
      const b = artBox(a);
      const ang = Math.atan2(p.y - b.y, p.x - b.x);
      let rot = g.r0 + ((ang - g.a0) * 180) / Math.PI;
      for (const snap of [0, 90, 180, 270, 360]) if (Math.abs((((rot % 360) + 360) % 360) - snap) < 4) rot = snap;
      schedule(clampArtwork({ ...a, rotation: rot }, zone));
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0 && gesture.current) {
      gesture.current = null;
      if (live.current) onArtworkChange(live.current);
      live.current = null;
    }
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
      onArtworkChange(clampArtwork(fn(), zone));
    }
  }

  const box = artwork ? artBox(live.current ?? artwork) : null;

  return (
    <div className="stage-wrap">
      {!compact && (
        <div className="gtools" role="toolbar" aria-label="Workspace tools">
          <button type="button" className="gtool" aria-label="Zoom in" disabled={zoomI >= ZOOMS.length - 1} onClick={() => setZoomI((z) => Math.min(z + 1, ZOOMS.length - 1))}>
            <ZoomIn size={16} aria-hidden="true" />
          </button>
          <button type="button" className="gtool" aria-label="Zoom out" disabled={zoomI === 0} onClick={() => setZoomI((z) => Math.max(z - 1, 0))}>
            <ZoomOut size={16} aria-hidden="true" />
          </button>
          <span className="gtool__sep" aria-hidden="true" />
          <button type="button" className={"gtool gtool--label" + (zoneVisible ? " is-on" : "")} aria-pressed={zoneVisible} onClick={() => setZoneVisible((v) => !v)}>
            {zoneVisible ? <Eye size={15} aria-hidden="true" /> : <EyeOff size={15} aria-hidden="true" />} Print area
          </button>
          <button type="button" className={"gtool gtool--label" + (fabricMode ? " is-on" : "")} aria-pressed={fabricMode} onClick={() => setFabricMode((v) => !v)}>
            <Sparkles size={15} aria-hidden="true" /> Fabric preview
          </button>
        </div>
      )}

      <div className={"gframe" + (zoom > 1 ? " is-zoomed" : "")} ref={frameRef}>
        <div
          ref={stageRef}
          className={"gstage" + (fabricMode ? " mode-fabric" : " mode-clean")}
          style={{ aspectRatio: `${STAGE_W} / ${STAGE_H}`, width: `${zoom * 100}%` }}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* 1 — flat colour masked to the garment silhouette */}
          <div
            className="gstage__color"
            style={{
              backgroundColor: colorHex,
              WebkitMaskImage: `url(${img})`,
              maskImage: `url(${img})`,
            }}
            aria-hidden="true"
          />
          {/* 2 — artwork (clipped to the garment in fabric mode) */}
          <div
            className="gstage__artclip"
            style={
              fabricMode
                ? { WebkitMaskImage: `url(${img})`, maskImage: `url(${img})` }
                : undefined
            }
          >
            {artwork && box && (
              <div
                ref={artRef}
                className={"stage__art" + (out ? " is-out" : "")}
                role="img"
                aria-label={`Artwork ${artwork.fileName}. Use arrow keys to move, plus and minus to resize, square brackets to rotate.`}
                tabIndex={0}
                onKeyDown={onKeyDown}
                onPointerDown={(e) => onPointerDown(e, "move")}
                style={{
                  left: box.x * k,
                  top: box.y * k,
                  width: box.w * k,
                  height: box.h * k,
                  transform: `translate(-50%, -50%) rotate(${(live.current ?? artwork).rotation}deg)`,
                }}
              >
                <img src={artwork.src} alt="" draggable={false} />
                <span className="stage__box" aria-hidden="true" />
                <button type="button" className="stage__handle stage__handle--rotate" aria-label="Rotate artwork" onPointerDown={(e) => onPointerDown(e, "rotate")}>
                  <RotateCw size={13} aria-hidden="true" />
                </button>
                <button type="button" className="stage__handle stage__handle--scale" aria-label="Resize artwork" onPointerDown={(e) => onPointerDown(e, "scale")} />
              </div>
            )}
          </div>
          {/* 3 — real fabric folds (multiply) */}
          <img
            className="gstage__shade"
            src={img}
            alt=""
            aria-hidden="true"
            draggable={false}
            style={{ filter: `grayscale(1) brightness(${tuning.shadeBrightness})` }}
          />
          {/* 4 — highlights for dark fabric (screen) */}
          <img
            className="gstage__light"
            src={img}
            alt=""
            aria-hidden="true"
            draggable={false}
            style={{ opacity: tuning.lightOpacity, filter: "grayscale(1) contrast(1.15)" }}
          />
          {/* overlay: print zone */}
          {zoneVisible && (
            <svg className="gstage__overlay" viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} aria-hidden="true">
              <rect className="stage__zone" x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx={6} />
              <text className="gstage__zonelabel" x={zone.x + 8} y={zone.y - 8}>
                PRINT AREA · {zone.widthIn}″ × {zone.heightIn}″
              </text>
            </svg>
          )}

          {out && artwork && (
            <div className="stage__warn" role="status">
              <AlertTriangle size={14} aria-hidden="true" />
              <span>Part of your design is outside the print area.</span>
              <button type="button" className="stage__fix" onClick={() => onArtworkChange(fitArtworkToZone(artwork, zone))}>
                <Shrink size={13} aria-hidden="true" /> Fit to print area
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="stage__note">{PREVIEW_DISCLAIMER}</p>
    </div>
  );
}
