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
        Full name *
        <input type="text" name="name" required>
      </label>
      <label>
        Delivery address *
        <textarea name="address" rows="2" required></textarea>
      </label>
      <label>
        Contact number *
        <input type="tel" name="contact" required placeholder="09XX XXX XXXX">
      </label>
      <label>
        Preferred platform for updates *
        <select name="contact_platform" id="contact-platform-select" required>
          <option value="" disabled selected>Select a platform</option>
          <option value="threads">Threads</option>
          <option value="imessage">iMessage</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="viber">Viber</option>
          <option value="instagram">Instagram</option>
        </select>
      </label>
      <p class="checkout-note">This is where I will be reaching out to you with shipping updates and your tracking number. Please keep your account open for messages.</p>
      <label>
        <span id="contact-handle-label">Your handle or number *</span>
        <input type="text" name="contact_handle" id="contact-handle-input" required placeholder="Select a platform first">
      </label>
      <label>
        Shipping region *
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
      <p class="manual-quote-note" id="manual-quote-note" style="display:none;">Your order's a bit heavier than our standard rates cover — I'll check the exact shipping cost myself and send it your way over Threads DM before anything ships.</p>

      <label>
        Preferred mode of payment *
        <select name="payment_method" id="payment-method-select" required>
          <option value="" disabled selected>Select a payment method</option>
          ${PAYMENT_METHODS.map(m => `<option value="${m.id}">${m.label}</option>`).join('')}
        </select>
      </label>

      <div class="qr-display" id="qr-display" style="display:none;">
        <img id="qr-image" src="" alt="Payment QR code">
        <p class="qr-caption" id="qr-caption"></p>
      </div>

      <label>
        Upload proof of payment *
        <input type="file" name="proof" accept="image/*" required>
      </label>

      <button type="submit" class="submit-order" disabled>Submit order</button>
    </form>
  `;

  overlay.appendChild(drawer);
  document.body.appendChild(overlay);

  document.getElementById('cart-close').addEventListener('click', closeCart);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeCart(); });

  document.getElementById('region-select').addEventListener('change', updateShippingAndTotal);

  const HANDLE_MODES = {
    threads:   { label: 'Your Threads handle *',   placeholder: '@yourhandle',      type: 'text', pattern: '^@.+', maxlength: null, inputmode: null },
    instagram: { label: 'Your Instagram handle *',  placeholder: '@yourhandle',      type: 'text', pattern: '^@.+', maxlength: null, inputmode: null },
    imessage:  { label: 'Your iMessage number (11 digits) *', placeholder: '09XXXXXXXXX', type: 'tel', pattern: '^\\d{11}$', maxlength: 11, inputmode: 'numeric' },
    whatsapp:  { label: 'Your WhatsApp number (11 digits) *', placeholder: '09XXXXXXXXX', type: 'tel', pattern: '^\\d{11}$', maxlength: 11, inputmode: 'numeric' },
    viber:     { label: 'Your Viber number (11 digits) *',    placeholder: '09XXXXXXXXX', type: 'tel', pattern: '^\\d{11}$', maxlength: 11, inputmode: 'numeric' },
  };

  const handleInput = document.getElementById('contact-handle-input');
  const handleLabel = document.getElementById('contact-handle-label');

  document.getElementById('contact-platform-select').addEventListener('change', e => {
    const mode = HANDLE_MODES[e.target.value];
    handleInput.value = '';
    if (!mode) return;
    handleLabel.textContent = mode.label;
    handleInput.placeholder = mode.placeholder;
    handleInput.type = mode.type;
    handleInput.setAttribute('pattern', mode.pattern);
    if (mode.maxlength) { handleInput.maxLength = mode.maxlength; } else { handleInput.removeAttribute('maxlength'); }
    if (mode.inputmode) { handleInput.setAttribute('inputmode', mode.inputmode); } else { handleInput.removeAttribute('inputmode'); }
  });

  // Live-sanitize: for phone-based platforms, strip anything that isn't a digit as they type
  handleInput.addEventListener('input', () => {
    const platform = document.getElementById('contact-platform-select').value;
    if (['imessage', 'whatsapp', 'viber'].includes(platform)) {
      handleInput.value = handleInput.value.replace(/\D/g, '').slice(0, 11);
    }
  });

  const checkoutForm = document.getElementById('checkout-form');
  const submitButton = checkoutForm.querySelector('.submit-order');

  function refreshSubmitState() {
    submitButton.disabled = !checkoutForm.checkValidity();
  }
  checkoutForm.addEventListener('input', refreshSubmitState);
  checkoutForm.addEventListener('change', refreshSubmitState);
  refreshSubmitState();

  document.getElementById('payment-method-select').addEventListener('change', e => {
    const method = PAYMENT_METHODS.find(m => m.id === e.target.value);
    const display = document.getElementById('qr-display');
    if (!method) {
      display.style.display = 'none';
      return;
    }
    document.getElementById('qr-image').src = method.qr;
    document.getElementById('qr-caption').textContent = `Scan to pay via ${method.label}`;
    display.style.display = 'block';
  });

  document.getElementById('checkout-form').addEventListener('submit', async e => {
    e.preventDefault();
    if (cartCount() === 0) {
      alert('Your cart is empty — add something first.');
      return;
    }

    const submitBtn = e.target.querySelector('.submit-order');
    submitBtn.disabled = true;

    const data = new FormData(e.target);
    const region = SHIPPING_RATES.find(r => r.id === data.get('region'));
    const shipping = getShippingRate(data.get('region'), cartTotalWeight());
    const subtotal = cartSubtotal();
    const paymentMethod = PAYMENT_METHODS.find(m => m.id === data.get('payment_method'));

    const items = Object.entries(cart).map(([id, qty]) => {
      const p = getProduct(Number(id));
      return { product_id: p.id, name: p.name, qty, price: p.price };
    });

    // 1. Upload proof of payment to Cloudinary
    submitBtn.textContent = 'Uploading proof...';
    let proofUrl;
    try {
      proofUrl = await uploadProofOfPayment(data.get('proof'));
    } catch (err) {
      console.error('Cloudinary upload failed:', err);
      alert('Could not upload your proof of payment — please check the image and try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit order';
      return;
    }

    // 2. Save the order in Supabase
    submitBtn.textContent = 'Submitting order...';
    const { error } = await supabaseClient.from('orders').insert({
      customer_name: data.get('name'),
      address: data.get('address'),
      contact_number: data.get('contact'),
      contact_platform: data.get('contact_platform'),
      contact_handle: data.get('contact_handle'),
      region_id: data.get('region'),
      region_label: region ? region.label : null,
      payment_method: data.get('payment_method'),
      items: items,
      subtotal: subtotal,
      shipping_fee: shipping, // null if over 5kg — matches the "to be confirmed" case
      total: shipping === null ? null : subtotal + shipping,
      proof_url: proofUrl,
      status: 'new'
    });

    if (error) {
      console.error('Order submission failed:', error);
      alert('Something went wrong submitting your order. Kindly try submitting again, it must have been a glitch or something. :)');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit order';
      return;
    }

    // 3. Record the sale against each product's stock/sold count (best-effort —
    // the order itself is already saved even if this part hiccups)
    for (const item of items) {
      try {
        await supabaseClient.rpc('record_sale', { p_product_id: item.product_id, p_qty: item.qty });
      } catch (err) {
        console.warn('Could not update stock/sold count for product', item.product_id, err);
      }
    }

    // 4. Ping Telegram (best-effort — order is already saved regardless)
    try {
      await fetch('/api/notify-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          contact: data.get('contact'),
          contactPlatform: data.get('contact_platform'),
          contactHandle: data.get('contact_handle'),
          address: data.get('address'),
          region: region ? region.label : data.get('region'),
          paymentMethod: paymentMethod ? paymentMethod.label : data.get('payment_method'),
          items,
          subtotal,
          shipping,
          total: shipping === null ? null : subtotal + shipping,
          proofUrl
        })
      });
    } catch (err) {
      console.warn('Telegram notification failed (order was still saved):', err);
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit order';

    alert('Order submitted! Lois will confirm your payment and reach out to you in your platform of choice. Please keep your DMs open for messages.');
    for (const id in cart) delete cart[id];
    updateCartBadge();
    e.target.reset();
    refreshSubmitState();
    document.getElementById('qr-display').style.display = 'none';
    closeCart();
    loadProductsAndRender(); // refresh stock/sold-out state on the storefront
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
  const noteEl = document.getElementById('manual-quote-note');
  document.getElementById('subtotal-amount').textContent = `₱${subtotal.toLocaleString('en-PH')}`;

  if (!regionId) {
    document.getElementById('shipping-amount').textContent = 'Select a region';
    document.getElementById('grand-total').textContent = `₱${subtotal.toLocaleString('en-PH')}`;
    noteEl.style.display = 'none';
    return;
  }

  const totalWeight = cartTotalWeight();
  const rate = getShippingRate(regionId, totalWeight);

  if (rate === null) {
    document.getElementById('shipping-amount').textContent = 'To be confirmed';
    document.getElementById('grand-total').textContent = `₱${subtotal.toLocaleString('en-PH')} + shipping`;
    noteEl.style.display = 'block';
    return;
  }

  document.getElementById('shipping-amount').textContent = `₱${rate.toLocaleString('en-PH')}`;
  document.getElementById('grand-total').textContent = `₱${(subtotal + rate).toLocaleString('en-PH')}`;
  noteEl.style.display = 'none';
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
