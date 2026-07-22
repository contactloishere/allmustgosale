# All Must Go — Mike Charlie Co. Threads-exclusive sale

## Status: Stage 1 complete ✅

**Stage 1 — Storefront grid + swipeable gallery**
- [x] Product grid, mobile-first, responsive (1 col mobile → 2 → 3 col desktop)
- [x] Swipeable photo carousel per product (touch drag, works with 1–5 images)
- [x] Dot indicators (only shown when a product has >1 image)
- [x] Tap/click a photo → opens full-res image in a new tab (ready for real Cloudinary URLs)
- [x] Price shown as a hang-tag style label (signature design element)
- [x] "Add to cart" button (visual only for now — no real cart yet)
- [x] Product data shaped exactly like the future Supabase table:
      `name, description, price, weight (hidden), images[]` — see `data/products.js`

## Not built yet (next stages)
- Stage 2: Real cart (add/remove/quantity), checkout form (name, address, contact),
  shipping calculator using the J&T/SPX rate table + per-product weight
- Stage 3: Supabase wiring — real products table, orders table
- Stage 4: Cloudinary upload widget for proof-of-payment, Telegram bot ping on order submit

## How to preview locally
Just open `index.html` in a browser — no build step, no dependencies.
(Placeholder photos are from picsum.photos — swap `data/products.js`
image URLs for real Cloudinary links whenever ready.)

## Data notes
- `data/products.js` is temporary/placeholder. In Stage 3 this becomes a live
  fetch from Supabase instead — nothing else in the app needs to change when that happens.
- Weight is stored per-product but never rendered — it's read by the (future)
  shipping calculator only.
