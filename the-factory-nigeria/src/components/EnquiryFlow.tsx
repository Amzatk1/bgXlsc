import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Info, Paperclip, Pencil, ShieldCheck } from "lucide-react";
import { SERVICES } from "../data/services";
import { EMPTY_ENQUIRY, enquiryLink, type EnquiryFields } from "../lib/whatsapp";
import { WhatsAppIcon } from "./WhatsAppIcon";

const DRAFT_KEY = "tfn-enquiry-draft";

const SERVICE_OPTS = [...SERVICES.map((s) => s.title), "I'm not sure yet"];

const SUPPLY_OPTS: { v: string; d: string }[] = [
  { v: "The Factory makes & supplies the garments", d: "We source blanks or fabric and produce it." },
  { v: "Print / embroider items I supply", d: "You provide the garments; we decorate them." },
  { v: "I'm not sure yet", d: "We'll advise the best route for your order." },
];
const ARTWORK_OPTS = ["Print-ready file", "Rough idea / sketch", "I need help with artwork", "Not applicable"];
const FULFIL_OPTS = ["Pickup in Ilupeju", "Delivery (to confirm)", "Not sure yet"];

const STEP_TITLES = [
  "What do you need?",
  "Order details",
  "Timing & fulfilment",
  "About you",
  "Review your enquiry",
];
const TOTAL = STEP_TITLES.length;

export function EnquiryFlow({ initialService }: { initialService?: string }) {
  const [step, setStep] = useState(0);
  const [q, setQ] = useState<EnquiryFields>(() => {
    let base: EnquiryFields = EMPTY_ENQUIRY;
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      if (saved) base = { ...EMPTY_ENQUIRY, ...JSON.parse(saved) };
    } catch {
      /* ignore */
    }
    if (initialService && SERVICE_OPTS.includes(initialService)) base = { ...base, service: initialService };
    return base;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const set = (k: keyof EnquiryFields, v: string) => setQ((prev) => ({ ...prev, [k]: v }));

  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(q));
    } catch {
      /* ignore */
    }
  }, [q]);

  const qtyNum = parseInt(q.quantity.replace(/[^\d]/g, ""), 10);
  const belowMin = !Number.isNaN(qtyNum) && qtyNum > 0 && qtyNum < 30;

  function validate(s: number): Record<string, string> {
    const e: Record<string, string> = {};
    if (s === 0 && !q.service) e.service = "Choose a service, or pick “I’m not sure yet”.";
    if (s === 1 && !q.quantity.trim()) e.quantity = "Add a rough quantity — you can type “not sure”.";
    if (s === 3 && !q.name.trim()) e.name = "Add your name so we know who we’re talking to.";
    return e;
  }

  function scrollTop() {
    window.setTimeout(() => topRef.current?.scrollIntoView({ block: "start", behavior: "smooth" }), 10);
  }

  function goNext() {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      window.setTimeout(() => document.getElementById("f-" + first)?.focus(), 20);
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL - 1));
    scrollTop();
  }
  function goBack() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
    scrollTop();
  }
  function editStep(s: number) {
    setErrors({});
    setStep(s);
    scrollTop();
  }

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (step < TOTAL - 1) goNext();
  };

  const Choices = ({
    field,
    options,
    describe,
  }: {
    field: keyof EnquiryFields;
    options: (string | { v: string; d: string })[];
    describe?: boolean;
  }) => (
    <div className={"choices" + (describe ? " choices--stacked" : "")} role="radiogroup" aria-label={field}>
      {options.map((opt) => {
        const v = typeof opt === "string" ? opt : opt.v;
        const d = typeof opt === "string" ? "" : opt.d;
        const active = q[field] === v;
        return (
          <label key={v} className={"choice" + (active ? " is-active" : "")}>
            <input
              type="radio"
              name={field}
              value={v}
              checked={active}
              onChange={() => set(field, v)}
            />
            <span className="choice__label">{v}</span>
            {d ? <span className="choice__desc">{d}</span> : null}
          </label>
        );
      })}
    </div>
  );

  const REVIEW_ROWS: { label: string; value: string; step: number }[] = [
    { label: "Service", value: q.service, step: 0 },
    { label: "Garment / product", value: q.product, step: 0 },
    { label: "Quantity", value: q.quantity, step: 1 },
    { label: "Sizes", value: q.sizes, step: 1 },
    { label: "Who makes it", value: q.supply, step: 1 },
    { label: "Artwork", value: q.artwork, step: 1 },
    { label: "Needed by", value: q.neededBy, step: 2 },
    { label: "Pickup / delivery", value: q.fulfilment, step: 2 },
    { label: "Name", value: q.name, step: 3 },
    { label: "Company", value: q.company, step: 3 },
    { label: "Email", value: q.email, step: 3 },
    { label: "Notes", value: q.notes, step: 3 },
  ];

  return (
    <section className="enquiry" aria-label="Order enquiry">
      <div className="enquiry__head" ref={topRef} tabIndex={-1}>
        <span className="eyebrow">Order enquiry</span>
        <h2 className="h2">{STEP_TITLES[step]}</h2>
        <div className="enquiry__progress">
          <span className="mono">
            Step {step + 1} of {TOTAL}
          </span>
          <span className="enquiry__bar" aria-hidden="true">
            <span style={{ width: `${((step + 1) / TOTAL) * 100}%` }} />
          </span>
        </div>
      </div>

      <form className="enquiry__form" onSubmit={onSubmit} noValidate>
        {/* STEP 1 — WHAT */}
        {step === 0 && (
          <div className="enquiry__step">
            <fieldset className="field" aria-describedby={errors.service ? "f-service-err" : undefined}>
              <legend>Which service do you need?</legend>
              {errors.service ? (
                <p className="field__error" id="f-service-err" role="alert">
                  {errors.service}
                </p>
              ) : null}
              <span id="f-service" tabIndex={-1} />
              <Choices field="service" options={SERVICE_OPTS} />
            </fieldset>

            <div className="field">
              <label htmlFor="f-product">
                Garment or product <span className="field__opt">(optional)</span>
              </label>
              <input
                id="f-product"
                type="text"
                value={q.product}
                onChange={(e) => set("product", e.target.value)}
                placeholder="e.g. heavyweight tees, polo shirts, tote bags"
              />
            </div>
          </div>
        )}

        {/* STEP 2 — DETAILS */}
        {step === 1 && (
          <div className="enquiry__step">
            <div className="field">
              <label htmlFor="f-quantity">How many pieces (roughly)?</label>
              {errors.quantity ? (
                <p className="field__error" id="f-quantity-err" role="alert">
                  {errors.quantity}
                </p>
              ) : null}
              <input
                id="f-quantity"
                type="text"
                value={q.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                placeholder="e.g. 50"
                aria-describedby={"f-quantity-note" + (errors.quantity ? " f-quantity-err" : "")}
              />
              <p className="field__note" id="f-quantity-note">
                {belowMin
                  ? "Our standard minimum order starts at 30 pieces. Send the details and the team will confirm what’s possible."
                  : "Minimum order: 30 pieces. A rough number is fine."}
              </p>
            </div>

            <div className="field">
              <label htmlFor="f-sizes">
                Size breakdown <span className="field__opt">(optional)</span>
              </label>
              <input
                id="f-sizes"
                type="text"
                value={q.sizes}
                onChange={(e) => set("sizes", e.target.value)}
                placeholder="e.g. 10 S, 20 M, 20 L"
              />
            </div>

            <fieldset className="field">
              <legend>Who makes the garments?</legend>
              <Choices field="supply" options={SUPPLY_OPTS} describe />
            </fieldset>

            <fieldset className="field">
              <legend>
                Artwork or logo <span className="field__opt">(optional)</span>
              </legend>
              <Choices field="artwork" options={ARTWORK_OPTS} />
            </fieldset>
          </div>
        )}

        {/* STEP 3 — TIMING */}
        {step === 2 && (
          <div className="enquiry__step">
            <div className="field">
              <label htmlFor="f-neededBy">
                Needed by <span className="field__opt">(optional)</span>
              </label>
              <input
                id="f-neededBy"
                type="text"
                value={q.neededBy}
                onChange={(e) => set("neededBy", e.target.value)}
                placeholder="e.g. mid-August, or “flexible”"
              />
            </div>

            <fieldset className="field">
              <legend>
                Pickup or delivery <span className="field__opt">(optional)</span>
              </legend>
              <Choices field="fulfilment" options={FULFIL_OPTS} />
            </fieldset>

            <p className="enquiry__hint">
              <Info size={15} aria-hidden="true" />
              Timing and delivery are confirmed with you after we review the order — this is just a
              guide.
            </p>
          </div>
        )}

        {/* STEP 4 — ABOUT YOU */}
        {step === 3 && (
          <div className="enquiry__step">
            <div className="field">
              <label htmlFor="f-name">Your name</label>
              {errors.name ? (
                <p className="field__error" id="f-name-err" role="alert">
                  {errors.name}
                </p>
              ) : null}
              <input
                id="f-name"
                type="text"
                autoComplete="name"
                value={q.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="First name is fine"
                aria-describedby={errors.name ? "f-name-err" : undefined}
              />
            </div>

            <div className="field">
              <label htmlFor="f-company">
                Brand or company <span className="field__opt">(optional)</span>
              </label>
              <input
                id="f-company"
                type="text"
                autoComplete="organization"
                value={q.company}
                onChange={(e) => set("company", e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="f-email">
                Email <span className="field__opt">(optional)</span>
              </label>
              <input
                id="f-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={q.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="For a written quote — WhatsApp is our main channel"
              />
            </div>

            <div className="field">
              <label htmlFor="f-notes">
                Anything else <span className="field__opt">(optional)</span>
              </label>
              <textarea
                id="f-notes"
                rows={3}
                value={q.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Colours, references, questions…"
              />
            </div>
          </div>
        )}

        {/* STEP 5 — REVIEW */}
        {step === 4 && (
          <div className="enquiry__step">
            <div className="ticket ticket--perf review">
              <div className="ticket__head">
                <span className="ticket__code">ENQUIRY · TFN-{new Date().getFullYear()}</span>
                <span className="chip chip--brand">
                  <span className="chip__dot" aria-hidden="true" />
                  Draft
                </span>
              </div>
              <dl className="review__list">
                {REVIEW_ROWS.filter((r) => r.value.trim()).map((r) => (
                  <div className="review__row" key={r.label}>
                    <dt>{r.label}</dt>
                    <dd>{r.value}</dd>
                    <button type="button" className="review__edit" onClick={() => editStep(r.step)}>
                      <Pencil size={13} aria-hidden="true" /> Edit
                    </button>
                  </div>
                ))}
              </dl>
            </div>

            {belowMin ? (
              <p className="enquiry__hint">
                <Info size={15} aria-hidden="true" />
                You’re under the 30-piece minimum — that’s fine to send. The team will confirm what’s
                possible.
              </p>
            ) : null}

            <div className="enquiry__send">
              <a
                ref={ctaRef}
                href={enquiryLink(q)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--wa btn--block btn--lg"
                onClick={() => setSent(true)}
              >
                <WhatsAppIcon /> Send enquiry on WhatsApp
              </a>
              <p className="console__reassure">
                <ShieldCheck size={15} aria-hidden="true" />
                This sends an enquiry — not a confirmed order or price. The team replies to confirm
                availability, price and timing.
              </p>
              {sent ? (
                <p className="enquiry__attach" role="status">
                  <Paperclip size={15} aria-hidden="true" />
                  Now attach your artwork, logo or reference images directly in WhatsApp.
                </p>
              ) : null}
            </div>
          </div>
        )}

        {/* NAV */}
        <div className="enquiry__nav">
          {step > 0 ? (
            <button type="button" className="btn btn--outline" onClick={goBack}>
              <ArrowLeft size={17} aria-hidden="true" /> Back
            </button>
          ) : (
            <span />
          )}
          {step < TOTAL - 1 ? (
            <button type="submit" className="btn btn--primary">
              {step === 3 ? "Review enquiry" : "Continue"} <ArrowRight size={17} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
