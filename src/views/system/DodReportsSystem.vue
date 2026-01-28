<template>
  <Layout>
    <div class="dod-reports-system">
      <Card class="reports-main-card">
        <template #title>
          <div class="page-header modern-header">
            <div class="title-block">
              <div class="title-eyebrow">Панель управления</div>
              <h1 class="page-title">Справки ДОД</h1>
              <p class="page-subtitle">Управление справками дополнительного образования</p>
            </div>
            <div class="header-actions">
              <Button
                label="Создать справку"
                icon="pi pi-plus"
                class="creation-button"
                @click="createReport"
              />
            </div>
          </div>
        </template>
        
        <template #content>
          <!-- Фильтры и табы -->
          <div class="reports-filters">
            <div class="filters-left">
              <div class="search-filter">
                <label class="filter-label">Поиск:</label>
                <div class="search-container">
                  <i class="pi pi-search search-icon"></i>
                  <InputText
                    v-model="searchQuery"
                    placeholder="Поиск по справкам"
                    class="search-input"
                  />
                </div>
              </div>
              <div class="year-filter">
                <label class="filter-label">Год:</label>
                <Dropdown
                  v-model="selectedYear"
                  :options="availableYears"
                  option-label="label"
                  option-value="value"
                  placeholder="Выберите год"
                  class="year-dropdown"
                  @change="filterByYear"
                />
              </div>
            </div>

            <div class="reports-tabs">
              <div class="tab-buttons">
                <Button
                  :label="`Новые (${newReports.length})`"
                  :class="['tab-button', { active: activeTab === 'new' }]"
                  @click="activeTab = 'new'"
                />
                <Button
                  :label="`Принятые (${acceptedReports.length})`"
                  :class="['tab-button', { active: activeTab === 'accepted' }]"
                  @click="activeTab = 'accepted'"
                />
                <Button
                  :label="`Отклоненные (${rejectedReports.length})`"
                  :class="['tab-button', { active: activeTab === 'rejected' }]"
                  @click="activeTab = 'rejected'"
                />
                <Button
                  :label="`На проверке (${pendingReports.length})`"
                  :class="['tab-button', { active: activeTab === 'pending' }]"
                  @click="activeTab = 'pending'"
                />
              </div>
            </div>
          </div>
          
          <!-- Таблица справок -->
          <div class="reports-table">
            <DataTable
              :value="currentReports"
              :paginator="true"
              :rows="10"
              :rowsPerPageOptions="[5, 10, 20, 50]"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Показано {first} - {last} из {totalRecords} записей"
              :loading="loading"
              class="p-datatable-sm"
              :selectionMode="'single'"
              @row-select="onRowSelect"
              @row-click="onRowClick"
            >
              <template #empty>
                <div class="table-empty">Данных пока нет</div>
              </template>
              <Column field="id" header="ID" :sortable="true" style="width: 80px">
                <template #body="slotProps">
                  <span class="report-id">{{ slotProps.data.id }}</span>
                </template>
              </Column>
              
              <Column field="title" header="Название справки" :sortable="true">
                <template #body="slotProps">
                  <div class="report-title-cell">
                    <h4 class="report-title">{{ slotProps.data.title }}</h4>
                    <p class="report-institution">{{ slotProps.data.institution }}</p>
                  </div>
                </template>
              </Column>
              
              <Column field="district" header="Район" :sortable="true">
                <template #body="slotProps">
                  <span class="report-district">{{ formatDistrict(slotProps.data.district) }}</span>
                </template>
              </Column>
              
              <Column field="submittedBy" header="Подал" :sortable="true">
                <template #body="slotProps">
                  <div class="submitter-info">
                    <span class="submitter-name">{{ slotProps.data.submittedBy }}</span>
                    <span class="submit-date">{{ formatDate(slotProps.data.submittedAt) }}</span>
                  </div>
                </template>
              </Column>
              
              <Column field="status" header="Статус" :sortable="true">
                <template #body="slotProps">
                  <Tag
                    :value="slotProps.data.status"
                    :severity="getStatusSeverity(slotProps.data.status)"
                    class="status-tag"
                  />
                </template>
              </Column>
              
              <Column field="actions" header="Действия" style="width: 100px">
                <template #body="slotProps">
                  <div class="action-buttons">
                    <Button
                      v-if="slotProps.data.status === 'Отклонено' && slotProps.data.rejectionReason"
                      label="Причина"
                      icon="pi pi-info-circle"
                      class="p-button-sm p-button-text p-button-secondary"
                      @click.stop="openRejectionReason(slotProps.data)"
                    />
                    <Button
                      label="Открыть"
                      icon="pi pi-external-link"
                      class="p-button-sm p-button-secondary"
                      @click="viewSections(slotProps.data)"
                    />
                    <Button
                      label="Удалить"
                      icon="pi pi-trash"
                      class="p-button-sm p-button-danger"
                      @click.stop="confirmDeleteReport(slotProps.data)"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
        </template>
      </Card>
    </div>

    <Dialog
      v-model:visible="showReasonDialog"
      header="Причина отклонения"
      :modal="true"
      :style="{ width: '520px' }"
      class="reason-dialog"
    >
      <div class="reason-content">
        <p class="reason-title">{{ reasonTitle }}</p>
        <div class="reason-text">{{ reasonText }}</div>
      </div>

      <template #footer>
        <Button
          label="Закрыть"
          icon="pi pi-times"
          class="p-button-text"
          @click="showReasonDialog = false"
        />
      </template>
    </Dialog>
    
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Layout from '@/components/Layout.vue'
import Tag from 'primevue/tag'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import { fetchUsers, type BackendUser } from '@/services/users'
import { fetchMainInfoList, type MainInfo, deleteReport } from '@/services/reports'

const router = useRouter()
const toast = useToast()

// Состояние
const activeTab = ref<'new' | 'rejected' | 'pending' | 'accepted'>('new')
const selectedYear = ref(null)
const loading = ref(false)
const searchQuery = ref('')
const showReasonDialog = ref(false)
const reasonText = ref('')
const reasonTitle = ref('')

// Данные справок
const reports = ref<Array<{
  id: string
  title: string
  institution: string
  district: string
  status: string
  submittedBy: string
  submittedAt: Date
  year: number
  completedSections: number
  totalSections: number
  rejectionReason?: string
}>>([])

// Computed properties
const availableYears = computed(() => {
  const years = [...new Set(reports.value.map(r => r.year))].sort((a, b) => b - a)
  return years.map(year => ({
    label: `${year} год`,
    value: year
  }))
})

const newReports = computed(() => {
  let filtered = reports.value.filter(r => r.status === 'Новая')
  if (selectedYear.value) {
    filtered = filtered.filter(r => r.year === selectedYear.value)
  }
  return filtered
})

const rejectedReports = computed(() => {
  let filtered = reports.value.filter(r => r.status === 'Отклонено')
  if (selectedYear.value) {
    filtered = filtered.filter(r => r.year === selectedYear.value)
  }
  return filtered
})

const acceptedReports = computed(() => {
  let filtered = reports.value.filter(r => r.status === 'Принято')
  if (selectedYear.value) {
    filtered = filtered.filter(r => r.year === selectedYear.value)
  }
  return filtered
})

const pendingReports = computed(() => {
  let filtered = reports.value.filter(r => r.status === 'На проверке')
  if (selectedYear.value) {
    filtered = filtered.filter(r => r.year === selectedYear.value)
  }
  return filtered
})

const currentReports = computed(() => {
  let list = []
  switch (activeTab.value) {
    case 'new':
      list = newReports.value
      break
    case 'accepted':
      list = acceptedReports.value
      break
    case 'rejected':
      list = rejectedReports.value
      break
    case 'pending':
      list = pendingReports.value
      break
    default:
      list = newReports.value
  }
  if (!searchQuery.value) return list
  const q = searchQuery.value.toLowerCase().trim()
  return list.filter(report => {
    const haystack = [
      report.title,
      report.institution,
      report.district,
      report.submittedBy,
      String(report.id)
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
})

// Methods
const filterByYear = () => {
  console.log('Фильтрация по году:', selectedYear.value)
}

const getStatusSeverity = (status: string) => {
  const severityMap: Record<string, string> = {
    'Новая': 'info',
    'На проверке': 'warning',
    'Отклонено': 'danger',
    'Принято': 'success'
  }
  return severityMap[status] || 'info'
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('ru-RU')
}

const districtLabels: Record<string, string> = {
  central: 'Центральный район',
  north: 'Северный район',
  south: 'Южный район',
  east: 'Восточный район',
  west: 'Западный район'
}

const formatDistrict = (district: string) => {
  return districtLabels[district] || district || 'Не указан'
}

const onRowSelect = (event: any) => {
  console.log('Выбрана справка:', event.data)
}

const onRowClick = (event: any) => {
  console.log('Клик по строке:', event.data)
  viewSections(event.data)
}

const viewSections = (report: any) => {
  router.push(`/system/report-sections/${report.id}`)
}

const createReport = () => {
  router.push('/system/dod-reports/create')
}

const openRejectionReason = (report: any) => {
  reasonTitle.value = report.title
  reasonText.value = report.rejectionReason || 'Причина не указана'
  showReasonDialog.value = true
}

const confirmDeleteReport = async (report: any) => {
  const ok = window.confirm(`Удалить справку «${report.title}»?`)
  if (!ok) return
  try {
    await deleteReport(Number(report.id))
    reports.value = reports.value.filter(item => item.id !== report.id)
    toast.add({
      severity: 'success',
      summary: 'Справки ДОД',
      detail: 'Справка удалена',
      life: 2500
    })
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Справки ДОД',
      detail: 'Не удалось удалить справку',
      life: 3000
    })
  }
}

  const resolveSubmitter = (organizationName: string, users: BackendUser[]) => {
    return users.find(user => user.educationalInstitution === organizationName)
  }

  const mapReport = (info: MainInfo, users: BackendUser[]) => {
    const dateSource = info.changeDate2 || info.changeDate1
    const submittedAt = dateSource ? new Date(dateSource) : new Date()
    const year = submittedAt.getFullYear()
    const submitter = resolveSubmitter(info.organizationName, users)
    const status = info.status || (info.changeNumber2 ? 'На проверке' : 'Новая')
    return {
      id: String(info.id),
      title: info.reportTitle || `Справка о деятельности ДОД за ${year} год`,
      institution: info.organizationName,
      district: submitter?.district || 'Не указан',
      status,
      submittedBy: submitter?.name || submitter?.email || 'Не указано',
      submittedAt,
      year,
      completedSections: 0,
      totalSections: 18,
      rejectionReason: info.rejectionReason || ''
    }
  }

// Lifecycle
onMounted(async () => {
  loading.value = true
  try {
    const [mainInfoPage, users] = await Promise.all([
      fetchMainInfoList(0, 100),
      fetchUsers()
    ])
    reports.value = mainInfoPage.content.map(info => mapReport(info, users))
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Справки ДОД',
      detail: 'Не удалось загрузить список справок',
      life: 3000
    })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.dod-reports-system {
  width: 100%;
}

.reports-main-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.6s ease-out;
}

.header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.page-header {
  text-align: left;
  margin-bottom: 2rem;
}

.modern-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
}

.title-block {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.title-eyebrow {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #6b7280;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.page-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.reports-filters {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(22, 63, 94, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(22, 63, 94, 0.1);
  backdrop-filter: blur(10px);
  flex-wrap: wrap;
}

.filters-left {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  flex: 1;
}

.search-filter {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.creation-button {
  background: #1d4ed8;
  border: none;
  color: white;
}

.year-filter {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.filter-label {
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.year-dropdown {
  min-width: 150px;
}

.search-container {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding-left: 2.5rem;
  border-radius: 25px;
  border: 1px solid rgba(22, 63, 94, 0.2);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.reports-tabs {
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
}

.tab-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

:deep(.tab-button) {
  padding: 0.7rem 1.2rem;
  border: 1.5px solid rgba(22, 63, 94, 0.45) !important;
  background: transparent !important;
  color: #1f2937 !important;
  box-shadow: none !important;
  border-radius: 999px;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.tab-button:hover) {
  background: rgba(22, 63, 94, 0.08) !important;
  border-color: rgba(22, 63, 94, 0.6) !important;
}

:deep(.tab-button.active) {
  background: #163F5E !important;
  color: white !important;
  border-color: #163F5E !important;
}

.reports-table {
  margin-top: 2rem;
}

.report-id {
  font-weight: 600;
  color: #163F5E;
  font-size: 0.9rem;
}

.report-title-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.report-title {
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  font-size: 0.95rem;
}

.report-institution {
  color: #6b7280;
  margin: 0;
  font-size: 0.85rem;
}

.report-district {
  color: #4a5568;
  font-weight: 500;
}

.submitter-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.submitter-name {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.submit-date {
  color: #6b7280;
  font-size: 0.8rem;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.action-buttons .p-button {
  font-size: 0.8rem;
  padding: 0.4rem 0.8rem;
}

.reason-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.reason-title {
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.reason-text {
  background: rgba(220, 53, 69, 0.08);
  border: 1px solid rgba(220, 53, 69, 0.2);
  border-radius: 12px;
  padding: 1rem;
  color: #2c3e50;
  white-space: pre-wrap;
}

.table-empty {
  padding: 1.5rem 0;
  text-align: center;
  color: #6b7280;
  font-weight: 500;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
