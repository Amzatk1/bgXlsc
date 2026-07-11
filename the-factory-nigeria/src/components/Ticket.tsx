import type { ReactNode } from "react";

export type TicketRow = { label: string; value: ReactNode };

export function Ticket({
  code,
  status,
  rows,
  footer,
  perf = false,
  className,
}: {
  code: string;
  status?: ReactNode;
  rows: TicketRow[];
  footer?: ReactNode;
  perf?: boolean;
  className?: string;
}) {
  return (
    <div className={"ticket" + (perf ? " ticket--perf" : "") + (className ? " " + className : "")}>
      <div className="ticket__head">
        <span className="ticket__code">{code}</span>
        {status}
      </div>
      <dl className="ticket__body">
        {rows.map((r) => (
          <div className="ticket__row" key={r.label}>
            <dt>{r.label}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>
      {footer ? <div className="ticket__foot">{footer}</div> : null}
    </div>
  );
}
