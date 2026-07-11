import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function SectionHeader({
  eyebrow,
  title,
  intro,
  action,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="section-head">
      <Reveal>
        <span className="eyebrow">{eyebrow}</span>
      </Reveal>
      <div className="section-head__row">
        <Reveal delay={60}>
          <h2 className="h2">{title}</h2>
        </Reveal>
        {action ? <Reveal delay={120}>{action}</Reveal> : null}
      </div>
      {intro ? (
        <Reveal delay={90}>
          <p className="lede">{intro}</p>
        </Reveal>
      ) : null}
    </div>
  );
}
