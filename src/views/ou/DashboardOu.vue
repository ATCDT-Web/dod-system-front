<template>
  <Layout>
    <div class="dashboard-content">
      <Card class="dashboard-main-card">
            <template #title>
              <div class="card-header">
                <h1 class="card-title">Панель администратора ОУ</h1>
                <p class="card-subtitle">Управление образовательным учреждением</p>
              </div>
            </template>
            
            <template #content>
              <div class="ou-stats">
                <div class="stat-card">
                  <div class="stat-icon">
                    <i class="pi pi-check-circle"></i>
                  </div>
                  <div class="stat-content">
                    <h3 class="stat-title">Справки ДОД проверенные</h3>
                    <p class="stat-value">24</p>
                    <p class="stat-change positive">+3 за неделю</p>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon">
                    <i class="pi pi-clock"></i>
                  </div>
                  <div class="stat-content">
                    <h3 class="stat-title">Справки ДОД на проверке</h3>
                    <p class="stat-value">8</p>
                    <p class="stat-change neutral">Ожидают проверки</p>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon">
                    <i class="pi pi-file-edit"></i>
                  </div>
                  <div class="stat-content">
                    <h3 class="stat-title">Справки в работе</h3>
                    <p class="stat-value">5</p>
                    <p class="stat-change info">В процессе заполнения</p>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon">
                    <i class="pi pi-chart-line"></i>
                  </div>
                  <div class="stat-content">
                    <h3 class="stat-title">Общая активность</h3>
                    <p class="stat-value">37</p>
                    <p class="stat-change positive">Всего справок</p>
                  </div>
                </div>
              </div>
              
              <div class="ou-sections">
                <div class="section-card">
                  <h3 class="section-title">Быстрые действия</h3>
                  <div class="action-buttons">
                    <Button
                      label="Создать справку ДОД"
                      icon="pi pi-plus"
                      class="action-button"
                      @click="createDodReport"
                    />
                    <Button
                      label="Проверить справки"
                      icon="pi pi-check"
                      class="action-button"
                      @click="checkReports"
                    />
                    <Button
                      label="Экспорт справок"
                      icon="pi pi-download"
                      class="action-button"
                      @click="exportReports"
                    />
                    <Button
                      label="Настройки ОУ"
                      icon="pi pi-cog"
                      class="action-button"
                      @click="ouSettings"
                    />
                  </div>
                </div>
                
                <div class="section-card">
                  <h3 class="section-title">Последние действия</h3>
                  <div class="actions-list">
                    <div class="action-item approved">
                      <i class="pi pi-check-circle action-icon"></i>
                      <div class="action-content">
                        <p class="action-text">Одобрена справка ДОД за 2025 год</p>
                        <p class="action-time">2 дня назад</p>
                      </div>
                    </div>
                    <div class="action-item pending">
                      <i class="pi pi-clock action-icon"></i>
                      <div class="action-content">
                        <p class="action-text">На проверке справка ДОД за 2025 год</p>
                        <p class="action-time">1 день назад</p>
                      </div>
                    </div>
                    <div class="action-item rejected">
                      <i class="pi pi-times-circle action-icon"></i>
                      <div class="action-content">
                        <p class="action-text">Отклонена справка ДОД за 2025 год</p>
                        <p class="action-time">3 дня назад</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="ou-info">
                <div class="info-card">
                  <h3 class="info-title">Информация об учреждении</h3>
                  <div class="info-content">
                    <div class="info-item">
                      <span class="info-label">Название:</span>
                      <span class="info-value">{{ user.institutionName }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Тип:</span>
                      <span class="info-value">{{ getInstitutionType(user.institutionType) }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Район:</span>
                      <span class="info-value">{{ getDistrictName(user.district) }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Статус:</span>
                      <span class="info-value status-active">Активно</span>
                    </div>
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
import { useToast } from 'primevue/usetoast'
import Layout from '@/components/Layout.vue'
import type { User } from '@/types'
import { getStoredUser } from '@/services/auth'

// Reactive data
const toast = useToast()
const user = ref<User>({} as User)

// Computed properties
const userInfo = computed(() => [
  { label: 'ФИО', value: `${user.value.firstName} ${user.value.lastName}` },
  { label: 'Email', value: user.value.email },
  { label: 'Роль', value: 'Администратор ОУ' },
  { label: 'Статус', value: 'Активен' }
])

// Helper functions
const getInstitutionType = (type: string): string => {
  const types: Record<string, string> = {
    'sosh': 'Средняя общеобразовательная школа',
    'gymnasium': 'Гимназия',
    'lyceum': 'Лицей',
    'school': 'Школа'
  }
  return types[type] || type
}

const getDistrictName = (district: string): string => {
  const districts: Record<string, string> = {
    'central': 'Центральный район',
    'north': 'Северный район',
    'south': 'Южный район',
    'east': 'Восточный район',
    'west': 'Западный район'
  }
  return districts[district] || district
}

// Event handlers
const createDodReport = () => {
  toast.add({
    severity: 'info',
    summary: 'Создание справки ДОД',
    detail: 'Функция создания справки ДОД будет реализована',
    life: 3000
  })
}

const checkReports = () => {
  toast.add({
    severity: 'info',
    summary: 'Проверка справок',
    detail: 'Функция проверки справок будет реализована',
    life: 3000
  })
}

const exportReports = () => {
  toast.add({
    severity: 'info',
    summary: 'Экспорт справок',
    detail: 'Функция экспорта справок будет реализована',
    life: 3000
  })
}

const ouSettings = () => {
  toast.add({
    severity: 'info',
    summary: 'Настройки ОУ',
    detail: 'Функция настроек ОУ будет реализована',
    life: 3000
  })
}

// Lifecycle
onMounted(() => {
  const storedUser = getStoredUser()
  if (storedUser) {
    user.value = storedUser
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

.ou-stats {
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

.stat-change.info {
  color: #3b82f6;
}

.ou-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-button {
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

.actions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 12px;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  margin-bottom: 0.75rem;
}

.action-item:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: translateX(5px);
}

.action-item.approved {
  border-left-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.action-item.pending {
  border-left-color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.action-item.rejected {
  border-left-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.action-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.action-item.approved .action-icon {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.action-item.pending .action-icon {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.action-item.rejected .action-icon {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.action-content {
  flex: 1;
}

.action-text {
  font-weight: 500;
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
}

.action-time {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
}

.ou-info {
  margin-top: 2rem;
}

.info-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.info-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
}

.info-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 600;
}

.status-active {
  color: #10b981;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
