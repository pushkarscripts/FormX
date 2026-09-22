const API_ROOT = '/api';

export function getToken() {
  return localStorage.getItem('formx_token');
}

export function setSession({ token, admin }) {
  localStorage.setItem('formx_token', token);
  localStorage.setItem('formx_admin', JSON.stringify(admin));
}

export function clearSession() {
  localStorage.removeItem('formx_token');
  localStorage.removeItem('formx_admin');
}

export function getStoredAdmin() {
  const value = localStorage.getItem('formx_admin');
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    clearSession();
    return null;
  }
}

export async function apiRequest(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_ROOT}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}
