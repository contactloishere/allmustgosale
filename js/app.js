// ===== Stage 1: storefront grid + swipeable carousel =====
// Cart state, checkout, shipping calc, Supabase, Cloudinary, Telegram
// all come in later stages. This file only renders products and
// handles the photo carousel + zoom.

function formatPrice(php) {
  return '₱' + php.toLocaleString('en-PH');
}

function buildCarousel(product) {
  const wrap = document.createElement('div');
  wrap.className = 'carousel';

  const track = document.createElement('div');
  track.className = 'carousel-track';

  product.images.forEach(src => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';

    const img = document.createElement('img');
    img.src = src;
    img.alt = product.name;
    img.loading = 'lazy';

    // Tap/click a photo -> open full-res version in a new tab.
    // (When these become real Cloudinary URLs, this opens the
    // original file directly, same as it does with the placeholders now.)
    slide.addEventListener('click', () => window.open(src, '_blank'));

    slide.appendChild(img);
    track.appendChild(slide);
  });

  wrap.appendChild(track);

  // Dots (only if more than 1 image)
  let dots = null;
  if (product.images.length > 1) {
    dots = document.createElement('div');
    dots.className = 'carousel-dots';
    product.images.forEach((_, i) => {
      const dot = document.createElement('span');
      if (i === 0) dot.classList.add('active');
      dots.appendChild(dot);
    });
    wrap.appendChild(dots);
  }

  // --- Swipe handling ---
  let index = 0;
  const total = product.images.length;

  function goTo(i) {
    index = Math.max(0, Math.min(total - 1, i));
    track.style.transform = `translateX(-${index * 100}%)`;
    if (dots) {
      [...dots.children].forEach((d, di) => d.classList.toggle('active', di === index));
    }
  }

  let startX = 0;
  let deltaX = 0;
  let dragging = false;

  wrap.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    dragging = true;
  }, { passive: true });

  wrap.addEventListener('touchmove', e => {
    if (!dragging) return;
    deltaX = e.touches[0].clientX - startX;
  }, { passive: true });

  wrap.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    if (Math.abs(deltaX) > 40) {
      goTo(index + (deltaX < 0 ? 1 : -1));
    }
    deltaX = 0;
  });

  return wrap;
}

const DESC_PREVIEW_COUNT = 2;

function buildDescription(rawDescription) {
  const bullets = (rawDescription || '')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);

  const wrap = document.createElement('div');
  wrap.className = 'product-desc';

  if (bullets.length === 0) return wrap;

  const list = document.createElement('ul');
  list.className = 'product-desc__list';

  bullets.forEach((bullet, i) => {
    const li = document.createElement('li');
    li.textContent = bullet;
    if (i >= DESC_PREVIEW_COUNT) li.hidden = true;
    list.appendChild(li);
  });

  wrap.appendChild(list);

  if (bullets.length > DESC_PREVIEW_COUNT) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'see-more-toggle';
    toggle.textContent = 'See more';

    let expanded = false;
    toggle.addEventListener('click', () => {
      expanded = !expanded;
      [...list.children].forEach((li, i) => {
        if (i >= DESC_PREVIEW_COUNT) li.hidden = !expanded;
      });
      toggle.textContent = expanded ? 'See less' : 'See more';
    });

    wrap.appendChild(toggle);
  }

  return wrap;
}

function buildCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.dataset.category = product.category || 'uncategorized';

  const isTracked = product.stockQuantity !== null && product.stockQuantity !== undefined;
  const isSoldOut = isTracked && product.stockQuantity <= 0;
  const isLowStock = isTracked && !isSoldOut && product.stockQuantity <= 5;
  card.dataset.soldOut = isSoldOut ? 'true' : 'false';
  if (isSoldOut) card.classList.add('is-sold-out');

  const carousel = buildCarousel(product);
  if (isSoldOut) {
    const badge = document.createElement('div');
    badge.className = 'sold-out-badge';
    badge.textContent = 'SOLD OUT';
    carousel.appendChild(badge);
  }
  card.appendChild(carousel);

  const body = document.createElement('div');
  body.className = 'product-body';

  const name = document.createElement('h2');
  name.className = 'product-name';
  name.textContent = product.name;

  const desc = buildDescription(product.description);

  // Sold count / low-stock urgency line (only shown when there's something to say)
  let metaLine = null;
  if (isLowStock || product.unitsSold > 0) {
    metaLine = document.createElement('p');
    metaLine.className = 'product-meta';
    const parts = [];
    if (isLowStock) parts.push(`Only ${product.stockQuantity} left`);
    if (product.unitsSold > 0) parts.push(`${product.unitsSold} sold`);
    metaLine.textContent = parts.join(' · ');
  }

  const footer = document.createElement('div');
  footer.className = 'product-footer';

  const priceWrap = document.createElement('div');
  priceWrap.className = 'price-wrap';

  if (product.originalPrice && product.originalPrice > product.price) {
    const originalPrice = document.createElement('span');
    originalPrice.className = 'original-price';
    originalPrice.textContent = formatPrice(product.originalPrice);
    priceWrap.appendChild(originalPrice);
  }

  const price = document.createElement('span');
  price.className = 'price-tag';
  price.textContent = formatPrice(product.price);
  priceWrap.appendChild(price);

  const btn = document.createElement('button');
  btn.className = 'add-to-cart';
  btn.type = 'button';

  if (isSoldOut) {
    btn.textContent = 'Sold out';
    btn.disabled = true;
  } else {
    btn.textContent = 'Add to cart';
    btn.addEventListener('click', () => {
      addToCart(product.id);
      btn.textContent = 'Added';
      btn.classList.add('added');
      setTimeout(() => {
        btn.textContent = 'Add to cart';
        btn.classList.remove('added');
      }, 1200);
    });
  }

  footer.appendChild(priceWrap);
  footer.appendChild(btn);

  body.appendChild(name);
  body.appendChild(desc);
  if (metaLine) body.appendChild(metaLine);
  body.appendChild(footer);
  card.appendChild(body);

  return card;
}

const CATEGORIES = [
  { id: 'all', label: 'All Items' },
  { id: 'preloved', label: 'Preloved Finds' },
  { id: 'clearance', label: 'Clearance Sale' },
  { id: 'soaps', label: 'Soaps' },
  { id: 'sold-out', label: 'Sold Out' },
];

function buildCategoryFilters() {
  const container = document.getElementById('category-filters');
  if (!container) return;

  CATEGORIES.forEach((cat, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'category-btn';
    if (i === 0) btn.classList.add('active');
    btn.textContent = cat.label;
    btn.dataset.category = cat.id;
    btn.addEventListener('click', () => {
      container.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyCategoryFilter(cat.id);
    });
    container.appendChild(btn);
  });
}

function applyCategoryFilter(categoryId) {
  const cards = document.querySelectorAll('#storefront .product-card');
  cards.forEach(card => {
    let show;
    if (categoryId === 'all') {
      show = true;
    } else if (categoryId === 'sold-out') {
      show = card.dataset.soldOut === 'true';
    } else {
      show = card.dataset.category === categoryId;
    }
    card.style.display = show ? '' : 'none';
  });
}

function renderStorefront() {
  const root = document.getElementById('storefront');
  root.innerHTML = '';
  PRODUCTS.forEach(product => root.appendChild(buildCard(product)));

  // Re-apply whichever category tab is currently active
  const activeBtn = document.querySelector('.category-btn.active');
  applyCategoryFilter(activeBtn ? activeBtn.dataset.category : 'all');
}

async function loadProductsAndRender() {
  const root = document.getElementById('storefront');

  try {
    const { data, error } = await supabaseClient
      .from('products')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (data && data.length > 0) {
      PRODUCTS = data.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        originalPrice: row.original_price, // null = not discounted, no strikethrough shown
        weight: row.weight,
        stockQuantity: row.stock_quantity, // null = not tracked
        unitsSold: row.units_sold || 0,
        category: row.category || null,
        images: [row.image_url_1, row.image_url_2, row.image_url_3, row.image_url_4, row.image_url_5]
          .filter(Boolean)
      }));
    }
    // If the table is empty, PRODUCTS stays as the fallback placeholder data.
  } catch (err) {
    console.warn('Could not load products from Supabase — showing placeholder data instead.', err);
    // PRODUCTS stays as the fallback placeholder data.
  }

  renderStorefront();
}

buildCategoryFilters();
loadProductsAndRender();
