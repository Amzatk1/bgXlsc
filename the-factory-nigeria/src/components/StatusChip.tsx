import type { ReactNode } from "react";

type Tone = "default" | "ready" | "active" | "brand" | "dark";

export function StatusChip({
  children,
  tone = "default",
  pulse = false,
}: {
  children: ReactNode;
  tone?: Tone;
  pulse?: boolean;
}) {
  const toneClass =
    tone === "ready"
      ? "chip chip--ready"
      : tone === "active"
        ? "chip chip--active"
        : tone === "brand"
          ? "chip chip--brand"
          : tone === "dark"
            ? "chip chip--dark"
            : "chip";

  return (
    <span className={toneClass}>
      <span className={"chip__dot" + (pulse ? " chip__dot--pulse" : "")} aria-hidden="true" />
      {children}
    </span>
  );
}
