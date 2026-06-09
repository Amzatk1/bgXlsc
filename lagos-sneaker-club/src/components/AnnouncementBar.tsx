import { openStatus } from "../data/site";
import { useSettings } from "../content";
import { waEnquiries } from "../lib/whatsapp";
import { WhatsAppIcon } from "./Icons";

export function AnnouncementBar() {
  const s = useSettings();
  const { isOpen, opensAt, closesAt } = openStatus(new Date(), s.hours);

  return (
    <div className="announce">
      <div className="container">
        <span className="announce__msg">
          <span className="announce__dot" aria-hidden="true" />
          {s.announcement ? (
            <strong>{s.announcement}</strong>
          ) : (
            <>
              <strong>{isOpen ? "Open now" : `Opens ${opensAt}`}</strong>
              <span aria-hidden="true">·</span>
              {isOpen ? `Until ${closesAt} today` : s.hoursSummary}
              <span className="announce__addr">
                <span aria-hidden="true">·</span> {s.addressStreet}
              </span>
            </>
          )}
        </span>
        <span className="announce__links">
          <a href={s.instagramUrl} target="_blank" rel="noreferrer">
            {s.instagramHandle}
          </a>
          <a href={waEnquiries.general()} target="_blank" rel="noreferrer">
            <WhatsAppIcon size={13} />
            {s.whatsappDisplay}
          </a>
        </span>
      </div>
    </div>
  );
}
