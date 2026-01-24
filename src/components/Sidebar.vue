<template>
  <div ref="sidebarRef" class="sidebar">
    <div class="sidebar-header">
      <div class="logo-container">
        <img :src="logo" alt="Logo" class="logo" />
      </div>
      <h2 class="sidebar-title">Комитет по образованию Санкт-Петербурга</h2>
    </div>
    
    <nav class="sidebar-nav">
      <ul class="nav-list">
        <!-- Общие разделы -->
        <li class="nav-item">
          <router-link 
            :to="user.role === 'admin_system' ? '/system/dashboard' : '/ou/dashboard'" 
            class="nav-link" 
            :class="{ active: $route.name === 'DashboardSystem' || $route.name === 'DashboardOu' }"
          >
            <i class="pi pi-home nav-icon"></i>
            <span class="nav-text">Главная</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link 
            :to="user.role === 'admin_system' ? '/system/dod-reports' : '/ou/dod-reports'" 
            class="nav-link" 
            :class="{ active: $route.name === 'DodReportsSystem' || $route.name === 'DodReportsOu' }"
          >
            <i class="pi pi-file nav-icon"></i>
            <span class="nav-text">Справки ДОД</span>
          </router-link>
        </li>
        
        <!-- Разделы только для администратора системы -->
        <template v-if="user.role === 'admin_system'">
          <li class="nav-item">
            <router-link to="/system/institutions" class="nav-link" :class="{ active: $route.name === 'InstitutionsSystem' || $route.name === 'InstitutionDetailSystem' }">
              <i class="pi pi-building nav-icon"></i>
              <span class="nav-text">Образовательные учреждения</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/system/ou-admins" class="nav-link" :class="{ active: $route.name === 'OuAdminsSystem' || $route.name === 'OuAdminDetailSystem' }">
              <i class="pi pi-users nav-icon"></i>
              <span class="nav-text">Администраторы ОУ</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/system/system-admins" class="nav-link" :class="{ active: $route.name === 'SystemAdminsSystem' || $route.name === 'SystemAdminDetailSystem' }">
              <i class="pi pi-shield nav-icon"></i>
              <span class="nav-text">Администраторы платформы</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/system/reports" class="nav-link" :class="{ active: $route.name === 'ReportsSystem' }">
              <i class="pi pi-chart-line nav-icon"></i>
              <span class="nav-text">Отчеты</span>
            </router-link>
          </li>
        </template>
        
        <!-- Раздел настроек для администратора ОУ -->
        <li class="nav-item" v-if="user.role === 'admin_ou'">
          <router-link to="/ou/settings" class="nav-link" :class="{ active: $route.name === 'SettingsOu' }">
            <i class="pi pi-cog nav-icon"></i>
            <span class="nav-text">Настройки</span>
          </router-link>
        </li>
      </ul>
    </nav>
    
    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">
          <i class="pi pi-user"></i>
        </div>
        <div class="user-details">
          <div class="user-name">{{ user.fullName }}</div>
          <div class="user-role">{{ user.role === 'admin_system' ? 'Администратор платформы' : 'Администратор ОУ' }}</div>
        </div>
      </div>
      <Button
        label="Выйти"
        icon="pi pi-sign-out"
        class="logout-button"
        @click="handleLogout"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import logo from '@/assets/logo.svg'
import type { User } from '@/types'
import { logout } from '@/services/auth'

interface Props {
  user: User
}

defineProps<Props>()

// Управление анимацией сайдбара
const sidebarRef = ref<HTMLElement>()

onMounted(() => {
  // Проверяем, был ли сайдбар уже показан в этой сессии
  const sidebarShown = sessionStorage.getItem('sidebar-shown')
  
  if (sidebarShown && sidebarRef.value) {
    // Если уже был показан, убираем анимацию
    sidebarRef.value.classList.add('no-animation')
  } else {
    // Если первый раз, отмечаем что показан
    sessionStorage.setItem('sidebar-shown', 'true')
  }
})

const router = useRouter()
const toast = useToast()

const handleLogout = (): void => {
  logout()
  toast.add({
    severity: 'info',
    summary: 'Выход',
    detail: 'Вы успешно вышли из системы',
    life: 3000
  })
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  width: 280px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

.sidebar-header {
  padding: 2rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  height: 40px;
  width: auto;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
}

.logo:hover {
  transform: scale(1.1);
}

.sidebar-title {
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  text-shadow: none;
  line-height: 1.3;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin-bottom: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  color: #4a5568;
  text-decoration: none;
  transition: all 0.3s ease;
  border-radius: 0 25px 25px 0;
  margin-right: 1rem;
  position: relative;
}

.nav-link:hover {
  background: rgba(22, 63, 94, 0.1);
  color: #163F5E;
  transform: translateX(5px);
}

.nav-link.active {
  background: rgba(22, 63, 94, 0.15);
  color: #163F5E;
  box-shadow: 0 4px 15px rgba(22, 63, 94, 0.2);
}

.nav-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #163F5E;
  border-radius: 0 2px 2px 0;
}

.nav-icon {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.nav-text {
  font-weight: 500;
  font-size: 1rem;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(22, 63, 94, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.user-info:hover {
  background: rgba(22, 63, 94, 0.15);
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: rgba(22, 63, 94, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #163F5E;
  font-size: 1.25rem;
}

.user-details {
  flex: 1;
}

.user-name {
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.user-role {
  color: #6b7280;
  font-size: 0.8rem;
}

.logout-button {
  width: 100%;
  background: rgba(22, 63, 94, 0.1);
  border: 1px solid rgba(22, 63, 94, 0.3);
  color: #163F5E;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background: rgba(22, 63, 94, 0.2);
  border-color: rgba(22, 63, 94, 0.5);
  transform: translateY(-1px);
}

/* Анимации - только при первом показе */
.sidebar {
  animation: slideInLeft 0.6s ease-out;
}

/* Убираем анимацию при переходах между страницами */
.sidebar.no-animation {
  animation: none;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    transform: translateX(-100%);
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
}
</style>
