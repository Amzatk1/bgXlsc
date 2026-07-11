import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function PageIntro({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="pageintro paper-grid">
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
