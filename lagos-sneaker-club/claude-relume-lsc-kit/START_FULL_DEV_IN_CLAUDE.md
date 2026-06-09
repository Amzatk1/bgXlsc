# Paste This Into Claude To Start Full Dev

I am uploading a folder called `claude-relume-lsc-kit`. Use it as the full source package for a premium Lagos Sneaker Club website.

Read these files first:
- `README.md`
- `PROMPT_FOR_CLAUDE.md`
- `ASSET_MANIFEST.md`
- `asset-manifest.json`
- `RESEARCH_NOTES.md`
- `RELUME_SITEMAP_PROMPT.txt`

Main objective: create a world-class, minimal ecommerce and culture website for Lagos Sneaker Club only. Do not make a dual-brand site. Do not include Bearded Genius as a brand, nav item, page, product category, collaborator, or visual identity. If old Instagram images contain legacy Bearded Genius email text inside the image, treat it as image-only historical content and do not repeat it in live site copy.

Use the assets inside `assets/`:
- Use `assets/logo/lsc-profile-logo.jpg` as the logo.
- Use the brand, event, product, and video folders for the homepage slideshow, shop, culture pages, stock-with-us page, and visit-store sections.
- Use `ASSET_MANIFEST.md` and `asset-manifest.json` as the source of truth for file paths.

Use this workflow:
1. Start by turning `PROMPT_FOR_CLAUDE.md` into a concise Relume prompt.
2. Create the Relume sitemap first.
3. Define strong section names and section descriptions for every page.
4. Generate wireframes in Relume.
5. Use Relume Style Guide / Design View for the visual system.
6. After Relume, implement or specify the production frontend with custom animations, slideshow/video handling, shop/reserve behavior, mobile polish, and performance tuning.

If you have access to a Relume, website IA, ecommerce UX, motion-design, or Emil Kowalski / Animations on the Web skill, use the best relevant skill. If an Emil Kowalski skill is not available, still apply the motion principles: calm timing, natural easing, purposeful transitions, hover states that clarify actions, spring-like drawers, reduced-motion support, and performance-safe transforms/opacity.

Required pages:
- Home
- Shop
- Events & Culture
- Stock With Us
- Visit Ikoyi
- About
- Contact

Required ecommerce behavior:
- Shop filters for brand, category, size, condition, and availability.
- Product cards with image, name, condition, sizes, and `Reserve on WhatsApp`.
- Do not invent fake prices. Use `Confirm price on WhatsApp` until real inventory/prices are supplied.
- Include a reserve/cart drawer that can build a WhatsApp message.
- Seed the shop with the sneaker placeholders listed in `PROMPT_FOR_CLAUDE.md`.

Homepage requirement: the first screen must feel like the real product, not a marketing splash page. It should show Lagos Sneaker Club, sneaker culture in Lagos, a premium image/video slideshow, featured drops, and direct shopping/reserve actions immediately.

Visual direction: minimal editorial retail. Black, white, charcoal, concrete grey, one strong red accent from the LSC poster, circular logo, refined serif display moments, clean sans-serif UI, sharp product cards, 6-8px radii, generous whitespace, and no generic streetwear clutter.

Deliverables:
1. Final Relume prompt ready to paste.
2. Sitemap table with pages, page goals, and section plans.
3. Homepage wireframe brief.
4. Shop wireframe brief and reserve flow.
5. Style guide with colors, typography, spacing, buttons, cards, and image treatment.
6. Motion spec for slideshow, hover states, section reveals, media rail, drawer/cart, and reduced motion.
7. Asset placement plan using exact local file paths.
8. Implementation plan for the production frontend.
9. Then build the full site/codebase based on the approved plan.

Before coding, call out any missing inputs that affect production quality, especially real inventory, prices, size availability, payment method, shipping/returns/authenticity policies, final WhatsApp number, domain, and confirmed contact email. Make reasonable placeholders for the first build, but label anything that needs client confirmation.
