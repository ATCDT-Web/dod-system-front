export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082'

const buildUrl = (path: string) => (path.startsWith('http') ? path : `${API_BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`)

export const authFetch = async (path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('auth_token')
  const headers = new Headers(options.headers ?? {})
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers
  })

  if (response.status === 401) {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }

  return response
}

export const buildJsonBody = (value: unknown) => JSON.stringify(value)

export const authFetchForm = async (path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('auth_token')
  const headers = new Headers(options.headers ?? {})
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers
  })

  if (response.status === 401) {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }

  return response
}
