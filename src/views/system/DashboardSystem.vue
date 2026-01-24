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
                    <Button
                      label="Управление ОУ"
                      icon="pi pi-building"
                      class="action-button"
                      @click="manageInstitutions"
                    />
                    <Button
                      label="Проверить справки"
                      icon="pi pi-check"
                      class="action-button"
                      @click="checkReports"
                    />
                    <Button
                      label="Администраторы ОУ"
                      icon="pi pi-users"
                      class="action-button"
                      @click="manageOuAdmins"
                    />
                    <Button
                      label="Системные отчеты"
                      icon="pi pi-chart-line"
                      class="action-button"
                      @click="systemReports"
                    />
                  </div>
                </div>
              </div>
            </template>
          </Card>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Layout from '@/components/Layout.vue'
import type { User } from '@/types'
import { getStoredUser } from '@/services/auth'
import { fetchUsers } from '@/services/users'
import { fetchMainInfoList } from '@/services/reports'

// Reactive data
const toast = useToast()
const router = useRouter()
const user = ref<User>({} as User)
const institutionsCount = ref(0)
const acceptedReports = ref(0)
const pendingReports = ref(0)
const rejectedReports = ref(0)

// Computed properties
const userInfo = computed(() => [
  { label: 'ФИО', value: `${user.value.firstName} ${user.value.lastName}` },
  { label: 'Email', value: user.value.email },
  { label: 'Роль', value: 'Администратор платформы' },
  { label: 'Статус', value: 'Активен' }
])

// Event handlers
const manageInstitutions = () => {
  router.push('/system/institutions')
}

const checkReports = () => {
  router.push('/system/dod-reports')
}

const manageOuAdmins = () => {
  router.push('/system/ou-admins')
}

const systemReports = () => {
  router.push('/system/dod-reports')
}

// Lifecycle
onMounted(async () => {
  const storedUser = getStoredUser()
  if (storedUser) {
    user.value = storedUser
  }

  try {
    const [users, reportsPage] = await Promise.all([
      fetchUsers(),
      fetchMainInfoList(0, 2000)
    ])

    const institutionSet = new Set(
      users
        .map(userItem => userItem.educationalInstitution)
        .filter((name): name is string => Boolean(name && name.trim()))
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
      detail: 'Не удалось загрузить данные для панели',
      life: 3000
    })
  }
})
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
  position: relative;
  z-index: 2;
}

.card-header {
  margin-bottom: 2rem;
}

.card-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
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
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
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
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
}

.stat-change {
  font-size: 0.8rem;
  margin: 0;
  font-weight: 500;
}

.stat-change.positive {
  color: #10b981;
}

.stat-change.neutral {
  color: #6b7280;
}

.admin-sections {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.section-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.action-button {
  width: 100%;
  background: rgba(22, 63, 94, 0.1);
  border: 1px solid rgba(22, 63, 94, 0.3);
  color: #163F5E;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-button:hover {
  background: rgba(22, 63, 94, 0.2);
  border-color: rgba(22, 63, 94, 0.5);
  transform: translateY(-1px);
}


@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
