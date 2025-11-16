// static/Javascript/auth.js  (non-module, safe to include with normal <script> tags)

const API_BASE = "/api";   // only define once

function saveTokens(tokens) {
  try {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  } catch (e) {
    console.error('Failed saving tokens', e);
  }
}

function getAccessToken() {
  return localStorage.getItem('access_token');
}

function getRefreshToken() {
  return localStorage.getItem('refresh_token');
}

function loggedIn() {
  return !!getAccessToken();
}

async function login(username, password) {
  const resp = await fetch(`${API_BASE}/auth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!resp.ok) {
    const err = await resp.json().catch(()=>({detail: 'Login failed'}));
    throw err;
  }
  const tokens = await resp.json();
  saveTokens(tokens);
  return tokens;
}

function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  // optionally redirect:
  // window.location.href = '/login/';
}

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const resp = await fetch(`${API_BASE}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh })
    });
    if (!resp.ok) {
      logout();
      return false;
    }
    const data = await resp.json();
    localStorage.setItem('access_token', data.access);
    return true;
  } catch(e) {
    console.error('refresh failed', e);
    logout();
    return false;
  }
}

// small helper to check token expiry (without external lib)
function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    if (!exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return now >= exp;
  } catch (e) {
    return true;
  }
}

// call on page load to auto-refresh if possible
async function ensureValidAccess() {
  const access = getAccessToken();
  if (!access) return false;
  if (isTokenExpired(access)) {
    return await refreshAccessToken();
  }
  return true;
}

// expose to global
window.auth = {
  API_BASE,
  saveTokens,
  getAccessToken,
  getRefreshToken,
  loggedIn,
  login,
  logout,
  refreshAccessToken,
  isTokenExpired,
  ensureValidAccess
};
