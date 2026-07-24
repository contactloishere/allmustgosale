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

## Round 7 updates
- [x] Error alert copy softened ("must have been a glitch or something :)")
- [x] Success alert copy now says Lois will reach out via their chosen platform,
      not specifically Threads
- [x] Preferred-platform note copy simplified (no em dash, no emoji)
- [x] **Likely fix for the Telegram ping**: added `package.json` with
      `"type": "module"` at the project root. Without this, Vercel may have
      been treating `api/notify-order.js`'s modern `export default` syntax as
      invalid, causing the function to fail silently every time (order still
      saves either way since that part is separate) — this should resolve it

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

## Round 8 updates
- [x] Fixed browser tab title + link preview (og:title/og:description) to
      "Lois Torre's Clearance Sale" — this is what shows when the link is
      shared in iMessage/Threads/etc.
- [x] Checkout note moved to appear right after "Preferred platform for
      updates," before the handle/number field
- [x] Handle/number field now adapts automatically to the selected platform:
      Threads/Instagram require a leading "@"; iMessage/WhatsApp/Viber accept
      digits only, capped at 11, with the label and placeholder updating to match
- [x] Subtitle copy updated again (single paragraph) and its font now matches
      the footer's monospace font
- [x] Footer copy simplified (no em dash)

## Round 9 updates
- [x] Optional strikethrough "original price" next to the current price —
      see `supabase-schema-update-4.sql` (adds `original_price` to `products`)
- [x] Only shows when `original_price` is set and higher than `price` —
      leave it blank for anything that isn't discounted

## Round 10 updates — Product variants
- [x] Optional variants per product — see `supabase-schema-update-5.sql`
      (new `product_variants` table: variant name, its own photo, its own
      stock count, plus a `record_variant_sale()` function)
- [x] A product with zero variant rows behaves exactly as before (no dropdown,
      stock/sold-out tracked on the product itself)
- [x] A product WITH variants: the carousel pools the product's own photos
      together with every variant's photo into one swipeable gallery; a
      dropdown below the description lists each variant with its stock
      status (e.g. "Citrus (Sold out)"); picking one jumps the carousel to
      that variant's photo and updates the "Only X left"/"X sold" line to
      that specific variant
- [x] Add to Cart is disabled until a variant is picked (for variant products),
      and disabled again if the picked variant is sold out
- [x] Cart, checkout, Supabase orders, stock-recording, and the Telegram
      ping all correctly track which variant was ordered (shown as
      "Product Name — Variant Name")
- [x] Card-level "SOLD OUT" badge only shows once ALL variants are sold out;
      individual sold-out variants are just disabled in the dropdown until then

## How to add variants to a product
In Supabase → Table Editor → `product_variants` → Insert row:
- `product_id`: the parent product's ID (from the `products` table)
- `variant_name`: e.g. "Lavender"
- `image_url`: that variant's own Cloudinary photo
- `stock_quantity`: leave blank to not track stock for that specific variant
- `display_order`: optional, lower numbers show first

## Round 11 updates
- [x] Cart now persists through a page refresh (saved locally in the browser,
      no login required) — this solves the "refreshed and lost my cart" issue
      without needing OAuth/accounts, which is a separate, bigger feature for
      a different problem (returning customers skipping re-entering info)
- [x] Cart drawer now shows a clear "Items subtotal (N items): ₱X" line right
      after the item list, before the checkout form starts, plus each line
      item now shows its own "₱X each · Subtotal: ₱Y" for larger multi-item carts

## Round 12 updates
- [x] Name, address, contact number, preferred platform, and handle/number
      are now remembered locally (same trick as the cart) — returning to the
      site later has these pre-filled, so repeat customers don't retype
      everything. Doesn't carry across devices (that would need the login/
      OAuth feature discussed earlier) — just saves typing on the same phone/browser

## Round 13 updates
- [x] Fixed: variant products now show the total "X sold" count (summed
      across all variants) right away, not just after picking one — matches
      how non-variant products already behaved
- [x] Replaced "tap photo opens full-res in a new tab" with a proper
      fullscreen swipeable lightbox: tap any photo, it opens large with the
      same dot indicators, swipe through the rest without closing and
      reopening — close via the × or tapping outside the photo
