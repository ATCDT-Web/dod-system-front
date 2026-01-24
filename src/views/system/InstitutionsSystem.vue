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
                  autocomplete="off"
                  name="search"
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
                <span class="district-name">{{ formatDistrict(data.district) }}</span>
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
const selectedType = ref(null)

// Данные ОУ
const institutions = ref<Array<{
  id: string
  name: string
  code: string
  type: string
  district: string
  director: string
  phone: string
  address: string
  studentsCount: number
  reportsCount: number
  lastReport: { year: number; status: string; submittedAt: Date } | null
  createdAt: Date
}>>([])

// Опции фильтров
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

const districtOptions = computed(() => {
  const districts = [...new Set(institutions.value.map(i => i.district))].sort()
  return [
    { label: 'Все районы', value: null },
    ...districts.map(district => ({
      label: formatDistrict(district),
      value: district
    }))
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
      formatDistrict(i.district).toLowerCase().includes(searchTerm) ||
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
  if (type.includes('Не указано')) return 'secondary'
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

const buildInstitutionsFromUsers = (users: BackendUser[]) => {
  const map = new Map<string, typeof institutions.value[number]>()
  let index = 1

  users
    .filter(user => !user.admin && user.educationalInstitution)
    .forEach(user => {
      const key = `${user.educationalInstitution}|${user.district || ''}`
      if (map.has(key)) return

      const code = `ОУ-${String(index).padStart(3, '0')}`
      map.set(key, {
        id: String(user.id),
        name: user.educationalInstitution || 'Не указано',
        code,
        type: 'Не указано',
        district: user.district || 'Не указан',
        director: user.name || user.email,
        phone: '',
        address: '',
        studentsCount: 0,
        reportsCount: 0,
        lastReport: null,
        createdAt: new Date()
      })
      index += 1
    })

  institutions.value = Array.from(map.values())
}

onMounted(async () => {
  loading.value = true
  try {
    const users = await fetchUsers()
    buildInstitutionsFromUsers(users)
  } catch {
    toast.add({
      severity: 'error',
      summary: 'ОУ',
      detail: 'Не удалось загрузить список образовательных учреждений',
      life: 3000
    })
  } finally {
    loading.value = false
  }
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
