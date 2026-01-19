<template>
  <Layout>
    <div class="ou-admin-detail">
      <div class="page-header">
        <div class="header-content">
          <Button 
            icon="pi pi-arrow-left" 
            label="Назад к списку" 
            class="p-button-text back-button"
            @click="goBack"
          />
          <div class="header-info">
            <h1 class="page-title">{{ ouAdmin.fullName }}</h1>
            <p class="page-subtitle">{{ ouAdmin.position }} • {{ ouAdmin.institution }}</p>
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
                <label>Email:</label>
                <span>{{ ouAdmin.email }}</span>
              </div>
              <div class="info-item">
                <label>Телефон:</label>
                <span>{{ ouAdmin.phone }}</span>
              </div>
              <div class="info-item">
                <label>Образовательное учреждение:</label>
                <span>{{ ouAdmin.institution }}</span>
              </div>
              <div class="info-item">
                <label>Район:</label>
                <span>{{ ouAdmin.district }}</span>
              </div>
              <div class="info-item">
                <label>Статус:</label>
                <Tag :value="ouAdmin.status" :severity="getStatusSeverity(ouAdmin.status)" />
              </div>
              <div class="info-item">
                <label>Дата регистрации:</label>
                <span>{{ formatDate(ouAdmin.createdAt) }}</span>
              </div>
            </div>
          </template>
        </Card>

        <!-- Статистика активности -->
        <Card class="stats-card">
          <template #header>
            <h2>Статистика активности</h2>
          </template>
          <template #content>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ ouAdmin.reportsCount }}</div>
                <div class="stat-label">Справок ДОД</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ formatDate(ouAdmin.lastLogin) }}</div>
                <div class="stat-label">Последний вход</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ getDaysSinceLogin() }}</div>
                <div class="stat-label">Дней назад</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ getActivityLevel() }}</div>
                <div class="stat-label">Уровень активности</div>
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
            <div v-if="ouAdminReports.length === 0" class="no-reports">
              <i class="pi pi-file-o no-reports-icon"></i>
              <p>Справки ДОД не подавались</p>
            </div>
            <div v-else class="reports-list">
              <div 
                v-for="report in ouAdminReports" 
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
import Layout from '@/components/Layout.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

const router = useRouter()
const route = useRoute()

// Состояние
const loading = ref(false)

// Данные администратора ОУ
const ouAdmin = ref({
  id: '001',
  fullName: 'Иванова Анна Сергеевна',
  email: 'ivanova@school1.spb.ru',
  institution: 'МБОУ СОШ №1',
  district: 'Центральный район',
  position: 'Директор',
  status: 'Активен',
  lastLogin: new Date('2024-12-20T10:30:00'),
  reportsCount: 3,
  phone: '+7 (812) 123-45-67',
  createdAt: new Date('2020-09-01')
})

// Справки администратора ОУ
const ouAdminReports = ref([
  {
    id: '001',
    title: 'Справка о деятельности ДОД за 2024 год',
    year: 2024,
    status: 'Принято',
    submittedAt: new Date('2024-03-15'),
    completedSections: 16,
    totalSections: 16,
    rejectionReason: null
  },
  {
    id: '002',
    title: 'Справка о деятельности ДОД за 2023 год',
    year: 2023,
    status: 'На проверке',
    submittedAt: new Date('2023-12-20'),
    completedSections: 16,
    totalSections: 16,
    rejectionReason: null
  },
  {
    id: '003',
    title: 'Справка о деятельности ДОД за 2022 год',
    year: 2022,
    status: 'Отклонено',
    submittedAt: new Date('2022-12-15'),
    completedSections: 16,
    totalSections: 16,
    rejectionReason: 'Неполные данные по разделу 3'
  }
])

// Методы
const goBack = () => {
  router.push('/system/ou-admins')
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

const getDaysSinceLogin = () => {
  const now = new Date()
  const lastLogin = new Date(ouAdmin.value.lastLogin)
  const diffTime = Math.abs(now.getTime() - lastLogin.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const getActivityLevel = () => {
  const daysSinceLogin = getDaysSinceLogin()
  if (daysSinceLogin <= 1) return 'Высокий'
  if (daysSinceLogin <= 7) return 'Средний'
  if (daysSinceLogin <= 30) return 'Низкий'
  return 'Очень низкий'
}

const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'Активен': return 'success'
    case 'Неактивен': return 'warning'
    case 'Заблокирован': return 'danger'
    default: return 'info'
  }
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

onMounted(() => {
  const adminId = route.params.id
  console.log('Загрузка администратора ОУ:', adminId)
  // TODO: Загрузить данные администратора ОУ по ID
})
</script>

<style scoped>
.ou-admin-detail {
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
