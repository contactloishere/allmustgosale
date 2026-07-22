# All Must Go — Mike Charlie Co. Threads-exclusive sale

## Status: Stage 2 complete ✅

**Stage 1 — Storefront grid + swipeable gallery**
- [x] Product grid, mobile-first, responsive (1 col mobile → 2 → 3 col desktop)
- [x] Swipeable photo carousel per product (touch drag, works with 1–5 images)
- [x] Dot indicators (only shown when a product has >1 image)
- [x] Tap/click a photo → opens full-res image in a new tab (ready for real Cloudinary URLs)
- [x] Price shown as a hang-tag style label (signature design element)
- [x] Product data shaped exactly like the future Supabase table:
      `name, description, price, weight (hidden), images[]` — see `data/products.js`
- [x] Personal title/subtitle copy (@loisinprogress's Clearance Sale)

**Stage 2 — Cart, checkout form, shipping calculator**
- [x] Floating cart button with live item count
- [x] Cart drawer: view items, adjust quantity, remove
- [x] Checkout form: name, address, contact number, shipping region
- [x] Shipping calculator using the full J&T/SPX rate table (Maxim excluded) —
      see `data/shipping-rates.js`, matched against combined cart weight
      (each product's hidden weight, never shown to the customer)
- [x] Live-updating subtotal / shipping / total as region or cart changes
- [x] Proof-of-payment file picker (upload wiring is Stage 4)
- [x] Threads-DM tracking note shown at checkout
- [x] Submit currently shows an order summary popup as a placeholder —
      Stage 3 replaces this with an actual Supabase write

## Not built yet (next stages)
- Stage 3: Supabase wiring — real products table (replacing `data/products.js`), orders table
- Stage 4: Cloudinary upload widget for proof-of-payment, Telegram bot ping on order submit

## Notes on the shipping table
- Orders over 5kg total weight aren't in the rate table — the calculator shows
  "will quote manually" rather than guessing. Worth deciding: should heavy carts
  be blocked at checkout, or allowed through with a manual-quote flag for Lois to follow up on?

## How to preview locally
Just open `index.html` in a browser — no build step, no dependencies.
(Placeholder photos are from picsum.photos — swap `data/products.js`
image URLs for real Cloudinary links whenever ready.)

## Data notes
- `data/products.js` is temporary/placeholder. In Stage 3 this becomes a live
  fetch from Supabase instead — nothing else in the app needs to change when that happens.
- Weight is stored per-product but never rendered — it's read by the (future)
  shipping calculator only.
