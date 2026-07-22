# All Must Go — Mike Charlie Co. Threads-exclusive sale

## Status: Stage 3 complete ✅ + design/copy polish + payment method QR flow

**Stage 1 — Storefront grid + swipeable gallery**
- [x] Product grid, mobile-first, responsive (1 col mobile → 2 → 3 col desktop)
- [x] Swipeable photo carousel per product (touch drag, works with 1–5 images)
- [x] Dot indicators (only shown when a product has >1 image)
- [x] Tap/click a photo → opens full-res image in a new tab (ready for real Cloudinary URLs)
- [x] Price shown as a hang-tag style label (signature design element)
- [x] Title in Playfair Display: "Lois T.'s Clearance Sale" + personal subtitle copy
- [x] Product descriptions render as a bulleted list, showing the first 2 bullets
      with a "See more" / "See less" toggle for the rest — separate bullets in
      Supabase with a line break in the `description` field

**Stage 2 — Cart, checkout form, shipping calculator**
- [x] Floating cart button with live item count
- [x] Cart drawer: view items, adjust quantity, remove
- [x] Checkout form: name, address, contact number, shipping region
- [x] Shipping calculator using the full J&T/SPX rate table (Maxim excluded)
- [x] Live-updating subtotal / shipping / total as region or cart changes
- [x] "To be confirmed" manual-quote note + copy for carts over 5kg
- [x] Preferred mode of payment dropdown (GCash, BDO, GoTyme, Maribank, CIMB Bank)
      → shows the matching QR code image, positioned right before the
      proof-of-payment upload — see `data/payment-methods.js`

**Stage 3 — Supabase (real data)**
- [x] `supabase-schema.sql` — run once to create `products` and `orders` tables
- [x] `supabase-schema-update-1.sql` — adds the `payment_method` column
      (run this too — it's a small follow-up to the original schema)
- [x] Storefront fetches real products from Supabase; `data/products.js` is
      now just a fallback if the real table is empty/unreachable
- [x] Checkout submit writes a real row to `orders`, including payment method

## Not built yet (next stage)
- Stage 4: Cloudinary upload widget for proof-of-payment (currently the file
  picker exists but the file isn't uploaded anywhere — `proof_url` stays empty),
  and the Telegram bot ping whenever a new order comes in

## One-time setup needed
1. Run `supabase-schema.sql` in Supabase → SQL Editor (done ✅)
2. Run `supabase-schema-update-1.sql` too (adds payment_method column)
3. Add real products via Supabase → Table Editor → `products` table
   (Cloudinary image URLs go in `image_url_1` through `image_url_5`;
   separate description bullets with a line break)

## Live site
https://allmustgosale.vercel.app — auto-redeploys a minute or two after
every GitHub upload.

## How to preview locally
Just open `index.html` in a browser — no build step, no dependencies.
