// auth.js
// Small helper to store/get JWT tokens in localStorage

const API_BASE = "/api";

export function saveTokens(tokens) {
  localStorage.setItem('access_token', tokens.access);
  localStorage.setItem('refresh_token', tokens.refresh);
}

export function getAccessToken() {
  return localStorage.getItem('access_token');
}

export function loggedIn() {
  return !!getAccessToken();
}

export async function login(username, password) {
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

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}
