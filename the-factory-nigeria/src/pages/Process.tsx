import { VIDEOS, PROCESS_PHOTOS } from "../data/media";
import { PageIntro } from "../components/PageIntro";
import { MediaVideo } from "../components/MediaVideo";
import { Photo } from "../components/Photo";
import { ProcessBoard } from "../components/ProcessBoard";
import { SectionHeader } from "../components/SectionHeader";
import { StatusChip } from "../components/StatusChip";
import { SpecLine } from "../components/SpecLine";
import { Reveal } from "../components/Reveal";
import { CtaBand } from "../components/CtaBand";

export function Process() {
  return (
    <>
      <PageIntro
        compact
        eyebrow="How it works"
        title="A production path you can follow"
        intro="From your first message to pickup, here’s exactly how an order moves through The Factory. Nothing goes into production until it’s confirmed with you."
      >
        <SpecLine items={["Minimum order: 30 pieces", "Confirmed before production", "Pickup or delivery"]} />
      </PageIntro>

      <section className="section">
        <div className="container split split--media">
          <Reveal className="split__media">
            <MediaVideo
              {...VIDEOS.howToWork}
              ratio="4x5"
              tag={<StatusChip tone="dark" pulse>{VIDEOS.howToWork.label}</StatusChip>}
            />
          </Reveal>
          <div className="split__b">
            <SectionHeader
              eyebrow="Watch first"
              title="Here’s exactly how to work with The Factory"
              intro="A quick walkthrough of how we take a brief from enquiry to finished, packed order — so you know what to expect before you reach out."
            />
            <ul className="bullets">
              <li>Tell us what you need — service, quantity, garment and timing.</li>
              <li>We confirm what’s possible and the price on WhatsApp.</li>
              <li>You approve the artwork, materials and any sample.</li>
              <li>We produce, quality-check, then it’s ready for pickup or delivery.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Photographic journey */}
      <section className="section section--paper2">
        <div className="container">
          <SectionHeader
            eyebrow="The journey"
            title="Six steps, in pictures"
            intro="What actually happens between your brief and your finished order."
          />
          <div className="grid cols-3 journey">
            {PROCESS_PHOTOS.map((p, i) => (
              <Reveal delay={(i % 3) * 70} key={p.name}>
                <figure className="journey__item">
                  <Photo
                    name={p.name}
                    alt={p.alt}
                    ratio="4 / 3"
                    position={p.position}
                    sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
                  />
                  <figcaption className="journey__cap">
                    <span className="journey__n mono">{p.n}</span>
                    <span className="journey__t">{p.title}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="The production board"
            title="Eight steps, start to finish"
            intro="Each order moves through these stages. Timelines depend on the job and are always confirmed with you directly."
          />
          <ProcessBoard />
        </div>
      </section>

      <CtaBand
        title="Have your details ready?"
        text="Start an order enquiry and we’ll take it from there. Minimum order: 30 pieces."
      />
    </>
  );
}
