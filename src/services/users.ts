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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082'

export const fetchUsers = async (): Promise<BackendUser[]> => {
  const response = await fetch(`${API_BASE_URL}/api/user/getAllUsers`, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('Не удалось загрузить пользователей')
  }

  return (await response.json()) as BackendUser[]
}

export const fetchUserById = async (id: string): Promise<BackendUser> => {
  const response = await fetch(`${API_BASE_URL}/api/user/${id}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('Не удалось загрузить пользователя')
  }

  return (await response.json()) as BackendUser
}

export const updateUser = async (id: string, payload: UpdateUserPayload): Promise<BackendUser> => {
  const response = await fetch(`${API_BASE_URL}/api/user/update/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error('Не удалось сохранить пользователя')
  }

  return (await response.json()) as BackendUser
}

export const deleteUser = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/user/delete/${id}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    throw new Error('Не удалось удалить пользователя')
  }
}
