// src/utils/api.js
// Centralized fetch wrapper — every network call in the app goes through this file.
// Change API_BASE_URL via .env (VITE_API_URL) when you deploy the backend somewhere
// other than localhost.

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

async function request(path, { method = "GET", body, isFormData = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isFormData && body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    // Surface the backend's error message (validation errors, 401s, etc.)
    const message = data?.error || `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return data;
}

export const api = {
  get:    (path)              => request(path),
  post:   (path, body)        => request(path, { method: "POST",   body }),
  patch:  (path, body)        => request(path, { method: "PATCH",  body }),
  delete: (path)               => request(path, { method: "DELETE" }),
  upload: (path, formData)    => request(path, { method: "POST", body: formData, isFormData: true }),
};

export { API_BASE_URL };
