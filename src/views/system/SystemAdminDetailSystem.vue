<template>
  <Layout>
    <div class="system-admin-detail">
      <div class="page-header">
        <div class="header-content">
          <Button 
            icon="pi pi-arrow-left" 
            label="Назад к списку" 
            class="p-button-text back-button"
            @click="goBack"
          />
          <div class="header-info">
            <h1 class="page-title">{{ systemAdmin.fullName }}</h1>
            <p class="page-subtitle">{{ systemAdmin.email }}</p>
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
                <span>{{ systemAdmin.email }}</span>
              </div>
              <div class="info-item">
                <label>Дата создания:</label>
                <span>{{ formatDate(systemAdmin.createdAt) }}</span>
              </div>
              <div class="info-item">
                <label>Последний вход:</label>
                <span>{{ formatDate(systemAdmin.lastLogin) }} в {{ formatTime(systemAdmin.lastLogin) }}</span>
              </div>
              <div class="info-item">
                <label>Дней с последнего входа:</label>
                <span class="highlight">{{ getDaysSinceLogin() }}</span>
              </div>
            </div>
          </template>
        </Card>



        <!-- Действия -->
        <Card class="actions-card">
          <template #header>
            <h2>Действия</h2>
          </template>
          <template #content>
            <div class="actions-grid">
              <Button 
                icon="pi pi-pencil" 
                label="Редактировать" 
                class="action-button"
                @click="editSystemAdmin"
              />
              <Button 
                icon="pi pi-key" 
                label="Сменить пароль" 
                class="action-button"
                @click="changePassword"
              />
              <Button 
                icon="pi pi-trash" 
                label="Удалить" 
                class="action-button p-button-danger"
                @click="deleteSystemAdmin"
              />
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

// Данные администратора платформы
const systemAdmin = ref({
  id: '001',
  fullName: 'Смирнов Алексей Владимирович',
  email: 'smirnov@education.spb.ru',
  lastLogin: new Date('2024-12-20T09:15:00'),
  createdAt: new Date('2020-01-15')
})

// Методы
const goBack = () => {
  router.push('/system/system-admins')
}

const editSystemAdmin = () => {
  console.log('Редактирование администратора платформы')
  // TODO: Реализовать редактирование
}

const changePassword = () => {
  console.log('Смена пароля администратора платформы')
  // TODO: Реализовать смену пароля
}


const deleteSystemAdmin = () => {
  console.log('Удаление администратора платформы')
  // TODO: Реализовать удаление
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getDaysSinceLogin = () => {
  const now = new Date()
  const lastLogin = new Date(systemAdmin.value.lastLogin)
  const diffTime = Math.abs(now.getTime() - lastLogin.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}



onMounted(() => {
  const adminId = route.params.id
  console.log('Загрузка администратора платформы:', adminId)
  // TODO: Загрузить данные администратора платформы по ID
})
</script>

<style scoped>
.system-admin-detail {
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
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.info-card,
.actions-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.6s ease-out;
}

.info-card :deep(.p-card-header),
.actions-card :deep(.p-card-header) {
  background: rgba(22, 63, 94, 0.1);
  border-bottom: 1px solid rgba(22, 63, 94, 0.2);
  border-radius: 20px 20px 0 0;
  padding: 1.5rem 2rem;
  backdrop-filter: blur(10px);
}

.info-card :deep(.p-card-header) h2,
.actions-card :deep(.p-card-header) h2 {
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



.actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.action-button {
  padding: 1rem 1.5rem !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

.action-button:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
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
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
