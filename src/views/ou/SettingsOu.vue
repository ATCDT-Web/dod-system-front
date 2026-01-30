<template>
  <Layout>
    <div class="settings">
      <Card class="settings-main-card">
        <template #title>
          <div class="page-header">
            <h1 class="page-title">Настройки</h1>
            <p class="page-subtitle">Управление профилем и данными учреждения</p>
          </div>
        </template>
        
        <template #content>
          <div class="settings-content">
            <!-- Информация о пользователе -->
            <div class="user-info-section">
              <h2 class="section-title">Личная информация</h2>
              <div class="info-card">
                <div class="info-grid">
                  <div class="info-field">
                    <label>ФИО:</label>
                    <span>{{ user.fullName }}</span>
                    <Button
                      icon="pi pi-pencil"
                      class="p-button-text p-button-sm edit-button"
                      @click="editField('fullName')"
                    />
                  </div>
                  <div class="info-field">
                    <label>Email:</label>
                    <span>{{ user.email }}</span>
                    <Button
                      icon="pi pi-pencil"
                      class="p-button-text p-button-sm edit-button"
                      @click="editField('email')"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Информация об учреждении -->
            <div class="institution-info-section">
              <h2 class="section-title">Информация об учреждении</h2>
              <div class="info-card">
                <div class="info-grid">
                  <div class="info-field">
                    <label>Название учреждения:</label>
                    <span>{{ user.institutionName }}</span>
                    <Button
                      icon="pi pi-pencil"
                      class="p-button-text p-button-sm edit-button"
                      @click="editField('institutionName')"
                    />
                  </div>
                  <div class="info-field">
                    <label>Тип учреждения:</label>
                    <span>{{ getInstitutionType(user.institutionType) }}</span>
                    <Button
                      icon="pi pi-pencil"
                      class="p-button-text p-button-sm edit-button"
                      @click="editField('institutionType')"
                    />
                  </div>
                  <div class="info-field">
                    <label>Район:</label>
                    <span>{{ getDistrictName(user.district) }}</span>
                    <Button
                      icon="pi pi-pencil"
                      class="p-button-text p-button-sm edit-button"
                      @click="editField('district')"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Дополнительная информация -->
            <div class="additional-info-section">
              <h2 class="section-title">Дополнительная информация</h2>
              <div class="info-card">
                <div class="info-grid">
                  <div class="info-field">
                    <label>Дата регистрации:</label>
                    <span>{{ formatDate(user.createdAt) }}</span>
                  </div>
                  <div class="info-field">
                    <label>Роль в системе:</label>
                    <span>{{ user.role === 'admin_system' ? 'Администратор платформы' : 'Администратор ОУ' }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Действия -->
            <div class="actions-section">
              <h2 class="section-title">Действия</h2>
              <div class="action-buttons">
                <Button
                  label="Изменить пароль"
                  icon="pi pi-key"
                  class="action-button"
                  @click="changePassword"
                />
              </div>
            </div>
          </div>
        </template>
      </Card>
      
      <!-- Модальное окно редактирования -->
      <Dialog
        v-model:visible="showEditDialog"
        :header="`Редактирование ${getFieldLabel(editingField)}`"
        :modal="true"
        :style="{ width: '500px' }"
        class="edit-dialog"
      >
        <div class="edit-form">
          <div class="form-field">
            <label class="field-label">{{ getFieldLabel(editingField) }}</label>
            <div class="field-input">
              <InputText
                v-if="editingField === 'fullName' || editingField === 'email' || editingField === 'institutionName'"
                v-model="editValue"
                :placeholder="`Введите ${getFieldLabel(editingField).toLowerCase()}`"
                class="modern-input"
              />
              <Dropdown
                v-else-if="editingField === 'institutionType'"
                v-model="editValue"
                :options="institutionTypeOptions"
                optionLabel="label"
                optionValue="value"
                :placeholder="`Выберите ${getFieldLabel(editingField).toLowerCase()}`"
                class="modern-dropdown"
              />
              <Dropdown
                v-else-if="editingField === 'district'"
                v-model="editValue"
                :options="districtOptions"
                optionLabel="label"
                optionValue="value"
                :placeholder="`Выберите ${getFieldLabel(editingField).toLowerCase()}`"
                class="modern-dropdown"
              />
            </div>
          </div>
        </div>
        
        <template #footer>
          <Button
            label="Отмена"
            icon="pi pi-times"
            class="p-button-text"
            @click="cancelEdit"
          />
          <Button
            label="Сохранить"
            icon="pi pi-check"
            class="save-button"
            @click="saveEdit"
          />
        </template>
      </Dialog>
      
      <!-- Модальное окно смены пароля -->
      <Dialog
        v-model:visible="showPasswordDialog"
        header="Изменение пароля"
        :modal="true"
        :style="{ width: '500px' }"
        class="password-dialog"
      >
        <div class="password-form">
          <div class="form-field">
            <label class="field-label">Текущий пароль</label>
            <Password
              v-model="passwordForm.currentPassword"
              placeholder="Введите текущий пароль"
              class="modern-password"
              :feedback="false"
              toggleMask
            />
          </div>
          <div class="form-field">
            <label class="field-label">Новый пароль</label>
            <Password
              v-model="passwordForm.newPassword"
              placeholder="Введите новый пароль"
              class="modern-password"
              :feedback="false"
              toggleMask
            />
          </div>
          <div class="form-field">
            <label class="field-label">Подтверждение пароля</label>
            <Password
              v-model="passwordForm.confirmPassword"
              placeholder="Подтвердите новый пароль"
              class="modern-password"
              :feedback="false"
              toggleMask
            />
          </div>
        </div>
        
        <template #footer>
          <Button
            label="Отмена"
            icon="pi pi-times"
            class="p-button-text"
            @click="cancelPasswordChange"
          />
          <Button
            label="Изменить пароль"
            icon="pi pi-check"
            class="save-button"
            @click="savePasswordChange"
          />
        </template>
      </Dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import Layout from '@/components/Layout.vue'
import type { User } from '@/types'
import { fetchUserProfile, getStoredUser, setStoredUser } from '@/services/auth'

const toast = useToast()

// Состояние
const user = ref<User>({} as User)
const showEditDialog = ref(false)
const showPasswordDialog = ref(false)
const editingField = ref<string>('')
const editValue = ref<string>('')

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Опции для выпадающих списков
const institutionTypeOptions = [
  { label: 'Средняя общеобразовательная школа', value: 'sosh' },
  { label: 'Гимназия', value: 'gymnasium' },
  { label: 'Лицей', value: 'lyceum' },
  { label: 'Школа', value: 'school' }
]

const districtOptions = [
  { label: 'Центральный район', value: 'central' },
  { label: 'Северный район', value: 'north' },
  { label: 'Южный район', value: 'south' },
  { label: 'Восточный район', value: 'east' },
  { label: 'Западный район', value: 'west' }
]

// Computed properties
const userInfo = computed(() => [
  { label: 'ФИО', value: user.value.fullName },
  { label: 'Email', value: user.value.email },
  { label: 'Роль', value: user.value.role === 'admin_system' ? 'Администратор платформы' : 'Администратор ОУ' }
])

// Methods
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

const getFieldLabel = (field: string): string => {
  const labels: Record<string, string> = {
    'fullName': 'ФИО',
    'email': 'Email',
    'institutionName': 'Название учреждения',
    'institutionType': 'Тип учреждения',
    'district': 'Район'
  }
  return labels[field] || field
}

const editField = (field: string) => {
  editingField.value = field
  editValue.value = user.value[field as keyof User] as string
  showEditDialog.value = true
}

const cancelEdit = () => {
  showEditDialog.value = false
  editingField.value = ''
  editValue.value = ''
}

const saveEdit = () => {
  if (editValue.value.trim()) {
    user.value[editingField.value as keyof User] = editValue.value as any
    
    setStoredUser(user.value)
    
    toast.add({
      severity: 'success',
      summary: 'Изменения сохранены',
      detail: `${getFieldLabel(editingField.value)} успешно обновлен`,
      life: 3000
    })
    
    cancelEdit()
  } else {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Поле не может быть пустым',
      life: 3000
    })
  }
}

const changePassword = () => {
  showPasswordDialog.value = true
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

const cancelPasswordChange = () => {
  showPasswordDialog.value = false
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

const savePasswordChange = () => {
  if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword || !passwordForm.value.confirmPassword) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Все поля должны быть заполнены',
      life: 3000
    })
    return
  }
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Новые пароли не совпадают',
      life: 3000
    })
    return
  }
  
  if (passwordForm.value.newPassword.length < 6) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Пароль должен содержать минимум 6 символов',
      life: 3000
    })
    return
  }
  
  toast.add({
    severity: 'success',
    summary: 'Пароль изменен',
    detail: 'Пароль успешно обновлен',
    life: 3000
  })
  
  cancelPasswordChange()
}


const formatDate = (date: string | Date) => {
  if (!date) return 'Не указано'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('ru-RU')
}

// Lifecycle
onMounted(async () => {
  const storedUser = getStoredUser()
  if (storedUser) {
    user.value = storedUser
  }

  try {
    const updatedUser = await fetchUserProfile()
    if (updatedUser) {
      user.value = updatedUser
    }
  } catch {
    toast.add({
      severity: 'warn',
      summary: 'Профиль',
      detail: 'Не удалось обновить данные профиля с сервера',
      life: 3000
    })
  }
})
</script>

<style scoped>
.settings {
  width: 100%;
}

.settings-main-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 2;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
}

.info-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.info-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
}

.info-field label {
  font-weight: 600;
  color: #163F5E;
  font-size: 0.9rem;
}

.info-field span {
  color: #2c3e50;
  font-size: 1rem;
  padding: 0.5rem 0;
}

.edit-button {
  position: absolute;
  top: 0;
  right: 0;
  color: #163F5E;
  transition: all 0.3s ease;
}

.edit-button:hover {
  color: #1e4a6b;
  transform: scale(1.1);
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.action-button {
  background: rgba(22, 63, 94, 0.1);
  border: 1px solid rgba(22, 63, 94, 0.3);
  color: #163F5E;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-button:hover {
  background: rgba(22, 63, 94, 0.2);
  border-color: rgba(22, 63, 94, 0.5);
  transform: translateY(-1px);
}

.edit-form,
.password-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
}

.field-input {
  width: 100%;
}

.modern-input,
.modern-dropdown,
.modern-password {
  width: 100%;
  border-radius: 8px;
  border: 1px solid rgba(22, 63, 94, 0.3);
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.modern-input:focus,
.modern-dropdown:focus,
.modern-password:focus {
  border-color: #163F5E;
  box-shadow: 0 0 0 2px rgba(22, 63, 94, 0.2);
}

.save-button {
  background: #163F5E;
  border: none;
  color: white;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.save-button:hover {
  background: #1e4a6b;
  transform: translateY(-1px);
}
</style>
