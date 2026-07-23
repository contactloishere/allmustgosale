# All Must Go — Mike Charlie Co. Threads-exclusive sale

## Status: Stage 5 complete ✅ (Stage 4 finished + mobile fix + stock/category features)

**Stage 1 — Storefront grid + swipeable gallery**
- [x] Responsive grid: 2 columns on mobile, 2 on tablet, 3 on desktop
- [x] Swipeable photo carousel per product, dot indicators, tap-to-zoom (opens full-res in new tab)
- [x] Price shown as a hang-tag style label
- [x] Title in Playfair Display: "Lois T.'s Clearance Sale" + personal subtitle copy
- [x] Descriptions render as bullets with a "See more"/"See less" toggle

**Stage 2 — Cart, checkout form, shipping calculator**
- [x] Floating cart button, drawer, quantity controls
- [x] Checkout form: name, address, contact, shipping region
- [x] Shipping calculator using the full J&T/SPX rate table (Maxim excluded)
- [x] "To be confirmed" note + copy for carts over 5kg
- [x] Payment method dropdown (GCash, BDO, GoTyme, Maribank, CIMB Bank) → shows matching QR code

**Stage 3 — Supabase (real data)**
- [x] `products` and `orders` tables, Row Level Security configured
- [x] Storefront fetches real products; `data/products.js` is fallback only

**Stage 4 — Cloudinary upload + Telegram notification** ✅ NOW COMPLETE
- [x] Proof-of-payment file uploads directly to Cloudinary on submit (`js/cloudinary-client.js`)
- [x] Order is saved to Supabase with the real `proof_url`
- [x] `api/notify-order.js` — a Vercel serverless function that pings your Telegram bot
      with the full order details (name, contact, address, region, payment method,
      items, totals, proof link) — the bot token stays secret via a Vercel
      environment variable, never exposed in the website code
- [ ] **Action needed from you:** add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`
      as Environment Variables in your Vercel project settings (see below),
      otherwise the Telegram ping will silently fail (the order still saves either way)

**Stage 5 — Stock tracking, sold count, categories**
- [x] `stock_quantity`, `units_sold`, `category` columns added to `products`
      (see `supabase-schema-update-2.sql`)
- [x] "SOLD OUT" badge + disabled Add to Cart button when stock hits 0
- [x] "Only X left" urgency text when stock is low (≤3), "X sold" counter —
      both shown only when there's something to say
- [x] `record_sale()` database function safely updates stock/sold count on every
      order — runs automatically, no manual step needed per order
- [x] Category filter buttons below the subtitle: All Items, Preloved Finds,
      Clearance Sale, Soaps, Sold Out — filters the grid instantly, no page reload
      (this is a filter over all loaded products, not paginated infinite scroll —
      fine for a product count in the dozens; worth revisiting only if the
      catalog grows very large)

## ACTION NEEDED — one-time setup for this round
1. Run `supabase-schema-update-2.sql` in Supabase → SQL Editor
2. In Vercel: your project → **Settings** → **Environment Variables** → add:
   - `TELEGRAM_BOT_TOKEN` = (the token from BotFather)
   - `TELEGRAM_CHAT_ID` = (your chat ID)
   Then go to **Deployments** → click the ⋯ on the latest one → **Redeploy**
   (env vars only take effect after a redeploy)
3. Per product in Supabase Table Editor, optionally set:
   - `stock_quantity` (leave blank to not track stock for that item)
   - `category` — use exactly `preloved`, `clearance`, or `soaps` to match
     the filter buttons (anything else just won't match a button, harmless)

## Not built yet / discussed, not started
- Star ratings + testimonials per product (see chat discussion — needs its own
  small public form + a moderation step before reviews go live)
- Customer login/saved address (intentionally deferred — noted as a "maybe later")

## Live site
https://allmustgosale.vercel.app

## How to preview locally
Open `index.html` in a browser — no build step, no dependencies.

## Round 6 updates
- [x] Subtitle copy updated (minimalism/simple-living framing) — two paragraphs now
- [x] Low-stock urgency threshold widened from ≤3 to ≤5 units
- [x] New checkout fields: "Preferred platform for updates" (Threads/iMessage/
      WhatsApp/Viber/Instagram) + their handle/number on that platform —
      see `supabase-schema-update-3.sql` (adds `contact_platform`, `contact_handle`
      to the `orders` table) — also included in the Telegram ping
- [x] Every checkout field is now marked required with an asterisk
- [x] Submit button stays grayed out and disabled until every required field
      is filled in — colorizes automatically the moment the form is valid

## ACTION NEEDED for this round
1. Run `supabase-schema-update-3.sql` in Supabase → SQL Editor
2. Re-upload files to GitHub as usual
3. Still pending: confirm Telegram env vars are checked for "Production" in
   Vercel, and check the Vercel function logs if the ping still doesn't fire
