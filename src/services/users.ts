export interface BackendUser {
  id: number
  name: string
  email: string
  district?: string
  educationalInstitution?: string
  position?: string
  admin?: boolean
}

export interface UpdateUserPayload {
  name?: string
  email?: string
  password?: string
  district?: string
  educationalInstitution?: string
  position?: string
  admin?: boolean
}

import { authFetch } from '@/services/api'

export const fetchUsers = async (): Promise<BackendUser[]> => {
  const response = await authFetch('/api/user/getAllUsers')

  if (!response.ok) {
    throw new Error('Не удалось загрузить пользователей')
  }

  return (await response.json()) as BackendUser[]
}

export const fetchUserById = async (id: string): Promise<BackendUser> => {
  const response = await authFetch(`/api/user/${id}`)

  if (!response.ok) {
    throw new Error('Не удалось загрузить пользователя')
  }

  return (await response.json()) as BackendUser
}

export const updateUser = async (id: string, payload: UpdateUserPayload): Promise<BackendUser> => {
  const response = await authFetch(`/api/user/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error('Не удалось сохранить пользователя')
  }

  return (await response.json()) as BackendUser
}

export const deleteUser = async (id: string): Promise<void> => {
  const response = await authFetch(`/api/user/delete/${id}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    throw new Error('Не удалось удалить пользователя')
  }
}
