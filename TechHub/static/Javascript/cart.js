// cart.js (updated)
// Put this in static/Javascript/cart.js and load AFTER auth.js
// Assumes API_BASE may be set by auth.js; fallback to '/api'
window.API_BASE = window.API_BASE || '/api';

// -------------------- Utilities --------------------
function log(...args){ console.log('[cart]', ...args); }

function safeParseJson(resp) {
  // try json then text
  return resp.text().then(text => {
    try { return JSON.parse(text); } catch(e) { return text; }
  });
}

function showError(msg){
  try { alert(msg); } catch(e){ console.error(msg); }
}

function fmtINR(v){
  v = Number(v) || 0;
  return '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getAuthHeaders() {
  const token = localStorage.getItem('access_token');
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

// -------------------- Fetch helpers --------------------
async function fetchJson(url, opts = {}) {
  try {
    const resp = await fetch(url, opts);
    if (!resp.ok) {
      const body = await safeParseJson(resp);
      const err = { status: resp.status, body };
      throw err;
    }
    // success
    return await resp.json();
  } catch (err) {
    // Re-throw to caller (can be object or Error)
    throw err;
  }
}

// -------------------- Cart API functions --------------------
async function fetchCartItems() {
  const headers = getAuthHeaders();
  if (!headers.Authorization) return []; // not logged in

  try {
    const url = `${window.API_BASE}/cart/`;
    const resp = await fetch(url, { headers });
    if (!resp.ok) {
      const body = await safeParseJson(resp).catch(()=>null);
      log('fetchCartItems failed', resp.status, body);
      return [];
    }
    return await resp.json();
  } catch (e) {
    console.error('fetchCartItems error', e);
    return [];
  }
}

async function removeCartItem(cartItemId) {
  const headers = getAuthHeaders();
  if (!headers.Authorization) { showError('Login required'); return false; }

  try {
    const resp = await fetch(`${window.API_BASE}/cart/${cartItemId}/`, {
      method: 'DELETE', headers
    });
    if (!resp.ok) {
      const body = await safeParseJson(resp).catch(()=>null);
      log('removeCartItem failed', resp.status, body);
      showError((body && body.detail) ? body.detail : 'Failed to remove item');
      return false;
    }
    return true;
  } catch (e) {
    console.error('removeCartItem error', e);
    showError('Failed to remove item');
    return false;
  }
}

// -------------------- Render / UI --------------------
function getCartContainer(id='cartItems'){
  return document.getElementById(id);
}

async function renderCartItems(containerId='cartItems') {
  const container = getCartContainer(containerId);
  if (!container) return;
  container.innerHTML = '<p>Loading cart...</p>';

  const items = await fetchCartItems();
  if (!items || items.length === 0) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    updateCartSummary([]);
    return;
  }

  container.innerHTML = '';
  items.forEach(it => {
    const product = it.product || {};
    const name = product.name || it.product_name || it.name || 'Product';
    // image may be full or relative path; keep as-is
    const image = product.image || it.product_image || it.image || '/static/images/placeholder.png';
    const priceRaw = product.price ?? it.product_price ?? it.price ?? 0;
    const price = parseFloat(String(priceRaw).replace(/,/g, '')) || 0;
    const qty = it.quantity ?? 1;
    const subtotal = price * qty;

    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = `
      <img src="${image}" alt="${name}" />
      <div style="flex:1; padding-left:12px;">
        <h4 style="margin:0 0 6px">${name}</h4>
        <p style="margin:6px 0;color:#666">Price: ${fmtINR(price)}</p>
        <p style="margin:6px 0;color:#666">Quantity: ${qty}</p>
        <p style="margin:6px 0;font-weight:600">Subtotal: ${fmtINR(subtotal)}</p>
        <button class="btn-remove" data-id="${it.id}" style="margin-top:8px;">Remove</button>
      </div>
    `;
    container.appendChild(row);
  });

  // attach remove handlers
  container.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      btn.disabled = true;
      const ok = await removeCartItem(id);
      btn.disabled = false;
      if (ok) {
        await renderCartItems(containerId);
        await updateCartCount();
      }
    });
  });

  // update summary
  updateCartSummary(items);
}

// -------------------- Summary & count --------------------
function updateCartSummary(items) {
  const subtotalEl = document.getElementById('subtotal');
  const taxEl = document.getElementById('tax');
  const totalEl = document.getElementById('total');

  if (!subtotalEl || !taxEl || !totalEl) return;

  if (!items || items.length === 0) {
    subtotalEl.textContent = fmtINR(0);
    taxEl.textContent = fmtINR(0);
    totalEl.textContent = fmtINR(0);
    return;
  }

  let subtotal = 0;
  items.forEach(it => {
    const product = it.product || {};
    const priceRaw = product.price ?? it.product_price ?? it.price ?? 0;
    const price = parseFloat(String(priceRaw).replace(/,/g, '')) || 0;
    const qty = it.quantity ?? 1;
    subtotal += price * qty;
  });

  const tax = +(subtotal * 0.18);
  const total = subtotal + tax;

  document.getElementById('subtotal').textContent = fmtINR(subtotal);
  document.getElementById('tax').textContent = fmtINR(tax);
  document.getElementById('total').textContent = fmtINR(total);
}

async function updateCartCount(badgeId='cartCount') {
  const badge = document.getElementById(badgeId);
  if (!badge) return;
  const items = await fetchCartItems();
  badge.textContent = (items && items.length) ? items.length : 0;
  return badge.textContent;
}

// -------------------- Add to cart --------------------
async function addToCart(productIdentifier, quantity=1) {
  const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };
  if (!headers.Authorization) {
    alert('Please login to add items to cart.');
    window.location.href = '/login/';
    return;
  }

  // prepare candidate payloads (order matters)
  const tryPayloads = [];
  const numeric = /^-?\d+$/.test(String(productIdentifier));
  if (numeric) tryPayloads.push({ product_id: Number(productIdentifier), quantity });
  // common server expects numeric id in product_id; sometimes they accept string slug in 'product' or 'product_id'
  tryPayloads.push({ product_id: productIdentifier, quantity });
  tryPayloads.push({ product: productIdentifier, quantity });

  let lastErr = null;
  for (const payload of tryPayloads) {
    try {
      const resp = await fetch(`${window.API_BASE}/cart/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (resp.ok) {
        alert('Added to cart');
        await updateCartCount();
        await renderCartItems('cartItems');
        return;
      }

      const body = await safeParseJson(resp).catch(()=>null);
      log('addToCart attempt failed', resp.status, payload, body);

      if (body && typeof body === 'object') {
        // server field errors like {product_id: ["This field is required."]}
        const keys = Object.keys(body);
        if (keys.length) {
          const first = body[keys[0]];
          lastErr = Array.isArray(first) ? first.join('; ') : String(first);
        } else {
          lastErr = JSON.stringify(body);
        }
      } else if (typeof body === 'string') {
        lastErr = body;
      } else {
        lastErr = `HTTP ${resp.status}`;
      }
    } catch (e) {
      console.error('addToCart error', e);
      lastErr = e && e.message ? e.message : String(e);
    }
  }

  showError('Failed to add to cart: ' + (lastErr || 'unknown error'));
}

// -------------------- Checkout --------------------
async function doCheckout() {
  const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };
  if (!headers.Authorization) { showError('Login required to checkout'); window.location.href = '/login/'; return null; }

  try {
    const resp = await fetch(`${window.API_BASE}/checkout/`, { method: 'POST', headers });
    if (!resp.ok) {
      const body = await safeParseJson(resp).catch(()=>null);
      log('checkout failed', resp.status, body);
      const msg = (body && body.detail) ? body.detail : (typeof body === 'string' ? body : 'Checkout failed');
      showError('Failed to checkout: ' + msg);
      return null;
    }
    const order = await resp.json();
    return order;
  } catch (e) {
    console.error('doCheckout error', e);
    showError('Checkout failed: ' + (e.message || e));
    return null;
  }
}

// -------------------- Order progress UI --------------------
const ORDER_STEPS = ['cart','checkout','processing','shipped','delivered'];
function setOrderProgress(step) {
  const steps = document.querySelectorAll('#orderProgress .step');
  const index = ORDER_STEPS.indexOf(step);
  steps.forEach((s, i) => {
    s.classList.remove('active','completed');
    if (i < index) s.classList.add('completed');
    if (i === index) s.classList.add('active');
  });
  const status = document.getElementById('progressStatus');
  if (status) status.textContent = "Status: " + (step.charAt(0).toUpperCase() + step.slice(1));
}

// -------------------- Wiring on load --------------------
document.addEventListener('DOMContentLoaded', function() {
  // initial UI setup
  updateCartCount('cartCount');
  renderCartItems('cartItems');
  setOrderProgress('cart');

  // Checkout button: run checkout in-place (no immediate redirect)
  const checkoutBtn = document.getElementById('btnCheckout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async function () {
      // UI feedback
      checkoutBtn.disabled = true;
      const origText = checkoutBtn.textContent;
      checkoutBtn.textContent = 'Processing...';
      setOrderProgress('checkout');

      const order = await doCheckout();

      checkoutBtn.disabled = false;
      checkoutBtn.textContent = origText;

      if (order) {
        // success
        alert('Order placed! Order id: ' + (order.id || '(unknown)'));
        // update UI
        await renderCartItems('cartItems');
        await updateCartCount('cartCount');
        setOrderProgress('processing');
        // navigate to order detail page if exists
        if (order && order.id) {
          window.location.href = `/orders/${order.id}/`;
        }
      } else {
        // failed - revert stepper to cart
        setOrderProgress('cart');
      }
    });
  }

  // If any step elements are clickable (optional), allow clicking to change UI (debug)
  document.querySelectorAll('#orderProgress .step').forEach(s => {
    s.addEventListener('click', () => {
      const stepName = s.getAttribute('data-step');
      if (stepName) setOrderProgress(stepName);
    });
  });
});

// -------------------- Global expose --------------------
window.cart = window.cart || {};
Object.assign(window.cart, {
  fetchCartItems,
  renderCartItems,
  removeCartItem,
  updateCartSummary,
  updateCartCount,
  doCheckout
});
window.addToCart = addToCart;
