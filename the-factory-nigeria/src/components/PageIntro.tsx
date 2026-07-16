import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function PageIntro({
  eyebrow,
  title,
  intro,
  children,
  compact = false,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  /**
   * Inner-page variant: same Factory type treatment and ruled paper, but the
   * composition is rebalanced so the route's first useful content lands inside
   * the first viewport on a laptop (the HODINKEE editorial-header principle —
   * authority without ceremony). Home keeps its own full hero.
   */
  compact?: boolean;
}) {
  return (
    <section className={"pageintro paper-grid" + (compact ? " pageintro--compact" : "")}>
      <div className="container">
        <Reveal>
          <span className="eyebrow">{eyebrow}</span>
        </Reveal>
        <Reveal delay={70}>
          <h1 className="display pageintro__title">{title}</h1>
        </Reveal>
        {intro ? (
          <Reveal delay={130}>
            <p className="lede pageintro__lede">{intro}</p>
          </Reveal>
        ) : null}
        {children ? <Reveal delay={190}>{children}</Reveal> : null}
      </div>
    </section>
  );
}
