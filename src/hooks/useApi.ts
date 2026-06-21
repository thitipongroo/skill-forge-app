"use client";

// Same-origin fetch helper. The Auth.js session cookie is sent automatically,
// so no manual auth header is needed.
export async function apiFetch(url: string, init: RequestInit = {}) {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
  });
  if (res.status === 401) { if (typeof window !== "undefined") window.location.href = "/login"; throw new Error("unauthorized"); }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.status === 204 ? null : res.json();
}
