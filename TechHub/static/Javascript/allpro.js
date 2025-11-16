// allpro.js
// Renders ALL products (follows DRF pagination) into #productsList
// Requires addToCart(product_id_or_slug) to exist (you already have cart.js)

window.API_BASE = window.API_BASE || '/api';

function productImageUrl(product) {
  // product.image may be a URL or a path like "/media/..."
  if (!product) return '/static/images/placeholder.png';
  const img = product.image || product.image_url || product.image_url_full || '';
  if (!img) return '/static/images/placeholder.png';
  // If it's already absolute, return as-is; else prefix if needed
  if (/^(https?:)?\/\//.test(img)) return img;
  // if starts with /media or /static or / then use as-is
  if (img.startsWith('/')) return img;
  // fallback: try to guess relative path
  return img;
}

async function fetchAllProducts() {
  const all = [];
  let page = 1;
  try {
    while (true) {
      const resp = await fetch(`${window.API_BASE}/products/?page=${page}`);
      if (!resp.ok) {
        console.error('Failed to fetch products page', page, resp.status);
        break;
      }
      const data = await resp.json();
      // DRF pagination: data.results, data.next
      const results = Array.isArray(data) ? data : (data.results || []);
      all.push(...results);
      // stop when no next or results empty
      if (!data.next) break;
      page++;
    }
  } catch (err) {
    console.error('Error fetching products', err);
  }
  return all;
}

function createProductCard(p) {
  // Defensive: p may contain: id, slug, name, price, image
  const id = p.id ?? '';
  const slug = p.slug ?? '';
  const name = p.name ?? p.title ?? 'Product';
  // price may be string or number
  const rawPrice = p.price ?? p.price_amount ?? 0;
  const price = (typeof rawPrice === 'string') ? rawPrice : Number(rawPrice || 0);
  const imageUrl = productImageUrl(p);

  const card = document.createElement('div');
  card.className = 'product-card';
  card.setAttribute('data-product', (p.slug || p.name || '').toLowerCase());

  card.innerHTML = `
    <div class="image-container">
      <img src="${imageUrl}" alt="${name}">
    </div>
    <div class="product-info">
      <div class="product-title">${name}</div>
      <div class="rating"><span class="star">★</span> ${(p.rating || 4.3)} • <span class="stock">${p.stock ?? 10} in stock</span></div>
      <div class="price">₹${price.toLocaleString('en-IN')}</div>
      <button class="add-btn" data-id="${id}" data-slug="${slug}">
        <i class="fa-solid fa-cart-plus"></i> Add to Cart
      </button>
    </div>
  `;
  return card;
}

async function renderAllProducts(containerId='productsList') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '<p>Loading products…</p>';

  const products = await fetchAllProducts();
  if (!products || products.length === 0) {
    container.innerHTML = '<p>No products found.</p>';
    return;
  }

  // clear and render grid wrapper if you want
  container.innerHTML = '';
  const row = document.createElement('div');
  row.className = 'products-row'; // keep CSS compatibility
  container.appendChild(row);

  products.forEach(p => {
    const card = createProductCard(p);
    row.appendChild(card);
  });

  // attach Add to Cart listeners
  container.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', async (ev) => {
      const id = btn.getAttribute('data-id');
      const slug = btn.getAttribute('data-slug');
      // prefer numeric id if present, otherwise slug
      const identifier = id ? id : (slug ? slug : null);
      if (!identifier) {
        alert('Cannot add this product (missing id).');
        return;
      }
      // addToCart should be defined in cart.js and exposed globally
      if (typeof window.addToCart === 'function') {
        await window.addToCart(identifier, 1);
      } else if (typeof window.cart?.addToCart === 'function') {
        await window.cart.addToCart(identifier, 1);
      } else {
        alert('Add to cart not available. Make sure cart.js is loaded.');
      }
    });
  });

  // optional: also export products array
  window._allProducts = products;
}

// a harmless filterProducts function so your filter buttons won't error
function filterProducts(category) {
  // If you want filtering client-side: category matches in data-product attribute
  const grid = document.querySelector('#productsList .products-row');
  if (!grid) return;
  const cards = grid.querySelectorAll('.product-card');
  if (category === 'all') {
    cards.forEach(c => c.style.display = '');
    return;
  }
  cards.forEach(c => {
    const prod = c.getAttribute('data-product') || '';
    if (prod.toLowerCase().includes(category.toLowerCase())) {
      c.style.display = '';
    } else {
      c.style.display = 'none';
    }
  });
}

// run on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  renderAllProducts('productsList');
  // expose filter function globally (already declared)
  window.filterProducts = filterProducts;
});
