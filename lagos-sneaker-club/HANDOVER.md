# Lagos Sneaker Club — Owner Handover Guide

This site is built so **you can update stock, photos, videos, events, hours and contact
details yourself — no code, no developer.** You do it from a simple admin panel (Sanity
Studio). When you click **Publish**, the website updates within about a minute.

If no CMS is connected yet, the site still runs on the built-in sample content — nothing
breaks. Follow "One-time setup" to switch it on.

---

## 1. One-time setup (do this once)

A developer (or you) connects the admin panel:

1. Create a free Sanity account at https://www.sanity.io and a project (note the **Project ID**).
2. In the `studio/` folder: `cp .env.example .env`, paste the Project ID, then
   `npm install` and `npm run deploy`. You'll get an admin link like
   `https://lagos-sneaker-club.sanity.studio`.
3. In the website host (Vercel), add two settings and redeploy:
   - `VITE_SANITY_PROJECT_ID` = your Project ID
   - `VITE_SANITY_DATASET` = `production`
4. In Sanity → **API → CORS origins**, add your website address.

After this, the website shows whatever you publish in the admin panel.

> Full technical detail is in `studio/README.md` and `CMS_PLAN.md`.

---

## 2. Logging in

Open your admin link (the `…sanity.studio` URL) and sign in with the email you used for
Sanity. You'll see four sections: **Products**, **Videos & media**, **Events**, and
**Store settings**.

---

## 3. Add a new sneaker

1. Click **Products → Create new**.
2. Fill in:
   - **Brand**, **Model** (e.g. "Dunk Low Retro"), **Colorway** (e.g. "Panda — Black/White").
   - **Type** (Low-top, Runner, etc.), **Condition**, **Availability**.
   - **Sizes** → "Add item" for each UK size; tick **Available**, or tick **Sold out**.
   - **Price display**:
     - *Confirm on WhatsApp* (default) → the card shows "On request".
     - *Show fixed price* → type the price in ₦.
     - *Hide price* → no price shown.
   - **Photos** → upload one or more (the first is the card image). Add **alt text**.
     No photo yet? Leave it empty — the site shows a clean editorial placeholder tile.
   - Optional: **Badge** ("New drop", "Made in Lagos"…), **Featured** (see §6), **Origin note**.
3. Make sure **Published** is on.
4. Click **Publish**. The pair appears on **/shop** (and the homepage if Featured).

## 4. Mark sizes sold out

Open the product → **Sizes** → tick **Sold out** on the size(s) → **Publish**. Sold-out
sizes show struck-through on the website. To remove a size entirely, delete that row.
To mark the whole pair gone, set **Availability** appropriately or untick **Published**.

## 5. Upload a new video (or image) to the homepage / feed

1. **Videos & media → Create new**.
2. Set **Type** = Video (or Image), **Where it appears**:
   - *Homepage slideshow* — the big hero rotation.
   - *Media rail* — the swipeable "from the feed" strip.
3. Upload the **Video file (mp4)** + a **Poster image** (the still shown before it plays),
   or an **Image**. Add a **Caption** and an optional **Links to** (e.g. the Instagram post).
4. **Publish.** Videos autoplay muted; visitors can tap the speaker icon to hear sound.

## 6. Show a product on the homepage

Open the product → turn on **Show on homepage (Featured drops)** → **Publish**. The
homepage shows the featured pairs. Use **Sort order** (lower number = shown first) to order them.

## 7. Update WhatsApp number, hours, address, announcement

**Store settings** (single page):
- **WhatsApp number (digits only)** — powers every "WhatsApp / Reserve" button.
- **WhatsApp number (shown)** — the pretty version displayed on the site.
- **Instagram, address, map links.**
- **Opening hours** + **Hours summary** — drives the "Open now / Opens 12pm" banner.
- **Announcement bar text** — leave empty to auto-show open/closed; fill it to pin a message
  (e.g. "Sneaker Saturday this weekend 🔥").
- **SEO title / description.**

Click **Publish** — the whole site updates.

## 8. How publishing works

Edits are saved as drafts as you type. Nothing is live until you press **Publish**. After
publishing, allow up to ~1 minute for the website's cache to refresh.

## 9. What not to touch

- Don't change a product's **slug** after it's shared/linked unless you mean to.
- Don't delete **Store settings** — there should always be exactly one.
- Don't edit the website code in `src/` for routine content — that's what the admin is for.
- Keep at least one photo's **alt text** filled (good for accessibility + SEO).

---

## 10. Where things live

- **Website code + hosting:** Vercel (auto-deploys from the repo).
- **Content (this admin):** Sanity.
- **Reservations & orders:** WhatsApp (the site builds the message; you confirm price,
  size and pickup/delivery in chat).

## 11. Later: real online checkout (Shopify)

This site is built for **browse + reserve over WhatsApp**, which suits LSC today. If you
later want **real online payments, carts and automatic inventory**, add **Shopify** for the
shop:

- Shopify properly handles product **variants** (sizes), **inventory counts**, checkout and payments.
- Keep **Sanity** for editorial content (videos, events, homepage, store info).
- The product card + reserve flow can be repointed to Shopify's Storefront API; the rest of
  the site stays as-is.

Recommendation: **Sanity now** (content + WhatsApp reserve). **Shopify later** only if/when
you want on-site payment and live inventory.
