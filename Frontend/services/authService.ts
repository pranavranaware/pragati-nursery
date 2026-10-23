import { fetchApi, setAuthToken, clearAuthToken } from '@/lib/apiClient'
import type { AuthUser } from '@/types/domain'

export const demoAdmin: AuthUser = {
  id: 'admin-1',
  name: 'Pragati Admin',
  email: 'admin@pragatinursery.in',
  role: 'ADMIN',
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresInMs: number
  user: {
    id: number
    name: string
    email: string
    role: 'ADMIN' | 'CUSTOMER'
  }
}

const normalizeRole = (role?: string): 'ADMIN' | 'CUSTOMER' =>
  role && role.toUpperCase().includes('ADMIN') ? 'ADMIN' : 'CUSTOMER'

export const authService = {
  async login(email: string, password: string): Promise<AuthUser | null> {
    try {
      const res = await fetchApi<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      if (res && res.accessToken) {
        setAuthToken(res.accessToken)
        return {
          id: String(res.user.id),
          name: res.user.name,
          email: res.user.email,
          role: normalizeRole(res.user.role),
        }
      }
      return null
    } catch (err) {
      console.error('Login error:', err)
      throw err
    }
  },

  async register(name: string, email: string, password: string): Promise<AuthUser | null> {
    try {
      const res = await fetchApi<LoginResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      })

      if (res && res.accessToken) {
        setAuthToken(res.accessToken)
        return {
          id: String(res.user.id),
          name: res.user.name,
          email: res.user.email,
          role: normalizeRole(res.user.role),
        }
      }
      return null
    } catch (err) {
      console.error('Registration error:', err)
      throw err
    }
  },

  async me(): Promise<AuthUser | null> {
    try {
      const res = await fetchApi<any>('/auth/me')
      if (res) {
        return {
          id: String(res.id),
          name: res.name,
          email: res.email,
          role: normalizeRole(res.role),
        }
      }
      return null
    } catch {
      return null
    }
  },

  async logout(): Promise<void> {
    try {
      await fetchApi('/auth/logout', { method: 'POST' })
    } catch {
      // Ignore network failure on logout
    } finally {
      clearAuthToken()
    }
  },
}
