// products.js
const API_BASE = "/api";

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

  // attach add-to-cart listeners
  document.querySelectorAll('.btn-add').forEach(btn=>{
    btn.addEventListener('click', async (ev)=>{
      const id = btn.getAttribute('data-id');
      await addToCart(id, 1);
    });
  });
}

// call on page load
document.addEventListener('DOMContentLoaded', ()=> renderProducts('productsList'));
