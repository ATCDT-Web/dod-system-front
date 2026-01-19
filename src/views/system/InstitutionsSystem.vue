<template>
  <Layout>
    <div class="institutions-system">
      <Card class="institutions-main-card">
        <template #title>
          <div class="page-header">
            <h1 class="page-title">Образовательные учреждения</h1>
            <p class="page-subtitle">Управление образовательными учреждениями системы</p>
          </div>
        </template>
        
        <template #content>
          <!-- Фильтры -->
          <div class="institutions-filters">
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
            
            <!-- Фильтр по типу ОУ -->
            <div class="type-filter">
              <label class="filter-label">Тип ОУ:</label>
              <Dropdown
                v-model="selectedType"
                :options="typeOptions"
                option-label="label"
                option-value="value"
                placeholder="Выберите тип"
                class="type-dropdown"
                @change="onTypeChange"
              />
            </div>
            
            <!-- Поиск -->
            <div class="search-filter">
              <label class="filter-label">Поиск:</label>
              <div class="search-container">
                <i class="pi pi-search search-icon"></i>
                <InputText 
                  v-model="globalFilter" 
                  placeholder="Поиск по названию, администратору..."
                  class="search-input"
                />
              </div>
            </div>
          </div>
          <!-- Таблица ОУ -->
          <DataTable 
            :value="filteredInstitutions" 
            :loading="loading"
            :paginator="true" 
            :rows="10"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Показано {first} - {last} из {totalRecords} записей"
            :sortField="'name'"
            :sortOrder="1"
            @row-click="onRowClick"
            class="institutions-table"
            rowHover
            stripedRows
          >

            <Column field="name" header="Название ОУ" :sortable="true">
              <template #body="{ data }">
                <div class="institution-name">
                  <strong>{{ data.name }}</strong>
                  <small class="institution-code">{{ data.code }}</small>
                </div>
              </template>
            </Column>

            <Column field="type" header="Тип ОУ" :sortable="true">
              <template #body="{ data }">
                <Tag :value="data.type" :severity="getTypeSeverity(data.type)" />
              </template>
            </Column>

            <Column field="district" header="Район" :sortable="true">
              <template #body="{ data }">
                <span class="district-name">{{ data.district }}</span>
              </template>
            </Column>

            <Column field="director" header="Администратор ОУ" :sortable="true">
              <template #body="{ data }">
                <div class="director-info">
                  <div class="director-name">{{ data.director }}</div>
                  <small class="director-phone">{{ data.phone }}</small>
                </div>
              </template>
            </Column>

            <Column field="studentsCount" header="Обучающихся" :sortable="true">
              <template #body="{ data }">
                <span class="students-count">{{ data.studentsCount.toLocaleString() }}</span>
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

            <Column field="lastReport" header="Последняя справка" :sortable="true">
              <template #body="{ data }">
                <div v-if="data.lastReport" class="last-report">
                  <div class="report-year">{{ data.lastReport.year }} год</div>
                  <Tag 
                    :value="data.lastReport.status" 
                    :severity="getReportStatusSeverity(data.lastReport.status)"
                    class="report-status-tag"
                  />
                </div>
                <span v-else class="no-reports">Нет справок</span>
              </template>
            </Column>

            <Column header="Действия" :exportable="false" style="min-width: 8rem">
              <template #body="{ data }">
                <div class="action-buttons">
                  <Button 
                    icon="pi pi-eye" 
                    class="p-button-sm p-button-text"
                    @click="viewInstitution(data)"
                    v-tooltip.top="'Просмотр'"
                  />
                  <Button 
                    icon="pi pi-pencil" 
                    class="p-button-sm p-button-text"
                    @click="editInstitution(data)"
                    v-tooltip.top="'Редактировать'"
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
const selectedType = ref(null)

// Данные ОУ
const institutions = ref([
  {
    id: '001',
    name: 'МБОУ СОШ №1',
    code: 'ОУ-001',
    type: 'Средняя общеобразовательная школа',
    district: 'Центральный район',
    director: 'Иванова Анна Сергеевна',
    phone: '+7 (812) 123-45-67',
    address: 'ул. Невский проспект, д. 1',
    studentsCount: 1250,
    reportsCount: 3,
    lastReport: {
      year: 2024,
      status: 'Принято',
      submittedAt: new Date('2024-03-15')
    },
    createdAt: new Date('2020-09-01')
  },
  {
    id: '002',
    name: 'МБОУ СОШ №2',
    code: 'ОУ-002',
    type: 'Средняя общеобразовательная школа',
    district: 'Северный район',
    director: 'Петров Владимир Иванович',
    phone: '+7 (812) 234-56-78',
    address: 'ул. Ленина, д. 15',
    studentsCount: 980,
    reportsCount: 2,
    lastReport: {
      year: 2023,
      status: 'На проверке',
      submittedAt: new Date('2023-12-20')
    },
    createdAt: new Date('2019-09-01')
  },
  {
    id: '003',
    name: 'МБОУ СОШ №3',
    code: 'ОУ-003',
    type: 'Средняя общеобразовательная школа',
    district: 'Южный район',
    director: 'Сидорова Мария Владимировна',
    phone: '+7 (812) 345-67-89',
    address: 'пр. Победы, д. 25',
    studentsCount: 1100,
    reportsCount: 1,
    lastReport: {
      year: 2022,
      status: 'Отклонено',
      submittedAt: new Date('2022-12-15')
    },
    createdAt: new Date('2021-09-01')
  },
  {
    id: '004',
    name: 'МБОУ СОШ №4',
    code: 'ОУ-004',
    type: 'Средняя общеобразовательная школа',
    district: 'Восточный район',
    director: 'Козлов Алексей Петрович',
    phone: '+7 (812) 456-78-90',
    address: 'ул. Мира, д. 8',
    studentsCount: 850,
    reportsCount: 0,
    lastReport: null,
    createdAt: new Date('2022-09-01')
  },
  {
    id: '005',
    name: 'МБОУ СОШ №5',
    code: 'ОУ-005',
    type: 'Средняя общеобразовательная школа',
    district: 'Западный район',
    director: 'Смирнов Дмитрий Александрович',
    phone: '+7 (812) 567-89-01',
    address: 'ул. Пушкина, д. 12',
    studentsCount: 1350,
    reportsCount: 4,
    lastReport: {
      year: 2024,
      status: 'Принято',
      submittedAt: new Date('2024-02-15')
    },
    createdAt: new Date('2018-09-01')
  },
  {
    id: '006',
    name: 'МБОУ СОШ №6',
    code: 'ОУ-006',
    type: 'Средняя общеобразовательная школа',
    district: 'Красногвардейский район',
    director: 'Кузнецова Елена Владимировна',
    phone: '+7 (812) 678-90-12',
    address: 'ул. Гагарина, д. 30',
    studentsCount: 920,
    reportsCount: 2,
    lastReport: {
      year: 2024,
      status: 'Принято',
      submittedAt: new Date('2024-03-10')
    },
    createdAt: new Date('2020-09-01')
  },
  {
    id: '007',
    name: 'МБОУ СОШ №7',
    code: 'ОУ-007',
    type: 'Средняя общеобразовательная школа',
    district: 'Калининский район',
    director: 'Морозов Сергей Алексеевич',
    phone: '+7 (812) 789-01-23',
    address: 'пр. Науки, д. 45',
    studentsCount: 1080,
    reportsCount: 1,
    lastReport: {
      year: 2023,
      status: 'Новая',
      submittedAt: new Date('2023-11-25')
    },
    createdAt: new Date('2019-09-01')
  },
  {
    id: '008',
    name: 'МБОУ СОШ №8',
    code: 'ОУ-008',
    type: 'Средняя общеобразовательная школа',
    district: 'Кировский район',
    director: 'Волкова Наталья Петровна',
    phone: '+7 (812) 890-12-34',
    address: 'ул. Комсомольская, д. 18',
    studentsCount: 1150,
    reportsCount: 3,
    lastReport: {
      year: 2024,
      status: 'На проверке',
      submittedAt: new Date('2024-04-05')
    },
    createdAt: new Date('2021-09-01')
  },
  {
    id: '009',
    name: 'МБОУ СОШ №9',
    code: 'ОУ-009',
    type: 'Средняя общеобразовательная школа',
    district: 'Колпинский район',
    director: 'Федоров Игорь Михайлович',
    phone: '+7 (812) 901-23-45',
    address: 'ул. Советская, д. 22',
    studentsCount: 750,
    reportsCount: 1,
    lastReport: {
      year: 2022,
      status: 'Отклонено',
      submittedAt: new Date('2022-10-30')
    },
    createdAt: new Date('2020-09-01')
  },
  {
    id: '010',
    name: 'МБОУ СОШ №10',
    code: 'ОУ-010',
    type: 'Средняя общеобразовательная школа',
    district: 'Красносельский район',
    director: 'Соколова Людмила Константиновна',
    phone: '+7 (812) 012-34-56',
    address: 'ул. Красных Партизан, д. 5',
    studentsCount: 1050,
    reportsCount: 0,
    lastReport: null,
    createdAt: new Date('2022-09-01')
  }
])

// Опции фильтров
const districtOptions = computed(() => {
  const districts = [...new Set(institutions.value.map(i => i.district))].sort()
  return [
    { label: 'Все районы', value: null },
    ...districts.map(district => ({ label: district, value: district }))
  ]
})

const typeOptions = computed(() => {
  const types = [...new Set(institutions.value.map(i => i.type))].sort()
  return [
    { label: 'Все типы', value: null },
    ...types.map(type => ({ label: type, value: type }))
  ]
})

const filteredInstitutions = computed(() => {
  let filtered = institutions.value

  // Фильтр по району
  if (selectedDistrict.value) {
    filtered = filtered.filter(i => i.district === selectedDistrict.value)
  }

  // Фильтр по типу
  if (selectedType.value) {
    filtered = filtered.filter(i => i.type === selectedType.value)
  }

  // Поиск
  if (globalFilter.value) {
    const searchTerm = globalFilter.value.toLowerCase()
    filtered = filtered.filter(i => 
      i.name.toLowerCase().includes(searchTerm) ||
      i.director.toLowerCase().includes(searchTerm) ||
      i.district.toLowerCase().includes(searchTerm) ||
      i.type.toLowerCase().includes(searchTerm)
    )
  }

  return filtered
})

// Методы
const onRowClick = (event: any) => {
  console.log('Клик по строке:', event.data)
  viewInstitution(event.data)
}

const viewInstitution = (institution: any) => {
  router.push(`/system/institution-detail/${institution.id}`)
}

const editInstitution = (institution: any) => {
  console.log('Редактирование ОУ:', institution)
  // TODO: Реализовать редактирование
}

const addInstitution = () => {
  console.log('Добавление нового ОУ')
  // TODO: Реализовать добавление
}

const onDistrictChange = () => {
  // TODO: Реализовать фильтрацию по району
}

const onTypeChange = () => {
  // TODO: Реализовать фильтрацию по типу
}

const getTypeSeverity = (type: string) => {
  if (type.includes('Средняя')) return 'info'
  if (type.includes('Гимназия')) return 'success'
  if (type.includes('Лицей')) return 'warning'
  return 'info'
}

const getReportsStatus = (institution: any) => {
  if (institution.reportsCount === 0) return 'Нет справок'
  if (institution.lastReport?.status === 'Принято') return 'Активен'
  if (institution.lastReport?.status === 'На проверке') return 'На проверке'
  if (institution.lastReport?.status === 'Отклонено') return 'Требует внимания'
  return 'Неизвестно'
}

const getReportStatusSeverity = (status: string) => {
  switch (status) {
    case 'Принято': return 'success'
    case 'На проверке': return 'warning'
    case 'Отклонено': return 'danger'
    case 'Новая': return 'info'
    default: return 'info'
  }
}

onMounted(() => {
  // Инициализация данных
})
</script>

<style scoped>
.institutions-system {
  width: 100%;
}

.institutions-main-card {
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

.institutions-filters {
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
.type-filter,
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
.type-dropdown {
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

.institutions-table {
  background: transparent;
}

.institution-name {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.institution-code {
  color: #6c757d;
  font-size: 0.8rem;
}

.district-name {
  color: #495057;
  font-weight: 500;
}

.director-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.director-name {
  font-weight: 500;
  color: #2c3e50;
}

.director-phone {
  color: #6c757d;
  font-size: 0.8rem;
}

.students-count {
  font-weight: 600;
  color: #163F5E;
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

.last-report {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.report-year {
  font-weight: 500;
  color: #2c3e50;
}

.report-status-tag {
  align-self: flex-start;
}

.no-reports {
  color: #6c757d;
  font-style: italic;
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
  .institutions-filters {
    flex-direction: column;
    gap: 1rem;
  }
  
  .district-filter,
  .type-filter,
  .search-filter {
    flex: none;
  }
}
</style>
