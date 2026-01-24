// Типы для пользователя
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName?: string
  district: string
  institutionType: string
  institutionName: string
  role: 'admin_system' | 'admin_ou'
  verified?: boolean
  verificationCode?: string
  createdAt?: string
  verifiedAt?: string
}

// Типы для аутентификации
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  district: string
  institutionType: string
  institutionName: string
  position: string
}

// Типы для опций выбора
export interface SelectOption {
  label: string
  value: string
}

// Типы для роутера
export interface RouteMeta {
  requiresAuth?: boolean
  title?: string
}

// Типы для API ответов
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Типы для компонентов
export interface ComponentProps {
  [key: string]: any
}

// Типы для событий
export interface CustomEvent {
  type: string
  payload?: any
}

// Типы для подтверждения email
export interface EmailVerification {
  email: string
  code: string
  expiresAt: string
  attempts: number
}

export interface EmailVerificationData {
  email: string
  code: string
}
