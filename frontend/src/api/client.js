export const apiBase = () => (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')

export async function api(path, { method = 'GET', json, token, auth = true } = {}) {
  const headers = {}
  if (json !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (auth && token) {
    headers.Authorization = `Bearer ${token}`
  }
  const res = await fetch(`${apiBase()}${path}`, {
    method,
    headers,
    body: json !== undefined ? JSON.stringify(json) : undefined,
  })
  const text = await res.text()
  let body
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = text
  }
  if (!res.ok) {
    const err = new Error(typeof body?.error === 'string' ? body.error : `HTTP ${res.status}`)
    err.status = res.status
    err.body = body
    throw err
  }
  return body
}

export async function uploadContent(token, formData) {
  const res = await fetch(`${apiBase()}/api/content/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  const text = await res.text()
  let body
  try {
    body = text ? JSON.parse(text) : text
  } catch {
    body = text
  }
  if (!res.ok) {
    const err = new Error(body?.error || body?.message || `HTTP ${res.status}`)
    err.body = body
    throw err
  }
  return body
}
