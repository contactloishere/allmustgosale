// ===== Stage 1: storefront grid + swipeable carousel =====
// Cart state, checkout, shipping calc, Supabase, Cloudinary, Telegram
// all come in later stages. This file only renders products and
// handles the photo carousel + zoom.

function formatPrice(php) {
  return '₱' + php.toLocaleString('en-PH');
}

function buildCarousel(images, altText) {
  const wrap = document.createElement('div');
  wrap.className = 'carousel';

  const track = document.createElement('div');
  track.className = 'carousel-track';

  images.forEach(src => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';

    const img = document.createElement('img');
    img.src = src;
    img.alt = altText;
    img.loading = 'lazy';

    // Tap/click a photo -> open full-res version in a new tab.
    slide.addEventListener('click', () => window.open(src, '_blank'));

    slide.appendChild(img);
    track.appendChild(slide);
  });

  wrap.appendChild(track);

  // Dots (only if more than 1 image)
  let dots = null;
  if (images.length > 1) {
    dots = document.createElement('div');
    dots.className = 'carousel-dots';
    images.forEach((_, i) => {
      const dot = document.createElement('span');
      if (i === 0) dot.classList.add('active');
      dots.appendChild(dot);
    });
    wrap.appendChild(dots);
  }

  // --- Swipe handling ---
  let index = 0;
  const total = images.length;

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

  return { element: wrap, goTo };
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

    function setExpanded(value) {
      expanded = value;
      [...list.children].forEach((li, i) => {
        if (i >= DESC_PREVIEW_COUNT) li.hidden = !expanded;
      });
      toggle.textContent = expanded ? 'See less' : 'See more';
    }

    toggle.addEventListener('click', e => {
      e.stopPropagation();
      setExpanded(!expanded);
    });

    // Once expanded, tapping anywhere else in the description also collapses it
    wrap.addEventListener('click', e => {
      if (expanded && e.target !== toggle) setExpanded(false);
    });

    wrap.appendChild(toggle);
  }

  return wrap;
}

function buildCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.dataset.category = product.category || 'uncategorized';

  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;

  // Pool the product's own photos with every variant's photo into one gallery
  const variantImages = hasVariants ? product.variants.map(v => v.image).filter(Boolean) : [];
  const allImages = [...product.images, ...variantImages];

  // Card-level sold-out: for non-variant products, based on the product's own stock.
  // For variant products, only sold out if EVERY variant is sold out.
  const isTracked = product.stockQuantity !== null && product.stockQuantity !== undefined;
  let isSoldOut, isLowStock;
  if (hasVariants) {
    isSoldOut = product.variants.every(v =>
      v.stockQuantity !== null && v.stockQuantity !== undefined && v.stockQuantity <= 0
    );
    isLowStock = false; // per-variant urgency is shown after a selection instead
  } else {
    isSoldOut = isTracked && product.stockQuantity <= 0;
    isLowStock = isTracked && !isSoldOut && product.stockQuantity <= 5;
  }
  card.dataset.soldOut = isSoldOut ? 'true' : 'false';
  if (isSoldOut) card.classList.add('is-sold-out');

  const carousel = buildCarousel(allImages, product.name);
  if (isSoldOut) {
    const badge = document.createElement('div');
    badge.className = 'sold-out-badge';
    badge.textContent = 'SOLD OUT';
    carousel.element.appendChild(badge);
  }
  card.appendChild(carousel.element);

  const body = document.createElement('div');
  body.className = 'product-body';

  const name = document.createElement('h2');
  name.className = 'product-name';
  name.textContent = product.name;

  const desc = buildDescription(product.description);

  // Sold count / low-stock urgency line (only shown when there's something to say;
  // for variant products this updates once a variant is picked, see below)
  const metaLine = document.createElement('p');
  metaLine.className = 'product-meta';
  metaLine.style.display = 'none';

  function updateMetaLine(stockQuantity, unitsSold) {
    const tracked = stockQuantity !== null && stockQuantity !== undefined;
    const soldOutNow = tracked && stockQuantity <= 0;
    const lowNow = tracked && !soldOutNow && stockQuantity <= 5;
    const parts = [];
    if (lowNow) parts.push(`Only ${stockQuantity} left`);
    if (unitsSold > 0) parts.push(`${unitsSold} sold`);
    if (parts.length > 0) {
      metaLine.textContent = parts.join(' · ');
      metaLine.style.display = '';
    } else {
      metaLine.style.display = 'none';
    }
  }

  if (!hasVariants) updateMetaLine(product.stockQuantity, product.unitsSold);

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

  let selectedVariant = null; // set via the dropdown, when variants exist

  function refreshAddToCartButton() {
    if (hasVariants) {
      if (!selectedVariant) {
        btn.textContent = 'Select an option';
        btn.disabled = true;
        return;
      }
      const vSoldOut = selectedVariant.stockQuantity !== null && selectedVariant.stockQuantity !== undefined && selectedVariant.stockQuantity <= 0;
      if (vSoldOut) {
        btn.textContent = 'Sold out';
        btn.disabled = true;
      } else {
        btn.textContent = 'Add to cart';
        btn.disabled = false;
      }
    } else {
      if (isSoldOut) {
        btn.textContent = 'Sold out';
        btn.disabled = true;
      } else {
        btn.textContent = 'Add to cart';
        btn.disabled = false;
      }
    }
  }
  refreshAddToCartButton();

  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    addToCart(product.id, selectedVariant ? selectedVariant.id : null);
    const original = btn.textContent;
    btn.textContent = 'Added';
    btn.classList.add('added');
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove('added');
    }, 1200);
  });

  footer.appendChild(priceWrap);
  footer.appendChild(btn);

  body.appendChild(name);
  body.appendChild(desc);

  if (hasVariants) {
    const variantSelect = document.createElement('select');
    variantSelect.className = 'variant-select';

    const placeholderOpt = document.createElement('option');
    placeholderOpt.value = '';
    placeholderOpt.textContent = 'Select an option';
    placeholderOpt.disabled = true;
    placeholderOpt.selected = true;
    variantSelect.appendChild(placeholderOpt);

    product.variants.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.id;
      const vSoldOut = v.stockQuantity !== null && v.stockQuantity !== undefined && v.stockQuantity <= 0;
      opt.textContent = vSoldOut ? `${v.name} (Sold out)` : v.name;
      if (vSoldOut) opt.disabled = true;
      variantSelect.appendChild(opt);
    });

    variantSelect.addEventListener('change', () => {
      const chosen = product.variants.find(v => String(v.id) === variantSelect.value);
      selectedVariant = chosen || null;
      refreshAddToCartButton();

      if (chosen) {
        updateMetaLine(chosen.stockQuantity, chosen.unitsSold);
        if (chosen.image) {
          const imgIndex = allImages.indexOf(chosen.image);
          if (imgIndex >= 0) carousel.goTo(imgIndex);
        }
      } else {
        metaLine.style.display = 'none';
      }
    });

    body.appendChild(variantSelect);
  }

  body.appendChild(metaLine);
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

    const { data: variantRows, error: variantError } = await supabaseClient
      .from('product_variants')
      .select('*')
      .order('display_order', { ascending: true });

    if (variantError) console.warn('Could not load product variants:', variantError);

    if (data && data.length > 0) {
      PRODUCTS = data.map(row => {
        const variants = (variantRows || [])
          .filter(v => v.product_id === row.id)
          .map(v => ({
            id: v.id,
            name: v.variant_name,
            image: v.image_url,
            stockQuantity: v.stock_quantity,
            unitsSold: v.units_sold || 0
          }));

        return {
          id: row.id,
          name: row.name,
          description: row.description,
          price: row.price,
          originalPrice: row.original_price, // null = not discounted, no strikethrough shown
          weight: row.weight,
          stockQuantity: row.stock_quantity, // null = not tracked (ignored if variants exist)
          unitsSold: row.units_sold || 0,
          category: row.category || null,
          variants: variants, // empty array = no variants, behaves as before
          images: [row.image_url_1, row.image_url_2, row.image_url_3, row.image_url_4, row.image_url_5]
            .filter(Boolean)
        };
      });
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
