<template>
  <Layout>
    <div class="system-admins-system">
      <Card class="system-admins-main-card">
        <template #title>
          <div class="page-header">
            <h1 class="page-title">Администраторы платформы</h1>
            <p class="page-subtitle">Управление администраторами системы</p>
          </div>
        </template>
        
        <template #content>
          <!-- Фильтры -->
          <div class="system-admins-filters">
            <!-- Поиск -->
            <div class="search-filter">
              <label class="filter-label">Поиск:</label>
              <div class="search-container">
                <i class="pi pi-search search-icon"></i>
                <InputText 
                  v-model="globalFilter" 
                  placeholder="Поиск по ФИО, email..."
                  class="search-input"
                />
              </div>
            </div>
            
            <!-- Кнопка создания -->
            <div class="create-filter">
              <Button 
                icon="pi pi-plus" 
                label="Создать администратора" 
                class="create-button"
                @click="showCreateModal"
              />
            </div>
          </div>
          
          <!-- Таблица администраторов платформы -->
          <DataTable 
            :value="filteredSystemAdmins" 
            :loading="loading"
            :paginator="true" 
            :rows="10"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Показано {first} - {last} из {totalRecords} записей"
            :sortField="'fullName'"
            :sortOrder="1"
            @row-click="onRowClick"
            class="system-admins-table"
            rowHover
            stripedRows
          >
            <Column field="fullName" header="ФИО" :sortable="true">
              <template #body="{ data }">
                <div class="admin-name">
                  <strong>{{ data.fullName }}</strong>
                  <small class="admin-email">{{ data.email }}</small>
                </div>
              </template>
            </Column>


            <Column field="lastLogin" header="Последний вход" :sortable="true">
              <template #body="{ data }">
                <div class="login-info">
                  <div class="login-date">{{ formatDate(data.lastLogin) }}</div>
                  <small class="login-time">{{ formatTime(data.lastLogin) }}</small>
                </div>
              </template>
            </Column>

            <Column field="createdAt" header="Дата создания" :sortable="true">
              <template #body="{ data }">
                <span class="created-date">{{ formatDate(data.createdAt) }}</span>
              </template>
            </Column>


            <Column header="Действия" :exportable="false" style="min-width: 10rem">
              <template #body="{ data }">
                <div class="action-buttons">
                  <Button 
                    icon="pi pi-eye" 
                    class="p-button-sm p-button-text"
                    @click="viewSystemAdmin(data)"
                    v-tooltip.top="'Просмотр'"
                  />
                  <Button 
                    icon="pi pi-pencil" 
                    class="p-button-sm p-button-text"
                    @click="editSystemAdmin(data)"
                    v-tooltip.top="'Редактировать'"
                  />
                  <Button 
                    icon="pi pi-ban" 
                    class="p-button-sm p-button-text"
                    @click="toggleStatus(data)"
                    v-tooltip.top="data.status === 'Активен' ? 'Заблокировать' : 'Разблокировать'"
                  />
                  <Button 
                    icon="pi pi-trash" 
                    class="p-button-sm p-button-text p-button-danger"
                    @click="deleteSystemAdmin(data)"
                    v-tooltip.top="'Удалить'"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>

    <!-- Модалка создания администратора -->
    <Dialog 
      v-model:visible="createModalVisible" 
      modal 
      header="Создать администратора платформы"
      :style="{ width: '500px' }"
      :closable="true"
    >
      <div class="create-form">
        <div class="form-group">
          <label for="createEmail">Email:</label>
          <InputText 
            id="createEmail"
            v-model="newAdmin.email" 
            placeholder="Введите email"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="createPassword">Пароль:</label>
          <Password 
            id="createPassword"
            v-model="newAdmin.password" 
            placeholder="Введите пароль"
            class="form-input"
            :feedback="false"
          />
        </div>
        
      </div>
      
      <template #footer>
        <Button 
          label="Отмена" 
          icon="pi pi-times" 
          class="p-button-text" 
          @click="cancelCreate"
        />
        <Button 
          label="Создать" 
          icon="pi pi-check" 
          @click="createSystemAdmin"
          :disabled="!isCreateFormValid"
        />
      </template>
    </Dialog>

    <!-- Модалка редактирования администратора -->
    <Dialog 
      v-model:visible="editModalVisible" 
      modal 
      header="Редактировать администратора платформы"
      :style="{ width: '500px' }"
      :closable="true"
    >
      <div class="edit-form">
        <div class="form-group">
          <label for="editFullName">ФИО:</label>
          <InputText 
            id="editFullName"
            v-model="editingAdmin.fullName" 
            placeholder="Введите ФИО"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="editEmail">Email:</label>
          <InputText 
            id="editEmail"
            v-model="editingAdmin.email" 
            placeholder="Введите email"
            class="form-input"
          />
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
          @click="saveSystemAdmin"
          :disabled="!isEditFormValid"
        />
      </template>
    </Dialog>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Layout from '@/components/Layout.vue'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import Password from 'primevue/password'

const router = useRouter()

// Состояние
const loading = ref(false)
const globalFilter = ref('')

// Модалки
const createModalVisible = ref(false)
const editModalVisible = ref(false)

// Формы
const newAdmin = ref({
  email: '',
  password: ''
})

const editingAdmin = ref({
  id: '',
  fullName: '',
  email: ''
})

// Данные администраторов платформы
const systemAdmins = ref([
  {
    id: '001',
    fullName: 'Смирнов Алексей Владимирович',
    email: 'smirnov@education.spb.ru',
    lastLogin: new Date('2024-12-20T09:15:00'),
    createdAt: new Date('2020-01-15')
  },
  {
    id: '002',
    fullName: 'Петрова Елена Сергеевна',
    email: 'petrova@education.spb.ru',
    lastLogin: new Date('2024-12-19T14:30:00'),
    createdAt: new Date('2021-03-20')
  },
  {
    id: '003',
    fullName: 'Козлов Дмитрий Александрович',
    email: 'kozlov@education.spb.ru',
    lastLogin: new Date('2024-11-10T11:45:00'),
    createdAt: new Date('2022-06-10')
  },
  {
    id: '004',
    fullName: 'Волкова Мария Игоревна',
    email: 'volkova@education.spb.ru',
    lastLogin: new Date('2024-12-20T16:20:00'),
    createdAt: new Date('2021-09-15')
  },
  {
    id: '005',
    fullName: 'Федоров Игорь Михайлович',
    email: 'fedorov@education.spb.ru',
    lastLogin: new Date('2024-10-25T08:30:00'),
    createdAt: new Date('2022-02-28')
  }
])


const filteredSystemAdmins = computed(() => {
  let filtered = systemAdmins.value

  // Поиск
  if (globalFilter.value) {
    const searchTerm = globalFilter.value.toLowerCase()
    filtered = filtered.filter(a => 
      a.fullName.toLowerCase().includes(searchTerm) ||
      a.email.toLowerCase().includes(searchTerm)
    )
  }

  return filtered
})

// Валидация форм
const isCreateFormValid = computed(() => {
  return newAdmin.value.email && 
         newAdmin.value.password
})

const isEditFormValid = computed(() => {
  return editingAdmin.value.fullName && 
         editingAdmin.value.email
})

// Методы
const onRowClick = (event: any) => {
  console.log('Клик по строке:', event.data)
  viewSystemAdmin(event.data)
}

const viewSystemAdmin = (admin: any) => {
  router.push(`/system/system-admin-detail/${admin.id}`)
}

const editSystemAdmin = (admin: any) => {
  editingAdmin.value = { ...admin }
  editModalVisible.value = true
}

const deleteSystemAdmin = (admin: any) => {
  console.log('Удаление администратора платформы:', admin)
  // TODO: Реализовать удаление
}

const toggleStatus = (admin: any) => {
  console.log('Изменение статуса администратора платформы:', admin)
  // TODO: Реализовать изменение статуса
}

const showCreateModal = () => {
  newAdmin.value = {
    email: '',
    password: ''
  }
  createModalVisible.value = true
}

const createSystemAdmin = () => {
  console.log('Создание администратора платформы:', newAdmin.value)
  // TODO: Реализовать создание
  createModalVisible.value = false
}

const cancelCreate = () => {
  createModalVisible.value = false
}

const saveSystemAdmin = () => {
  console.log('Сохранение администратора платформы:', editingAdmin.value)
  // TODO: Реализовать сохранение
  editModalVisible.value = false
}

const cancelEdit = () => {
  editModalVisible.value = false
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

onMounted(() => {
  // Инициализация данных
})
</script>

<style scoped>
.system-admins-system {
  width: 100%;
}

.system-admins-main-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.6s ease-out;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.system-admins-filters {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(22, 63, 94, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(22, 63, 94, 0.1);
  backdrop-filter: blur(10px);
}

.search-filter {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.create-filter {
  display: flex;
  align-items: flex-end;
}

.filter-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}


.search-container {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding-left: 2.5rem;
  border-radius: 25px;
  border: 1px solid rgba(22, 63, 94, 0.2);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.create-button {
  background: #163F5E !important;
  border-color: #163F5E !important;
  color: white !important;
  font-weight: 600 !important;
  padding: 0.75rem 1.5rem !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

.create-button:hover {
  background: #1e4a6b !important;
  border-color: #1e4a6b !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(22, 63, 94, 0.3) !important;
}

.system-admins-table {
  background: transparent;
}

.admin-name {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.admin-email {
  color: #6c757d;
  font-size: 0.8rem;
}

.login-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.login-date {
  font-weight: 500;
  color: #2c3e50;
}

.login-time {
  color: #6c757d;
  font-size: 0.8rem;
}

.created-date {
  color: #495057;
  font-weight: 500;
}


.action-buttons {
  display: flex;
  gap: 0.5rem;
}

/* Стили для форм */
.create-form,
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(22, 63, 94, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #163F5E;
  box-shadow: 0 0 0 2px rgba(22, 63, 94, 0.1);
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

/* Адаптивность */
@media (max-width: 768px) {
  .system-admins-filters {
    flex-direction: column;
    gap: 1rem;
  }
  
  .search-filter {
    flex: none;
  }
  
  .create-filter {
    align-items: stretch;
  }
}
</style>
