import { ASSETS } from "../data/assets";
import { SITE } from "../data/site";
import { Link } from "../router";

export function Brand({ showText = true, onClick }: { showText?: boolean; onClick?: () => void }) {
  return (
    <Link to="/" className="brand" aria-label={`${SITE.name} — home`} onClick={onClick}>
      <span className="brand__mark">
        <img src={ASSETS.logo} alt="" width={40} height={40} />
      </span>
      {showText && (
        <span className="brand__text">
          <strong>Lagos Sneaker Club</strong>
          <small>{SITE.tagline}</small>
        </span>
      )}
    </Link>
  );
}
