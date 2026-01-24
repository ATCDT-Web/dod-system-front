<template>
  <div class="verification-container register-bg">
    <div class="verification-card">
      <Card class="verification-card-inner">
        <template #title>
          <div class="text-center">
            <div class="logo-container">
              <img :src="logo" alt="Logo" class="logo mb-3" />
            </div>
            <h1 class="text-3xl font-bold text-gray-800">Подтверждение email</h1>
            <p class="text-gray-600 mt-2">
              Мы отправили код подтверждения на ваш email: <strong>{{ email }}</strong>
            </p>
          </div>
        </template>
        <template #content>
          <form @submit.prevent="handleVerification" class="p-fluid">
            <div class="field">
              <label for="verificationCode" class="font-semibold text-gray-700">Код подтверждения</label>
              <InputText
                id="verificationCode"
                v-model="form.code"
                placeholder="Введите 6-значный код"
                class="modern-input text-center text-2xl tracking-widest"
                :class="{ 'p-invalid': errors.code }"
                maxlength="6"
                required
              />
              <small v-if="errors.code" class="p-error">{{ errors.code }}</small>
            </div>

            <div class="field">
              <Button
                type="submit"
                label="Подтвердить"
                icon="pi pi-check"
                class="w-full modern-button"
                :loading="loading"
                :disabled="!isCodeValid"
              />
            </div>

            <div class="text-center mt-4">
              <p class="text-sm text-gray-600">
                Не получили код? 
                <Button
                  label="Отправить повторно"
                  link
                  class="p-button-link text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                  :disabled="resendCooldown > 0"
                  @click="handleResend"
                />
              </p>
              <p v-if="resendCooldown > 0" class="text-sm text-orange-600 mt-1">
                Повторная отправка доступна через {{ resendCooldown }} сек.
              </p>
            </div>

            <div class="text-center mt-4">
              <p class="text-sm text-gray-600">
                Неправильный email? 
                <router-link to="/register" class="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                  Вернуться к регистрации
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
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import logo from '@/assets/logo.svg'
import type { EmailVerificationData } from '@/types'

// Reactive data
const router = useRouter()
const route = useRoute()
const toast = useToast()

const loading = ref<boolean>(false)
const resendCooldown = ref<number>(0)
const email = ref<string>('')

const form = reactive<EmailVerificationData>({
  email: '',
  code: ''
})

const errors = reactive<{
  code: string
}>({
  code: ''
})

// Computed properties
const isCodeValid = computed(() => {
  return form.code.length === 6 && /^\d{6}$/.test(form.code)
})

// Timer for resend cooldown
let resendTimer: NodeJS.Timeout | null = null

// Validation function
const validateForm = (): boolean => {
  let isValid = true
  
  // Reset errors
  errors.code = ''
  
  // Code validation
  if (!form.code) {
    errors.code = 'Код подтверждения обязателен'
    isValid = false
  } else if (!/^\d{6}$/.test(form.code)) {
    errors.code = 'Код должен содержать 6 цифр'
    isValid = false
  }
  
  return isValid
}

// Generate verification code
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Save verification data
const saveVerificationData = (email: string, code: string): void => {
  const verificationData = {
    email,
    code,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    attempts: 0
  }
  localStorage.setItem('emailVerification', JSON.stringify(verificationData))
}

// Get verification data
const getVerificationData = () => {
  const data = localStorage.getItem('emailVerification')
  return data ? JSON.parse(data) : null
}

// Verification handler
const handleVerification = async (): Promise<void> => {
  if (!validateForm()) return
  
  loading.value = true
  
  try {
    // Имитация API запроса
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const verificationData = getVerificationData()
    
    if (!verificationData) {
      toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Данные подтверждения не найдены. Пожалуйста, пройдите регистрацию заново.',
        life: 5000
      })
      router.push('/register')
      return
    }
    
    // Check if code is expired
    if (new Date() > new Date(verificationData.expiresAt)) {
      toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Код подтверждения истек. Пожалуйста, запросите новый код.',
        life: 5000
      })
      return
    }
    
    // Check attempts
    if (verificationData.attempts >= 3) {
      toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Превышено количество попыток. Пожалуйста, запросите новый код.',
        life: 5000
      })
      return
    }
    
    // Verify code
    if (form.code === verificationData.code) {
      // Code is correct, complete registration
      const users: any[] = JSON.parse(localStorage.getItem('users') || '[]')
      const pendingUser = users.find(u => u.email === email.value && !u.verified)
      
      if (pendingUser) {
        // Mark user as verified
        pendingUser.verified = true
        pendingUser.verifiedAt = new Date().toISOString()
        localStorage.setItem('users', JSON.stringify(users))
        
        // Clear verification data
        localStorage.removeItem('emailVerification')
        
        toast.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Email успешно подтвержден! Теперь вы можете войти в систему.',
          life: 5000
        })
        
        router.push('/login')
      } else {
        toast.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: 'Пользователь не найден. Пожалуйста, пройдите регистрацию заново.',
          life: 5000
        })
        router.push('/register')
      }
    } else {
      // Wrong code, increment attempts
      verificationData.attempts++
      localStorage.setItem('emailVerification', JSON.stringify(verificationData))
      
      toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: `Неверный код. Осталось попыток: ${3 - verificationData.attempts}`,
        life: 5000
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Произошла ошибка при подтверждении кода',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

// Resend code handler
const handleResend = async (): Promise<void> => {
  if (resendCooldown.value > 0) return
  
  loading.value = true
  
  try {
    // Имитация отправки email
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newCode = generateVerificationCode()
    saveVerificationData(email.value, newCode)
    
    // Start cooldown timer
    resendCooldown.value = 60
    startResendTimer()
    
    toast.add({
      severity: 'success',
      summary: 'Код отправлен',
      detail: 'Новый код подтверждения отправлен на ваш email',
      life: 5000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось отправить код. Попробуйте позже.',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

// Start resend timer
const startResendTimer = (): void => {
  resendTimer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(resendTimer!)
      resendTimer = null
    }
  }, 1000)
}

// Lifecycle
onMounted(() => {
  // Get email from route params or localStorage
  const emailParam = route.query.email as string
  const verificationData = getVerificationData()
  
  if (emailParam) {
    email.value = emailParam
  } else if (verificationData) {
    email.value = verificationData.email
  } else {
    // No email found, redirect to registration
    router.push('/register')
    return
  }
  
  // Check if verification is expired
  if (verificationData && new Date() > new Date(verificationData.expiresAt)) {
    toast.add({
      severity: 'warn',
      summary: 'Внимание',
      detail: 'Код подтверждения истек. Пожалуйста, запросите новый код.',
      life: 5000
    })
  }
})

onUnmounted(() => {
  if (resendTimer) {
    clearInterval(resendTimer)
  }
})
</script>

<style scoped>
.verification-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  background-attachment: fixed;
}

.verification-container::before {
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

.verification-card {
  width: 100%;
  max-width: 500px;
  position: relative;
  z-index: 2;
}

.verification-card-inner {
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
.verification-card-inner::-webkit-scrollbar {
  width: 8px;
}

.verification-card-inner::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
}

.verification-card-inner::-webkit-scrollbar-thumb {
  background: #163F5E;
  border-radius: 10px;
  transition: background 0.3s ease;
}

.verification-card-inner::-webkit-scrollbar-thumb:hover {
  background: #1e4a6b;
}

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

.modern-button:disabled {
  background: #9ca3af;
  transform: none;
  box-shadow: none;
  cursor: not-allowed;
}

.field {
  margin-bottom: 1.5rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
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
</style>
