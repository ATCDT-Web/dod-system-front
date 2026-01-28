<template>
  <Layout>
    <div class="dashboard-content">
      <Card class="dashboard-main-card">
        <template #title>
          <div class="card-header">
            <h1 class="card-title">Панель администратора платформы</h1>
            <p class="card-subtitle">Управление системой и мониторинг</p>
          </div>
        </template>

        <template #content>
          <div class="admin-stats">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="pi pi-building"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-title">Образовательные учреждения</h3>
                <p class="stat-value">{{ institutionsCount }}</p>
                <p class="stat-change neutral">Всего учреждений</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="pi pi-check-circle"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-title">Справки ДОД проверенные</h3>
                <p class="stat-value">{{ acceptedReports }}</p>
                <p class="stat-change positive">Принято</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="pi pi-clock"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-title">Справки ДОД на проверке</h3>
                <p class="stat-value">{{ pendingReports }}</p>
                <p class="stat-change info">Ожидают проверки</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="pi pi-times-circle"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-title">Справки ДОД отклоненные</h3>
                <p class="stat-value">{{ rejectedReports }}</p>
                <p class="stat-change neutral">Отклонено</p>
              </div>
            </div>
          </div>

          <div class="admin-sections">
            <div class="section-card">
              <h3 class="section-title">Быстрые действия</h3>
              <div class="action-buttons">
                <Button label="Управление ОУ" icon="pi pi-building" class="action-button" @click="manageInstitutions" />
                <Button label="Справки ДОД" icon="pi pi-file" class="action-button" @click="checkReports" />
                <Button label="Администраторы ОУ" icon="pi pi-users" class="action-button" @click="manageOuAdmins" />
                <Button label="Создать ОУ" icon="pi pi-plus" class="action-button" @click="createInstitutionPage" />
                <Button label="Создать справку" icon="pi pi-file" class="action-button" @click="createReportPage" />
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Layout from '@/components/Layout.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import { fetchUsers } from '@/services/users'
import { fetchMainInfoList } from '@/services/reports'
import { getStoredUser } from '@/services/auth'
import type { User } from '@/types'

const toast = useToast()
const router = useRouter()
const user = ref<User>({} as User)
const institutionsCount = ref(0)
const acceptedReports = ref(0)
const pendingReports = ref(0)
const rejectedReports = ref(0)

const manageInstitutions = () => router.push('/system/institutions')
const checkReports = () => router.push('/system/dod-reports')
const manageOuAdmins = () => router.push('/system/ou-admins')
const createInstitutionPage = () => router.push('/system/institutions/create')
const createReportPage = () => router.push('/system/dod-reports/create')

const loadDashboardData = async () => {
  try {
    const storedUser = getStoredUser()
    if (storedUser) {
      user.value = storedUser
    }

    const [users, reportsPage] = await Promise.all([fetchUsers(), fetchMainInfoList(0, 2000)])
    const institutionSet = new Set(
      users.map(u => u.educationalInstitution).filter((name): name is string => Boolean(name && name.trim()))
    )
    institutionsCount.value = institutionSet.size
    const reports = reportsPage.content
    acceptedReports.value = reports.filter(report => report.status === 'Принято').length
    pendingReports.value = reports.filter(report => report.status === 'На проверке').length
    rejectedReports.value = reports.filter(report => report.status === 'Отклонено').length
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Дашборд',
      detail: 'Не удалось загрузить данные',
      life: 3000
    })
  }
}

onMounted(loadDashboardData)
</script>

<style scoped>
.dashboard-content {
  animation: fadeIn 0.6s ease-out;
}

.dashboard-main-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
}

.card-header {
  margin-bottom: 2rem;
}

.card-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.card-subtitle {
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0;
}

.admin-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  background: rgba(22, 63, 94, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #163F5E;
  font-size: 1.5rem;
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.stat-change {
  font-size: 0.8rem;
  font-weight: 500;
}

.stat-change.positive {
  color: #10b981;
}

.stat-change.neutral {
  color: #6b7280;
}

.stat-change.info {
  color: #1d4ed8;
}

.admin-sections {
  display: grid;
  gap: 2rem;
}

.section-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.section-title {
  margin: 0 0 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(3, minmax(200px, 1fr));
  gap: 1rem;
}

.action-button {
  width: 100%;
  border-radius: 14px;
  border: 1px solid rgba(22, 63, 94, 0.18);
  background: rgba(255, 255, 255, 0.9);
  color: #163F5E;
  font-weight: 600;
  justify-content: flex-start;
  gap: 0.75rem;
  padding: 0.9rem 1.1rem;
  box-shadow: 0 10px 20px rgba(22, 63, 94, 0.08);
  transition: all 0.25s ease;
}

.action-button:hover {
  border-color: rgba(22, 63, 94, 0.35);
  background: rgba(22, 63, 94, 0.08);
  box-shadow: 0 12px 25px rgba(22, 63, 94, 0.15);
  transform: translateY(-1px);
}

@media (max-width: 1024px) {
  .action-buttons {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
}

@media (max-width: 640px) {
  .action-buttons {
    grid-template-columns: 1fr;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
  }
}
</style>
