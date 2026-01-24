<template>
  <Layout>
    <div class="dod-reports-system">
      <Card class="reports-main-card">
        <template #title>
          <div class="page-header">
            <h1 class="page-title">Справки ДОД</h1>
            <p class="page-subtitle">Управление справками дополнительного образования</p>
          </div>
        </template>
        
        <template #content>
          <!-- Фильтры и табы -->
          <div class="reports-filters">
            <!-- Фильтр по году -->
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
            
            <!-- Табы для фильтрации справок -->
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
import { fetchUsers, type BackendUser } from '@/services/users'
import { fetchMainInfoList, type MainInfo } from '@/services/reports'

const router = useRouter()
const toast = useToast()

// Состояние
const activeTab = ref<'new' | 'rejected' | 'pending' | 'accepted'>('new')
const selectedYear = ref(null)
const loading = ref(false)
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
  switch (activeTab.value) {
    case 'new':
      return newReports.value
    case 'accepted':
      return acceptedReports.value
    case 'rejected':
      return rejectedReports.value
    case 'pending':
      return pendingReports.value
    default:
      return newReports.value
  }
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

const openRejectionReason = (report: any) => {
  reasonTitle.value = report.title
  reasonText.value = report.rejectionReason || 'Причина не указана'
  showReasonDialog.value = true
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
    title: `Справка о деятельности ДОД за ${year} год`,
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

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0;
}

.reports-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 2rem;
}

.year-filter {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-label {
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
}

.year-dropdown {
  min-width: 150px;
}

.reports-tabs {
  flex-shrink: 0;
}

.tab-buttons {
  display: flex;
  gap: 1rem;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  border: 2px solid rgba(22, 63, 94, 0.2);
  background: rgba(255, 255, 255, 0.6);
  color: #2c3e50;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.tab-button:hover {
  background: rgba(22, 63, 94, 0.1);
  border-color: rgba(22, 63, 94, 0.3);
}

.tab-button.active {
  background: #163F5E;
  color: white;
  border-color: #163F5E;
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
