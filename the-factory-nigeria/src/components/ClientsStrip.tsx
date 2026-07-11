import { CLIENTS } from "../data/brand";
import { LOGO_BG } from "../data/media";
import { Reveal } from "./Reveal";

// Brands the factory has produced for (names supplied by the manager).
// Official logo files are used where the brand has supplied them; the
// rest are set as typographic wordmarks until their files arrive.
const LOGO_FILES: Record<string, string> = {
  "Bearded Genius": LOGO_BG,
};

export function ClientsStrip({ dark = false }: { dark?: boolean }) {
  return (
    <Reveal className={"clients" + (dark ? " clients--dark" : "")}>
      <h2 className="clients__label mono">Brands we&rsquo;ve produced for</h2>
      <ul className="clients__list">
        {CLIENTS.map((c) => (
          <li className="clients__item" key={c}>
            {LOGO_FILES[c] ? <img className="clients__logo" src={LOGO_FILES[c]} alt={c} /> : c}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
