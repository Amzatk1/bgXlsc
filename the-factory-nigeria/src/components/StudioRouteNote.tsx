import { ArrowUpRight } from "lucide-react";

export function StudioRouteNote({ compact = false }: { compact?: boolean }) {
  return (
    <aside className={"studio-route" + (compact ? " studio-route--compact" : "")} aria-label="Studio option">
      <div className="studio-route__copy">
        <span className="mono mono--purple">Design from one item</span>
        <p>
          This enquiry follows the standard 30-piece minimum. If you want to design a garment or
          jersey visually, Studio accepts requests starting from one item.
        </p>
      </div>
      <a className="btn btn--outline" href="#/studio">
        Open Studio <ArrowUpRight size={16} aria-hidden="true" />
      </a>
    </aside>
  );
}
