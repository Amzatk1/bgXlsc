import { TICKER } from "../data/brand";

export function Ticker() {
  const run = (key: string) => (
    <div className="ticker__track" key={key} aria-hidden={key === "b"}>
      {TICKER.map((t, i) => (
        <span className="ticker__item" key={t + i}>
          {t}
          <span aria-hidden="true">/</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="ticker" role="marquee" aria-label="What we produce">
      {run("a")}
      {run("b")}
    </div>
  );
}
