import { authFetch, authFetchForm } from '@/services/api'

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
  reportTitle?: string
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

import { authFetch } from '@/services/api'

export const fetchMainInfoList = async (page = 0, size = 100): Promise<PageResponse<MainInfo>> => {
  const response = await authFetch(`/api/unit/getMainInfoList?page=${page}&size=${size}`)

  if (response.status === 204) {
    return { totalPages: 0, totalElements: 0, size, content: [] }
  }

  if (!response.ok) {
    throw new Error('Не удалось загрузить список справок')
  }

  return (await response.json()) as PageResponse<MainInfo>
}

export const fetchMainInfo = async (id: string): Promise<MainInfo> => {
  const response = await authFetch(`/api/unit/getMainInfo?id=${id}`)

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
  const response = await authFetch('/api/unit/updateStatus', {
    method: 'PUT',
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
  const response = await authFetch(`/api/unit/getContactInfo?id=${id}`)

  if (!response.ok) {
    throw new Error('Не удалось загрузить контактные данные')
  }

  return (await response.json()) as ContactInfo
}

export const fetchUnit = async (unitNumber: number, id: string): Promise<Record<string, any>> => {
  const response = await authFetch(`/api/unit/getUnit${unitNumber}?id=${id}`)

  if (!response.ok) {
    throw new Error(`Не удалось загрузить раздел ${unitNumber}`)
  }

  return (await response.json()) as Record<string, any>
}

export interface ImportExcelError {
  section: string
  field: string
  cell: string
  message: string
}

export interface ImportExcelResponse {
  updatedSections: string[]
  errors: ImportExcelError[]
}

export const importReportExcel = async (
  id: string,
  files: File[],
  mode: 'partial' | 'full' = 'partial'
): Promise<ImportExcelResponse> => {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))

  const response = await authFetchForm(
    `/api/unit/importExcel?reportId=${encodeURIComponent(id)}&mode=${encodeURIComponent(mode)}`,
    {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error('Не удалось импортировать Excel')
  }

  return (await response.json()) as ImportExcelResponse
}

export const downloadUnitExcel = async (unit: number, organizationName: string): Promise<Blob> => {
  const response = await authFetch(`/api/unit/export/unit${unit}/${encodeURIComponent(organizationName)}`, {
    method: 'GET'
  })

  if (!response.ok) {
    throw new Error('Не удалось сформировать Excel')
  }

  return await response.blob()
}

export const downloadUnitExcelByDistrict = async (unit: number, district: string): Promise<Blob> => {
  const response = await authFetch(`/api/unit/export/unit/${unit}/district/${encodeURIComponent(district)}`, {
    method: 'GET'
  })

  if (!response.ok) {
    throw new Error('Не удалось сформировать Excel')
  }

  return await response.blob()
}

export const deleteReport = async (id: number): Promise<void> => {
  const response = await authFetch(`/api/unit/delete/${id}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    throw new Error('Не удалось удалить справку')
  }
}
