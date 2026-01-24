<template>
  <Layout>
    <div class="ou-admins-system">
      <Card class="ou-admins-main-card">
        <template #title>
          <div class="page-header">
            <h1 class="page-title">Администраторы ОУ</h1>
            <p class="page-subtitle">Управление администраторами образовательных учреждений</p>
          </div>
        </template>
        
        <template #content>
          <!-- Фильтры -->
          <div class="ou-admins-filters">
            <!-- Фильтр по району -->
            <div class="district-filter">
              <label class="filter-label">Район:</label>
              <Dropdown
                v-model="selectedDistrict"
                :options="districtOptions"
                option-label="label"
                option-value="value"
                placeholder="Выберите район"
                class="district-dropdown"
                @change="onDistrictChange"
              />
            </div>
            
            <!-- Фильтр по статусу -->
            <div class="status-filter">
              <label class="filter-label">Статус:</label>
              <Dropdown
                v-model="selectedStatus"
                :options="statusOptions"
                option-label="label"
                option-value="value"
                placeholder="Выберите статус"
                class="status-dropdown"
                @change="onStatusChange"
              />
            </div>
            
            <!-- Поиск -->
            <div class="search-filter">
              <label class="filter-label">Поиск:</label>
              <div class="search-container">
                <i class="pi pi-search search-icon"></i>
                <InputText 
                  v-model="globalFilter" 
                  placeholder="Поиск по ФИО, email, ОУ..."
                  class="search-input"
                  autocomplete="off"
                  name="search"
                />
              </div>
            </div>
          </div>
          
          <!-- Таблица администраторов ОУ -->
          <DataTable 
            :value="filteredOuAdmins" 
            :loading="loading"
            :paginator="true" 
            :rows="10"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Показано {first} - {last} из {totalRecords} записей"
            :sortField="'fullName'"
            :sortOrder="1"
            @row-click="onRowClick"
            class="ou-admins-table"
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

            <Column field="institution" header="Образовательное учреждение" :sortable="true">
              <template #body="{ data }">
                <div class="institution-info">
                  <div class="institution-name">{{ data.institution }}</div>
                  <small class="institution-district">{{ formatDistrict(data.district) }}</small>
                </div>
              </template>
            </Column>

            <Column field="position" header="Должность" :sortable="true">
              <template #body="{ data }">
                <span class="position-name">{{ data.position }}</span>
              </template>
            </Column>

            <Column field="status" header="Статус" :sortable="true">
              <template #body="{ data }">
                <Tag :value="data.status" :severity="getStatusSeverity(data.status)" />
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

            <Column field="reportsCount" header="Справок ДОД" :sortable="true">
              <template #body="{ data }">
                <div class="reports-info">
                  <span class="reports-count">{{ data.reportsCount }}</span>
                  <small class="reports-status">{{ getReportsStatus(data) }}</small>
                </div>
              </template>
            </Column>

            <Column header="Действия" :exportable="false" style="min-width: 8rem">
              <template #body="{ data }">
                <div class="action-buttons">
                  <Button 
                    icon="pi pi-eye" 
                    class="p-button-sm p-button-text"
                    @click="viewOuAdmin(data)"
                    v-tooltip.top="'Просмотр'"
                  />
                  <Button 
                    icon="pi pi-pencil" 
                    class="p-button-sm p-button-text"
                    @click="editOuAdmin(data)"
                    v-tooltip.top="'Редактировать'"
                  />
                  <Button 
                    icon="pi pi-ban" 
                    class="p-button-sm p-button-text"
                    @click="toggleStatus(data)"
                    v-tooltip.top="data.status === 'Активен' ? 'Заблокировать' : 'Разблокировать'"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
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
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Tag from 'primevue/tag'
import { fetchUsers, type BackendUser } from '@/services/users'

const router = useRouter()
const toast = useToast()

// Состояние
const loading = ref(false)
const globalFilter = ref('')
const selectedDistrict = ref(null)
const selectedStatus = ref(null)

// Данные администраторов ОУ
const ouAdmins = ref<Array<{
  id: string
  fullName: string
  email: string
  institution: string
  district: string
  position: string
  status: string
  lastLogin: Date
  reportsCount: number
  phone: string
  createdAt: Date
}>>([])

const districtLabels: Record<string, string> = {
  central: 'Центральный район',
  north: 'Северный район',
  south: 'Южный район',
  east: 'Восточный район',
  west: 'Западный район'
}

const formatDistrict = (district: string) => {
  return districtLabels[district] || district || 'Не указан'
}

// Опции фильтров
const districtOptions = computed(() => {
  const districts = [...new Set(ouAdmins.value.map(a => a.district))].sort()
  return [
    { label: 'Все районы', value: null },
    ...districts.map(district => ({ label: formatDistrict(district), value: district }))
  ]
})

const statusOptions = computed(() => [
  { label: 'Все статусы', value: null },
  { label: 'Активен', value: 'Активен' },
  { label: 'Неактивен', value: 'Неактивен' },
  { label: 'Заблокирован', value: 'Заблокирован' }
])

const filteredOuAdmins = computed(() => {
  let filtered = ouAdmins.value

  // Фильтр по району
  if (selectedDistrict.value) {
    filtered = filtered.filter(a => a.district === selectedDistrict.value)
  }

  // Фильтр по статусу
  if (selectedStatus.value) {
    filtered = filtered.filter(a => a.status === selectedStatus.value)
  }

  // Поиск
  if (globalFilter.value) {
    const searchTerm = globalFilter.value.toLowerCase()
    filtered = filtered.filter(a =>
      a.fullName.toLowerCase().includes(searchTerm) ||
      a.email.toLowerCase().includes(searchTerm) ||
      a.institution.toLowerCase().includes(searchTerm) ||
      formatDistrict(a.district).toLowerCase().includes(searchTerm) ||
      a.position.toLowerCase().includes(searchTerm)
    )
  }

  return filtered
})

// Методы
const onRowClick = (event: any) => {
  console.log('Клик по строке:', event.data)
  viewOuAdmin(event.data)
}

const viewOuAdmin = (admin: any) => {
  router.push(`/system/ou-admin-detail/${admin.id}`)
}

const editOuAdmin = (admin: any) => {
  console.log('Редактирование администратора ОУ:', admin)
  // TODO: Реализовать редактирование
}

const toggleStatus = (admin: any) => {
  console.log('Изменение статуса администратора ОУ:', admin)
  // TODO: Реализовать изменение статуса
}

const onDistrictChange = () => {
  // Фильтрация уже работает через computed property
}

const onStatusChange = () => {
  // Фильтрация уже работает через computed property
}

const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'Активен': return 'success'
    case 'Неактивен': return 'warning'
    case 'Заблокирован': return 'danger'
    default: return 'info'
  }
}

const getReportsStatus = (admin: any) => {
  if (admin.reportsCount === 0) return 'Нет справок'
  if (admin.reportsCount === 1) return '1 справка'
  if (admin.reportsCount < 5) return `${admin.reportsCount} справки`
  return `${admin.reportsCount} справок`
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

const buildOuAdmins = (users: BackendUser[]) => {
  ouAdmins.value = users
    .filter(user => !user.admin && user.educationalInstitution)
    .map(user => ({
      id: String(user.id),
      fullName: user.name || user.email,
      email: user.email,
      institution: user.educationalInstitution || 'Не указано',
      district: user.district || 'Не указан',
      position: user.position || 'Не указано',
      status: 'Активен',
      lastLogin: new Date(),
      reportsCount: 0,
      phone: '',
      createdAt: new Date()
    }))
}

onMounted(async () => {
  loading.value = true
  try {
    const users = await fetchUsers()
    buildOuAdmins(users)
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Администраторы ОУ',
      detail: 'Не удалось загрузить список администраторов ОУ',
      life: 3000
    })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.ou-admins-system {
  width: 100%;
}

.ou-admins-main-card {
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

.ou-admins-filters {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(22, 63, 94, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(22, 63, 94, 0.1);
  backdrop-filter: blur(10px);
}

.district-filter,
.status-filter,
.search-filter {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.filter-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.district-dropdown,
.status-dropdown {
  width: 100%;
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

.ou-admins-table {
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

.institution-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.institution-name {
  font-weight: 500;
  color: #2c3e50;
}

.institution-district {
  color: #6c757d;
  font-size: 0.8rem;
}

.position-name {
  color: #495057;
  font-weight: 500;
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

.reports-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.reports-count {
  font-weight: 600;
  color: #163F5E;
}

.reports-status {
  color: #6c757d;
  font-size: 0.8rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
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
  .ou-admins-filters {
    flex-direction: column;
    gap: 1rem;
  }
  
  .district-filter,
  .status-filter,
  .search-filter {
    flex: none;
  }
}
</style>
