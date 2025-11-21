const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Get base server URL without /api suffix (for profile pictures, Strava redirects, etc.)
export function getServerBaseUrl() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  // Remove /api from the end if present
  return apiUrl.replace(/\/api\/?$/, '') || 'http://localhost:4000';
}

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Request failed');
  }

  return res.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
