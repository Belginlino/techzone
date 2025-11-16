// cart.js
const API_BASE = "/api";

function getAuthHeaders() {
  const token = localStorage.getItem('access_token');
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

async function addToCart(product_id, quantity=1) {
  const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };
  if (!headers.Authorization) {
    alert('Please login to add items to cart.');
    window.location.href = '/login/';
    return;
  }
  const resp = await fetch(`${API_BASE}/cart/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ product_id: product_id, quantity: quantity })
  });
  if (!resp.ok) {
    const err = await resp.json().catch(()=>({detail:'Failed to add'}));
    alert(err.detail || 'Failed to add to cart');
    return;
  }
  alert('Added to cart');
  updateCartCount();
}

async function fetchCart() {
  const headers = { ...getAuthHeaders() };
  if (!headers.Authorization) {
    return [];
  }
  const resp = await fetch(`${API_BASE}/cart/`, { headers });
  if (!resp.ok) return [];
  return resp.json();
}

async function updateCartCount(badgeId='cartCount') {
  const badge = document.getElementById(badgeId);
  if (!badge) return;
  const items = await fetchCart();
  const count = items.length;
  badge.textContent = count;
}

// On cart page: render cart items into #cartItems container
async function renderCartItems(containerId='cartItems') {
  const container = document.getElementById(containerId);
  if (!container) return;
  const items = await fetchCart();
  if (!items.length) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }
  container.innerHTML = '';
  let total = 0;
  items.forEach(it=>{
    const lineTotal = (parseFloat(it.product.price) * it.quantity);
    total += lineTotal;
    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = `
      <div class="cart-item">
        <img src="${it.product.image || '/static/images/placeholder.png'}" alt="${it.product.name}" />
        <div>
          <h4>${it.product.name}</h4>
          <p>Price: ₹ ${it.product.price}</p>
          <p>Quantity: ${it.quantity}</p>
          <p>Subtotal: ₹ ${lineTotal.toFixed(2)}</p>
          <button class="btn-remove" data-id="${it.id}">Remove</button>
        </div>
      </div>
    `;
    container.appendChild(row);
  });
  // add checkout + total
  const summary = document.createElement('div');
  summary.className = 'cart-summary';
  summary.innerHTML = `<h3>Total: ₹ ${total.toFixed(2)}</h3>
    <button id="btnCheckout">Checkout</button>`;
  container.appendChild(summary);

  // attach removals
  container.querySelectorAll('.btn-remove').forEach(b=>{
    b.addEventListener('click', async ()=>{
      const id = b.getAttribute('data-id');
      await removeCartItem(id);
      await renderCartItems(containerId);
      await updateCartCount();
    });
  });

  document.getElementById('btnCheckout')?.addEventListener('click', async ()=>{
    await checkout();
    await renderCartItems(containerId);
    await updateCartCount();
  });
}

async function removeCartItem(cartItemId) {
  const headers = getAuthHeaders();
  if (!headers.Authorization) { alert('Login required'); return; }
  const resp = await fetch(`${API_BASE}/cart/${cartItemId}/`, {
    method: 'DELETE', headers
  });
  if (!resp.ok) alert('Failed to remove item');
}

async function checkout() {
  const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };
  if (!headers.Authorization) { alert('Login required'); return; }
  const resp = await fetch(`${API_BASE}/checkout/`, { method: 'POST', headers });
  if (!resp.ok) {
    const err = await resp.json().catch(()=> ({detail:'Checkout failed'}));
    alert(err.detail || 'Checkout failed');
    return;
  }
  const order = await resp.json();
  alert('Order placed! Order id: ' + order.id);
}
