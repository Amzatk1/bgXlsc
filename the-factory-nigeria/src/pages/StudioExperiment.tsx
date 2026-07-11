import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Download,
  FlaskConical,
  HelpCircle,
  Info,
  Minus,
  Paperclip,
  Pencil,
  Plus,
  Share2,
  Trash2,
  Upload,
} from "lucide-react";
import {
  AVAILABILITY_LABEL,
  colorAvailability,
  CUSTOM_COLOR_NOTICE,
  FABRIC_VISUAL_NOTICE,
  FABRICS,
  MARKET_SOURCING_NOTICE,
  PRODUCTS,
  QUALITY_COPY,
  STANDARD_COLORS,
  type AvailabilityStatus,
  type ViewId,
} from "../studio/catalog";
import {
  applyPlacement,
  clampArtwork,
  defaultArtworkPlacement,
  emptySizes,
  estimatedDpi,
  getProduct,
  getZone,
  initialState,
  placementsForView,
  qualityLevel,
  round2,
  SIZE_KEYS,
  sizeIssue,
  sizeTotal,
  validateForSubmit,
  type Artwork,
  type DesignState,
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
  shareFiles,
} from "../studio/exporter";
import { downloadReferenceSheet, exportReferenceSheet } from "../studio/referenceSheet";
import { GARMENT_IMG, hexLuma, layerTuning, STAGE_H, STAGE_W } from "../studio/garment";
import { TeeStage } from "../components/studio/TeeStage";
import { WhatsAppIcon } from "../components/WhatsAppIcon";

const STEPS = ["Product", "Colour & fabric", "Design", "Review", "Order details", "Send"];
const METHODS = ["Screen printing", "Direct-to-garment (DTG)", "Heat transfer", "Embroidery", "Not sure — advise me"];

/** Availability status: always text, never colour alone. */
function AvailabilityBadge({ status }: { status: AvailabilityStatus }) {
  return <span className={"avail avail--" + status}>{AVAILABILITY_LABEL[status]}</span>;
}

// Read-only photoreal mockup used on review/confirm screens (no handles).
function TeePreview({ state, view }: { state: DesignState; view: ViewId }) {
  const product = getProduct(state);
  const zone = product.zones[view];
  const art = state.artworks[view];
  const img = (GARMENT_IMG[product.id] ?? GARMENT_IMG["unisex-tee"])[view];
  const tuning = useMemo(() => layerTuning(state.color.hex, product.id), [state.color.hex, product.id]);
  const box = art
    ? {
        w: (art.widthIn * zone.w) / zone.widthIn,
        x: zone.x + art.cx * zone.w,
        y: zone.y + art.cy * zone.h,
      }
    : null;
  return (
    <figure className="tprev">
      <div
        className="tprev__stage gstage mode-fabric"
        role="img"
        aria-label={`${view} preview — ${state.color.name} ${product.name}`}
        style={{ aspectRatio: `${STAGE_W} / ${STAGE_H}` }}
      >
        <div
          className="gstage__color"
          style={{ backgroundColor: state.color.hex, WebkitMaskImage: `url(${img})`, maskImage: `url(${img})` }}
          aria-hidden="true"
        />
        <div className="gstage__artclip" style={{ WebkitMaskImage: `url(${img})`, maskImage: `url(${img})` }}>
          {art && box && (
            <div
              className="tprev__art"
              style={{
                left: `${(box.x / STAGE_W) * 100}%`,
                top: `${(box.y / STAGE_H) * 100}%`,
                width: `${(box.w / STAGE_W) * 100}%`,
                transform: `translate(-50%, -50%) rotate(${art.rotation}deg)`,
              }}
            >
              <img src={art.src} alt="" draggable={false} />
            </div>
          )}
        </div>
        <img className="gstage__shade" src={img} alt="" aria-hidden="true" style={{ filter: `grayscale(1) brightness(${tuning.shadeBrightness})` }} />
        <img className="gstage__light" src={img} alt="" aria-hidden="true" style={{ opacity: tuning.lightOpacity, filter: "grayscale(1) contrast(1.15)" }} />
      </div>
      <figcaption className="mono">{view}{art ? "" : " · no design added"}</figcaption>
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
  /** Native file sharing available? Decides Share-first vs download fallback. */
  const canShare = useMemo(() => canShareFiles(), []);
  const fileRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const product = getProduct(state);
  const zone = getZone(state);
  const art = state.artworks[state.view];
  const fabric = getFabric(state);

  const set = (patch: Partial<DesignState>) => setState((s) => ({ ...s, ...patch }));
  const setDetails = (patch: Partial<DesignState["details"]>) =>
    setState((s) => ({ ...s, details: { ...s.details, ...patch } }));

  /** Switch garment; keep artwork but re-clamp it to the new print zones. */
  function setProductId(id: string) {
    setState((s) => {
      const next = PRODUCTS.find((p) => p.id === id);
      if (!next) return s;
      const artworks = { ...s.artworks };
      (Object.keys(artworks) as ViewId[]).forEach((v) => {
        const a = artworks[v];
        if (a) artworks[v] = clampArtwork(a, next.zones[v]);
      });
      return { ...s, productId: id, artworks };
    });
  }

  // ---- artwork history (undo / redo) ----
  // Mutations happen OUTSIDE setState updaters (StrictMode double-invokes
  // updaters, so side effects inside them corrupt the stacks).
  const history = useRef<{ past: DesignState["artworks"][]; future: DesignState["artworks"][] }>({
    past: [],
    future: [],
  });
  const artworksRef = useRef(state.artworks);
  artworksRef.current = state.artworks;
  const [historyTick, setHistoryTick] = useState(0);
  const setArtwork = (view: ViewId, a: Artwork | undefined) => {
    history.current.past.push(artworksRef.current);
    if (history.current.past.length > 40) history.current.past.shift();
    history.current.future = [];
    setHistoryTick((t) => t + 1);
    const artworks = { ...artworksRef.current };
    if (a) artworks[view] = a;
    else delete artworks[view];
    setState((s) => ({ ...s, artworks }));
  };
  const undo = () => {
    const prev = history.current.past.pop();
    if (!prev) return;
    history.current.future.push(artworksRef.current);
    setHistoryTick((t) => t + 1);
    setState((s) => ({ ...s, artworks: prev }));
  };
  const redo = () => {
    const next = history.current.future.pop();
    if (!next) return;
    history.current.past.push(artworksRef.current);
    setHistoryTick((t) => t + 1);
    setState((s) => ({ ...s, artworks: next }));
  };
  void historyTick; // re-render trigger for button disabled states

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
    window.setTimeout(() => topRef.current?.scrollIntoView({ block: "start", behavior: "smooth" }), 10);
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
    const placement = defaultArtworkPlacement(zone, res.naturalW, res.naturalH);
    setArtwork(state.view, { ...res, ...placement });
    if (fileRef.current) fileRef.current.value = "";
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
      for (const v of ["front", "back"] as ViewId[]) {
        const a = state.artworks[v];
        if (a) files.push(await dataUrlToFile(a.src, `${state.reference}-${v}-original-${a.fileName}`));
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

  /** Legibility guard: artwork tone vs shirt tone (approximate, non-blocking). */
  const lowContrast =
    art && typeof art.avgLuma === "number" && Math.abs(art.avgLuma - hexLuma(state.color.hex)) < 0.16;

  // ---- shared editor control fragments (rendered once, re-arranged by CSS) ----

  const uploadControls = (
    <>
      <div
        className="field dropzone"
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
        <label htmlFor="art-upload">
          {art ? "Replace" : "Upload"} {state.view} artwork
        </label>
        <input
          ref={fileRef}
          id="art-upload"
          className="upload"
          type="file"
          accept="image/png,image/jpeg"
          onChange={(e) => onFile(e.target.files)}
        />
        <p className="field__note">
          Drag &amp; drop or browse — PNG or JPEG, up to 10 MB. Transparent PNGs keep their transparency.
        </p>
        {uploadError && (
          <p className="field__error" role="alert">
            {uploadError}
          </p>
        )}
      </div>

      {(history.current.past.length > 0 || history.current.future.length > 0) && (
        <div className="editactions" aria-label="History">
          <button type="button" className="btn btn--outline" onClick={undo} disabled={!history.current.past.length} aria-label="Undo (Ctrl+Z)">
            Undo
          </button>
          <button type="button" className="btn btn--outline" onClick={redo} disabled={!history.current.future.length} aria-label="Redo (Ctrl+Shift+Z)">
            Redo
          </button>
        </div>
      )}

      {art && (
        <div className="editactions">
          <button type="button" className="btn btn--outline" onClick={() => fileRef.current?.click()}>
            <Upload size={16} aria-hidden="true" /> Replace
          </button>
          <button
            type="button"
            className="btn btn--outline editactions__remove"
            onClick={() => setArtwork(state.view, undefined)}
          >
            <Trash2 size={16} aria-hidden="true" /> Remove
          </button>
        </div>
      )}

      {!art && (
        <ol className="emptysteps" aria-label="How it works">
          <li>Upload a logo or design</li>
          <li>Position it on the garment</li>
          <li>Review the preview</li>
          <li>Send it to The Factory for a quote</li>
        </ol>
      )}
    </>
  );

  const adjustControls = art ? (
    <>
      <div className="field">
        <span className="field__legend mono">Placement presets</span>
        <div className="presetrow">
          {placementsForView(state.view).map((p) => (
            <button
              key={p.id}
              type="button"
              className="preset"
              onClick={() => setArtwork(state.view, applyPlacement(art, p, zone))}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="art-size">
          Printed width — {art.widthIn}″
          <span className="field__opt"> (~{estimatedDpi(art)} DPI)</span>
        </label>
        <input
          id="art-size"
          type="range"
          min={1}
          max={round2(zone.widthIn * 1.15)}
          step={0.25}
          value={art.widthIn}
          onChange={(e) =>
            setArtwork(state.view, clampArtwork({ ...art, widthIn: Number(e.target.value) }, zone))
          }
        />
        <p className={"quality quality--" + qualityLevel(art)} role="status">
          {QUALITY_COPY[qualityLevel(art)]} <em>Approximate guide, not a final decision.</em>
        </p>
        {lowContrast && (
          <p className="quality quality--soft" role="status">
            Low contrast: your design may blend into the {state.color.name.toLowerCase()} fabric.{" "}
            <em>We never change your colours — the team confirms legibility before printing.</em>
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="art-rot">Rotation — {Math.round(art.rotation)}°</label>
        <input
          id="art-rot"
          type="range"
          min={-180}
          max={180}
          step={1}
          value={((art.rotation + 180) % 360) - 180}
          onChange={(e) =>
            setArtwork(state.view, clampArtwork({ ...art, rotation: Number(e.target.value) }, zone))
          }
        />
      </div>

      <div className="editactions">
        <button
          type="button"
          className="btn btn--outline"
          onClick={() =>
            setArtwork(
              state.view,
              clampArtwork({ ...art, ...defaultArtworkPlacement(zone, art.naturalW, art.naturalH) }, zone),
            )
          }
        >
          Centre &amp; reset
        </button>
      </div>
      <p className="field__note">
        Tip: drag to move · pinch or use the corner handle to resize · keyboard arrows, + − and [ ] also work.
      </p>
    </>
  ) : (
    <p className="field__note">Upload artwork first — position and size controls appear here.</p>
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
        <li>
          Front design: {state.artworks.front ? "added" : "—"} · Back design: {state.artworks.back ? "added" : "—"}
        </li>
      </ul>
      <p className="ed__summarynote">{MARKET_SOURCING_NOTICE}</p>
    </aside>
  );

  // ------------------------------------------------------------------
  return (
    <div className="studio" ref={topRef}>
      <div className="studio__proto" role="note">
        <FlaskConical size={14} aria-hidden="true" />
        Experimental prototype — test mode. Nothing is sent automatically, prices are not shown, and
        availability is confirmed by The Factory team.
      </div>

      <header className="studio__head container">
        <span className="eyebrow">Studio</span>
        <h1 className="h2">Design your garment</h1>
        <p className="studio__stepmeta mono" aria-hidden="true">
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
        {/* STEP 1 — PRODUCT */}
        {step === 0 && (
          <section className="studio__panel" aria-label="Choose a product">
            <div className="prodgrid">
              {PRODUCTS.map((p) => (
                <label key={p.id} className={"prodcard" + (state.productId === p.id ? " is-active" : "")}>
                  <input
                    type="radio"
                    name="product"
                    checked={state.productId === p.id}
                    onChange={() => setProductId(p.id)}
                  />
                  <img className="prodcard__thumb" src={p.thumb} alt={`${p.name} — real garment render`} loading="lazy" />
                  <span className="prodcard__name">{p.name}</span>
                  <span className="prodcard__fit mono">{p.fit}</span>
                  <span className="prodcard__desc">{p.description}</span>
                  <span className="prodcard__meta">
                    <span className="prodcard__metaline"><strong>Typical use:</strong> {p.use}</span>
                    <span className="prodcard__metaline"><strong>Material reference:</strong> {p.material}</span>
                  </span>
                  <AvailabilityBadge status={p.availability} />
                </label>
              ))}
            </div>
            <p className="enquiry__hint">
              <Info size={15} aria-hidden="true" />
              {MARKET_SOURCING_NOTICE}
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
                zone={zone}
                artwork={art}
                onArtworkChange={(a) => setArtwork(state.view, a)}
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
          <section className="studio__panel ed" aria-label="Add and position artwork">
            <div className="ed__stagecol">
              <div className="viewtabs" role="tablist" aria-label="Garment view">
                {(["front", "back"] as ViewId[]).map((v) => (
                  <button
                    key={v}
                    role="tab"
                    aria-selected={state.view === v}
                    className={"viewtab" + (state.view === v ? " is-active" : "")}
                    onClick={() => set({ view: v })}
                  >
                    {v === "front" ? "Front" : "Back"}
                    {state.artworks[v] ? <Check size={13} aria-hidden="true" /> : null}
                  </button>
                ))}
              </div>
              <TeeStage
                productId={product.id}
                view={state.view}
                colorHex={state.color.hex}
                zone={zone}
                artwork={art}
                onArtworkChange={(a) => setArtwork(state.view, a)}
              />
            </div>

            {/* Mobile bottom-sheet tabs (hidden ≥861px) */}
            <div className="ed__sheettabs" role="tablist" aria-label="Editor controls">
              {(
                [
                  ["artwork", "Artwork"],
                  ["adjust", "Position"],
                  ["style", "Garment & colour"],
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
              {uploadControls}
            </div>
            <div className={"ed__rail ed__rail--adjust" + (mtab === "adjust" ? " is-mtab" : "")}>
              {adjustControls}
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
                {"Studio requests start from just 1 item. The team confirms the price for your quantity."}
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

            <fieldset className="field">
              <legend>
                Printing method preference <span className="field__opt">(the team confirms what suits your artwork)</span>
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

        {/* STEP 6 — CONFIRM & SEND (TEST MODE) */}
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
                    <Paperclip size={14} aria-hidden="true" /> Design brief (JSON, includes placement data)
                  </li>
                  {state.artworks.front && (
                    <li>
                      <Paperclip size={14} aria-hidden="true" /> Original front artwork —{" "}
                      {state.artworks.front.fileName} (untouched)
                    </li>
                  )}
                  {state.artworks.back && (
                    <li>
                      <Paperclip size={14} aria-hidden="true" /> Original back artwork —{" "}
                      {state.artworks.back.fileName} (untouched)
                    </li>
                  )}
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
              Test mode: nothing is uploaded or sent automatically. Preparing your design only
              creates the files on your device — you choose what to share on WhatsApp.
            </p>
            <button
              type="button"
              className="btn btn--primary btn--lg"
              onClick={() => setSubmitted(new Date().toISOString())}
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
                  <button type="button" className="btn btn--outline" onClick={() => downloadPreview(state)}>
                    <Download size={16} aria-hidden="true" /> Mockup
                  </button>
                  <button type="button" className="btn btn--outline" onClick={() => downloadSpec(state)}>
                    <Download size={16} aria-hidden="true" /> Design brief (JSON)
                  </button>
                  {state.artworks.front && (
                    <button type="button" className="btn btn--outline" onClick={() => downloadOriginalArtwork(state, "front")}>
                      <Download size={16} aria-hidden="true" /> Front original
                    </button>
                  )}
                  {state.artworks.back && (
                    <button type="button" className="btn btn--outline" onClick={() => downloadOriginalArtwork(state, "back")}>
                      <Download size={16} aria-hidden="true" /> Back original
                    </button>
                  )}
                </div>
                <p className="field__note">
                  The complete reference already includes the mockups, placement, colour and production
                  details — these are optional extras for the team.
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
                  if (step === 2 && !state.artworks.front && !state.artworks.back) {
                    setUploadError("Add at least one design (front or back) to continue.");
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
                Send design to The Factory <ArrowRight size={17} aria-hidden="true" />
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
                setState(initialState());
                setSubmitted(null);
                setShareState("idle");
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
