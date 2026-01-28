import { authFetch } from '@/services/api'

export interface CreateInstitutionPayload {
  institutionName: string
  adminName: string
  email: string
  district?: string
  position?: string
  phone?: string
  address?: string
}

export interface CreateReportPayload {
  userId: number | string
  title: string
}

export const createInstitution = async (payload: CreateInstitutionPayload): Promise<void> => {
  const response = await authFetch('/api/admin/institutions', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || 'Не удалось создать образовательное учреждение')
  }
}

export const createReport = async (payload: CreateReportPayload): Promise<number> => {
  const response = await authFetch('/api/admin/reports', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || 'Не удалось создать справку')
  }
  const data = await response.json()
  return data.id
}
