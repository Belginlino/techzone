// products.js - renders product list and wires add-to-cart buttons
// Assumes API_BASE exists (from auth.js) and addToCart is loaded (from cart.js)
// ensure tokens valid; if not, proceed but disable auth actions
document.addEventListener('DOMContentLoaded', async () => {
  // if auth.ensureValidAccess exists
  if (window.auth && typeof window.auth.ensureValidAccess === 'function') {
    await window.auth.ensureValidAccess();
  }
  // now safe to call updateCartCount etc.
});

function productImageUrl(product) {
  // product.image may be null or like "/media/products/..."
  return product.image ? product.image : '/static/images/placeholder.png';
}

async function fetchProducts(page=1) {
  const resp = await fetch(`${API_BASE}/products/?page=${page}`);
  if (!resp.ok) {
    console.error('Failed to fetch products', resp.status);
    return [];
  }
  const data = await resp.json();
  return data.results || data; // DRF pagination returns {results, ...}
}

// Example: render products into a container with id="productsList"
async function renderProducts(containerId='productsList') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '<p>Loading products...</p>';
  const products = await fetchProducts();
  if (!products.length) {
    container.innerHTML = '<p>No products found.</p>';
    return;
  }
  container.innerHTML = ''; // clear
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image">
        <img src="${productImageUrl(p)}" alt="${p.name}" />
      </div>
      <div class="product-info">
        <h3 class="product-name">${p.name}</h3>
        <p class="product-price">₹ ${p.price}</p>
        <div class="product-actions">
          <button class="btn-add" data-id="${p.id}" data-slug="${p.slug}">Add to cart</button>
          <a class="btn-view" href="/product/${p.slug}/">View</a>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // attach add-to-cart listeners (addToCart is expected globally)
  document.querySelectorAll('.btn-add').forEach(btn=>{
    btn.addEventListener('click', async (ev)=>{
      const id = btn.getAttribute('data-id');
      if (typeof addToCart === 'function') {
        await addToCart(id, 1);
      } else if (window.cart && typeof window.cart.addToCart === 'function') {
        await window.cart.addToCart(id,1);
      } else {
        console.warn('addToCart not available');
      }
    });
  });
}

// call on page load if container exists
document.addEventListener('DOMContentLoaded', ()=>{
  // render products only if a productsList element exists
  if (document.getElementById('productsList')) {
    renderProducts('productsList');
  }
});
