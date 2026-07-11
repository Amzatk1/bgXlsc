import { STEPS, type Step } from "../data/process";
import { useReveal } from "../lib/useReveal";
import { StatusChip } from "./StatusChip";

type Tone = "default" | "ready" | "active" | "brand";

function toneFor(status: Step["status"]): Tone {
  switch (status) {
    case "Start here":
      return "brand";
    case "Make":
      return "active";
    case "Check":
      return "active";
    case "Pickup":
      return "ready";
    default:
      return "default";
  }
}

function BoardRow({ step, delay }: { step: Step; delay: number }) {
  const ref = useReveal<HTMLLIElement>();
  return (
    <li ref={ref} data-reveal className="board__row" style={{ transitionDelay: `${delay}ms` }}>
      <span className="board__n mono">{step.n}</span>
      <div className="board__main">
        <div className="board__titlerow">
          <h3 className="board__title">{step.title}</h3>
          <StatusChip tone={toneFor(step.status)}>{step.status}</StatusChip>
        </div>
        <p className="board__detail">{step.detail}</p>
      </div>
    </li>
  );
}

export function ProcessBoard() {
  return (
    <ol className="board">
      {STEPS.map((s, i) => (
        <BoardRow key={s.n} step={s} delay={Math.min(i * 50, 250)} />
      ))}
    </ol>
  );
}
