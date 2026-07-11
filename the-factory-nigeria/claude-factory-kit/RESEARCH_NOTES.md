# Research Notes

## Instagram Profile Capture

Source: https://www.instagram.com/thefactorynigeria_/

- Username: thefactorynigeria_
- Display name: GARMENT PRODUCTION & PRINTING FACTORY IN LAGOS
- Followers at capture: 1044
- Posts at capture: 211
- Highlight reel count: 17
- Bio: We specialize in garment production and printing services  / MOQ: 30pcs / ⏰: 9am - 5pm / Monday to Friday  / Factory visits: (By Appointment) / Enquiries⤵️
- WhatsApp: +234 909 943 6487 / wa.me/2349099436487
- Address: 46 Industrial Avenue, Ilupeju, Lagos, Nigeria
- Coordinates: 6.54003, 3.35868
- Hours: 9am - 5pm, Monday to Friday
- Visits: Factory visits by appointment
- MOQ: 30 pieces
- Screenshot highlights: Prints, Our Process, Products, Production, Payment

## Public API Limitation

The Instagram profile reports 211 posts. Public endpoints exposed a reliable 36-post media archive before returning login/rate-limit responses. The package still includes profile JSON, feed JSON, 98 downloaded assets, and the user-supplied screenshots.

## Design Direction

The Factory should not look like Lagos Sneaker Club or Bearded Genius. It should feel like a production studio:

- quote-first service site
- process timeline
- production-ticket cards
- real workshop media
- garment labels / pattern paper / stitch-line motifs
- practical WhatsApp quote flow
- address and appointment confidence

## Motion Direction

Use Emil Kowalski-style practical motion:

- transform/opacity
- short timing
- origin-aware menus/forms
- subtle button press
- reduced-motion support
- no noisy decorative animation

## Additional Research: Claude Skills, Relume, Motion and Remotion

### Relume / Claude Design

Sources reviewed:

- https://www.relume.io/claude-design-export
- https://www.relume.io/style-guide

Takeaways for Claude:

- Use a design-system-first workflow: brand colours, typography, spacing, reusable sections, component rules, and assets before page buildout.
- Relume Claude Design export positioning is useful for this project because the site should carry a real visual system into Claude, not rely on a generic prompt-only layout.
- The sitemap and style guide should come before implementation so the Factory website has distinct IA and consistent components.

### Emil Kowalski / Practical UI Animation

Sources reviewed:

- https://emilkowal.ski/ui/7-practical-animation-tips
- https://emilkowal.ski/ui/good-vs-great-animations
- https://emilkowal.ski/ui/building-a-drawer-component
- https://emilkowal.ski/ui/you-dont-need-animations

Takeaways for Claude:

- Motion should clarify state, hierarchy, navigation, and feedback; avoid decoration that makes production info harder to read.
- Use transform/opacity, origin-aware entrances, custom easing, and short timings. Button press can use subtle scale `.97`.
- Avoid starting popovers/modals at `scale(0)`; start around `.9` or higher for natural motion.
- Use ease-out for UI entering because it feels responsive; use quicker ease-in for exits.
- Most UI motion should stay under 300ms; drawers/sheets can use `cubic-bezier(0.32, 0.72, 0, 1)` around 420-500ms.
- Support `prefers-reduced-motion` and test motion in slow-motion before finalizing.

### Remotion

Sources reviewed:

- https://www.remotion.dev/docs/use-current-frame
- https://www.remotion.dev/docs/interpolate
- https://www.remotion.dev/docs/staticfile
- https://www.remotion.dev/docs/html5-video

Takeaways for Claude:

- Remotion is optional for this website. Use it for exportable campaign videos/reels, not normal website UI animation.
- Remotion animations must be frame-driven with `useCurrentFrame()` / `useVideoConfig()`, `interpolate()`, `Easing.bezier`, and `<Sequence>`.
- Assets should be served through Remotion asset APIs such as `staticFile()` and Remotion `<Img>` / `<Video>` elements.
- Avoid CSS/Tailwind animations inside Remotion compositions; use frame-based animation for deterministic renders.
- Suggested exports: 16:9 website hero loop, 9:16 quote/process reel, and 1:1 proof wall social tile.

### Claude Skills / Tooling Instruction

Claude should check its available skills/tools first. If it has browser/research, Relume/Claude Design, UI/UX, accessibility, frontend QA, motion, Remotion, media-performance, or SEO skills, it should use them deliberately. If not, it should still follow the same principles manually and disclose what was unavailable.

## Additional Research: Awarded Ecommerce and UX References

Sources reviewed:

- Awwwards E-commerce collection: https://www.awwwards.com/websites/e-commerce/
- Awwwards Ecommerce of the Year historical winners list: https://fr.wikipedia.org/wiki/Awwwards
- CSS Design Awards homepage / scoring examples: https://www.cssdesignawards.com/
- Baymard ecommerce UX research: https://baymard.com/research

How to apply this research:

- Treat Awwwards/CSSDA as a craft bar for art direction, interaction quality, and polish, not as a template library.
- Treat Baymard as the usability guardrail: ecommerce-level clarity, predictable forms, mobile tap targets, no hidden CTAs, no cleverness that hurts conversion.
- The Factory should synthesize these into quote-commerce for garment production: service discovery, production proof, process confidence, and WhatsApp enquiry flow.
- Reference examples to learn from, not copy: Pangram Pangram Foundry, Simply Chocolate, Protest Sportswear, Nixon eCommerce Platform, Frans Hals Museum, MA, and Mammut Expedition Baikal.
- AI-generated media, if used, should be limited to support textures/icons/backgrounds and never fake real business proof.
