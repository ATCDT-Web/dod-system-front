<template>
  <Layout>
    <div class="institution-detail">
      <div class="page-header">
        <div class="header-content">
          <Button 
            icon="pi pi-arrow-left" 
            label="Назад к списку" 
            class="p-button-text back-button"
            @click="goBack"
          />
          <div class="header-info">
            <h1 class="page-title">{{ institution.name }}</h1>
            <p class="page-subtitle">{{ institution.code }} • {{ formatDistrict(institution.district) }}</p>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <!-- Основная информация -->
        <Card class="info-card">
          <template #header>
            <h2>Основная информация</h2>
          </template>
          <template #content>
            <div class="info-grid">
              <div class="info-item">
                <label>Тип ОУ:</label>
                <span>{{ institution.type }}</span>
              </div>
              <div class="info-item">
                <label>Район:</label>
                <span>{{ formatDistrict(institution.district) }}</span>
              </div>
              <div class="info-item">
                <label>Директор:</label>
                <span>{{ institution.director }}</span>
              </div>
              <div class="info-item">
                <label>Телефон:</label>
                <span>{{ institution.phone }}</span>
              </div>
              <div class="info-item">
                <label>Адрес:</label>
                <span>{{ institution.address }}</span>
              </div>
              <div class="info-item">
                <label>Количество обучающихся:</label>
                <span class="highlight">{{ institution.studentsCount.toLocaleString() }}</span>
              </div>
              <div class="info-item">
                <label>Дата регистрации:</label>
                <span>{{ formatDate(institution.createdAt) }}</span>
              </div>
            </div>
          </template>
        </Card>

        <!-- Статистика справок -->
        <Card class="stats-card">
          <template #header>
            <h2>Статистика справок ДОД</h2>
          </template>
          <template #content>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ institution.reportsCount }}</div>
                <div class="stat-label">Всего справок</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ acceptedReports }}</div>
                <div class="stat-label">Принято</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ pendingReports }}</div>
                <div class="stat-label">На проверке</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ rejectedReports }}</div>
                <div class="stat-label">Отклонено</div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Список справок -->
        <Card class="reports-card">
          <template #header>
            <div class="card-header">
              <h2>Справки ДОД</h2>
              <div class="header-actions">
                <Button 
                  icon="pi pi-refresh" 
                  label="Обновить" 
                  class="p-button-sm p-button-text"
                  @click="refreshReports"
                />
              </div>
            </div>
          </template>
          <template #content>
            <div v-if="institutionReports.length === 0" class="no-reports">
              <i class="pi pi-file-o no-reports-icon"></i>
              <p>Справки ДОД не подавались</p>
            </div>
            <div v-else class="reports-list">
              <div 
                v-for="report in institutionReports" 
                :key="report.id"
                class="report-item"
                @click="viewReport(report)"
              >
                <div class="report-header">
                  <div class="report-title">
                    <h3>{{ report.title }}</h3>
                    <span class="report-year">{{ report.year }} год</span>
                  </div>
                  <Tag 
                    :value="report.status" 
                    :severity="getReportStatusSeverity(report.status)"
                    class="report-status"
                  />
                </div>
                <div class="report-info">
                  <div class="report-meta">
                    <span class="report-date">
                      <i class="pi pi-calendar"></i>
                      {{ formatDate(report.submittedAt) }}
                    </span>
                    <span class="report-sections">
                      <i class="pi pi-list"></i>
                      {{ report.completedSections }}/{{ report.totalSections }} разделов
                    </span>
                  </div>
                  <div v-if="report.rejectionReason" class="rejection-reason">
                    <i class="pi pi-exclamation-triangle"></i>
                    {{ report.rejectionReason }}
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Layout from '@/components/Layout.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { fetchUsers, type BackendUser } from '@/services/users'

const router = useRouter()
const route = useRoute()
const toast = useToast()

// Состояние
const loading = ref(false)

// Данные ОУ
const institution = ref({
  id: '',
  name: '',
  code: '',
  type: 'Не указано',
  district: '',
  director: '',
  phone: '',
  address: '',
  studentsCount: 0,
  reportsCount: 0,
  lastReport: null as { year: number; status: string; submittedAt: Date } | null,
  createdAt: new Date()
})

// Справки ОУ
const institutionReports = ref<Array<{
  id: string
  title: string
  year: number
  status: string
  submittedAt: Date
  completedSections: number
  totalSections: number
  rejectionReason: string | null
}>>([])

// Computed properties
const acceptedReports = computed(() => 
  institutionReports.value.filter(r => r.status === 'Принято').length
)

const pendingReports = computed(() => 
  institutionReports.value.filter(r => r.status === 'На проверке').length
)

const rejectedReports = computed(() => 
  institutionReports.value.filter(r => r.status === 'Отклонено').length
)

// Методы
const goBack = () => {
  router.push('/system/institutions')
}

const viewReport = (report: any) => {
  router.push(`/system/report-sections/${report.id}`)
}

const refreshReports = () => {
  console.log('Обновление справок')
  // TODO: Реализовать обновление данных
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
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

const getReportStatusSeverity = (status: string) => {
  switch (status) {
    case 'Принято': return 'success'
    case 'На проверке': return 'warning'
    case 'Отклонено': return 'danger'
    case 'Новая': return 'info'
    default: return 'info'
  }
}

const buildInstitutionFromUser = (user: BackendUser) => {
  const numericId = typeof user.id === 'number' ? user.id : Number(user.id)
  institution.value = {
    id: String(user.id ?? ''),
    name: user.educationalInstitution || 'Не указано',
    code: `ОУ-${String(Number.isFinite(numericId) ? numericId : 0).padStart(3, '0')}`,
    type: 'Не указано',
    district: user.district || 'Не указан',
    director: user.name || user.email,
    phone: '',
    address: '',
    studentsCount: 0,
    reportsCount: 0,
    lastReport: null,
    createdAt: new Date()
  }
}

onMounted(async () => {
  const institutionId = route.params.id
  if (!institutionId) {
    toast.add({
      severity: 'warn',
      summary: 'ОУ',
      detail: 'Не удалось определить учреждение',
      life: 3000
    })
    router.push('/system/institutions')
    return
  }

  loading.value = true
  try {
    const users = await fetchUsers()
    const match = users.find(user => String(user.id) === String(institutionId))
    if (!match) {
      toast.add({
        severity: 'warn',
        summary: 'ОУ',
        detail: 'Учреждение не найдено',
        life: 3000
      })
      router.push('/system/institutions')
      return
    }
    buildInstitutionFromUser(match)
  } catch {
    toast.add({
      severity: 'error',
      summary: 'ОУ',
      detail: 'Не удалось загрузить данные учреждения',
      life: 3000
    })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.institution-detail {
  width: 100%;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin: 1rem;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.back-button {
  color: #163F5E !important;
  border-color: rgba(22, 63, 94, 0.2) !important;
}

.back-button:hover {
  background: rgba(22, 63, 94, 0.1) !important;
  border-color: rgba(22, 63, 94, 0.3) !important;
}

.header-info {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.reports-card {
  grid-column: 1 / -1;
}

.info-card,
.stats-card,
.reports-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.6s ease-out;
}

.info-card :deep(.p-card-header),
.stats-card :deep(.p-card-header),
.reports-card :deep(.p-card-header) {
  background: rgba(22, 63, 94, 0.1);
  border-bottom: 1px solid rgba(22, 63, 94, 0.2);
  border-radius: 20px 20px 0 0;
  padding: 1.5rem 2rem;
  backdrop-filter: blur(10px);
}

.info-card :deep(.p-card-header) h2,
.stats-card :deep(.p-card-header) h2,
.reports-card :deep(.p-card-header) h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item label {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item span {
  color: #2c3e50;
  font-size: 1rem;
}

.info-item .highlight {
  font-weight: 600;
  color: #163F5E;
  font-size: 1.1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.stat-item {
  text-align: center;
  padding: 1.5rem;
  background: rgba(22, 63, 94, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(22, 63, 94, 0.1);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #163F5E;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.no-reports {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.no-reports-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.report-item {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(22, 63, 94, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.report-item:hover {
  background: rgba(22, 63, 94, 0.05);
  border-color: rgba(22, 63, 94, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(22, 63, 94, 0.1);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.report-title {
  flex: 1;
}

.report-title h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

.report-year {
  color: #6c757d;
  font-size: 0.9rem;
}

.report-status {
  flex-shrink: 0;
}

.report-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.report-meta {
  display: flex;
  gap: 1.5rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.report-meta span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rejection-reason {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #dc3545;
  font-size: 0.9rem;
  padding: 0.75rem;
  background: rgba(220, 53, 69, 0.1);
  border-radius: 8px;
  border-left: 3px solid #dc3545;
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

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .report-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
