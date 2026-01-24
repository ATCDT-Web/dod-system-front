export interface MainInfo {
  id: number
  organizationName: string
  postalAddress?: string
  okudFormCode?: string
  okpoOrgCode?: string
  changeDate1?: string
  changeNumber1?: string
  changeDate2?: string
  changeNumber2?: string
  status?: string
  rejectionReason?: string
}

export interface ContactInfo {
  id: number
  position?: string
  fullName?: string
  phoneNumber?: string
  email?: string
  documentDay?: string
  documentMonth?: string
  documentYear?: string
}

export interface PageResponse<T> {
  totalPages: number
  totalElements: number
  size: number
  content: T[]
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082'

export const fetchMainInfoList = async (page = 0, size = 100): Promise<PageResponse<MainInfo>> => {
  const response = await fetch(`${API_BASE_URL}/api/unit/getMainInfoList?page=${page}&size=${size}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (response.status === 204) {
    return { totalPages: 0, totalElements: 0, size, content: [] }
  }

  if (!response.ok) {
    throw new Error('Не удалось загрузить список справок')
  }

  return (await response.json()) as PageResponse<MainInfo>
}

export const fetchMainInfo = async (id: string): Promise<MainInfo> => {
  const response = await fetch(`${API_BASE_URL}/api/unit/getMainInfo?id=${id}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('Не удалось загрузить справку')
  }

  return (await response.json()) as MainInfo
}

export const updateReportStatus = async (
  id: string,
  status: string,
  rejectionReason?: string | null
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/unit/updateStatus`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: Number(id),
      status,
      rejectionReason: rejectionReason ?? null
    })
  })

  if (!response.ok) {
    throw new Error('Не удалось обновить статус справки')
  }
}

export const fetchContactInfo = async (id: string): Promise<ContactInfo> => {
  const response = await fetch(`${API_BASE_URL}/api/unit/getContactInfo?id=${id}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('Не удалось загрузить контактные данные')
  }

  return (await response.json()) as ContactInfo
}

export const fetchUnit = async (unitNumber: number, id: string): Promise<Record<string, any>> => {
  const response = await fetch(`${API_BASE_URL}/api/unit/getUnit${unitNumber}?id=${id}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Не удалось загрузить раздел ${unitNumber}`)
  }

  return (await response.json()) as Record<string, any>
}
