import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Eye, EyeOff, Grid3x3, Magnet, RotateCw, Shrink, Sparkles, ZoomIn, ZoomOut } from "lucide-react";
import { areasForView, getFontById, PREVIEW_DISCLAIMER, type ViewId } from "../../studio/catalog";
import {
  clampLayer,
  fitLayerToArea,
  homeArea,
  isLayerOutOfArea,
  layerBox,
  snapRotation,
  type Layer,
} from "../../studio/state";
import { PRODUCTS } from "../../studio/catalog";
import { GARMENT_IMG, layerTuning, STAGE_H, STAGE_W } from "../../studio/garment";

type Props = {
  productId: string;
  view: ViewId;
  colorHex: string;
  layers: Layer[]; // layers for THIS view
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (layer: Layer) => void;
  compact?: boolean; // hides toolbar + interaction (colour step preview)
};

type Gesture =
  | { kind: "drag"; startX: number; startY: number; cx0: number; cy0: number }
  | { kind: "scale"; d0: number; s0: number }
  | { kind: "rotate"; a0: number; r0: number }
  | { kind: "pinch"; d0: number; a0: number; s0: number; r0: number };

const ZOOMS = [1, 1.4, 1.8];
const SNAP = 0.014; // stage-normalised snap threshold (~8px)

export function TeeStage({ productId, view, colorHex, layers, selectedId, onSelect, onChange, compact = false }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const elRefs = useRef(new Map<string, HTMLDivElement>());
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<Gesture | null>(null);
  const live = useRef<Layer | null>(null);
  const raf = useRef(0);
  const [k, setK] = useState(1);
  const [zoomI, setZoomI] = useState(0);
  const [zoneVisible, setZoneVisible] = useState(true);
  const [fabricMode, setFabricMode] = useState(true);
  const [snapOn, setSnapOn] = useState(true);
  const [gridOn, setGridOn] = useState(false);
  const [dragOut, setDragOut] = useState(false);
  const [guides, setGuides] = useState<{ x: boolean; y: boolean } | null>(null);
  const snapRef = useRef(true);
  snapRef.current = snapOn;

  const product = useMemo(() => PRODUCTS.find((p) => p.id === productId) ?? PRODUCTS[0], [productId]);
  const img = (GARMENT_IMG[productId] ?? GARMENT_IMG["unisex-tee"])[view];
  const tuning = useMemo(() => layerTuning(colorHex, productId), [colorHex, productId]);
  const zoom = ZOOMS[zoomI];
  const areas = useMemo(() => areasForView(product, view), [product, view]);
  const selected = layers.find((l) => l.id === selectedId) ?? null;

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

  const committedOut = selected ? isLayerOutOfArea(selected, product) : false;
  const out = gesture.current ? dragOut : committedOut;

  // ---- geometry ----
  function boxPx(l: Layer) {
    const b = layerBox(l); // stage px
    return { x: b.x * k, y: b.y * k, w: b.w * k, h: b.h * k };
  }

  function paint(l: Layer) {
    const el = elRefs.current.get(l.id);
    if (!el) return;
    const b = boxPx(l);
    el.style.width = b.w + "px";
    el.style.height = b.h + "px";
    el.style.transform = `translate(${b.x}px, ${b.y}px) translate(-50%, -50%) rotate(${l.rotation}deg)`;
    if (l.kind === "text") {
      const span = el.firstElementChild as HTMLElement | null;
      if (span) span.style.fontSize = b.h + "px";
    }
  }

  function schedule(l: Layer) {
    live.current = l;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      if (live.current) {
        paint(live.current);
        setDragOut(isLayerOutOfArea(live.current, product));
      }
    });
  }

  function stagePoint(e: { clientX: number; clientY: number }) {
    const rect = stageRef.current!.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / (k * zoom), y: (e.clientY - rect.top) / (k * zoom) };
  }

  // ---- gestures ----
  function onPointerDown(e: React.PointerEvent, layer: Layer, mode: "move" | "scale" | "rotate") {
    if (compact) return;
    e.preventDefault();
    e.stopPropagation();
    if (layer.id !== selectedId) onSelect(layer.id);
    if (layer.locked) return; // locked: selectable, but no drag/resize/rotate
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      /* fine */
    }
    const p = stagePoint(e);
    pointers.current.set(e.pointerId, p);
    const a = live.current && live.current.id === layer.id ? live.current : layer;

    if (pointers.current.size === 2) {
      const [m, n] = [...pointers.current.values()];
      gesture.current = {
        kind: "pinch",
        d0: Math.hypot(n.x - m.x, n.y - m.y),
        a0: Math.atan2(n.y - m.y, n.x - m.x),
        s0: a.size,
        r0: a.rotation,
      };
      live.current = a;
      return;
    }
    const b = layerBox(a);
    if (mode === "move") gesture.current = { kind: "drag", startX: p.x, startY: p.y, cx0: a.cx, cy0: a.cy };
    else if (mode === "scale") gesture.current = { kind: "scale", d0: Math.hypot(p.x - b.x, p.y - b.y), s0: a.size };
    else gesture.current = { kind: "rotate", a0: Math.atan2(p.y - b.y, p.x - b.x), r0: a.rotation };
    live.current = a;
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!gesture.current || !live.current || !pointers.current.has(e.pointerId)) return;
    e.preventDefault();
    const p = stagePoint(e);
    pointers.current.set(e.pointerId, p);
    const g = gesture.current;
    const a = live.current;

    if (g.kind === "pinch" && pointers.current.size >= 2) {
      const [m, n] = [...pointers.current.values()];
      const d = Math.hypot(n.x - m.x, n.y - m.y);
      const ang = Math.atan2(n.y - m.y, n.x - m.x);
      schedule(
        clampLayer({ ...a, size: g.s0 * (d / Math.max(1, g.d0)), rotation: snapRotation(g.r0 + ((ang - g.a0) * 180) / Math.PI) }),
      );
      return;
    }
    if (g.kind === "drag") {
      let cx = g.cx0 + (p.x - g.startX) / STAGE_W;
      let cy = g.cy0 + (p.y - g.startY) / STAGE_H;
      // snap to stage centre, home-area centre lines, and area edges
      // (hold Alt or turn off the Snap tool for complete freedom)
      const snapping = snapRef.current && !e.altKey;
      const box = layerBox(a);
      const hw = box.w / 2 / STAGE_W;
      const hh = box.h / 2 / STAGE_H;
      const area = homeArea({ ...a, cx, cy }, product);
      const areaCx = (area.x + area.w / 2) / STAGE_W;
      const areaCy = (area.y + area.h / 2) / STAGE_H;
      const aL = area.x / STAGE_W;
      const aR = (area.x + area.w) / STAGE_W;
      const aT = area.y / STAGE_H;
      const aB = (area.y + area.h) / STAGE_H;
      let snapX = false;
      let snapY = false;
      if (snapping) {
        if (Math.abs(cx - 0.5) < SNAP) { cx = 0.5; snapX = true; }
        else if (Math.abs(cx - areaCx) < SNAP) { cx = areaCx; snapX = true; }
        else if (Math.abs(cx - hw - aL) < SNAP) { cx = aL + hw; snapX = true; }
        else if (Math.abs(cx + hw - aR) < SNAP) { cx = aR - hw; snapX = true; }
        if (Math.abs(cy - areaCy) < SNAP) { cy = areaCy; snapY = true; }
        else if (Math.abs(cy - hh - aT) < SNAP) { cy = aT + hh; snapY = true; }
        else if (Math.abs(cy + hh - aB) < SNAP) { cy = aB - hh; snapY = true; }
      }
      setGuides({ x: snapX, y: snapY });
      schedule(clampLayer({ ...a, cx, cy }));
    } else if (g.kind === "scale") {
      const b = layerBox(a);
      const d = Math.hypot(p.x - b.x, p.y - b.y);
      schedule(clampLayer({ ...a, size: g.s0 * (d / Math.max(1, g.d0)) }));
    } else if (g.kind === "rotate") {
      const b = layerBox(a);
      const ang = Math.atan2(p.y - b.y, p.x - b.x);
      const raw = g.r0 + ((ang - g.a0) * 180) / Math.PI;
      schedule(clampLayer({ ...a, rotation: snapRef.current && !e.altKey ? snapRotation(raw) : raw }));
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0 && gesture.current) {
      gesture.current = null;
      setGuides(null);
      if (live.current) onChange(live.current);
      live.current = null;
    }
  }

  function onKeyDown(e: React.KeyboardEvent, layer: Layer) {
    if (layer.locked) return;
    const step = e.shiftKey ? 0.03 : 0.008;
    const map: Record<string, () => Layer> = {
      ArrowLeft: () => ({ ...layer, cx: layer.cx - step }),
      ArrowRight: () => ({ ...layer, cx: layer.cx + step }),
      ArrowUp: () => ({ ...layer, cy: layer.cy - step }),
      ArrowDown: () => ({ ...layer, cy: layer.cy + step }),
      "+": () => ({ ...layer, size: layer.size * 1.06 }),
      "=": () => ({ ...layer, size: layer.size * 1.06 }),
      "-": () => ({ ...layer, size: layer.size * 0.94 }),
      "[": () => ({ ...layer, rotation: layer.rotation - (e.shiftKey ? 15 : 2) }),
      "]": () => ({ ...layer, rotation: layer.rotation + (e.shiftKey ? 15 : 2) }),
    };
    const fn = map[e.key];
    if (fn) {
      e.preventDefault();
      onChange(clampLayer(fn()));
    }
  }

  function renderLayer(l: Layer) {
    const isSel = l.id === selectedId && !compact;
    const b = boxPx(l);
    const common: React.CSSProperties = {
      width: b.w,
      height: b.h,
      transform: `translate(${b.x}px, ${b.y}px) translate(-50%, -50%) rotate(${l.rotation}deg)`,
    };
    return (
      <div
        key={l.id}
        ref={(el) => {
          if (el) elRefs.current.set(l.id, el);
          else elRefs.current.delete(l.id);
        }}
        className={"stage__art" + (isSel ? " is-sel" : "") + (isSel && out ? " is-out" : "")}
        role={compact ? undefined : "button"}
        aria-label={
          l.kind === "image"
            ? `Design ${l.fileName}. Arrow keys move, plus and minus resize, square brackets rotate.`
            : `Text ${l.text}. Arrow keys move, plus and minus resize, square brackets rotate.`
        }
        tabIndex={compact ? -1 : 0}
        onKeyDown={compact ? undefined : (e) => onKeyDown(e, l)}
        onPointerDown={(e) => onPointerDown(e, l, "move")}
        style={common}
      >
        {l.kind === "image" ? (
          <img src={l.src} alt="" draggable={false} />
        ) : (
          <span
            className="stage__text"
            style={{
              fontSize: b.h,
              fontFamily: getFontById(l.fontId).stack,
              fontWeight: getFontById(l.fontId).weight,
              color: l.color,
              letterSpacing: `${(l.letterSpacing || 0) * b.h}px`,
              WebkitTextStroke: l.outline && l.outlineWidth > 0 ? `${l.outlineWidth * b.h}px ${l.outline}` : undefined,
              paintOrder: "stroke fill",
            }}
          >
            {l.text}
          </span>
        )}
        {isSel && (
          <>
            <span className="stage__box" aria-hidden="true" />
            {!l.locked && (
              <>
                <button type="button" className="stage__handle stage__handle--rotate" aria-label="Rotate" onPointerDown={(e) => onPointerDown(e, l, "rotate")}>
                  <RotateCw size={13} aria-hidden="true" />
                </button>
                <button type="button" className="stage__handle stage__handle--scale" aria-label="Resize" onPointerDown={(e) => onPointerDown(e, l, "scale")} />
              </>
            )}
          </>
        )}
      </div>
    );
  }

  const sel = live.current && selected && live.current.id === selected.id ? live.current : selected;

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
            {zoneVisible ? <Eye size={15} aria-hidden="true" /> : <EyeOff size={15} aria-hidden="true" />} Print areas
          </button>
          <button type="button" className={"gtool gtool--label" + (fabricMode ? " is-on" : "")} aria-pressed={fabricMode} onClick={() => setFabricMode((v) => !v)}>
            <Sparkles size={15} aria-hidden="true" /> Fabric preview
          </button>
          <span className="gtool__sep" aria-hidden="true" />
          <button type="button" className={"gtool gtool--label" + (snapOn ? " is-on" : "")} aria-pressed={snapOn} onClick={() => setSnapOn((v) => !v)} title="Snap to centre (hold Alt to bypass)">
            <Magnet size={15} aria-hidden="true" /> Snap
          </button>
          <button type="button" className={"gtool gtool--label" + (gridOn ? " is-on" : "")} aria-pressed={gridOn} onClick={() => setGridOn((v) => !v)}>
            <Grid3x3 size={15} aria-hidden="true" /> Grid
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
          onPointerDown={compact ? undefined : () => onSelect(null)}
        >
          <div className="gstage__color" style={{ backgroundColor: colorHex, WebkitMaskImage: `url(${img})`, maskImage: `url(${img})` }} aria-hidden="true" />
          <div className="gstage__artclip" style={fabricMode ? { WebkitMaskImage: `url(${img})`, maskImage: `url(${img})` } : undefined}>
            {layers.filter((l) => !l.hidden).map(renderLayer)}
          </div>
          <img className="gstage__shade" src={img} alt="" aria-hidden="true" draggable={false} style={{ filter: `grayscale(1) brightness(${tuning.shadeBrightness})` }} />
          <img className="gstage__light" src={img} alt="" aria-hidden="true" draggable={false} style={{ opacity: tuning.lightOpacity, filter: "grayscale(1) contrast(1.15)" }} />

          {(zoneVisible || gridOn) && !compact && (
            <svg className="gstage__overlay" viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} aria-hidden="true">
              {gridOn &&
                Array.from({ length: 11 }).map((_, i) => (
                  <g key={"g" + i}>
                    <line className="stage__grid" x1={(STAGE_W / 12) * (i + 1)} y1={0} x2={(STAGE_W / 12) * (i + 1)} y2={STAGE_H} />
                    <line className="stage__grid" x1={0} y1={(STAGE_H / 14) * (i + 1)} x2={STAGE_W} y2={(STAGE_H / 14) * (i + 1)} />
                  </g>
                ))}
              {zoneVisible &&
                areas.map((a) => (
                  <g key={a.id}>
                    <rect className={"stage__zone" + (sel && homeArea(sel, product).id === a.id ? " is-home" : "")} x={a.x} y={a.y} width={a.w} height={a.h} rx={6} />
                  </g>
                ))}
              {sel && (
                <text className="gstage__zonelabel" x={homeArea(sel, product).x + 6} y={homeArea(sel, product).y - 7}>
                  {homeArea(sel, product).name.toUpperCase()} · {homeArea(sel, product).widthIn}″ × {homeArea(sel, product).heightIn}″
                </text>
              )}
              {guides?.x && <line className="stage__guide" x1={STAGE_W / 2} y1={0} x2={STAGE_W / 2} y2={STAGE_H} />}
              {guides?.y && sel && (
                <line className="stage__guide" x1={0} y1={sel.cy * STAGE_H} x2={STAGE_W} y2={sel.cy * STAGE_H} />
              )}
            </svg>
          )}

          {out && selected && !compact && (
            <div className="stage__warn" role="status">
              <AlertTriangle size={14} aria-hidden="true" />
              <span>Part of this design is outside the {homeArea(selected, product).name.toLowerCase()} print area.</span>
              <button type="button" className="stage__fix" onClick={() => onChange(fitLayerToArea(selected, product))}>
                <Shrink size={13} aria-hidden="true" /> Fit to area
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="stage__note">{PREVIEW_DISCLAIMER}</p>
    </div>
  );
}
