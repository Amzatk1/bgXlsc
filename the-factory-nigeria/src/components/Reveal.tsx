import type { CSSProperties, ReactNode } from "react";
import { useReveal } from "../lib/useReveal";

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
};

export function Reveal({ children, delay = 0, className, style }: Props) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      data-reveal
      className={className}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}
