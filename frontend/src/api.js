// Talks to the FastAPI backend. BASE defaults to "/api", which both the
// Vite dev server and nginx (in Docker) proxy through to the backend.
const BASE = import.meta.env.VITE_API_BASE || '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body.detail) {
        message = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail)
      }
    } catch { /* no JSON body */ }
    throw new Error(message)
  }

  if (res.status === 204) return null
  return res.json()
}

export const api = {
  // Pings the backend health endpoint. The proxy strips "/api", so "/api/"
  // maps to the backend's "/" health route. Returns true if the service
  // responds, false on any network error or non-OK status.
  health: async () => {
    try {
      const res = await fetch(`${BASE}/`, { headers: { 'Content-Type': 'application/json' } })
      return res.ok
    } catch {
      return false
    }
  },
  products: {
    list: () => request('/products'),
    create: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  },
  customers: {
    list: () => request('/customers'),
    create: (data) => request('/customers', { method: 'POST', body: JSON.stringify(data) }),
    remove: (id) => request(`/customers/${id}`, { method: 'DELETE' }),
  },
  orders: {
    list: () => request('/orders'),
    create: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  },
}
