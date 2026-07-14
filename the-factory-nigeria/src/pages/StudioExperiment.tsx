import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Eye,
  EyeOff,
  HelpCircle,
  Hash,
  Image as ImageIcon,
  Info,
  Lock,
  Minus,
  MoveDiagonal,
  Paperclip,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Share2,
  Trash2,
  Type as TypeIcon,
  Unlock,
  Upload,
  User,
} from "lucide-react";
import {
  AVAILABILITY_LABEL,
  colorAvailability,
  CUSTOM_COLOR_NOTICE,
  DIFFICULT_AREA_NOTICE,
  FABRIC_VISUAL_NOTICE,
  FABRICS,
  fabricMethodIssue,
  fontsByCategory,
  getFontById,
  getProductionMethod,
  GUIDES_NOTICE,
  isSublimated,
  MARKET_SOURCING_NOTICE,
  PRODUCTS,
  productPpi,
  QUALITY_COPY,
  STANDARD_COLORS,
  SUBLIMATION_BLANK_NOTE,
  SUBLIMATION_DARK_COLOUR_HELP,
  SUBLIMATION_FABRIC_NOTE,
  SUBLIMATION_NOTE,
  TOWEL_BACK_NOTE,
  type AvailabilityStatus,
  type ViewId,
} from "../studio/catalog";
import { minimumFor } from "../studio/factoryFacts";
import {
  DEFAULT_PATTERN,
  JERSEY_PATTERNS,
  PATTERN_NOTE,
  patternSummary,
  type PatternId,
  type PatternSpec,
} from "../studio/patterns";
import {
  applyPlacement,
  backgroundLayer,
  blankTooDarkForSublimation,
  clampLayer,
  difficultCrossings,
  emptySizes,
  estimatedDpi,
  fitLayerToArea,
  fullSurfaceOnNonSublimated,
  getProduct,
  hasAnyDesign,
  initialState,
  layerBox,
  layerHeightIn,
  layerLabel,
  layersForView,
  coverSize,
  newPatternLayer,
  restylePatternLayer,
  type ImageLayer,
  layerWidthIn,
  newImageLayer,
  newTextLayer,
  placementsForLayer,
  qualityLevel,
  round2,
  SIZE_KEYS,
  sizeIssue,
  sizeTotal,
  straightenLayer,
  textBlockScale,
  validateForSubmit,
  viewSummary,
  type DesignState,
  type Layer,
  type TextLayer,
  type TextRole,
} from "../studio/state";
import { intakeFile } from "../studio/imageFile";
import { buildStudioMessage, getFabric, studioWaLink, summaryRows } from "../studio/messages";
import {
  canShareFiles,
  copyText,
  dataUrlToFile,
  downloadOriginalArtwork,
  downloadPreview,
  downloadSpec,
  imageLayers,
  shareFiles,
} from "../studio/exporter";
import { downloadReferenceSheet, exportReferenceSheet } from "../studio/referenceSheet";
import { deserializeDesign, isWorthSaving, serializeDesign, type SavedDesign } from "../studio/persist";
import { clearDesignLocal, loadDesignLocal, saveDesignLocal, savedAgo } from "../studio/deviceStore";
import { garmentImg, hexLuma, layerTuning, measureTextAspect, STAGE_H, STAGE_W } from "../studio/garment";
import { TeeStage } from "../components/studio/TeeStage";
import { WhatsAppIcon } from "../components/WhatsAppIcon";

const STEPS = ["Product", "Colour & fabric", "Design", "Review", "Order details", "Send"];
const METHODS = ["Screen printing", "Direct-to-garment (DTG)", "Heat transfer", "Embroidery", "Not sure — advise me"];

/** Availability status: always text, never colour alone. */
function AvailabilityBadge({ status }: { status: AvailabilityStatus }) {
  return <span className={"avail avail--" + status}>{AVAILABILITY_LABEL[status]}</span>;
}

/** One read-only layer (image or text), positioned by % of the stage. */
function PreviewLayer({ layer }: { layer: Layer }) {
  const b = layerBox(layer);
  const style: React.CSSProperties = {
    left: `${(b.x / STAGE_W) * 100}%`,
    top: `${(b.y / STAGE_H) * 100}%`,
    width: `${(b.w / STAGE_W) * 100}%`,
    height: `${(b.h / STAGE_H) * 100}%`,
    transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
  };
  if (layer.kind === "image") {
    return (
      <div className="tprev__art" style={style}>
        <img src={layer.src} alt="" draggable={false} />
      </div>
    );
  }
  const f = getFontById(layer.fontId);
  // `size` is ONE line's font size as a fraction of stage height; 1cqh = 1% of
  // the stage height, so the block grows with the number of lines exactly as it
  // does in the editor and in the canvas exports.
  const fontCqh = layer.size * 100;
  return (
    <div className="tprev__art" style={style}>
      <span
        className="tprev__text"
        style={{
          fontSize: `${fontCqh}cqh`,
          fontFamily: f.stack,
          fontWeight: f.weight,
          color: layer.color,
          lineHeight: layer.lineHeight > 0 ? layer.lineHeight : 1,
          textAlign: layer.align,
          letterSpacing: `${(layer.letterSpacing || 0) * fontCqh}cqh`,
          WebkitTextStroke:
            layer.outline && layer.outlineWidth > 0 ? `${layer.outlineWidth * fontCqh}cqh ${layer.outline}` : undefined,
          paintOrder: "stroke fill",
        }}
      >
        {layer.text}
      </span>
    </div>
  );
}

// Read-only photoreal mockup used on review/confirm screens (no handles).
function TeePreview({ state, view }: { state: DesignState; view: ViewId }) {
  const product = getProduct(state);
  const img = garmentImg(product.id, view);
  const tuning = useMemo(() => layerTuning(state.color.hex, product.id), [state.color.hex, product.id]);
  const layers = layersForView(state, view);
  return (
    <figure className="tprev">
      <div
        className="tprev__stage gstage mode-fabric"
        role="img"
        aria-label={`${view} preview — ${state.color.name} ${product.name}`}
        style={{ aspectRatio: `${STAGE_W} / ${STAGE_H}`, containerType: "size" }}
      >
        <div
          className="gstage__color"
          style={{ backgroundColor: state.color.hex, WebkitMaskImage: `url(${img})`, maskImage: `url(${img})` }}
          aria-hidden="true"
        />
        <div className="gstage__artclip" style={{ WebkitMaskImage: `url(${img})`, maskImage: `url(${img})` }}>
          {layers.map((l) => (
            <PreviewLayer key={l.id} layer={l} />
          ))}
        </div>
        <img className="gstage__shade" src={img} alt="" aria-hidden="true" style={{ filter: `grayscale(1) brightness(${tuning.shadeBrightness})` }} />
        <img className="gstage__light" src={img} alt="" aria-hidden="true" style={{ opacity: tuning.lightOpacity, filter: "grayscale(1) contrast(1.15)" }} />
      </div>
      <figcaption className="mono">{view}{layers.length ? "" : " · no design added"}</figcaption>
    </figure>
  );
}

export function StudioExperiment() {
  const [state, setState] = useState<DesignState>(initialState);
  const [step, setStep] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customHex, setCustomHex] = useState("#7fd1c0");
  const [customName, setCustomName] = useState("");
  const [sheetUrl, setSheetUrl] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null); // ISO date
  const [shareState, setShareState] = useState<"idle" | "shared" | "unsupported">("idle");
  const [copied, setCopied] = useState(false);
  const [mtab, setMtab] = useState<"artwork" | "adjust" | "style">("artwork"); // mobile bottom-sheet tab
  const [resumeSave, setResumeSave] = useState<SavedDesign | null>(null); // on-device auto-save offer
  /** Native file sharing available? Decides Share-first vs download fallback. */
  const canShare = useMemo(() => canShareFiles(), []);
  const fileRef = useRef<HTMLInputElement>(null);
  const designFileRef = useRef<HTMLInputElement>(null); // hidden input for "load design file"
  const topRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<number>(0);

  const product = getProduct(state);
  const fabric = getFabric(state);
  const ppi = productPpi(product);
  const viewLayers = layersForView(state, state.view);
  const selected = state.layers.find((l) => l.id === state.selectedId) ?? null;

  const set = (patch: Partial<DesignState>) => setState((s) => ({ ...s, ...patch }));
  const setDetails = (patch: Partial<DesignState["details"]>) =>
    setState((s) => ({ ...s, details: { ...s.details, ...patch } }));

  function setProductId(id: string) {
    setState((s) => ({ ...s, productId: id }));
  }

  function setView(view: ViewId) {
    const candidates = snapRef.current.layers.filter((layer) => layer.view === view && !layer.hidden);
    const nextSelected = candidates.length ? candidates[candidates.length - 1].id : null;
    setState((s) => ({ ...s, view, selectedId: nextSelected }));
    setMtab(nextSelected ? "adjust" : "artwork");
  }

  // ---- layer history (undo / redo) ----
  // Snapshots of the whole layer stack + selection. Mutations happen OUTSIDE
  // setState updaters (StrictMode double-invokes those, corrupting the stack).
  type Snap = { layers: Layer[]; selectedId: string | null };
  const history = useRef<{ past: Snap[]; future: Snap[] }>({ past: [], future: [] });
  const snapRef = useRef<Snap>({ layers: state.layers, selectedId: state.selectedId });
  snapRef.current = { layers: state.layers, selectedId: state.selectedId };
  const [historyTick, setHistoryTick] = useState(0);

  function commit(next: Snap) {
    history.current.past.push(snapRef.current);
    if (history.current.past.length > 60) history.current.past.shift();
    history.current.future = [];
    setHistoryTick((t) => t + 1);
    setState((s) => ({ ...s, layers: next.layers, selectedId: next.selectedId }));
  }
  const undo = () => {
    const prev = history.current.past.pop();
    if (!prev) return;
    history.current.future.push(snapRef.current);
    setHistoryTick((t) => t + 1);
    setState((s) => ({ ...s, layers: prev.layers, selectedId: prev.selectedId }));
  };
  const redo = () => {
    const next = history.current.future.pop();
    if (!next) return;
    history.current.past.push(snapRef.current);
    setHistoryTick((t) => t + 1);
    setState((s) => ({ ...s, layers: next.layers, selectedId: next.selectedId }));
  };
  void historyTick;

  // ---- layer operations ----
  function selectLayer(id: string | null) {
    setState((s) => ({ ...s, selectedId: id }));
  }
  function addLayer(layer: Layer) {
    commit({ layers: [...snapRef.current.layers, layer], selectedId: layer.id });
  }
  function replaceLayer(layer: Layer) {
    commit({ layers: snapRef.current.layers.map((l) => (l.id === layer.id ? layer : l)), selectedId: layer.id });
  }
  function patchText(id: string, patch: Partial<TextLayer>) {
    const l = snapRef.current.layers.find((x) => x.id === id);
    if (!l || l.kind !== "text") return;
    const merged = { ...l, ...patch } as TextLayer;
    // Anything that changes the shape of the text block changes its box.
    if (
      patch.text !== undefined ||
      patch.fontId !== undefined ||
      patch.letterSpacing !== undefined ||
      patch.lineHeight !== undefined
    ) {
      const f = getFontById(merged.fontId);
      merged.aspect = measureTextAspect(merged.text, f.stack, f.weight, merged.letterSpacing, merged.lineHeight);
    }
    replaceLayer(clampLayer(merged));
  }
  function removeLayer(id: string) {
    const layers = snapRef.current.layers.filter((l) => l.id !== id);
    commit({ layers, selectedId: layers.length ? layers[layers.length - 1].id : null });
  }
  function duplicateLayer(id: string) {
    const l = snapRef.current.layers.find((x) => x.id === id);
    if (!l) return;
    const copy = clampLayer({ ...l, id: "L" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), cx: l.cx + 0.04, cy: l.cy + 0.04 });
    commit({ layers: [...snapRef.current.layers, copy], selectedId: copy.id });
  }
  function reorderLayer(id: string, dir: -1 | 1) {
    const arr = [...snapRef.current.layers];
    const i = arr.findIndex((l) => l.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    commit({ layers: arr, selectedId: id });
  }

  useEffect(() => {
    if (step !== 2) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function go(n: number) {
    setErrors({});
    setStep(Math.max(0, Math.min(STEPS.length - 1, n)));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(
      () => topRef.current?.scrollIntoView({ block: "start", behavior: reducedMotion ? "auto" : "smooth" }),
      10,
    );
  }

  // ---- on-device auto-save (this browser only; never uploaded) ----
  // On first mount, offer to resume a recent design saved on this device.
  useEffect(() => {
    let on = true;
    loadDesignLocal().then((saved) => {
      if (on && saved && deserializeDesign(saved)) setResumeSave(saved);
    });
    return () => {
      on = false;
    };
  }, []);

  // Debounced auto-save whenever the design changes (skip once sent).
  useEffect(() => {
    if (submitted) return;
    window.clearTimeout(saveTimer.current);
    if (!isWorthSaving(state)) return;
    saveTimer.current = window.setTimeout(() => {
      void saveDesignLocal(serializeDesign(state));
    }, 800);
    return () => window.clearTimeout(saveTimer.current);
  }, [state, submitted]);

  function resumeSavedDesign() {
    if (!resumeSave) return;
    const restored = deserializeDesign(resumeSave);
    if (restored) {
      setState(restored);
      go(restored.layers.length ? 2 : 0); // land on the editor if there's a design
    }
    setResumeSave(null);
  }
  function dismissResume() {
    setResumeSave(null);
    void clearDesignLocal();
  }

  /** Download the editable design as a .json file the customer keeps on their device. */
  function saveDesignFile() {
    const blob = new Blob([JSON.stringify(serializeDesign(state), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${state.reference}-studio-design.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  async function loadDesignFile(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    try {
      const restored = deserializeDesign(JSON.parse(await f.text()));
      if (restored) {
        setState(restored);
        setResumeSave(null);
        go(2);
      } else {
        setUploadError("That design file couldn't be read. Please choose a Studio design (.json) file.");
      }
    } catch {
      setUploadError("That design file couldn't be read. Please choose a Studio design (.json) file.");
    }
    if (designFileRef.current) designFileRef.current.value = "";
  }

  async function onFile(files: FileList | null) {
    setUploadError("");
    const f = files?.[0];
    if (!f) return;
    const res = await intakeFile(f);
    if (!res.ok) {
      setUploadError(res.error);
      return;
    }
    addLayer(
      newImageLayer(
        { src: res.src, fileName: res.fileName, fileKB: res.fileKB, naturalW: res.naturalW, naturalH: res.naturalH, hasAlpha: res.hasAlpha, avgLuma: res.avgLuma },
        product,
        state.view,
      ),
    );
    setMtab("adjust");
    if (fileRef.current) fileRef.current.value = "";
  }

  function addText(role: TextRole) {
    addLayer(newTextLayer(role, product, state.view));
    setMtab("adjust");
  }

  // ---- full-surface design (how a sublimated jersey is actually made) ----
  const sublimated = isSublimated(product);
  const bgLayer = backgroundLayer(state, state.view);
  const [pattern, setPattern] = useState<PatternSpec>(DEFAULT_PATTERN);
  /** The panel follows whatever is actually on the garment. */
  const activePattern: PatternSpec = bgLayer?.pattern ?? pattern;

  /** Add — or restyle — the full-surface design on the current view. */
  function applyPattern(next: Partial<PatternSpec>) {
    const spec: PatternSpec = { ...activePattern, ...next };
    setPattern(spec);
    const layers = snapRef.current.layers;
    const existing = layers.find(
      (l): l is ImageLayer => l.view === state.view && l.kind === "image" && !!l.generated,
    );
    if (existing) {
      const updated = restylePatternLayer(existing, spec);
      commit({
        layers: layers.map((l) => (l.id === updated.id ? updated : l)),
        selectedId: snapRef.current.selectedId,
      });
      return;
    }
    // A full surface sits UNDER every other layer — it is the garment itself.
    const layer = newPatternLayer(spec, state.view);
    commit({ layers: [layer, ...layers], selectedId: layer.id });
    setMtab("adjust");
  }

  // ---- what the process can physically do ----
  // Sublimation ink is a translucent dye: it cannot print a light colour onto a
  // dark blank. But the customer's real intent — a dark jersey — is exactly what
  // a full-surface design is for, so we offer that instead of just saying no.
  const darkBlank = blankTooDarkForSublimation(product, state.color.hex);
  const fabricIssue = fabricMethodIssue(product, fabric);
  const strandedFullSurface = fullSurfaceOnNonSublimated(state);
  const minimum = minimumFor(product);

  /** Keep the blank white and move the chosen colour into the print itself. */
  function moveColourIntoPrint() {
    const chosen = state.color.hex;
    const white = STANDARD_COLORS.find((c) => c.id === "white");
    if (white) setState((s) => ({ ...s, color: { ...white } }));
    applyPattern({ id: bgLayer ? activePattern.id : "solid", base: chosen });
  }

  /** Scale an uploaded image up until it covers the whole garment (sublimation). */
  function coverWithSelected() {
    if (!selected || selected.kind !== "image") return;
    replaceLayer(
      clampLayer({
        ...selected,
        cx: 0.5,
        cy: 0.5,
        rotation: 0,
        size: coverSize(selected.naturalW, selected.naturalH),
      }),
    );
  }

  function trySend() {
    const issues = validateForSubmit(state);
    if (issues.length) {
      const map: Record<string, string> = {};
      issues.forEach((i) => (map[i.field] = i.message));
      setErrors(map);
      go(4);
      return;
    }
    setErrors({});
    go(5);
  }

  // Build the reference sheet when entering the send step
  useEffect(() => {
    if (step !== 5) return;
    let on = true;
    setSheetUrl("");
    exportReferenceSheet(state)
      .then((url) => on && setSheetUrl(url))
      .catch(() => on && setSheetUrl(""));
    return () => {
      on = false;
    };
  }, [step, state]);

  /** Share the complete package (reference + untouched originals) through
   *  the device share sheet. The customer confirms in the sheet themselves. */
  async function onShare() {
    try {
      const files: File[] = [];
      if (sheetUrl) files.push(await dataUrlToFile(sheetUrl, `${state.reference}-studio-reference.png`));
      for (const l of imageLayers(state)) {
        files.push(await dataUrlToFile(l.src, `${state.reference}-${l.view}-original-${l.fileName}`));
      }
      const result = await shareFiles(state, files, buildStudioMessage(state));
      setShareState(result);
    } catch {
      /* user cancelled share — fine */
    }
  }

  async function onCopyMessage() {
    if (await copyText(buildStudioMessage(state))) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    }
  }

  const sizesStatus = sizeIssue(state.details);
  const qty = state.details.quantity;
  const qtyNum = parseInt(qty.replace(/[^\d]/g, ""), 10) || 0;
  const assigned = sizeTotal(state.details.sizes);

  /** Distribute the requested quantity evenly across the core sizes. */
  function splitEvenly() {
    if (!qtyNum) return;
    const core: (typeof SIZE_KEYS)[number][] = qtyNum < 4 ? ["M"] : ["S", "M", "L", "XL"];
    const base = Math.floor(qtyNum / core.length);
    const next = emptySizes();
    core.forEach((k, i) => (next[k] = base + (i < qtyNum % core.length ? 1 : 0)));
    setDetails({ sizes: next });
  }

  /** Legibility guard: image tone vs shirt tone (approximate, non-blocking). */
  const selLowContrast =
    selected && selected.kind === "image" && typeof selected.avgLuma === "number" &&
    Math.abs(selected.avgLuma - hexLuma(state.color.hex)) < 0.16;
  /**
   * Difficult regions (collar/pocket/placket…) the selected layer crosses.
   * A full-surface sublimated design covers the whole panel by definition —
   * flagging it for "crossing the collar" would be a false alarm.
   */
  const selCrossings =
    selected && !(selected.kind === "image" && selected.generated) ? difficultCrossings(selected, product) : [];

  function setSelectedSizeIn(inches: number) {
    if (!selected) return;
    if (selected.kind === "image") {
      replaceLayer(clampLayer({ ...selected, size: (inches * ppi) / STAGE_W }));
      return;
    }
    // The slider shows the height of the whole text BLOCK; `size` is one line's
    // font size, so divide back out the line count and line spacing.
    const scale = Math.max(0.1, textBlockScale(selected));
    replaceLayer(clampLayer({ ...selected, size: (inches * ppi) / (STAGE_H * scale) }));
  }

  const layerIcon = (l: Layer) =>
    l.kind === "image" ? <ImageIcon size={15} aria-hidden="true" /> : l.role === "number" ? <Hash size={15} aria-hidden="true" /> : l.role === "name" ? <User size={15} aria-hidden="true" /> : <TypeIcon size={15} aria-hidden="true" />;

  // ---- shared editor control fragments (rendered once, re-arranged by CSS) ----

  const addControls = (
    <>
      {/* Adding text is as important as adding a logo — same weight, same place. */}
      <div className="field">
        <span className="field__legend mono">Add to the {state.view}</span>
        <div className="addbig">
          <button type="button" className="addbig__btn addbig__btn--text" onClick={() => addText("text")}>
            <TypeIcon size={22} aria-hidden="true" />
            <span className="addbig__label">Add text</span>
            <span className="addbig__hint">Type anything — words, a slogan, a name</span>
          </button>
          <button type="button" className="addbig__btn" onClick={() => fileRef.current?.click()}>
            <ImageIcon size={22} aria-hidden="true" />
            <span className="addbig__label">Add image</span>
            <span className="addbig__hint">A logo or artwork — PNG or JPEG</span>
          </button>
        </div>
        <div className="addtext">
          <button type="button" className="btn btn--outline" onClick={() => addText("name")}>
            <User size={16} aria-hidden="true" /> Player name
          </button>
          <button type="button" className="btn btn--outline" onClick={() => addText("number")}>
            <Hash size={16} aria-hidden="true" /> Player number
          </button>
        </div>
      </div>

      {sublimated && (
        <div className="field">
          <span className="field__legend mono">Full surface — {getProductionMethod(product).label.toLowerCase()}</span>
          <p className="field__note">{getProductionMethod(product).designNote}</p>
          <div className="patterns" role="radiogroup" aria-label="Full-surface design">
            {JERSEY_PATTERNS.map((p) => (
              <label
                key={p.id}
                className={"pattern" + (bgLayer && activePattern.id === p.id ? " is-active" : "")}
                title={p.hint}
              >
                <input
                  type="radio"
                  name="jersey-pattern"
                  checked={!!bgLayer && activePattern.id === p.id}
                  onChange={() => applyPattern({ id: p.id as PatternId })}
                />
                <span className="pattern__name">{p.name}</span>
              </label>
            ))}
          </div>
          <div className="patterncolors">
            <label>
              Base
              <input
                type="color"
                className="colorin"
                value={activePattern.base}
                onChange={(e) => applyPattern({ base: e.target.value })}
              />
            </label>
            <label>
              Secondary
              <input
                type="color"
                className="colorin"
                value={activePattern.secondary}
                onChange={(e) => applyPattern({ secondary: e.target.value })}
              />
            </label>
            <label>
              Accent
              <input
                type="color"
                className="colorin"
                value={activePattern.accent}
                onChange={(e) => applyPattern({ accent: e.target.value })}
              />
            </label>
          </div>
          {bgLayer && (
            <div className="editactions">
              <button type="button" className="btn btn--outline editactions__remove" onClick={() => removeLayer(bgLayer.id)}>
                <Trash2 size={16} aria-hidden="true" /> Remove full surface
              </button>
            </div>
          )}
          <p className="field__note">{PATTERN_NOTE}</p>
        </div>
      )}

      <div className="field">
        <span className="field__legend mono">Upload artwork</span>
        <div
          className="dropzone"
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add("is-over");
          }}
          onDragLeave={(e) => e.currentTarget.classList.remove("is-over")}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("is-over");
            onFile(e.dataTransfer.files);
          }}
        >
          <label htmlFor="art-upload">Upload a logo or design</label>
          <input ref={fileRef} id="art-upload" className="upload" type="file" accept="image/png,image/jpeg" onChange={(e) => onFile(e.target.files)} />
          <p className="field__note">Drag &amp; drop or browse — PNG or JPEG, up to 10 MB. Add as many as you like. Transparent PNGs keep their transparency.</p>
          {uploadError && (
            <p className="field__error" role="alert">
              {uploadError}
            </p>
          )}
        </div>
      </div>

      {(history.current.past.length > 0 || history.current.future.length > 0) && (
        <div className="editactions" aria-label="History">
          <button type="button" className="btn btn--outline" onClick={undo} disabled={!history.current.past.length} aria-label="Undo (Ctrl+Z)">
            <RotateCcw size={15} aria-hidden="true" /> Undo
          </button>
          <button type="button" className="btn btn--outline" onClick={redo} disabled={!history.current.future.length} aria-label="Redo (Ctrl+Shift+Z)">
            Redo
          </button>
        </div>
      )}

      {viewLayers.length === 0 && (
        <ol className="emptysteps" aria-label="How it works">
          <li>Add a logo, or add text</li>
          <li>Drag it anywhere on the garment</li>
          <li>Resize, rotate and align it</li>
          <li>Send it to The Factory for a quote</li>
        </ol>
      )}
    </>
  );

  const layersPanel = (
    <div className="field">
      <span className="field__legend mono">{state.view} — {viewSummary(state, state.view)}</span>
      {viewLayers.length === 0 ? (
        <p className="field__note">Nothing added to the {state.view} yet.</p>
      ) : (
        <ul className="layerlist">
          {[...viewLayers].reverse().map((l) => {
            const idx = state.layers.findIndex((x) => x.id === l.id);
            return (
              <li key={l.id} className={"layeritem" + (l.id === state.selectedId ? " is-sel" : "") + (l.hidden ? " is-hidden" : "") + (l.locked ? " is-locked" : "")}>
                <button type="button" className="layeritem__main" onClick={() => selectLayer(l.id)}>
                  <span className="layeritem__icon">{layerIcon(l)}</span>
                  <span className="layeritem__label">{layerLabel(l)}</span>
                </button>
                <span className="layeritem__ops">
                  <button type="button" aria-label={l.locked ? "Unlock layer" : "Lock layer"} onClick={() => replaceLayer({ ...l, locked: !l.locked })}>
                    {l.locked ? <Lock size={14} aria-hidden="true" /> : <Unlock size={14} aria-hidden="true" />}
                  </button>
                  <button type="button" aria-label={l.hidden ? "Show layer" : "Hide layer"} onClick={() => replaceLayer({ ...l, hidden: !l.hidden })}>
                    {l.hidden ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
                  </button>
                  <button type="button" aria-label="Bring forward" disabled={idx >= state.layers.length - 1} onClick={() => reorderLayer(l.id, 1)}>
                    <ChevronUp size={14} aria-hidden="true" />
                  </button>
                  <button type="button" aria-label="Send backward" disabled={idx <= 0} onClick={() => reorderLayer(l.id, -1)}>
                    <ChevronDown size={14} aria-hidden="true" />
                  </button>
                  <button type="button" aria-label="Delete layer" className="layeritem__del" onClick={() => removeLayer(l.id)}>
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  const editControls = !selected ? (
    <p className="field__note">Select a design or text layer to edit it here — or add one from the “Add” tab.</p>
  ) : (
    <>
      <div className="field">
        <span className="field__legend mono">
          {layerIcon(selected)} Editing: {layerLabel(selected)}
        </span>
        <div className="outlinerow">
          <input
            type="text"
            aria-label="Layer name"
            placeholder="Name this layer (optional) — e.g. Main sponsor"
            value={selected.name ?? ""}
            onChange={(e) => replaceLayer({ ...selected, name: e.target.value.slice(0, 40) })}
          />
          <button
            type="button"
            className={"btn btn--outline" + (selected.locked ? " is-locked" : "")}
            aria-pressed={!!selected.locked}
            title={selected.locked ? "Unlock to move on the garment" : "Lock position on the garment"}
            onClick={() => replaceLayer({ ...selected, locked: !selected.locked })}
          >
            {selected.locked ? <Lock size={16} aria-hidden="true" /> : <Unlock size={16} aria-hidden="true" />}
          </button>
        </div>
        {selected.locked && (
          <p className="field__note">Locked on the garment — you can still fine-tune below, but it won't move when you drag on the preview.</p>
        )}
      </div>

      {/* Never a block. The customer keeps their idea; the team confirms production. */}
      {selCrossings.length > 0 && (
        <p className="quality quality--soft" role="status">
          <strong>Crosses the {selCrossings.join(" and ")}.</strong> {DIFFICULT_AREA_NOTICE}
        </p>
      )}

      {selected.kind === "text" && (
        <>
          <div className="field">
            <label htmlFor="t-text">{selected.role === "number" ? "Number (1–3 digits)" : selected.role === "name" ? "Player / team name" : "Text"}</label>
            {selected.role === "number" ? (
              <input
                id="t-text"
                type="text"
                value={selected.text}
                inputMode="numeric"
                onChange={(e) => patchText(selected.id, { text: e.target.value.replace(/[^\d]/g, "").slice(0, 3) })}
              />
            ) : (
              <textarea
                id="t-text"
                className="textin"
                rows={2}
                value={selected.text}
                onChange={(e) =>
                  patchText(selected.id, {
                    text: e.target.value.split("\n").slice(0, 6).join("\n").slice(0, 120),
                  })
                }
              />
            )}
            <p className="field__note">
              {selected.role === "number"
                ? "1, 2 or 3 digits."
                : `Press Enter for a new line — up to 6 lines (${selected.text.length}/120 characters).`}
            </p>
          </div>
          <div className="field">
            <label htmlFor="t-font">Font <span className="field__opt">(production-ready, licensed)</span></label>
            <select id="t-font" value={selected.fontId} onChange={(e) => patchText(selected.id, { fontId: e.target.value })}>
              {fontsByCategory().map((g) => (
                <optgroup key={g.category} label={g.category}>
                  {g.fonts.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="field-grid2">
            <div className="field">
              <label htmlFor="t-color">Text colour</label>
              <input id="t-color" type="color" className="colorin" value={selected.color} onChange={(e) => patchText(selected.id, { color: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="t-outline">Outline colour</label>
              <div className="outlinerow">
                <input
                  id="t-outline"
                  type="color"
                  className="colorin"
                  value={selected.outline || "#211f1e"}
                  onChange={(e) => patchText(selected.id, { outline: e.target.value, outlineWidth: selected.outlineWidth || 0.08 })}
                />
                <button type="button" className="btn btn--ghost" onClick={() => patchText(selected.id, { outline: selected.outline ? "" : "#211f1e", outlineWidth: selected.outline ? 0 : 0.08 })}>
                  <span className="btn-underline">{selected.outline ? "Remove" : "Add"}</span>
                </button>
              </div>
            </div>
          </div>
          {selected.outline && (
            <div className="field">
              <label htmlFor="t-outw">Outline thickness — {Math.round((selected.outlineWidth || 0) * 100)}%</label>
              <input id="t-outw" type="range" min={0.02} max={0.2} step={0.01} value={selected.outlineWidth || 0.08} onChange={(e) => patchText(selected.id, { outlineWidth: Number(e.target.value) })} />
            </div>
          )}
          <div className="field">
            <label htmlFor="t-ls">Letter spacing — {Math.round((selected.letterSpacing || 0) * 100)}%</label>
            <input id="t-ls" type="range" min={-0.1} max={0.4} step={0.01} value={selected.letterSpacing || 0} onChange={(e) => patchText(selected.id, { letterSpacing: Number(e.target.value) })} />
          </div>
          {selected.text.includes("\n") && (
            <>
              <div className="field">
                <label htmlFor="t-lh">Line spacing — {(selected.lineHeight || 1).toFixed(2)}×</label>
                <input
                  id="t-lh"
                  type="range"
                  min={0.8}
                  max={2}
                  step={0.05}
                  value={selected.lineHeight || 1.1}
                  onChange={(e) => patchText(selected.id, { lineHeight: Number(e.target.value) })}
                />
              </div>
              <div className="field">
                <span className="field__legend mono">Align lines</span>
                <div className="segmented" role="radiogroup" aria-label="Text alignment">
                  {(["left", "center", "right"] as const).map((a) => (
                    <label key={a} className={"segmented__opt" + (selected.align === a ? " is-active" : "")}>
                      <input
                        type="radio"
                        name="t-align"
                        checked={selected.align === a}
                        onChange={() => patchText(selected.id, { align: a })}
                      />
                      {a === "left" ? "Left" : a === "center" ? "Centre" : "Right"}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}

      <div className="field">
        <span className="field__legend mono">Jump to a spot <span className="field__opt">(optional)</span></span>
        <div className="presetrow">
          {placementsForLayer(product, state.view).map((p) => (
            <button key={p.id} type="button" className="preset" onClick={() => replaceLayer(applyPlacement(selected, p, product))}>
              {p.name}
            </button>
          ))}
          {sublimated && selected.kind === "image" && (
            <button type="button" className="preset preset--wide" onClick={coverWithSelected}>
              Cover whole garment
            </button>
          )}
        </div>
        <p className="field__note">
          These are shortcuts, not rules — drag your design wherever you want it. {GUIDES_NOTICE}
        </p>
      </div>

      <div className="field">
        <label htmlFor="l-size">
          {selected.kind === "image" ? (
            <>
              Printed width — {layerWidthIn(selected, product)}″
              <span className="field__opt">
                {selected.generated ? " (vector — scales cleanly)" : ` (~${estimatedDpi(selected, product)} DPI)`}
              </span>
            </>
          ) : (
            <>Text height — {layerHeightIn(selected, product)}″</>
          )}
        </label>
        {/* The range spans the whole garment — a design is never capped to a guide. */}
        <input
          id="l-size"
          type="range"
          min={selected.kind === "image" ? 1 : 0.5}
          max={selected.kind === "image" ? round2(STAGE_W / ppi) : round2((STAGE_H * 0.6) / ppi)}
          step={0.25}
          value={selected.kind === "image" ? layerWidthIn(selected, product) : layerHeightIn(selected, product)}
          onChange={(e) => setSelectedSizeIn(Number(e.target.value))}
        />
        {selected.kind === "image" && !selected.generated && (
          <p className={"quality quality--" + qualityLevel(selected, product)} role="status">
            {QUALITY_COPY[qualityLevel(selected, product)]} <em>Approximate guide, not a final decision.</em>
          </p>
        )}
        {selLowContrast && (
          <p className="quality quality--soft" role="status">
            Low contrast: this design may blend into the {state.color.name.toLowerCase()} fabric.{" "}
            <em>We never change your colours — the team confirms legibility before printing.</em>
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="l-rot">Rotation — {Math.round(selected.rotation > 180 ? selected.rotation - 360 : selected.rotation)}°</label>
        <input
          id="l-rot"
          type="range"
          min={-180}
          max={180}
          step={1}
          value={selected.rotation > 180 ? selected.rotation - 360 : selected.rotation}
          onChange={(e) => replaceLayer(clampLayer({ ...selected, rotation: Number(e.target.value) }))}
        />
      </div>

      <div className="field">
        <span className="field__legend mono">Precise position (numeric)</span>
        <div className="numgrid">
          <label>
            X %
            <input
              type="number"
              min={0}
              max={100}
              inputMode="numeric"
              value={Math.round(selected.cx * 100)}
              onChange={(e) => replaceLayer(clampLayer({ ...selected, cx: Number(e.target.value) / 100 }))}
            />
          </label>
          <label>
            Y %
            <input
              type="number"
              min={0}
              max={100}
              inputMode="numeric"
              value={Math.round(selected.cy * 100)}
              onChange={(e) => replaceLayer(clampLayer({ ...selected, cy: Number(e.target.value) / 100 }))}
            />
          </label>
          <label>
            Angle °
            <input
              type="number"
              min={-180}
              max={180}
              inputMode="numeric"
              value={Math.round(selected.rotation > 180 ? selected.rotation - 360 : selected.rotation)}
              onChange={(e) => replaceLayer(clampLayer({ ...selected, rotation: Number(e.target.value) }))}
            />
          </label>
        </div>
      </div>

      <div className="editactions">
        <button type="button" className="btn btn--outline" onClick={() => replaceLayer(straightenLayer(selected))}>
          <MoveDiagonal size={15} aria-hidden="true" /> Straighten
        </button>
        <button
          type="button"
          className="btn btn--outline"
          title="Optional: centre this inside the nearest alignment guide"
          onClick={() => replaceLayer(fitLayerToArea(selected, product))}
        >
          Fit to guide
        </button>
        <button type="button" className="btn btn--outline" onClick={() => duplicateLayer(selected.id)}>
          <Copy size={15} aria-hidden="true" /> Duplicate
        </button>
        <button type="button" className="btn btn--outline editactions__remove" onClick={() => removeLayer(selected.id)}>
          <Trash2 size={16} aria-hidden="true" /> Remove
        </button>
      </div>
      <p className="field__note">
        Tip: drag to move · pinch or use the corner handle to resize · arrows, + − and [ ] work too. Snapping is only
        an aid — switch <strong>Snap</strong> off (or hold Alt) to place a design completely freely.
      </p>
    </>
  );

  /**
   * What the production method can and cannot physically do. Shown wherever the
   * customer picks a colour or a fabric. Never a block — always a route forward.
   */
  const methodAdvice = (
    <>
      {darkBlank && (
        <div className="advice" role="status">
          <Info size={16} aria-hidden="true" />
          <div className="advice__body">
            <p>
              <strong>A sublimated jersey cannot start from a {state.color.name.toLowerCase()} blank.</strong>{" "}
              {SUBLIMATION_BLANK_NOTE}
            </p>
            <p>{SUBLIMATION_DARK_COLOUR_HELP}</p>
            <button type="button" className="btn btn--primary" onClick={moveColourIntoPrint}>
              Keep the blank white, print it {state.color.name.toLowerCase()}
            </button>
          </div>
        </div>
      )}
      {fabricIssue && (
        <div className="advice" role="status">
          <Info size={16} aria-hidden="true" />
          <div className="advice__body">
            <p>{fabricIssue}</p>
            <p className="field__note">{SUBLIMATION_FABRIC_NOTE}</p>
          </div>
        </div>
      )}
      {strandedFullSurface && (
        <div className="advice" role="status">
          <Info size={16} aria-hidden="true" />
          <div className="advice__body">
            <p>
              <strong>Your full-surface design is still here, on a garment that isn't sublimated.</strong> A full
              surface is printed into the fabric before a jersey is sewn. The {product.name.toLowerCase()} is{" "}
              {getProductionMethod(product).label.toLowerCase()}, so The Factory Nigeria will confirm how much of it can
              be reproduced that way — nothing has been deleted.
            </p>
          </div>
        </div>
      )}
    </>
  );

  const styleControls = (
    <>
      <div className="field">
        <span className="field__legend mono">Garment</span>
        <div className="minigarments" role="radiogroup" aria-label="Switch garment">
          {PRODUCTS.map((p) => (
            <label key={p.id} className={"minigarment" + (state.productId === p.id ? " is-active" : "")} title={p.name}>
              <input
                type="radio"
                name="ed-product"
                checked={state.productId === p.id}
                onChange={() => setProductId(p.id)}
              />
              <img src={p.thumb} alt="" loading="lazy" />
              <span className="minigarment__name">{p.name}</span>
            </label>
          ))}
        </div>
        <p className="field__note">
          {getProductionMethod(product).label} — {getProductionMethod(product).designNote} Switching garment keeps
          everything you have designed.
        </p>
      </div>
      <div className="field">
        <span className="field__legend mono">Colour — {state.color.name}</span>
        <div className="minidots" role="radiogroup" aria-label="Switch colour">
          {STANDARD_COLORS.map((c) => (
            <label key={c.id} className={"minidot" + (state.color.id === c.id ? " is-active" : "")} title={c.name}>
              <input type="radio" name="ed-color" checked={state.color.id === c.id} onChange={() => set({ color: { ...c } })} />
              <span style={{ background: c.hex }} aria-hidden="true" />
              <span className="sr-only">{c.name}</span>
            </label>
          ))}
        </div>
        {state.color.status === "confirm" && (
          <p className="field__note">{state.color.name} — availability to confirm (custom colour kept).</p>
        )}
        {methodAdvice}
      </div>
      <div className="field">
        <span className="field__legend mono">Fabric — {fabric ? fabric.name : "team advises"}</span>
        <div className="minifabrics" role="radiogroup" aria-label="Switch fabric">
          <label className={"minifabric" + (!state.details.fabricId ? " is-active" : "")}>
            <input type="radio" name="ed-fabric" checked={!state.details.fabricId} onChange={() => setDetails({ fabricId: "" })} />
            <span className="minifabric__advise mono">Team advises</span>
          </label>
          {FABRICS.map((f) => (
            <label key={f.id} className={"minifabric" + (state.details.fabricId === f.id ? " is-active" : "")} title={f.name}>
              <input type="radio" name="ed-fabric" checked={state.details.fabricId === f.id} onChange={() => setDetails({ fabricId: f.id })} />
              <img src={f.img} alt="" loading="lazy" />
              <span className="minifabric__name">{f.name}</span>
            </label>
          ))}
        </div>
        <p className="field__note">Fabric choice never changes the preview — the render shows shape and colour only.</p>
      </div>
    </>
  );

  const liveSummary = (
    <aside className="ed__summary" aria-label="Request so far">
      <span className="field__legend mono">Your request so far</span>
      <ul>
        <li>
          <strong>{product.name}</strong> — <AvailabilityBadge status={product.availability} />
        </li>
        <li>Production method: {getProductionMethod(product).label}</li>
        {product.tshirtOptionLabel && <li>T-shirt option: {product.tshirtOptionLabel}</li>}
        <li>
          {state.color.name} · <AvailabilityBadge status={colorAvailability(state.color.status)} />
        </li>
        <li>
          {fabric ? (
            <>
              {fabric.name} · <AvailabilityBadge status={fabric.availability} />
            </>
          ) : (
            "Fabric: no preference — the team advises"
          )}
        </li>
        {bgLayer?.pattern && <li>Full surface ({state.view}): {patternSummary(bgLayer.pattern)}</li>}
        <li>Front — {viewSummary(state, "front")}</li>
        <li>Back — {viewSummary(state, "back")}</li>
      </ul>
      <p className="ed__summarynote">{MARKET_SOURCING_NOTICE}</p>
    </aside>
  );

  // ------------------------------------------------------------------
  return (
    <div className="studio" ref={topRef}>
      <div className="studio__proto" role="note">
        <Info size={14} aria-hidden="true" />
        Studio preview — nothing is sent automatically. Pricing and market availability are confirmed
        by The Factory team before production.
      </div>

      <header className="studio__head container">
        <span className="eyebrow">Studio</span>
        <h1 className="h2">Design your garment</h1>
        <p className="studio__stepmeta mono" aria-live="polite">
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </p>
        <div className="studio__progress" role="group" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
          {STEPS.map((s, i) => (
            <button
              key={s}
              type="button"
              className={"studio__step" + (i === step ? " is-active" : "") + (i < step ? " is-done" : "")}
              onClick={() => i < step && go(i)}
              disabled={i > step}
            >
              <span className="studio__stepn mono">{i + 1}</span>
              <span className="studio__stepl">{s}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="container studio__body">
        {/* On-device resume offer (this browser only; nothing uploaded) */}
        {resumeSave && !submitted && (
          <div className="resumebar" role="status">
            <span className="resumebar__text">
              <RotateCcw size={16} aria-hidden="true" />
              You have a saved design on this device from {savedAgo(resumeSave.savedAt)}. Resume it?
            </span>
            <span className="resumebar__actions">
              <button type="button" className="btn btn--primary" onClick={resumeSavedDesign}>
                Resume design
              </button>
              <button type="button" className="btn btn--ghost" onClick={dismissResume}>
                <span className="btn-underline">Start fresh</span>
              </button>
            </span>
          </div>
        )}

        {/* STEP 1 — PRODUCT */}
        {step === 0 && (
          <section className="studio__panel" aria-label="Choose a product">
            {/* The Factory makes T-shirts two genuinely different ways. The
                customer chooses — the two are never merged into one option. */}
            <div className="prodnote" role="note">
              <Info size={16} aria-hidden="true" />
              <span>
                <strong>Two kinds of T-shirt.</strong> A <strong>custom-made</strong> T-shirt is sewn specifically for
                you (usually with The Factory's towel-back fabric option). A <strong>ready-made</strong> T-shirt is a
                100% cotton shirt that is bought and then printed. Pick the one you want — the team confirms fabric,
                pricing and timing either way.
              </span>
            </div>
            <div className="prodgrid">
              {PRODUCTS.map((p, i) => {
                const prod = getProductionMethod(p);
                return (
                  <label key={p.id} className={"prodcard" + (state.productId === p.id ? " is-active" : "")}>
                    <input
                      type="radio"
                      name="product"
                      checked={state.productId === p.id}
                      onChange={() => setProductId(p.id)}
                    />
                    <img
                      className="prodcard__thumb"
                      src={p.thumb}
                      alt={`${p.name} — real garment render`}
                      loading={i < 4 ? "eager" : "lazy"}
                      decoding="async"
                    />
                    <span className="prodcard__name">{p.name}</span>
                    <span className="prodcard__fit mono">{p.fit}</span>
                    <span className="prodcard__prod mono">{prod.badge}</span>
                    <span className="prodcard__desc">{p.description}</span>
                    <span className="prodcard__meta">
                      <span className="prodcard__metaline"><strong>How it's made:</strong> {prod.summary}</span>
                      <span className="prodcard__metaline"><strong>Typical use:</strong> {p.use}</span>
                      <span className="prodcard__metaline"><strong>Material reference:</strong> {p.material}</span>
                    </span>
                    <AvailabilityBadge status={p.availability} />
                  </label>
                );
              })}
            </div>
            <p className="enquiry__hint">
              <Info size={15} aria-hidden="true" />
              {MARKET_SOURCING_NOTICE}
            </p>
            <p className="enquiry__hint">
              <Info size={15} aria-hidden="true" />
              {TOWEL_BACK_NOTE} {SUBLIMATION_NOTE}
            </p>
            <p className="field__note studio__loaddesign">
              Continuing an earlier design?{" "}
              <button type="button" className="btn btn--ghost" onClick={() => designFileRef.current?.click()}>
                <Upload size={14} aria-hidden="true" /> <span className="btn-underline">Load a saved design file</span>
              </button>
              <input
                ref={designFileRef}
                type="file"
                accept="application/json,.json"
                className="sr-only"
                onChange={(e) => loadDesignFile(e.target.files)}
              />
            </p>
          </section>
        )}

        {/* STEP 2 — COLOUR & FABRIC */}
        {step === 1 && (
          <section className="studio__panel studio__panel--split" aria-label="Choose colour and fabric">
            <div>
              <fieldset className="field">
                <legend>Standard colours</legend>
                <div className="swatches" role="radiogroup" aria-label="Standard garment colours">
                  {STANDARD_COLORS.map((c) => (
                    <label
                      key={c.id}
                      className={"swatch" + (state.color.id === c.id ? " is-active" : "")}
                      title={c.name}
                    >
                      <input
                        type="radio"
                        name="color"
                        checked={state.color.id === c.id}
                        onChange={() => set({ color: { ...c } })}
                      />
                      <span className="swatch__chip" style={{ background: c.hex }} aria-hidden="true" />
                      <span className="swatch__name">{c.name}</span>
                    </label>
                  ))}
                </div>
                <p className="field__note">
                  Standard colours are <strong>commonly available</strong> — final shade always depends on the
                  fabric sourced for your order.
                </p>
              </fieldset>

              <fieldset className="field" style={{ marginTop: 18 }}>
                <legend>
                  Custom / rare colour <span className="field__opt">(availability confirmed by the team)</span>
                </legend>
                <div className="customcolor">
                  <input
                    type="color"
                    value={customHex}
                    onChange={(e) => setCustomHex(e.target.value)}
                    aria-label="Pick an approximate custom colour"
                  />
                  <input
                    type="text"
                    placeholder="Name it (e.g. mint, burnt orange)"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    aria-label="Custom colour name"
                  />
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={() =>
                      set({
                        color: {
                          id: "custom",
                          name: customName.trim() || "Custom colour",
                          hex: customHex,
                          status: "confirm",
                          custom: true,
                        },
                      })
                    }
                  >
                    Use this colour
                  </button>
                </div>
                {state.color.status === "confirm" && (
                  <p className="studio__confirmnote" role="status">
                    <Info size={15} aria-hidden="true" />
                    {CUSTOM_COLOR_NOTICE}
                  </p>
                )}
              </fieldset>

              <fieldset className="field" style={{ marginTop: 26 }}>
                <legend>Fabric &amp; textile</legend>
                <p className="field__note" style={{ marginBottom: 10 }}>
                  {FABRIC_VISUAL_NOTICE} Your choice is a preference — it does not change the on-screen
                  preview.
                </p>
                <div className="fabgrid" role="radiogroup" aria-label="Fabric options">
                  <label className={"fabcard fabcard--advise" + (!state.details.fabricId ? " is-active" : "")}>
                    <input
                      type="radio"
                      name="fabric"
                      checked={!state.details.fabricId}
                      onChange={() => setDetails({ fabricId: "" })}
                    />
                    <span className="fabcard__name">No preference</span>
                    <span className="fabcard__desc">
                      Let The Factory team recommend the best fabric for your design, quantity and budget.
                    </span>
                    <span className="avail avail--common">Team recommendation</span>
                  </label>
                  {FABRICS.map((f) => (
                    <label key={f.id} className={"fabcard" + (state.details.fabricId === f.id ? " is-active" : "")}>
                      <input
                        type="radio"
                        name="fabric"
                        checked={state.details.fabricId === f.id}
                        onChange={() => setDetails({ fabricId: f.id })}
                      />
                      <img className="fabcard__img" src={f.img} alt={`${f.name} close-up reference`} loading="lazy" />
                      <span className="fabcard__name">
                        {f.name} <span className="fabcard__weight mono">{f.weight}</span>
                      </span>
                      <span className="fabcard__desc">{f.description}</span>
                      <span className="fabcard__use">Typical: {f.use}</span>
                      {f.refNote && <span className="fabcard__refnote">{f.refNote}</span>}
                      <AvailabilityBadge status={f.availability} />
                    </label>
                  ))}
                </div>

                {methodAdvice}

                <details className="fabhelp">
                  <summary>
                    <HelpCircle size={15} aria-hidden="true" /> Help me choose a fabric
                  </summary>
                  <div className="fabhelp__body">
                    <p>
                      <strong>Lightweight vs heavyweight:</strong> lightweight fabric is thinner, cooler and
                      cheaper — great for hot weather and giveaways. Heavyweight fabric is thicker, warmer and
                      feels more premium — it drapes with structure and lasts longer.
                    </p>
                    <p>
                      <strong>Cotton vs polyester:</strong> cotton feels soft and natural and breathes well.
                      Polyester is lighter, dries quickly and holds its shape — best for sports. Blends sit in
                      the middle: cotton comfort with less creasing and shrinking.
                    </p>
                    <p>
                      <strong>Smooth vs textured:</strong> smooth jersey (t-shirts) prints crisply. Piqué
                      (polos) has a fine waffle texture that reads smart. Fleece and terry are thicker with a
                      soft surface — bold prints and embroidery work best there.
                    </p>
                    <p>
                      Not sure? Pick <strong>No preference</strong> — the team matches a fabric to your design,
                      quantity and budget, and confirms it with you before anything is made.
                    </p>
                  </div>
                </details>
                <p className="enquiry__hint" style={{ marginTop: 12 }}>
                  <Info size={15} aria-hidden="true" />
                  {MARKET_SOURCING_NOTICE}
                </p>
              </fieldset>
            </div>

            <div className="studio__side">
              <TeeStage
                productId={product.id}
                view={state.view}
                colorHex={state.color.hex}
                layers={viewLayers}
                selectedId={null}
                onSelect={() => {}}
                onChange={() => {}}
                compact
              />
              <p className="studio__colorstate mono">
                {state.color.name} · {AVAILABILITY_LABEL[colorAvailability(state.color.status)].toLowerCase()}
                {fabric ? ` · ${fabric.name}` : ""}
              </p>
            </div>
          </section>
        )}

        {/* STEP 3 — DESIGN (three-zone workspace on desktop, tabbed sheet on mobile) */}
        {step === 2 && (
          <section className="studio__panel ed" aria-label="Add and position your design">
            <div className="ed__stagecol">
              <div className="viewtabs" role="tablist" aria-label="Garment view">
                {(["front", "back"] as ViewId[]).map((v) => (
                  <button
                    key={v}
                    role="tab"
                    aria-selected={state.view === v}
                    className={"viewtab" + (state.view === v ? " is-active" : "")}
                    onClick={() => setView(v)}
                  >
                    {v === "front" ? "Front" : "Back"}
                    {layersForView(state, v).length ? <Check size={13} aria-hidden="true" /> : null}
                  </button>
                ))}
              </div>
              <TeeStage
                productId={product.id}
                view={state.view}
                colorHex={state.color.hex}
                layers={viewLayers}
                selectedId={state.selectedId}
                onSelect={selectLayer}
                onChange={replaceLayer}
              />
            </div>

            {/* Mobile bottom-sheet tabs (hidden ≥861px) */}
            <div className="ed__sheettabs" role="tablist" aria-label="Editor controls">
              {(
                [
                  ["artwork", "Add"],
                  ["adjust", "Edit"],
                  ["style", "Garment"],
                ] as const
              ).map(([id, name]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={mtab === id}
                  className={"ed__sheettab" + (mtab === id ? " is-active" : "")}
                  onClick={() => setMtab(id)}
                >
                  {name}
                </button>
              ))}
            </div>

            <div className={"ed__rail ed__rail--style" + (mtab === "style" ? " is-mtab" : "")}>
              {styleControls}
            </div>
            <div className={"ed__rail ed__rail--work" + (mtab === "artwork" ? " is-mtab" : "")}>
              {addControls}
              {layersPanel}
            </div>
            <div className={"ed__rail ed__rail--adjust" + (mtab === "adjust" ? " is-mtab" : "")}>
              {editControls}
              {liveSummary}
            </div>
          </section>
        )}

        {/* STEP 4 — REVIEW DESIGN */}
        {step === 3 && (
          <section className="studio__panel" aria-label="Review your design">
            <div className="tprev__row">
              <TeePreview state={state} view="front" />
              <TeePreview state={state} view="back" />
            </div>
            <p className="enquiry__hint">
              <Info size={15} aria-hidden="true" />
              Please review your design carefully. The preview will be used by The Factory Nigeria as a
              production reference, although final fabric colour, placement, print method and sizing will be
              confirmed before production.
            </p>
            <dl className="review__list studio__reviewlist">
              {summaryRows(state)
                .filter((r) => r.step !== 4)
                .map((r) => (
                  <div className="review__row" key={r.label}>
                    <dt>{r.label}</dt>
                    <dd>{r.value}</dd>
                    {typeof r.step === "number" && (
                      <button type="button" className="review__edit" onClick={() => go(r.step ?? 0)}>
                        <Pencil size={13} aria-hidden="true" /> Edit
                      </button>
                    )}
                  </div>
                ))}
            </dl>
            <p className="enquiry__hint">
              <Info size={15} aria-hidden="true" />
              {MARKET_SOURCING_NOTICE}
            </p>
            {errors.artwork && (
              <p className="field__error" role="alert">
                {errors.artwork}
              </p>
            )}
          </section>
        )}

        {/* STEP 5 — ORDER DETAILS */}
        {step === 4 && (
          <section className="studio__panel studio__panel--form" aria-label="Order details">
            {Object.keys(errors).length > 0 && (
              <div className="errorbox" role="alert">
                <strong>Before we continue:</strong>
                <ul>
                  {Object.values(errors).map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="field">
              <label htmlFor="o-qty">How many items do you need?</label>
              <input
                id="o-qty"
                inputMode="numeric"
                type="text"
                value={qty}
                onChange={(e) => setDetails({ quantity: e.target.value })}
                placeholder="e.g. 1"
                aria-describedby="o-qty-note"
              />
              <p className="field__note" id="o-qty-note">
                {minimum.note} The team confirms the price for your quantity.
              </p>
            </div>

            <fieldset className="field">
              <legend>Size breakdown</legend>
              <div className="sizes" role="group" aria-label="Quantity per size">
                {SIZE_KEYS.map((k) => (
                  <div className="sizes__cell" key={k}>
                    <span className="sizes__key mono">{k}</span>
                    <div className="sizes__stepper">
                      <button
                        type="button"
                        aria-label={`Fewer ${k}`}
                        onClick={() =>
                          setDetails({ sizes: { ...state.details.sizes, [k]: Math.max(0, state.details.sizes[k] - 1) } })
                        }
                      >
                        <Minus size={14} aria-hidden="true" />
                      </button>
                      <input
                        inputMode="numeric"
                        aria-label={`${k} quantity`}
                        value={state.details.sizes[k]}
                        onChange={(e) => {
                          const n = Math.max(0, parseInt(e.target.value.replace(/[^\d]/g, ""), 10) || 0);
                          setDetails({ sizes: { ...state.details.sizes, [k]: n } });
                        }}
                      />
                      <button
                        type="button"
                        aria-label={`More ${k}`}
                        onClick={() =>
                          setDetails({ sizes: { ...state.details.sizes, [k]: state.details.sizes[k] + 1 } })
                        }
                      >
                        <Plus size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="sizes__cell sizes__cell--total">
                  <span className="sizes__key mono">Total</span>
                  <strong className="sizes__total">{sizeTotal(state.details.sizes)}</strong>
                </div>
              </div>
              <p
                className={qtyNum && qtyNum === assigned ? "field__ok" : "field__note"}
                role="status"
              >
                {qtyNum && qtyNum === assigned
                  ? qtyNum === 1
                    ? `1 item assigned${(() => {
                        const k = SIZE_KEYS.find((s) => state.details.sizes[s] === 1);
                        return k ? ` to size ${k}` : "";
                      })()}.`
                    : `All ${qtyNum} items have been assigned.`
                  : qtyNum > assigned && assigned > 0
                    ? `${assigned} of ${qtyNum} items assigned. Choose sizes for the remaining ${qtyNum - assigned}.`
                    : `${assigned} of ${qtyNum || "—"} assigned`}
              </p>
              {sizesStatus && (
                <p className={sizesStatus.level === "error" ? "field__error" : "field__note"} role="status">
                  {sizesStatus.message}
                </p>
              )}
              <div className="field" style={{ marginTop: 10 }}>
                <label htmlFor="o-other">
                  Other / custom sizes <span className="field__opt">(optional — confirmed manually)</span>
                </label>
                <input
                  id="o-other"
                  type="text"
                  value={state.details.otherSizes}
                  onChange={(e) => setDetails({ otherSizes: e.target.value })}
                  placeholder="e.g. 3XL — 4, kids 10yrs — 6"
                />
              </div>
              <div className="sizes__actions">
                <button type="button" className="btn btn--outline" onClick={splitEvenly} disabled={!qtyNum}>
                  Split evenly
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => setDetails({ sizes: emptySizes() })}>
                  <span className="btn-underline">Clear sizes</span>
                </button>
              </div>
            </fieldset>

            <fieldset className="field">
              <legend>Same design on every item?</legend>
              <div className="choices">
                {(["yes", "no"] as const).map((v) => (
                  <label key={v} className={"choice" + (state.details.sameDesign === v ? " is-active" : "")}>
                    <input
                      type="radio"
                      name="same"
                      checked={state.details.sameDesign === v}
                      onChange={() => setDetails({ sameDesign: v })}
                    />
                    <span className="choice__label">{v === "yes" ? "Yes — identical" : "No — variations (explain in notes)"}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Listing four techniques implies The Factory owns four machines.
                Nobody has confirmed that, so the copy must not imply it either —
                see the `decoration-methods` question in factoryFacts.ts. */}
            <fieldset className="field">
              <legend>
                Printing method preference <span className="field__opt">(optional)</span>
              </legend>
              <div className="choices">
                {METHODS.map((m) => (
                  <label key={m} className={"choice" + (state.details.method === m ? " is-active" : "")}>
                    <input
                      type="radio"
                      name="method"
                      checked={state.details.method === m}
                      onChange={() => setDetails({ method: m })}
                    />
                    <span className="choice__label">{m}</span>
                  </label>
                ))}
              </div>
              <p className="field__note">
                This is a preference, not a booking. The Factory Nigeria confirms which method they can use for your
                garment, your fabric and your artwork — and will suggest a better one if there is one. If you're not
                sure, leave it to the team.
              </p>
            </fieldset>

            <div className="field">
              <span className="field__legend mono">Fabric</span>
              <p className="field__note">
                {fabric
                  ? `${fabric.name} (${fabric.weight.toLowerCase()} weight) — ${AVAILABILITY_LABEL[fabric.availability].toLowerCase()}. `
                  : "No preference — the team will recommend a fabric. "}
                Change it in the Colour &amp; fabric step, or add specifics in the notes below.
              </p>
            </div>

            <div className="field-grid2">
              <div className="field">
                <label htmlFor="o-deadline">
                  When do you need it? <span className="field__opt">(optional)</span>
                </label>
                <input
                  id="o-deadline"
                  type="text"
                  value={state.details.deadline}
                  onChange={(e) => setDetails({ deadline: e.target.value })}
                  placeholder="e.g. 15 August"
                />
              </div>
              <div className="field">
                <label htmlFor="o-delivery">
                  Delivery location <span className="field__opt">(optional)</span>
                </label>
                <input
                  id="o-delivery"
                  type="text"
                  value={state.details.deliveryLocation}
                  onChange={(e) => setDetails({ deliveryLocation: e.target.value })}
                  placeholder="e.g. Lekki, Lagos — or pickup"
                />
              </div>
              <div className="field">
                <label htmlFor="o-name">Your name</label>
                <input
                  id="o-name"
                  type="text"
                  autoComplete="name"
                  value={state.details.name}
                  onChange={(e) => setDetails({ name: e.target.value })}
                />
                {errors.name && (
                  <p className="field__error" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="field">
                <label htmlFor="o-phone">Phone / WhatsApp</label>
                <input
                  id="o-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={state.details.phone}
                  onChange={(e) => setDetails({ phone: e.target.value })}
                  placeholder="+234…"
                />
                {errors.phone && (
                  <p className="field__error" role="alert">
                    {errors.phone}
                  </p>
                )}
              </div>
              <div className="field">
                <label htmlFor="o-email">
                  Email <span className="field__opt">(optional)</span>
                </label>
                <input
                  id="o-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={state.details.email}
                  onChange={(e) => setDetails({ email: e.target.value })}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="o-notes">
                Additional instructions <span className="field__opt">(optional)</span>
              </label>
              <textarea
                id="o-notes"
                rows={3}
                value={state.details.notes}
                onChange={(e) => setDetails({ notes: e.target.value })}
                placeholder="Anything the team should know — including specific fabric or brand preferences"
              />
            </div>
          </section>
        )}

        {/* STEP 6 — CONFIRM & SEND */}
        {step === 5 && !submitted && (
          <section className="studio__panel" aria-label="Confirm and send">
            <h2 className="h3">This is exactly what will be shared</h2>
            <div className="sendgrid">
              <div>
                <span className="field__legend mono">Reference sheet (generated)</span>
                {sheetUrl ? (
                  <img className="sendgrid__sheet" src={sheetUrl} alt="Generated production reference sheet" />
                ) : (
                  <p className="field__note">Preparing reference sheet…</p>
                )}
                <span className="field__legend mono" style={{ marginTop: 14 }}>
                  What you'll share
                </span>
                <ul className="package">
                  <li>
                    <Paperclip size={14} aria-hidden="true" /> Production reference sheet (PNG)
                  </li>
                  <li>
                    <Paperclip size={14} aria-hidden="true" /> Mockup preview (PNG)
                  </li>
                  <li>
                    <Paperclip size={14} aria-hidden="true" /> Design brief (JSON — every layer, placement &amp; rotation)
                  </li>
                  {imageLayers(state).map((l) => (
                    <li key={l.id}>
                      <Paperclip size={14} aria-hidden="true" /> Original {l.view} artwork — {l.fileName} (untouched)
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="field__legend mono">WhatsApp message</span>
                <pre className="msgpreview">{buildStudioMessage(state)}</pre>
              </div>
            </div>
            <p className="enquiry__hint enquiry__hint--fabric">
              <Info size={15} aria-hidden="true" />
              A quick note before you send: some fabrics and colours may not be available in the
              market at the time of your request. The Factory team confirms availability with you
              in the WhatsApp chat after you send your design — and if your exact choice can't be
              sourced, they'll suggest the closest available alternative before anything is made.
            </p>
            <p className="enquiry__hint">
              <Info size={15} aria-hidden="true" />
              Privacy note: nothing is uploaded or sent automatically. Preparing your design only
              creates the files on your device — you choose what to share on WhatsApp.
            </p>
            <button
              type="button"
              className="btn btn--primary btn--lg"
              onClick={() => {
                setSubmitted(new Date().toISOString());
                void clearDesignLocal();
              }}
            >
              Prepare my design to send <ArrowRight size={17} aria-hidden="true" />
            </button>
          </section>
        )}

        {/* CONFIRMATION — share-first */}
        {step === 5 && submitted && (
          <section className="studio__panel studio__done" aria-label="Enquiry ready">
            <span className="chip chip--ready">
              <span className="chip__dot" aria-hidden="true" />
              Design ready to send — {state.reference}
            </span>
            <h2 className="h3">Your design is ready to share</h2>
            <p className="lede">
              Your Studio reference contains the front and back design, colour, quantity, sizes and
              production information. Nothing is sent until you confirm it yourself.
            </p>
            <div className="tprev__row">
              <TeePreview state={state} view="front" />
              <TeePreview state={state} view="back" />
            </div>
            <p className="mono studio__meta">
              Prepared {new Date(submitted).toLocaleDateString()} · Quantity {qty || "—"} · Sizes{" "}
              {sizeTotal(state.details.sizes) || "—"}
            </p>

            {canShare ? (
              <div className="sendrow">
                <button type="button" className="btn btn--wa btn--lg" onClick={onShare}>
                  <Share2 size={17} aria-hidden="true" /> Share Design to WhatsApp
                </button>
              </div>
            ) : (
              <div className="sharefallback">
                <span className="field__legend mono">How to send your design</span>
                <ol>
                  <li>Download the complete reference file below.</li>
                  <li>Copy the enquiry message.</li>
                  <li>Open The Factory's WhatsApp chat.</li>
                  <li>
                    Paste the message and <strong>attach the downloaded reference file</strong> in the chat.
                  </li>
                </ol>
              </div>
            )}
            {shareState === "shared" && (
              <p className="field__ok" role="status">
                Share sheet opened — choose WhatsApp and confirm to send your design to The Factory.
              </p>
            )}

            <div className="downloadrow">
              <a className="btn btn--outline" href={studioWaLink(state)} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon /> Open WhatsApp
              </a>
              <button type="button" className="btn btn--outline" onClick={onCopyMessage}>
                {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                {copied ? " Copied" : " Copy enquiry message"}
              </button>
              <button type="button" className="btn btn--outline" onClick={() => downloadReferenceSheet(state)}>
                <Download size={16} aria-hidden="true" /> Download complete reference
              </button>
            </div>

            <details className="fabhelp studio__dlmore">
              <summary>
                <Download size={15} aria-hidden="true" /> Download files separately
              </summary>
              <div className="fabhelp__body">
                <div className="downloadrow">
                  <button type="button" className="btn btn--outline" onClick={saveDesignFile}>
                    <Save size={16} aria-hidden="true" /> Editable design (.json)
                  </button>
                  <button type="button" className="btn btn--outline" onClick={() => downloadPreview(state)}>
                    <Download size={16} aria-hidden="true" /> Mockup
                  </button>
                  <button type="button" className="btn btn--outline" onClick={() => downloadSpec(state)}>
                    <Download size={16} aria-hidden="true" /> Design brief (JSON)
                  </button>
                  {imageLayers(state).map((l) => (
                    <button key={l.id} type="button" className="btn btn--outline" onClick={() => downloadOriginalArtwork(state, l)}>
                      <Download size={16} aria-hidden="true" /> {l.view} — {l.fileName}
                    </button>
                  ))}
                </div>
                <p className="field__note">
                  The <strong>editable design (.json)</strong> lets you (or the team) reopen and change this exact
                  design later — load it from the first step. The complete reference already includes the mockups,
                  placement, colour and production details.
                </p>
              </div>
            </details>

            <div className="nextlist">
              <span className="field__legend mono">What happens next</span>
              <ol>
                <li>
                  {canShare
                    ? "You share the reference (and message) to The Factory's WhatsApp and confirm the send."
                    : "You paste the message and attach the downloaded reference in WhatsApp."}
                </li>
                <li>The team reviews your design, colour, fabric and quantities.</li>
                <li>
                  They confirm availability, method, price and timing with you — or suggest the closest
                  available alternative if something can't be sourced.
                </li>
                <li>Production only starts after you approve the final specification.</li>
              </ol>
              <p className="field__note">
                This is an enquiry — not an order. Nothing goes into production until The Factory confirms
                it with you.
              </p>
            </div>

            <div className="sizes__actions">
              <button type="button" className="btn btn--ghost" onClick={() => window.location.reload()}>
                <span className="btn-underline">Start another design</span>
              </button>
              <a className="btn btn--ghost" href="#/">
                <span className="btn-underline">Return to the homepage</span>
              </a>
            </div>
          </section>
        )}

        {/* NAV */}
        {!submitted && (
          <div className="enquiry__nav studio__nav">
            {step > 0 ? (
              <button type="button" className="btn btn--outline" onClick={() => go(step - 1)}>
                <ArrowLeft size={17} aria-hidden="true" /> Back
              </button>
            ) : (
              <span />
            )}
            {step < 3 && (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  if (step === 2 && !hasAnyDesign(state)) {
                    setUploadError("Add at least one design or text (front or back) to continue.");
                    setMtab("artwork");
                    return;
                  }
                  go(step + 1);
                }}
              >
                Continue <ArrowRight size={17} aria-hidden="true" />
              </button>
            )}
            {step === 3 && (
              <button type="button" className="btn btn--primary btn--lg" onClick={() => go(4)}>
                Continue to order details <ArrowRight size={17} aria-hidden="true" />
              </button>
            )}
            {step === 4 && (
              <button type="button" className="btn btn--primary" onClick={trySend}>
                Review &amp; send <ArrowRight size={17} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
        {submitted && (
          <div className="enquiry__nav studio__nav">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setSubmitted(null);
                go(3);
              }}
            >
              <span className="btn-underline">Edit the design</span>
            </button>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => {
                void clearDesignLocal();
                setState(initialState());
                setSubmitted(null);
                setShareState("idle");
                setResumeSave(null);
                go(0);
              }}
            >
              Start a new design
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
