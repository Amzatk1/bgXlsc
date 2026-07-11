// A quiet, editorial alternative to a row of pill chips — used on inner
// page intros so the chip pattern doesn't repeat on every page.
export function SpecLine({ items }: { items: string[] }) {
  return (
    <p className="specline">
      {items.map((it, i) => (
        <span className="specline__item" key={it}>
          {i > 0 ? (
            <span className="specline__sep" aria-hidden="true">
              /
            </span>
          ) : null}
          {it}
        </span>
      ))}
    </p>
  );
}
