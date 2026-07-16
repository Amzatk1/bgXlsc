import { BRAND } from "../data/brand";
import { FACTORY_FLOOR } from "../data/media";
import { Photo } from "../components/Photo";
import { PageIntro } from "../components/PageIntro";
import { VisitPanel } from "../components/VisitPanel";
import { CtaBand } from "../components/CtaBand";
import { SpecLine } from "../components/SpecLine";
import { Reveal } from "../components/Reveal";

export function Visit() {
  return (
    <>
      <PageIntro
        compact
        eyebrow="Contact & visit"
        title="Come see the factory"
        intro="We’re at 46 Industrial Avenue, Ilupeju, Lagos. Factory visits are by appointment — message us on WhatsApp to book a time."
      >
        <SpecLine items={["By appointment", BRAND.hoursShort, "Ilupeju, Lagos"]} />
      </PageIntro>

      <section className="section--tight">
        <div className="container">
          <Reveal>
            <figure className="factoryband">
              <Photo
                name={FACTORY_FLOOR.name}
                alt={FACTORY_FLOOR.alt}
                position={FACTORY_FLOOR.position}
                sizes="(max-width: 900px) 100vw, 1200px"
              />
              <figcaption className="factoryband__cap">
                <span className="mono">Inside the factory</span>
                <span className="factoryband__sub">Production floor · Ilupeju, Lagos</span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <VisitPanel />
        </div>
      </section>

      <CtaBand
        title="Ready to place an order?"
        text="Visits are for meeting the team and seeing the floor. To get a price, start an order enquiry — it only takes a minute."
      />
    </>
  );
}
