<template>
  <div class="login-container login-bg">
    <div class="login-card">
      <Card class="login-card-inner">
        <template #title>
          <div class="text-center">
            <div class="logo-container">
              <img :src="logo" alt="Logo" class="logo mb-3" />
            </div>
             <h1 class="text-3xl font-bold text-gray-800">Вход в систему</h1>
          </div>
        </template>
        <template #content>
          <form @submit.prevent="handleLogin" class="p-fluid">
            <div class="field">
               <label for="email" class="font-semibold text-gray-700">Email</label>
              <InputText
                id="email"
                v-model="form.email"
                type="email"
                placeholder="Введите email"
                class="modern-input"
                :class="{ 'p-invalid': errors.email }"
                required
              />
              <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
            </div>

            <div class="field">
               <label for="password" class="font-semibold text-gray-700">Пароль</label>
              <Password
                id="password"
                v-model="form.password"
                placeholder="Введите пароль"
                :feedback="false"
                toggleMask
                class="modern-input"
                :class="{ 'p-invalid': errors.password }"
                required
              />
              <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
            </div>

            <div class="field">
              <Button
                type="submit"
                label="Войти"
                icon="pi pi-sign-in"
                class="w-full modern-button"
                :loading="loading"
              />
            </div>

            <div class="text-center mt-4">
               <p class="text-sm text-gray-600">
                 Нет аккаунта? 
                 <router-link to="/register" class="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                   Зарегистрироваться
                 </router-link>
               </p>
            </div>
          </form>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import logo from '@/assets/logo.svg'
import type { LoginCredentials } from '@/types'

// Reactive data
const router = useRouter()
const toast = useToast()

const loading = ref<boolean>(false)
const form = reactive<LoginCredentials>({
  email: '',
  password: ''
})

const errors = reactive<{
  email: string
  password: string
}>({
  email: '',
  password: ''
})

// Validation function
const validateForm = (): boolean => {
  let isValid = true
  
  // Reset errors
  errors.email = ''
  errors.password = ''
  
  // Email validation
  if (!form.email) {
    errors.email = 'Email обязателен'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Некорректный email'
    isValid = false
  }
  
  // Password validation
  if (!form.password) {
    errors.password = 'Пароль обязателен'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Пароль должен содержать минимум 6 символов'
    isValid = false
  }
  
  return isValid
}

// Login handler - упрощенная версия без авторизации
const handleLogin = async (): Promise<void> => {
  if (!validateForm()) return
  
  loading.value = true
  
  try {
    // Имитация API запроса
    await new Promise(resolve => setTimeout(resolve, 1000))
    
            // Создаем фиктивного пользователя для демонстрации
            // Определяем роль на основе email
            const isSystemAdmin = form.email.includes('system') || form.email.includes('admin')
            const demoUser = {
              id: 'demo',
              email: form.email,
              firstName: 'Демо',
              lastName: 'Пользователь',
              district: 'central',
              institutionType: 'sosh',
              institutionName: 'Демонстрационное учреждение',
              role: isSystemAdmin ? 'admin_system' : 'admin_ou',
              verified: true
            }
    
    // Сохраняем данные пользователя
    localStorage.setItem('user', JSON.stringify(demoUser))
    
    // Перенаправляем на соответствующий дашборд в зависимости от роли
    if (demoUser.role === 'admin_system') {
      router.push('/system/dashboard')
    } else {
      router.push('/ou/dashboard')
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Произошла ошибка при входе',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Фоновое изображение теперь в CSS классе login-bg */
  padding: 2rem;
  position: relative;
  overflow: hidden;
  /* Убрана анимация для предотвращения скроллбара */
  /* Фон остается статичным при анимациях */
  background-attachment: fixed;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: 1;
  animation: slideIn 1s ease-out;
}

.login-card {
  width: 100%;
  max-width: 450px;
  position: relative;
  z-index: 2;
  /* Убрана анимация для предотвращения скроллбара */
}

.login-card-inner {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  max-height: 80vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #163F5E rgba(255, 255, 255, 0.3);
}

/* Стилизация скроллбара для WebKit браузеров */
.login-card-inner::-webkit-scrollbar {
  width: 8px;
}

.login-card-inner::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
}

.login-card-inner::-webkit-scrollbar-thumb {
  background: #163F5E;
  border-radius: 10px;
  transition: background 0.3s ease;
}

.login-card-inner::-webkit-scrollbar-thumb:hover {
  background: #1e4a6b;
}

/* Убраны hover эффекты для плашки */

  .logo-container {
    display: flex;
    align-items: center;
  }

.logo {
  height: 80px;
  width: auto;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
}

.logo:hover {
  transform: scale(1.1);
}

.modern-input {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  color: #2c3e50;
  transition: all 0.3s ease;
}

.modern-input:focus {
  background: rgba(255, 255, 255, 1);
  border-color: #1e3a8a;
  box-shadow: 0 0 20px rgba(30, 58, 138, 0.2);
  transform: translateY(-2px);
}

.modern-input::placeholder {
  color: rgba(44, 62, 80, 0.6);
}

.modern-button {
  background: #163F5E;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 10px 25px rgba(22, 63, 94, 0.3);
}

.modern-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(22, 63, 94, 0.4);
  background: #1e4a6b;
}

.field {
  margin-bottom: 1.5rem;
  /* Убрана анимация для предотвращения скроллбара */
}

/* Убраны задержки анимации - все анимации удалены для предотвращения скроллбара */

.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  /* Убраны тени с лейблов */
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: scale(1.1);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes logoFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
</style>
