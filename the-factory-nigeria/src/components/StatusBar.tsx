import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { getOpenStatus } from "../lib/openStatus";
import { StatusChip } from "./StatusChip";

export function StatusBar() {
  const [status, setStatus] = useState(() => getOpenStatus());

  useEffect(() => {
    const t = setInterval(() => setStatus(getOpenStatus()), 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="statusbar">
      <div className="container statusbar__inner">
        <p className="statusbar__id">
          <span className="statusbar__dot" aria-hidden="true" />
          The Factory Nigeria
          <span className="statusbar__sep">·</span>
          <span className="statusbar__muted">Garment production &amp; printing</span>
        </p>
        <div className="statusbar__right">
          <span className="statusbar__loc">
            <MapPin size={13} aria-hidden="true" /> Ilupeju, Lagos
          </span>
          <StatusChip tone={status.open ? "ready" : "default"} pulse={status.open}>
            {status.label}
          </StatusChip>
        </div>
      </div>
    </div>
  );
}
