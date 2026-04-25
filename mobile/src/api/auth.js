import apiClient from './client';
import { API_URL } from '../constants';

async function postJson(path, body) {
  const url = `${API_URL}${path}`;
  console.log(`[auth] POST ${url}`, JSON.stringify(body));
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  console.log(`[auth] ${res.status}`, text.slice(0, 200));
  if (!res.ok) {
    const parsed = text ? JSON.parse(text) : {};
    const err = new Error(parsed.error || `Server returned ${res.status}`);
    err.response = { status: res.status, data: parsed };
    throw err;
  }
  return { data: JSON.parse(text) };
}

export const authApi = {
  emailLogin: (email, password) => postJson('/auth/login', { email, password }),
  googleLogin: (idToken) => postJson('/auth/google', { idToken }),
  appleLogin: (identityToken, fullName) => postJson('/auth/apple', { identityToken, fullName }),
  devLogin: (email, role = 'User') => postJson('/auth/dev-login', { email, role }),
  getMe: () => apiClient.get('/auth/me'),
};
