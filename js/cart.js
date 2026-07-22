// ===== Stage 2: cart, checkout form, shipping calculator =====
// Order submission (Supabase) and payment-proof upload (Cloudinary) and
// Telegram ping are Stage 3/4 — for now, submit just shows a summary
// so the whole flow is testable end-to-end.

const cart = {}; // { productId: quantity }

function getProduct(id) {
  return PRODUCTS.find(p => p.id === id);
}

function cartCount() {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

function cartTotalWeight() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = getProduct(Number(id));
    return sum + (p ? p.weight * qty : 0);
  }, 0);
}

function cartSubtotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = getProduct(Number(id));
    return sum + (p ? p.price * qty : 0);
  }, 0);
}

function addToCart(productId) {
  cart[productId] = (cart[productId] || 0) + 1;
  updateCartBadge();
}

function setQty(productId, qty) {
  if (qty <= 0) {
    delete cart[productId];
  } else {
    cart[productId] = qty;
  }
  updateCartBadge();
  renderCartItems();
  updateShippingAndTotal();
}

function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  const count = cartCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? 'inline-flex' : 'none';
}

// ===== Cart drawer UI =====

function buildCartDrawer() {
  const overlay = document.createElement('div');
  overlay.className = 'cart-overlay';
  overlay.id = 'cart-overlay';

  const drawer = document.createElement('div');
  drawer.className = 'cart-drawer';

  drawer.innerHTML = `
    <div class="cart-drawer__header">
      <h2>Your cart</h2>
      <button type="button" class="cart-close" id="cart-close" aria-label="Close cart">×</button>
    </div>

    <div class="cart-items" id="cart-items"></div>

    <form class="checkout-form" id="checkout-form">
      <label>
        Full name
        <input type="text" name="name" required>
      </label>
      <label>
        Delivery address
        <textarea name="address" rows="2" required></textarea>
      </label>
      <label>
        Contact number
        <input type="tel" name="contact" required placeholder="09XX XXX XXXX">
      </label>
      <label>
        Shipping region
        <select name="region" id="region-select" required>
          <option value="" disabled selected>Select your region</option>
          ${SHIPPING_RATES.map(r => `<option value="${r.id}">${r.label}</option>`).join('')}
        </select>
      </label>

      <div class="totals-box">
        <div class="totals-row"><span>Items subtotal</span><span id="subtotal-amount">₱0</span></div>
        <div class="totals-row"><span>Shipping</span><span id="shipping-amount">Select a region</span></div>
        <div class="totals-row totals-row--grand"><span>Total</span><span id="grand-total">₱0</span></div>
      </div>

      <label>
        Upload proof of payment
        <input type="file" name="proof" accept="image/*" required>
      </label>
      <p class="checkout-note">Payment details will be shown once you select a region. All order updates — including your tracking number — will be sent via Threads DM, so please keep your DMs open.</p>

      <button type="submit" class="submit-order">Submit order</button>
    </form>
  `;

  overlay.appendChild(drawer);
  document.body.appendChild(overlay);

  document.getElementById('cart-close').addEventListener('click', closeCart);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeCart(); });

  document.getElementById('region-select').addEventListener('change', updateShippingAndTotal);

  document.getElementById('checkout-form').addEventListener('submit', e => {
    e.preventDefault();
    if (cartCount() === 0) {
      alert('Your cart is empty — add something first.');
      return;
    }
    const data = new FormData(e.target);
    const region = SHIPPING_RATES.find(r => r.id === data.get('region'));
    const shipping = getShippingRate(data.get('region'), cartTotalWeight());

    // Stage 3/4 will replace this with: upload proof to Cloudinary,
    // write the order to Supabase, and ping the Telegram bot.
    alert(
      `Order preview (not yet submitted anywhere — Stage 3 wires this up):\n\n` +
      `Name: ${data.get('name')}\n` +
      `Address: ${data.get('address')}\n` +
      `Contact: ${data.get('contact')}\n` +
      `Region: ${region ? region.label : '(none)'}\n` +
      `Items subtotal: ₱${cartSubtotal().toLocaleString('en-PH')}\n` +
      `Shipping: ₱${shipping}\n` +
      `Total: ₱${(cartSubtotal() + (shipping || 0)).toLocaleString('en-PH')}`
    );
  });
}

function renderCartItems() {
  const container = document.getElementById('cart-items');
  const ids = Object.keys(cart);

  if (ids.length === 0) {
    container.innerHTML = `<p class="cart-empty">Your cart is empty.</p>`;
    return;
  }

  container.innerHTML = ids.map(id => {
    const p = getProduct(Number(id));
    const qty = cart[id];
    return `
      <div class="cart-item" data-id="${id}">
        <img src="${p.images[0]}" alt="${p.name}">
        <div class="cart-item__info">
          <p class="cart-item__name">${p.name}</p>
          <p class="cart-item__price">₱${p.price.toLocaleString('en-PH')}</p>
        </div>
        <div class="qty-control">
          <button type="button" class="qty-btn" data-action="dec">−</button>
          <span>${qty}</span>
          <button type="button" class="qty-btn" data-action="inc">+</button>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.cart-item').forEach(el => {
    const id = Number(el.dataset.id);
    el.querySelector('[data-action="inc"]').addEventListener('click', () => setQty(id, cart[id] + 1));
    el.querySelector('[data-action="dec"]').addEventListener('click', () => setQty(id, cart[id] - 1));
  });
}

function updateShippingAndTotal() {
  const regionId = document.getElementById('region-select').value;
  const subtotal = cartSubtotal();
  document.getElementById('subtotal-amount').textContent = `₱${subtotal.toLocaleString('en-PH')}`;

  if (!regionId) {
    document.getElementById('shipping-amount').textContent = 'Select a region';
    document.getElementById('grand-total').textContent = `₱${subtotal.toLocaleString('en-PH')}`;
    return;
  }

  const totalWeight = cartTotalWeight();
  const rate = getShippingRate(regionId, totalWeight);

  if (rate === null) {
    document.getElementById('shipping-amount').textContent = 'Over 5kg — will quote manually';
    document.getElementById('grand-total').textContent = `₱${subtotal.toLocaleString('en-PH')}+`;
    return;
  }

  document.getElementById('shipping-amount').textContent = `₱${rate.toLocaleString('en-PH')}`;
  document.getElementById('grand-total').textContent = `₱${(subtotal + rate).toLocaleString('en-PH')}`;
}

function openCart() {
  renderCartItems();
  updateShippingAndTotal();
  document.getElementById('cart-overlay').classList.add('open');
}

function closeCart() {
  document.getElementById('cart-overlay').classList.remove('open');
}

function buildFloatingCartButton() {
  const btn = document.createElement('button');
  btn.className = 'floating-cart';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Open cart');
  btn.innerHTML = `Cart <span id="cart-count" class="cart-count">0</span>`;
  btn.addEventListener('click', openCart);
  document.body.appendChild(btn);
}

buildCartDrawer();
buildFloatingCartButton();
