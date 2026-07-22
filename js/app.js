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

function buildCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';

  card.appendChild(buildCarousel(product));

  const body = document.createElement('div');
  body.className = 'product-body';

  const name = document.createElement('h2');
  name.className = 'product-name';
  name.textContent = product.name;

  const desc = document.createElement('p');
  desc.className = 'product-desc';
  desc.textContent = product.description;

  const footer = document.createElement('div');
  footer.className = 'product-footer';

  const price = document.createElement('span');
  price.className = 'price-tag';
  price.textContent = formatPrice(product.price);

  const btn = document.createElement('button');
  btn.className = 'add-to-cart';
  btn.type = 'button';
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

  footer.appendChild(price);
  footer.appendChild(btn);

  body.appendChild(name);
  body.appendChild(desc);
  body.appendChild(footer);
  card.appendChild(body);

  return card;
}

function renderStorefront() {
  const root = document.getElementById('storefront');
  PRODUCTS.forEach(product => root.appendChild(buildCard(product)));
}

renderStorefront();
