export interface BackendUser {
  id: number
  name: string
  email: string
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
