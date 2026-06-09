# Lagos Sneaker Club — Sanity Studio

The admin panel where the store owner edits products, media, events and settings.
The website reads this content; **no code changes are needed to update stock.**

## First-time setup (once)

1. Create a free Sanity project + get a project id:
   ```bash
   npm create sanity@latest -- --project-id "" --dataset production
   ```
   Or sign in at https://www.sanity.io/, create a project, and copy its **Project ID**.
2. In this `studio/` folder:
   ```bash
   cp .env.example .env        # then paste your project id into .env
   npm install
   npm run dev                 # opens the Studio at http://localhost:3333
   ```
3. Deploy a hosted Studio the owner can log into from anywhere:
   ```bash
   npm run deploy              # gives you https://<name>.sanity.studio
   ```

## Connect the website

In the main site, set these env vars (locally in `.env`, and in Vercel project settings):

```
VITE_SANITY_PROJECT_ID=<same project id>
VITE_SANITY_DATASET=production
```

Add API CORS origins in Sanity (Project → API → CORS origins) for your site URL and
`http://localhost:5173`. The site reads **published** documents over the public CDN.

## Content types

- **Products** — sneakers/stock: brand, model, colourway, sizes (available / sold out),
  condition, availability, price mode, photos, video, badge, featured, sort order.
- **Videos & media** — homepage slideshow + media-rail items (image or video, poster, caption, link).
- **Events** — community programme.
- **Store settings** — WhatsApp number, Instagram, address, opening hours, announcement, SEO.

See `../HANDOVER.md` for the plain-English owner guide.
