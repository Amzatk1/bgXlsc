# Claude Prompt: Bearded Genius Relume, UI/UX, Motion, Media, and Responsive Polish

You are working in this local codebase:

`/Users/ayooluwakarim/brand-codebases/bearded-genius`

Goal: improve the Bearded Genius website into a minimal, premium, culture-led Nigerian streetwear storefront using the real Instagram assets already arranged in the project. This is for a real business, so treat the work like production frontend work: polished UI, strong responsive behavior, clean code, accessible controls, no broken media, no horizontal overflow, no invented business claims, and an owner-friendly structure for future product updates.

## Research-Backed Tools And Workflow

Use this as a Relume + Claude Design + production implementation brief, not just a normal coding request.

I reviewed the Lagos Sneaker Club Claude/Relume kit at:

- `/Users/ayooluwakarim/brand-codebases/lagos-sneaker-club/claude-relume-lsc-kit/PROMPT_FOR_CLAUDE.md`
- `/Users/ayooluwakarim/brand-codebases/lagos-sneaker-club/claude-relume-lsc-kit/START_FULL_DEV_IN_CLAUDE.md`
- `/Users/ayooluwakarim/brand-codebases/lagos-sneaker-club/claude-relume-lsc-kit/RELUME_SITEMAP_PROMPT.txt`
- `/Users/ayooluwakarim/brand-codebases/lagos-sneaker-club/claude-relume-lsc-kit/RESEARCH_NOTES.md`

Use the LSC kit only as a workflow reference: sitemap-first thinking, strong section descriptions, asset manifest discipline, style-guide tokens, motion spec, implementation plan, then QA. Do not copy Lagos Sneaker Club content, products, brand identity, location copy, red poster direction, or LSC-specific pages into Bearded Genius.

Current external references to apply:

- Relume Site Builder positions the workflow as AI-generated sitemaps, wireframes, and style guides for marketing websites, then export to Figma, Webflow, React, or Claude Design: `https://www.relume.io/`
- Relume's Claude Design export is specifically about packaging colours, typography, spacing, and reusable components so Claude builds inside a real design system instead of drifting into a generic AI look: `https://www.relume.io/claude-design-export`
- Relume Style Guide Builder should be used to create on-brand colour, type, spacing, and component rules before Claude starts generating finished pages: `https://www.relume.io/style-guide`
- Emil Kowalski's public animation writing emphasizes purposeful motion, fast UI timing, ease-out/custom easing, origin-aware components, transforms/opacity for performance, interruptible transitions, and reduced-motion support: `https://emilkowal.ski/ui/7-practical-animation-tips`, `https://emilkowal.ski/ui/great-animations`, `https://emilkowal.ski/ui/good-vs-great-animations`, `https://emilkowal.ski/ui/css-transforms`, `https://emilkowal.ski/ui/you-dont-need-animations`, `https://emilkowal.ski/ui/building-a-drawer-component`
- WCAG 2.2 target-size guidance says pointer targets should be at least 24 by 24 CSS pixels or have enough spacing; for this storefront, aim higher at 40-44px on touch-first controls: `https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html`
- Web.dev's responsive design course frames responsive work as adapting layouts, typography, images, accessibility, and interaction patterns across screen sizes and input types: `https://web.dev/learn/design/`

If Claude has access to any of these skills, use them before coding:

- Relume / Relume Site Builder / Claude Design export skill
- Website information architecture skill
- Ecommerce UX skill
- Responsive frontend QA skill
- Motion design skill
- Emil Kowalski / Animations on the Web skill
- Accessibility skill

If those skills are unavailable, still apply the research-backed principles above directly.

## Required Relume / Claude Design Workflow

Do the work in this order:

1. Read the codebase and asset manifests first.
2. Produce a short Bearded Genius Relume prompt, not more than 2-4 paragraphs, suitable for Relume Site Builder.
3. Produce a sitemap table before coding. Recommended pages/sections:
   - Home
   - Shop
   - Culture
   - Custom Threads
   - About
   - Contact
4. For every page/section, write a useful section title and section description. Relume uses these to influence wireframes, so do not leave vague labels like "content section" or "image block".
5. Create the design system before final UI:
   - colour tokens
   - type scale
   - spacing scale
   - buttons
   - product cards
   - media cards
   - drawer/sheet
   - mobile header
   - video sound controls
   - focus states
6. If using Relume, generate sitemap first, then wireframes, then style guide/design view, then export to Claude Design/React or implement into this Vite app.
7. After Relume/Claude Design, do a production pass in this codebase for real interactions, responsive tuning, media performance, motion, and QA.
8. End with a short owner handoff note explaining how to update products, images, videos, WhatsApp number, sizes, and availability in `src/data.ts`.

Required deliverables before or during implementation:

- Final Relume prompt
- Sitemap table with page goals and section descriptions
- Style guide tokens
- Asset placement plan using exact file paths
- Motion spec
- Responsive QA plan
- Implementation plan
- Then code changes

## Brand Context

Brand: Bearded Genius
Instagram: `https://www.instagram.com/bearded_genius/`
Bio from latest Instagram fetch: `0909-9-GENIUS (+234 9099436487) | Nigerian Made | Check out people in BG: @thebeardedgeniusway`
Positioning: Nigerian-made streetwear and lifestyle pieces, expressive prints, custom threads, culture-first fashion, WhatsApp reservations.

Important: this codebase must be Bearded Genius only. Do not use Lagos Sneaker Club copy, logo, product names, or LSC-facing sections in the live UI. Some downloaded files are marked reference-only because they include LSC crossover context. Do not render those publicly unless explicitly asked.

## Files To Read First

Read these before editing:

- `src/App.tsx`
- `src/data.ts`
- `src/styles.css`
- `README.md`
- `public/assets/bearded-genius/asset-manifest.json`
- `public/assets/bearded-genius/instagram-2026-06-09/bearded-genius-instagram-manifest.json`

Visual overview sheets:

- `public/assets/bearded-genius/instagram-2026-06-09/bearded-genius-live-contact-sheet.jpg`
- `public/assets/bearded-genius/instagram-2026-06-09/bearded-genius-reference-contact-sheet.jpg`

## Use These New Assets

Use these in the live UI:

```ts
const BG_IG_2026 = "/assets/bearded-genius/instagram-2026-06-09";

const liveMedia = {
  brand: `${BG_IG_2026}/images/brand/genius-in-the-making.jpg`,
  culture1: `${BG_IG_2026}/images/editorial/culture-lives-on-01.jpg`,
  culture2: `${BG_IG_2026}/images/editorial/culture-lives-on-02.jpg`,
  customThreads: `${BG_IG_2026}/images/editorial/custom-threads-guildford.jpg`,
  builtToStandOutVideo: `${BG_IG_2026}/videos/built-to-stand-out.mp4`,
  builtToStandOutPoster: `${BG_IG_2026}/posters/built-to-stand-out-poster.jpg`,
  afriJorts1: `${BG_IG_2026}/images/products/afri-jorts-01.jpg`,
  afriJorts2: `${BG_IG_2026}/images/products/afri-jorts-02.jpg`,
  shopSet1: `${BG_IG_2026}/images/products/shop-now-set-01.jpg`,
  shopSet2: `${BG_IG_2026}/images/products/shop-now-set-02.jpg`,
  shopSet3: `${BG_IG_2026}/images/products/shop-now-set-03.jpg`,
  shopSet4: `${BG_IG_2026}/images/products/shop-now-set-04.jpg`,
  buttonUp1: `${BG_IG_2026}/images/products/button-up-01.jpg`,
  buttonUp2: `${BG_IG_2026}/images/products/button-up-02.jpg`,
  buttonUp3: `${BG_IG_2026}/images/products/button-up-03.jpg`,
};
```

Reference-only media, not for live UI unless requested:

- `posters/lsc-bag-bg-reference-poster.jpg`
- `videos/lsc-bag-bg-reference.mp4`
- `posters/sneaker-saturday-bg-reference-poster.jpg`
- `videos/sneaker-saturday-bg-reference.mp4`
- `reference/lsc-context/shabang-lsc-context-*.jpg`

## Product / Data Improvements

Update `src/data.ts` so the media system is richer and easier to maintain:

- Keep `BRAND` accurate: Bearded Genius, `@bearded_genius`, WhatsApp `2349099436487`.
- Add a structured media object for the new Instagram assets.
- Give each product an image gallery, not just a single image.
- Suggested product/gallery mapping:
  - AFRI JORTS: `afriJorts1`, `afriJorts2`
  - BG Button-Up: `buttonUp1`, `buttonUp2`, `buttonUp3`
  - Statement Set: `shopSet1`, `shopSet2`, `shopSet3`, `shopSet4`
  - Custom Threads: `customThreads`, plus culture/editorial support
- Do not invent exact prices. Use copy like `Confirm on WhatsApp`, `Reserve`, or `Availability by request`.

## UI Direction

Make the site feel minimal, premium, and culture-led, not generic ecommerce.

Core experience:

- The site should feel like a real storefront from the first screen: brand, product, culture, WhatsApp conversion, and media should all be immediately visible.
- Avoid making only a static marketing landing page. Bearded Genius needs shop/reserve behavior, product galleries, culture/story, and custom-order inquiry.
- Design with a restrained editorial rhythm: strong product/campaign visuals, confident short copy, useful CTAs, and controlled whitespace.
- Use real Instagram content to make the site feel alive, but crop and sequence it intentionally.
- The style should be Nigerian-made streetwear/lifestyle: expressive, confident, crafted, and culture-led. It should not look like a generic fashion template.

Design system direction:

- Palette: ink black, warm off-white, chalk/stone neutral, subtle gold/cream or deep red accent only where useful.
- Typography: clean sans-serif for UI, optionally one refined display face for campaign headings if already available or easy to add without slowing the site.
- Components: sharp cards, 6-8px radius max, thin borders, no nested cards, no decorative gradient orbs.
- Imagery: use actual garments, people, details, and campaign shots. Do not use vague stock-like backgrounds.
- Layout: mobile-first, dense enough to feel like commerce, spacious enough to feel premium.

Home:

- First viewport should immediately communicate Bearded Genius: logo, Nigerian-made streetwear, real campaign imagery, and a clear WhatsApp/shop action.
- Replace the static hero image stack with a calm slideshow using the new images and `built-to-stand-out.mp4`.
- Add subtle progress indicators or small thumbnails for the hero media.
- Include a visible shop preview or direct product/reserve action above the fold.
- Keep the hero useful on mobile. No text should be hidden under the sticky header or clipped by viewport height.

Shop:

- Product cards should feel like premium editorial product cards.
- Add small image thumbnail controls or a gallery hover/slide interaction per product.
- Mobile: one column, roomy cards, no clipped buttons or text.
- Tablet: two columns.
- Desktop: three/four columns depending on available width.
- WhatsApp reservation drawer must still work.
- Size chips must have at least 40px touch targets.

Culture/About:

- Make culture feel deeper by using `culture-lives-on-01`, `culture-lives-on-02`, `genius-in-the-making`, and the video poster.
- Add an editorial rhythm: large image, short copy, smaller supporting images, maybe a horizontal media rail.
- Suggested copy themes: Nigerian made, expressive prints, custom threads, built to stand out, the way people wear BG.
- Avoid long marketing paragraphs. Use sharp, confident copy.

Custom:

- Make custom orders feel like a clear service flow: brief, quantity, deadline, WhatsApp.
- Use `custom-threads-guildford.jpg` as primary visual.

Contact:

- Keep WhatsApp as the primary conversion.
- Instagram should be secondary.
- Make phone display human-friendly: `0909-9-GENIUS` and `+234 909 943 6487`.

## Motion Direction: Emil Kowalski-Style Polish

Use motion deeply but quietly. The site should feel expensive, not noisy. Do not just say "use Emil Kowalski"; actually apply the principles.

Principles:

- Purpose first: every animation must clarify state, hierarchy, navigation, media change, or user feedback. Remove motion that only decorates.
- Fast UI timing: most interface transitions should be under 300ms. Marketing/media transitions can be slightly slower only when they are not blocking interaction.
- Easing: default to custom ease-out for entering/appearing UI because it starts responsive and settles smoothly. Use quick ease-in for exits when appropriate.
- Origin-aware UI: popovers, menus, thumbnail previews, and sheets should animate from their trigger/edge, not randomly from center.
- Transform/opacity first: use `translate`, `scale`, and `opacity` for animation. Do not animate layout properties like height, margin, padding, top/left unless there is a measured reason.
- Avoid `scale(0)`: when scaling an element in, start around `0.93-0.98` plus opacity so the motion feels natural.
- Interruptible states: hover, drawer, menu, slideshow controls, and product gallery transitions should not feel stuck if the user changes direction quickly.
- Press feedback: buttons and icon buttons should have a subtle active scale around `0.97`.
- Cards: tiny pointer hover lift/image scale only on hover-capable devices; touch devices should not depend on hover reveals.
- Drawer/mobile menu: scrim fade, panel slide, edge-aware transform, and native-feeling easing. A good drawer curve to test is `cubic-bezier(0.32, 0.72, 0, 1)`.
- Hero media transitions: crossfade + slight scale drift, but keep text readable and never make the primary CTA move away from the user.
- Section reveals: use very light opacity + translateY reveals, staggered sparingly. Do not animate every block aggressively.
- Review animations slowed down mentally: if an animation looks strange in slow motion, adjust easing/origin/duration.
- Respect `prefers-reduced-motion: reduce`; disable slideshow drift/ken-burns, remove parallax, and keep only essential opacity changes.
- Performance: animations should remain smooth while media is loading. Prefer CSS transitions/animations or WAAPI over JS loops where possible.
- Do not add decorative gradient orbs, bokeh blobs, noisy parallax, overdone glassmorphism, or cartoon bounce.

Suggested token names:

```css
--ease-out-strong: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-soft: cubic-bezier(0.32, 0, 0.67, 0);
--ease-sheet: cubic-bezier(0.32, 0.72, 0, 1);
--duration-fast: 160ms;
--duration-ui: 240ms;
--duration-sheet: 420ms;
--duration-media: 620ms;
```

If adding video sound:

- Videos should autoplay muted only.
- Add a small YouTube-style mute/unmute toggle.
- Only one video may be audible at a time.
- Button must be at least 44px, have `aria-label`, and not trigger parent links.

## Responsive QA Requirements

Test at:

- 390px mobile
- 430px mobile
- 768px tablet
- 1024px small laptop
- 1360px or 1440px desktop

Must pass:

- `document.documentElement.scrollWidth <= window.innerWidth` on every page/section.
- No product card clipping.
- No overlapping text/buttons/images.
- Sticky header does not cover section starts.
- Drawer and mobile menu are usable on phone.
- Video controls are reachable on mobile.
- All primary controls should be at least 40px tall, with 44px preferred for mobile icon buttons and floating controls.
- Text must not scale with viewport width. Use responsive layout and clamped widths, not `vw` typography.
- Use stable dimensions/aspect ratios for product cards, hero media, media rails, and video blocks to prevent layout shift.
- All images and videos load from `/assets/bearded-genius/...`.
- No visible Lagos Sneaker Club / LSC copy in the rendered UI.
- No console errors.

## Implementation Standards

- Keep this as a Vite + React + TypeScript app.
- Prefer existing structure unless a small component extraction makes the code cleaner.
- Use `lucide-react` for icons.
- If adopting Relume React components, adapt them to this Vite app instead of replacing the whole project structure unless clearly necessary.
- Keep data owner-friendly. Products, media, statuses, sizes, and WhatsApp number should be easy to edit in `src/data.ts`.
- Keep cards at 8px radius or less.
- Do not nest cards inside cards.
- Do not make a marketing landing page only; keep the site usable as a storefront.
- Add accessible alt text for every image.
- Use semantic sections and clear labels.
- Keep generated code maintainable for future stock/media updates.
- Optimize media: lazy-load below-fold images, set width/height or aspect ratio, use poster images for videos, avoid autoplaying heavy videos outside the first meaningful viewport.
- Do not invent exact prices, delivery promises, return policies, or authenticity guarantees unless confirmed by the business owner.

## Verification Commands

Run:

```bash
npm run build
npm run dev
```

Then manually inspect the local site. Confirm:

- The Relume prompt/sitemap/style-guide plan is reflected in the final implementation.
- Hero slideshow/video works.
- Product image galleries work.
- Reserve bag works and WhatsApp message is correct.
- Mobile menu works.
- Contact links work.
- No broken media.
- No horizontal overflow at the viewport sizes above.
- No LSC text in the public Bearded Genius UI.
- No console errors after a cold reload.

## Final Response Needed

When done, summarize:

- Which Relume/Claude Design workflow decisions were used.
- Which Emil Kowalski-style motion principles were actually implemented.
- Files changed.
- New components/data structures added.
- Which Instagram assets were wired into the UI.
- Build result.
- Responsive QA result.
- Anything still needed from the business owner, such as exact prices, policies, delivery info, or more product photos.
