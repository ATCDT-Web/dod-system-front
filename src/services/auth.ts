import type { LoginCredentials, User } from '@/types'
import { API_BASE_URL, authFetch } from '@/services/api'

export interface AuthResponse {
  token: string
  type?: string
  email: string
  name?: string
  isAdmin?: boolean
}

interface BackendUser {
  id: number
  name: string
  email: string
  district?: string
  educationalInstitution?: string
  position?: string
  admin?: boolean
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  district: string
  educationalInstitution: string
  position: string
  admin?: boolean
}

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'user'

const splitName = (fullName?: string) => {
  const normalized = (fullName || '').trim()
  if (!normalized) {
    return { firstName: '', lastName: '', fullName: '' }
  }
  const parts = normalized.split(/\s+/)
  const firstName = parts[0] || ''
  const lastName = parts.slice(1).join(' ')
  return { firstName, lastName, fullName: normalized }
}

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY)

export const getStoredUser = (): User | null => {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export const isAuthenticated = (): boolean => Boolean(getToken())

export const saveAuth = (response: AuthResponse): User => {
  const { firstName, lastName, fullName } = splitName(response.name)
  const role = response.isAdmin ? 'admin_system' : 'admin_ou'
  const user: User = {
    id: response.email,
    email: response.email,
    firstName,
    lastName,
    fullName,
    district: '',
    institutionType: '',
    institutionName: '',
    role
  }

  if (response.token) {
    localStorage.setItem(TOKEN_KEY, response.token)
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  return user
}

export const fetchUserProfile = async (): Promise<User | null> => {
  const storedUser = getStoredUser()
  if (!getToken()) return null

  const response = await authFetch('/api/user/me')

  if (!response.ok) {
    throw new Error('Не удалось загрузить данные профиля')
  }

  const profile = (await response.json()) as BackendUser
  const { firstName, lastName, fullName } = splitName(profile.name)
  const updated: User = {
    ...(storedUser ?? {
      id: profile.email,
      email: profile.email,
      firstName: '',
      lastName: '',
      fullName: '',
      district: '',
      institutionType: '',
      institutionName: '',
      role: 'admin_ou'
    }),
    email: profile.email,
    firstName: firstName || storedUser?.firstName || '',
    lastName: lastName || storedUser?.lastName || '',
    fullName: fullName || storedUser?.fullName || '',
    district: profile.district || storedUser?.district || '',
    institutionName: profile.educationalInstitution || storedUser?.institutionName || '',
    role: profile.admin ? 'admin_system' : 'admin_ou'
  }

  localStorage.setItem(USER_KEY, JSON.stringify(updated))
  return updated
}

export const login = async (credentials: LoginCredentials): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  })

  if (!response.ok) {
    throw new Error('Неверный email или пароль')
  }

  const data = (await response.json()) as AuthResponse
  return saveAuth(data)
}

export const register = async (payload: RegisterPayload): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Не удалось зарегистрировать пользователя')
  }
}

export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const getHomeRoute = (user: User | null): string => {
  if (!user) return '/login'
  return user.role === 'admin_system' ? '/system/dashboard' : '/ou/dashboard'
}
