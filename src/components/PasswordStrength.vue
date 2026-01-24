<template>
  <div v-if="showStrength" class="password-strength">
    <div class="password-meter">
      <div 
        class="password-meter-fill" 
        :class="strengthClass"
        :style="{ width: strengthWidth }"
      ></div>
    </div>
    <div class="password-info" :class="strengthClass">
      {{ strengthText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  password: string
  showStrength?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showStrength: true
})

const strength = computed(() => {
  const password = props.password
  if (!password) return 0
  
  let score = 0
  
  // Длина пароля
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  
  // Содержит строчные буквы
  if (/[a-z]/.test(password)) score += 1
  
  // Содержит заглавные буквы
  if (/[A-Z]/.test(password)) score += 1
  
  // Содержит цифры
  if (/\d/.test(password)) score += 1
  
  // Содержит специальные символы
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
  
  return score
})

const strengthClass = computed(() => {
  const score = strength.value
  if (score <= 2) return 'weak'
  if (score <= 4) return 'medium'
  return 'strong'
})

const strengthText = computed(() => {
  const score = strength.value
  if (score <= 2) return 'Слабый'
  if (score <= 4) return 'Средний'
  return 'Сильный'
})

const strengthWidth = computed(() => {
  const score = strength.value
  if (score <= 2) return '33%'
  if (score <= 4) return '66%'
  return '100%'
})
</script>

<style scoped>
.password-strength {
  margin-top: 0.5rem;
}

.password-meter {
  background: #e5e7eb;
  height: 4px;
  border-radius: 2px;
  overflow: hidden;
}

.password-meter-fill {
  height: 100%;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.password-meter-fill.weak {
  background: #ef4444;
}

.password-meter-fill.medium {
  background: #f59e0b;
}

.password-meter-fill.strong {
  background: #10b981;
}

.password-info {
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 0.25rem;
}

.password-info.weak {
  color: #ef4444;
}

.password-info.medium {
  color: #f59e0b;
}

.password-info.strong {
  color: #10b981;
}
</style>
