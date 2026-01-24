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
                  <small class="institution-district">{{ data.district }}</small>
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
import Layout from '@/components/Layout.vue'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Tag from 'primevue/tag'

const router = useRouter()

// Состояние
const loading = ref(false)
const globalFilter = ref('')
const selectedDistrict = ref(null)
const selectedStatus = ref(null)

// Данные администраторов ОУ
const ouAdmins = ref([
  {
    id: '001',
    fullName: 'Иванова Анна Сергеевна',
    email: 'ivanova@school1.spb.ru',
    institution: 'МБОУ СОШ №1',
    district: 'Центральный район',
    position: 'Директор',
    status: 'Активен',
    lastLogin: new Date('2024-12-20T10:30:00'),
    reportsCount: 3,
    phone: '+7 (812) 123-45-67',
    createdAt: new Date('2020-09-01')
  },
  {
    id: '002',
    fullName: 'Петров Владимир Иванович',
    email: 'petrov@school2.spb.ru',
    institution: 'МБОУ СОШ №2',
    district: 'Северный район',
    position: 'Заместитель директора',
    status: 'Активен',
    lastLogin: new Date('2024-12-19T14:15:00'),
    reportsCount: 2,
    phone: '+7 (812) 234-56-78',
    createdAt: new Date('2021-03-15')
  },
  {
    id: '003',
    fullName: 'Сидорова Мария Владимировна',
    email: 'sidorova@school3.spb.ru',
    institution: 'МБОУ СОШ №3',
    district: 'Южный район',
    position: 'Директор',
    status: 'Заблокирован',
    lastLogin: new Date('2024-11-15T09:20:00'),
    reportsCount: 1,
    phone: '+7 (812) 345-67-89',
    createdAt: new Date('2019-08-20')
  },
  {
    id: '004',
    fullName: 'Козлов Алексей Петрович',
    email: 'kozlov@school4.spb.ru',
    institution: 'МБОУ СОШ №4',
    district: 'Восточный район',
    position: 'Директор',
    status: 'Активен',
    lastLogin: new Date('2024-12-20T16:45:00'),
    reportsCount: 0,
    phone: '+7 (812) 456-78-90',
    createdAt: new Date('2022-01-10')
  },
  {
    id: '005',
    fullName: 'Смирнов Дмитрий Александрович',
    email: 'smirnov@school5.spb.ru',
    institution: 'МБОУ СОШ №5',
    district: 'Западный район',
    position: 'Заместитель директора',
    status: 'Активен',
    lastLogin: new Date('2024-12-18T11:30:00'),
    reportsCount: 4,
    phone: '+7 (812) 567-89-01',
    createdAt: new Date('2020-11-05')
  },
  {
    id: '006',
    fullName: 'Кузнецова Елена Владимировна',
    email: 'kuznetsova@school6.spb.ru',
    institution: 'МБОУ СОШ №6',
    district: 'Красногвардейский район',
    position: 'Директор',
    status: 'Активен',
    lastLogin: new Date('2024-12-19T13:20:00'),
    reportsCount: 2,
    phone: '+7 (812) 678-90-12',
    createdAt: new Date('2021-06-15')
  },
  {
    id: '007',
    fullName: 'Морозов Сергей Алексеевич',
    email: 'morozov@school7.spb.ru',
    institution: 'МБОУ СОШ №7',
    district: 'Калининский район',
    position: 'Директор',
    status: 'Неактивен',
    lastLogin: new Date('2024-10-25T08:15:00'),
    reportsCount: 1,
    phone: '+7 (812) 789-01-23',
    createdAt: new Date('2019-12-01')
  },
  {
    id: '008',
    fullName: 'Волкова Наталья Петровна',
    email: 'volkova@school8.spb.ru',
    institution: 'МБОУ СОШ №8',
    district: 'Кировский район',
    position: 'Заместитель директора',
    status: 'Активен',
    lastLogin: new Date('2024-12-20T15:10:00'),
    reportsCount: 3,
    phone: '+7 (812) 890-12-34',
    createdAt: new Date('2021-09-20')
  },
  {
    id: '009',
    fullName: 'Федоров Игорь Михайлович',
    email: 'fedorov@school9.spb.ru',
    institution: 'МБОУ СОШ №9',
    district: 'Колпинский район',
    position: 'Директор',
    status: 'Заблокирован',
    lastLogin: new Date('2024-09-30T12:45:00'),
    reportsCount: 1,
    phone: '+7 (812) 901-23-45',
    createdAt: new Date('2020-04-12')
  },
  {
    id: '010',
    fullName: 'Соколова Людмила Константиновна',
    email: 'sokolova@school10.spb.ru',
    institution: 'МБОУ СОШ №10',
    district: 'Красносельский район',
    position: 'Директор',
    status: 'Активен',
    lastLogin: new Date('2024-12-19T17:30:00'),
    reportsCount: 0,
    phone: '+7 (812) 012-34-56',
    createdAt: new Date('2022-02-28')
  }
])

// Опции фильтров
const districtOptions = computed(() => {
  const districts = [...new Set(ouAdmins.value.map(a => a.district))].sort()
  return [
    { label: 'Все районы', value: null },
    ...districts.map(district => ({ label: district, value: district }))
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

onMounted(() => {
  // Инициализация данных
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
