# Prompt For Claude: Lagos Sneaker Club Relume Website

You are a senior brand strategist, UX architect, ecommerce designer, and motion-focused design engineer. I want you to help me use Relume to create a world-class, minimal website for Lagos Sneaker Club only.

Before producing the final answer, research or reason through the best workflow for using Relume: sitemap first, page sections second, wireframes third, style guide/design view fourth, then export to Figma/Webflow/React for final animation and ecommerce details. If you have access to any Claude skill for Relume, website IA, ecommerce UX, motion design, or an Emil Kowalski / Animations on the Web skill, use the best relevant skill. If an Emil Kowalski skill is unavailable, still apply public motion-design principles inspired by his design-engineering approach: subtle timing, natural easing, spring-like feel, purposeful hover states, clean transitions, no gratuitous movement, reduced-motion support, and high performance.

## Brand

Brand name: Lagos Sneaker Club  
Instagram: `@lgssnkrclub`  
Category: sneaker retail, consignment/stocking, Lagos sneaker culture, community events, physical retail space  
Location: 73 Ademola St, Ikoyi, Lagos 106104  
Hours: Monday-Saturday 12pm-6pm, Sunday 12pm-4pm  
Primary contact: WhatsApp `+234 913 002 3762`  
Instagram bio direction: "A Hub For Culture"  

Important: remove Bearded Genius from the website. Do not include Bearded Genius as a brand, nav item, page, product category, collaborator, product line, or visual identity. Some original LSC Instagram images contain legacy text like `LSC@BEARDEDGENIUS.ORG`; treat that only as part of the image and do not repeat it in live site copy unless the client confirms it.

## Assets To Use

Use local files from the attached `claude-relume-lsc-kit` folder:

Logo:
- `assets/logo/lsc-profile-logo.jpg`

Brand / editorial hero references:
- `assets/images/brand/01-calling-african-brands.jpg`
- `assets/images/brand/02-open-everyday.jpg`

Events and culture:
- `assets/images/events/01-partner-with-us.jpg`
- `assets/images/events/02-rasta-roast-community.jpg`
- `assets/images/events/03-sneaker-saturday-winners.jpg`

Product / commerce / lifestyle:
- `assets/images/products/01-lavcore-denim-crocs.jpg`
- `assets/images/products/02-whats-in-my-lsc-bag.jpg`
- `assets/images/products/03-1k-sneaker-saturday-fit.jpg`
- `assets/images/products/04-culture-fit.jpg`
- `assets/images/products/05-clue-4.jpg`
- `assets/images/products/06-clue-3.jpg`

Videos for slideshow / reels / motion sections:
- `assets/videos/01-rasta-roast-iv-sneakerhead-edition-good-fo.mp4`
- `assets/videos/02-bornstarng-really-said-hold-my-beer-you-re.mp4`
- `assets/videos/03-it-s-almost-time-let-the-countdown-begin-c.mp4`
- `assets/videos/04-we-told-you-to-keep-an-eye-out-hmm-were-yo.mp4`

Use `ASSET_MANIFEST.md` and `asset-manifest.json` as the final source of truth for asset paths if any filename differs.

Use the attached Instagram screenshots as mood references too: monochrome LSC store posters, huge serif typography, red partner/event poster, circular LSC logo, and a store interior with hanging sneakers.

## Strategic Goal

Create a premium website that makes Lagos Sneaker Club feel like the most credible sneaker culture hub in Lagos: a place to buy/reserve sneakers, visit in Ikoyi, join sneaker events, stock products, and understand Lagos sneaker culture.

The homepage must not be a generic marketing landing page. It should feel like a real retail UI from the first viewport: product browsing, culture imagery, a slideshow/video moment, and clear CTAs. It should immediately communicate what LSC is: sneakers, culture, Lagos, store, community.

## Visual Direction

Make it minimalist, editorial, and high-end.

Use:
- black, white, charcoal, soft off-white, concrete grey
- one strong LSC red accent inspired by `assets/images/events/01-partner-with-us.jpg`
- circular LSC logo
- refined serif display type for editorial statements such as "A Hub For Culture", "Open Everyday", "Lagos Sneaker Club"
- clean sans-serif UI for navigation, filters, cards, buttons, labels
- large image/video panels
- controlled whitespace
- product cards that feel like a premium sneaker store, not a dropshipping template
- thin borders, 6-8px radius, no bubbly rounded card-heavy design

Avoid:
- Bearded Genius branding
- purple/blue gradients
- beige-only palettes
- hypebeast clutter
- generic stock imagery
- giant hero with no shopping UI
- text explaining animations or how to use the site
- decorative pills/badges unless they serve a real UI function
- fake metrics or fake awards

## Animation Direction

Design the site with motion specifications that can be implemented after Relume export.

Use:
- homepage slideshow with images and short muted video clips
- slow image crossfades or masked slide transitions
- vertical or horizontal editorial carousel for LSC culture moments
- product-card hover: image scale 1.02, quick add reveal, size chips reveal
- nav hover: minimal underline/opacity transition
- cart drawer or WhatsApp checkout drawer: spring-like slide, 280-360ms
- section reveals: opacity + y translation only, staggered lightly
- scrolling media rail: smooth, drag/swipe enabled
- reduced-motion fallback: no parallax, no autoplay movement, static poster images

Motion rules:
- Motion must clarify hierarchy or state, not decorate.
- Prefer transforms and opacity for performance.
- Keep most transitions 180-360ms.
- Use ease-out or spring-like easing; avoid bouncy cartoon movement.
- Never animate large text in a way that reduces readability.
- Keep videos muted, compressed, lazy-loaded, and with poster frames.

## Pages And Sitemap

Create this sitemap in Relume:

1. Home
2. Shop
3. Events & Culture
4. Stock With Us
5. Visit Ikoyi
6. About
7. Contact

Global nav:
- Shop
- Events
- Visit
- Stock With Us
- About
- WhatsApp CTA

Footer:
- Lagos Sneaker Club logo
- Address and hours
- Instagram link
- WhatsApp contact
- Shop links
- Events links
- Stock With Us

## Page Requirements

### Home

Purpose: introduce LSC as a sneaker retail and culture hub in Lagos while immediately showing a usable store UI.

Sections:
1. Sticky minimal header with LSC logo, nav, search icon, bag icon, WhatsApp CTA.
2. First viewport: editorial retail split with slideshow/video panel and shop UI. Include headline like "Lagos Sneaker Club is a hub for sneaker culture." Use `Open Everyday`, `Calling African Brands`, and product/community clips as the rotating visual system.
3. Featured drops: sneaker product cards with filters preview.
4. Culture in Lagos: explain sneaker Saturdays, events, community, store energy.
5. Visit the Ikoyi space: address, hours, map CTA, store photos.
6. Stock with us: African brands, fashion, accessories, lifestyle products can enquire to stock at LSC.
7. Instagram/editorial wall: grid or slideshow using local images/videos.
8. Final CTA: WhatsApp, visit store, shop drops.

Homepage above-the-fold copy options:
- `Lagos Sneaker Club`
- `A hub for sneaker culture in Lagos.`
- `Shop drops, reserve pairs, visit the Ikoyi space, and pull up for community events.`
- CTAs: `Shop sneakers`, `WhatsApp us`, `Visit Ikoyi`

### Shop

Purpose: make it feel like customers can actually buy/reserve sneakers.

Include:
- category filters: New drops, Nike, New Balance, Adidas, Asics, Converse, Accessories
- size filters: UK 6-12
- condition filters: New, Used, Consignment
- product cards with image, name, condition, size availability, price placeholder, reserve button
- sticky cart or reserve drawer
- WhatsApp checkout flow
- note that inventory/prices must be confirmed by store staff

Use this starter inventory as editable placeholders until real stock/prices are confirmed:
- Nike Dunk Low Retro "Panda" - New - UK 7-11 - reserve
- New Balance 550 White/Green - New - UK 6-10 - reserve
- Adidas Campus 00s Green/Cloud White - New - UK 7-12 - reserve
- Asics Gel-Kayano 14 Cream/Black - New - UK 6-11 - reserve
- Nike Air Max 1 '87 Wheat - New/Consignment - UK 7-10 - reserve
- Converse Chuck 70 Black - New - UK 6-12 - reserve
- New Balance 2002R Protection Pack Grey - Consignment - UK 8-11 - reserve
- Nike Air Force 1 '07 White - New - UK 6-12 - reserve
- Lavcore Denim Crocs - Nigerian-made/custom - reserve

If prices are not provided, use `Confirm price on WhatsApp` or `Reserve on WhatsApp`, not fake prices.

### Events & Culture

Purpose: show LSC as a Lagos sneaker culture space.

Include:
- hero using `assets/videos/02-rasta-roast-iv...` or `assets/images/events/02-rasta-roast-community.jpg`
- event cards: Sneaker Saturday, Rasta Roast, Creator Days, Pop-ups
- RSVP CTA
- slideshow of community videos/images

### Stock With Us

Purpose: convert African fashion/accessory/lifestyle brands into stocking enquiries.

Use the "Calling African Brands" and "Partner With Us" assets.

Copy:
- `Stock your items with us.`
- `For African fashion, accessories, beauty, skincare, home decor, and lifestyle brands ready to meet Lagos sneaker culture.`
- CTA: `Start a stocking enquiry`

Do not repeat `LSC@BEARDEDGENIUS.ORG` as live text unless confirmed. Use WhatsApp or a neutral placeholder email such as `hello@lagossneakerclub.com` only if the client confirms.

### Visit Ikoyi

Purpose: physical store confidence.

Include:
- address
- hours
- store imagery
- map embed placeholder
- directions CTA
- WhatsApp CTA

### About

Purpose: brand story.

Include:
- "A Hub For Culture"
- LSC as a sneaker community, retail space, consignment channel, and Lagos creative meeting point.
- Keep copy short and confident.

### Contact

Purpose: simple conversion.

Include:
- WhatsApp
- Instagram
- Address
- Hours
- Contact form fields: name, phone/email, reason, message
- Reason options: Buy sneakers, Stock products, Book event, Visit store, Other

## Relume Execution Instructions

1. First generate a concise Relume prompt from this brief.
2. Then generate the sitemap with page names and section descriptions.
3. Make sure every page section has a useful section prompt, because Relume uses section titles/descriptions to influence wireframes.
4. Generate wireframes from the sitemap.
5. Use Relume Style Guide / Design View for:
   - black/white/charcoal base
   - red accent
   - serif display headings
   - clean sans-serif UI
   - minimal product cards
6. Export to Figma/Webflow/React for final polish:
   - custom slideshow/video behavior
   - hover states
   - cart/reserve drawer
   - exact image crops
   - mobile tuning
   - performance optimization

## Deliverables I Want From You

Return:

1. A final concise Relume prompt ready to paste.
2. A sitemap table with pages, purpose, and sections.
3. A homepage section-by-section wireframe brief.
4. A shop page wireframe brief with ecommerce behavior.
5. A style guide: colors, typography, spacing, buttons, cards, image treatment.
6. Motion spec: slideshow, hover, section reveal, drawer/cart, video rules.
7. Asset placement plan using the exact local file paths.
8. Implementation notes for Webflow/React after Relume export.
9. Quality checklist for "world-class" before handoff.

## Quality Bar

This should feel like a world-class sneaker culture website in Lagos: editorial, minimal, useful, image-led, and commercially credible. The user should instantly understand:

- LSC sells/reserves sneakers.
- LSC is in Ikoyi, Lagos.
- LSC hosts community/culture events.
- Brands can stock with LSC.
- Customers can contact via WhatsApp.

If any section feels generic, remove it or rewrite it.
