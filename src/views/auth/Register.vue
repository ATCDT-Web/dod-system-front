<template>
  <div class="register-container register-bg">
    <div class="register-card">
      <Card class="register-card-inner">
        <template #title>
          <div class="text-center">
            <div class="logo-container">
              <img :src="logo" alt="Logo" class="logo mb-3" />
            </div>
            <h1 class="text-3xl font-bold text-gray-800">Регистрация администратора ОУ</h1>
            <p class="text-sm text-gray-600 mt-2">
              Заполните форму для создания аккаунта администратора образовательного учреждения
            </p>
          </div>
        </template>
        <template #content>
          <form @submit.prevent="handleRegister" class="p-fluid">
            <div class="grid">
              <div class="col-12">
                <div class="field">
                  <label for="fullName" class="font-semibold text-gray-700">ФИО *</label>
                  <InputText
                    id="fullName"
                    v-model="form.fullName"
                    placeholder="Введите полное имя"
                    class="modern-input"
                    :class="{ 'p-invalid': errors.fullName }"
                    required
                  />
                  <small v-if="errors.fullName" class="p-error">{{ errors.fullName }}</small>
                </div>
              </div>

              <div class="col-12">
                <div class="field">
                  <label for="email" class="font-semibold text-gray-700">Email *</label>
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
              </div>

              <div class="col-12 md:col-6">
                <div class="field">
                  <label for="password" class="font-semibold text-gray-700">Пароль *</label>
                  <Password
                    id="password"
                    v-model="form.password"
                    placeholder="Введите пароль"
                    class="modern-input"
                    :class="{ 'p-invalid': errors.password }"
                    :feedback="false"
                    toggleMask
                    required
                    :showIcon="true"
                  />
                  <PasswordStrength :password="form.password" />
                  <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
                </div>
              </div>

              <div class="col-12 md:col-6">
                <div class="field">
                  <label for="confirmPassword" class="font-semibold text-gray-700">Подтвердите пароль *</label>
                  <Password
                    id="confirmPassword"
                    v-model="form.confirmPassword"
                    placeholder="Подтвердите пароль"
                    class="modern-input"
                    :class="{ 'p-invalid': errors.confirmPassword }"
                    :feedback="false"
                    toggleMask
                    required
                  />
                  <small v-if="errors.confirmPassword" class="p-error">{{ errors.confirmPassword }}</small>
                </div>
              </div>

              <div class="col-12">
                <div class="field">
                  <label for="district" class="font-semibold text-gray-700">Район *</label>
                  <Dropdown
                    id="district"
                    v-model="form.district"
                    :options="districtOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Выберите район"
                    class="modern-input"
                    :class="{ 'p-invalid': errors.district }"
                    required
                  />
                  <small v-if="errors.district" class="p-error">{{ errors.district }}</small>
                </div>
              </div>

              <div class="col-12">
                <div class="field">
                  <label for="institutionName" class="font-semibold text-gray-700">Образовательное учреждение *</label>
                  <InputText
                    id="institutionName"
                    v-model="form.institutionName"
                    placeholder="Введите название учреждения"
                    class="modern-input"
                    :class="{ 'p-invalid': errors.institutionName }"
                    required
                  />
                  <small v-if="errors.institutionName" class="p-error">{{ errors.institutionName }}</small>
                </div>
              </div>

              <div class="col-12">
                <div class="field">
                  <label for="institutionType" class="font-semibold text-gray-700">Вид ОУ *</label>
                  <Dropdown
                    id="institutionType"
                    v-model="form.institutionType"
                    :options="institutionTypeOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Выберите вид ОУ"
                    class="modern-input"
                    :class="{ 'p-invalid': errors.institutionType }"
                    required
                  />
                  <small v-if="errors.institutionType" class="p-error">{{ errors.institutionType }}</small>
                </div>
              </div>

              <div class="col-12">
                <div class="field">
                  <label for="position" class="font-semibold text-gray-700">Должность *</label>
                  <InputText
                    id="position"
                    v-model="form.position"
                    placeholder="Введите должность"
                    class="modern-input"
                    :class="{ 'p-invalid': errors.position }"
                    required
                  />
                  <small v-if="errors.position" class="p-error">{{ errors.position }}</small>
                </div>
              </div>
            </div>

            <div class="field">
              <Button
                type="submit"
                label="Зарегистрироваться"
                icon="pi pi-user-plus"
                class="w-full modern-button"
                :loading="loading"
              />
            </div>

            <div class="text-center mt-4">
              <p class="text-sm text-gray-600">
                Уже есть аккаунт? 
                <router-link to="/login" class="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                  Войти
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
import PasswordStrength from '@/components/PasswordStrength.vue'
import type { RegisterData, SelectOption, User } from '@/types'

// Reactive data
const router = useRouter()
const toast = useToast()

const loading = ref<boolean>(false)
const form = reactive<RegisterData & { confirmPassword: string; fullName: string }>({
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  firstName: '',
  lastName: '',
  district: '',
  institutionType: '',
  institutionName: ''
})

const errors = reactive<{
  fullName: string
  email: string
  password: string
  confirmPassword: string
  district: string
  institutionName: string
  institutionType: string
}>({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  district: '',
  institutionName: '',
  institutionType: ''
})

// Options for dropdowns
const districtOptions = ref<SelectOption[]>([
  { label: 'Центральный район', value: 'central' },
  { label: 'Северный район', value: 'north' },
  { label: 'Южный район', value: 'south' },
  { label: 'Восточный район', value: 'east' },
  { label: 'Западный район', value: 'west' }
])

const institutionTypeOptions = ref<SelectOption[]>([
  { label: 'Средняя общеобразовательная школа (СОШ)', value: 'sosh' },
  { label: 'Среднее профессиональное образование (СПО)', value: 'spo' },
  { label: 'Дошкольное образование (ДО)', value: 'do' },
  { label: 'Дополнительное образование', value: 'additional' },
  { label: 'Специальное образование', value: 'special' }
])

// Validation function
const validateForm = (): boolean => {
  let isValid = true
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
  
  // Full name validation
  if (!form.fullName.trim()) {
    errors.fullName = 'ФИО обязательно'
    isValid = false
  }
  
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
  
  // Confirm password validation
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Подтверждение пароля обязательно'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Пароли не совпадают'
    isValid = false
  }
  
  // District validation
  if (!form.district) {
    errors.district = 'Район обязателен'
    isValid = false
  }
  
  // Institution name validation
  if (!form.institutionName.trim()) {
    errors.institutionName = 'Название учреждения обязательно'
    isValid = false
  }
  
  // Institution type validation
  if (!form.institutionType) {
    errors.institutionType = 'Вид ОУ обязателен'
    isValid = false
  }
  
  return isValid
}

// Register handler
const handleRegister = async (): Promise<void> => {
  if (!validateForm()) return
  
  loading.value = true
  
  try {
    // Имитация API запроса
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Проверка существования пользователя
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]')
    const existingUser = users.find(u => u.email === form.email)
    
    if (existingUser) {
      toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Пользователь с таким email уже существует',
        life: 3000
      })
      return
    }
    
    // Генерация кода подтверждения
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Разделяем ФИО на имя и фамилию
    const nameParts = form.fullName.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''
    
    // Создание нового пользователя (неподтвержденного)
    const newUser: User = {
      id: Date.now().toString(),
      email: form.email,
      firstName: firstName,
      lastName: lastName,
      district: form.district,
      institutionType: form.institutionType,
      institutionName: form.institutionName
    }
    
    // Добавляем поля для подтверждения
    const userWithVerification = {
      ...newUser,
      verified: false,
      verificationCode,
      createdAt: new Date().toISOString()
    }
    
    // Сохранение пользователя
    users.push(userWithVerification)
    localStorage.setItem('users', JSON.stringify(users))
    
    // Сохранение данных для подтверждения
    const verificationData = {
      email: form.email,
      code: verificationCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 минут
      attempts: 0
    }
    localStorage.setItem('emailVerification', JSON.stringify(verificationData))
    
    toast.add({
      severity: 'success',
      summary: 'Регистрация завершена',
      detail: 'Код подтверждения отправлен на ваш email. Пожалуйста, проверьте почту.',
      life: 5000
    })
    
    router.push({
      path: '/verify-email',
      query: { email: form.email }
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Произошла ошибка при регистрации',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Фоновое изображение теперь в CSS классе register-bg */
  padding: 2rem;
  position: relative;
  overflow: hidden;
  /* Убрана анимация для предотвращения скроллбара */
  /* Фон остается статичным при анимациях */
  background-attachment: fixed;
}

.register-container::before {
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

.register-card {
  width: 100%;
  max-width: 700px;
  position: relative;
  z-index: 2;
  /* Убрана анимация для предотвращения скроллбара */
}

.register-card-inner {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  max-height: 85vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #163F5E rgba(255, 255, 255, 0.3);
}

/* Стилизация скроллбара для WebKit браузеров */
.register-card-inner::-webkit-scrollbar {
  width: 8px;
}

.register-card-inner::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
}

.register-card-inner::-webkit-scrollbar-thumb {
  background: #163F5E;
  border-radius: 10px;
  transition: background 0.3s ease;
}

.register-card-inner::-webkit-scrollbar-thumb:hover {
  background: #1e4a6b;
}

/* Убраны hover эффекты для плашки */

.logo-container {
  /* Убрана анимация логотипа */
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

/* Стили для индикатора силы пароля */
.p-password .p-password-info {
  opacity: 1 !important;
  visibility: visible !important;
  display: block !important;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.p-password .p-password-meter {
  margin-top: 0.5rem;
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

/* Убраны задержки анимации */

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
