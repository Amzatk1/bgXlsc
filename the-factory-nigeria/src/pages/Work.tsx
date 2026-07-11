import { VIDEOS, SHOWROOM } from "../data/media";
import { PageIntro } from "../components/PageIntro";
import { MediaVideo } from "../components/MediaVideo";
import { ProofWall } from "../components/ProofWall";
import { Photo } from "../components/Photo";
import { SectionHeader } from "../components/SectionHeader";
import { StatusChip } from "../components/StatusChip";
import { SpecLine } from "../components/SpecLine";
import { Reveal } from "../components/Reveal";
import { CtaBand } from "../components/CtaBand";

const REELS = [VIDEOS.craft, VIDEOS.strongStitch, VIDEOS.print, VIDEOS.bulkBts, VIDEOS.details];

export function Work() {
  return (
    <>
      <PageIntro
        eyebrow="Selected work"
        title="Off the floor, into the world"
        intro="Real production and finished pieces from The Factory, shot on-site. This is selected work to show capability — not a shop. To produce something similar, request a quote."
      >
        <SpecLine items={["Production", "Uniforms", "Finished work"]} />
      </PageIntro>

      {/* Editorial cover — a wide finished-work moment */}
      <section className="section--tight">
        <div className="container">
          <Reveal>
            <figure className="workcover">
              <Photo
                name={SHOWROOM.name}
                alt={SHOWROOM.alt}
                ratio="16 / 9"
                position={SHOWROOM.position}
                sizes="(max-width: 1200px) 100vw, 1200px"
                priority
              />
              <figcaption className="workcover__cap mono">Finished work · the showroom rack</figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="The proof wall"
            title="Selected production work"
            intro="Filter by type — real photography from the floor: production, uniforms and finished garments."
          />
          <ProofWall showFilter />
        </div>
      </section>

      <section className="section section--paper2">
        <div className="container">
          <SectionHeader
            eyebrow="Reels"
            title="In motion"
            intro="Tap any clip for sound — only one plays audio at a time."
          />
          <div className="reels" role="group" aria-label="Production reels">
            {REELS.map((v) => (
              <div className="reels__item" key={v.id}>
                <MediaVideo {...v} ratio="9x16" tag={<StatusChip tone="dark">{v.label}</StatusChip>} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title="Want this for your brand?" />
    </>
  );
}
