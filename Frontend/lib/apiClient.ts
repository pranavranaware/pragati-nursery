const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1'

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
  timestamp?: string
}

export class ApiError extends Error {
  status: number
  data: any

  constructor(message: string, status: number, data?: any) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('pragati_token') || sessionStorage.getItem('pragati_token')
}

export function setAuthToken(token: string, remember = true) {
  if (typeof window === 'undefined') return
  if (remember) {
    localStorage.setItem('pragati_token', token)
  } else {
    sessionStorage.setItem('pragati_token', token)
  }
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('pragati_token')
  sessionStorage.removeItem('pragati_token')
}

let refreshPromise: Promise<string | null> | null = null

async function performTokenRefresh(): Promise<string | null> {
  try {
    const url = `${API_BASE_URL}/auth/refresh`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) {
      return null
    }

    const body = await response.json()
    const data = body?.data || body
    if (data && data.accessToken) {
      setAuthToken(data.accessToken)
      return data.accessToken
    }
    return null
  } catch {
    return null
  }
}

function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = performTokenRefresh().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`
  const token = getAuthToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (options.body instanceof FormData) {
    delete headers['Content-Type']
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })

  let body: any = null
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    body = await response.json()
  } else {
    const text = await response.text()
    body = text ? { message: text } : null
  }

  if (!response.ok) {
    if (response.status === 401) {
      const isAuthEndpoint =
        endpoint.includes('/auth/login') ||
        endpoint.includes('/auth/register') ||
        endpoint.includes('/auth/refresh')

      if (!isRetry && !isAuthEndpoint) {
        const newToken = await refreshAccessToken()
        if (newToken) {
          return fetchApi<T>(endpoint, options, true)
        }
      }

      clearAuthToken()
      if (typeof window !== 'undefined' && !isAuthEndpoint) {
        if (window.location.pathname.startsWith('/admin') && !window.location.pathname.startsWith('/admin/login')) {
          window.location.href = '/admin/login'
        }
      }
      const errorMessage = 'Your session has expired. Please log in again.'
      throw new ApiError(errorMessage, 401, body)
    }

    const errorMessage = body?.message || body?.error || `Request failed with status ${response.status}`
    throw new ApiError(errorMessage, response.status, body)
  }

  if (body && typeof body === 'object' && 'data' in body && 'success' in body) {
    return body.data as T
  }

  return body as T
}
