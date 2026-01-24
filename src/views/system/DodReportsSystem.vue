<template>
  <Layout>
    <div class="dod-reports-system">
      <Card class="reports-main-card">
        <template #title>
          <div class="page-header">
            <h1 class="page-title">Справки ДОД</h1>
            <p class="page-subtitle">Управление справками дополнительного образования</p>
          </div>
        </template>
        
        <template #content>
          <!-- Фильтры и табы -->
          <div class="reports-filters">
            <!-- Фильтр по году -->
            <div class="year-filter">
              <label class="filter-label">Год:</label>
              <Dropdown
                v-model="selectedYear"
                :options="availableYears"
                option-label="label"
                option-value="value"
                placeholder="Выберите год"
                class="year-dropdown"
                @change="filterByYear"
              />
            </div>
            
            <!-- Табы для фильтрации справок -->
            <div class="reports-tabs">
              <div class="tab-buttons">
                <Button
                  :label="`Новые (${newReports.length})`"
                  :class="['tab-button', { active: activeTab === 'new' }]"
                  @click="activeTab = 'new'"
                />
                <Button
                  :label="`Отклоненные (${rejectedReports.length})`"
                  :class="['tab-button', { active: activeTab === 'rejected' }]"
                  @click="activeTab = 'rejected'"
                />
                <Button
                  :label="`На проверке (${pendingReports.length})`"
                  :class="['tab-button', { active: activeTab === 'pending' }]"
                  @click="activeTab = 'pending'"
                />
              </div>
            </div>
          </div>
          
          <!-- Таблица справок -->
          <div class="reports-table">
            <DataTable
              :value="currentReports"
              :paginator="true"
              :rows="10"
              :rowsPerPageOptions="[5, 10, 20, 50]"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Показано {first} - {last} из {totalRecords} записей"
              :loading="loading"
              class="p-datatable-sm"
              :selectionMode="'single'"
              @row-select="onRowSelect"
              @row-click="onRowClick"
            >
              <Column field="id" header="ID" :sortable="true" style="width: 80px">
                <template #body="slotProps">
                  <span class="report-id">{{ slotProps.data.id }}</span>
                </template>
              </Column>
              
              <Column field="title" header="Название справки" :sortable="true">
                <template #body="slotProps">
                  <div class="report-title-cell">
                    <h4 class="report-title">{{ slotProps.data.title }}</h4>
                    <p class="report-institution">{{ slotProps.data.institution }}</p>
                  </div>
                </template>
              </Column>
              
              <Column field="district" header="Район" :sortable="true">
                <template #body="slotProps">
                  <span class="report-district">{{ slotProps.data.district }}</span>
                </template>
              </Column>
              
              <Column field="submittedBy" header="Подал" :sortable="true">
                <template #body="slotProps">
                  <div class="submitter-info">
                    <span class="submitter-name">{{ slotProps.data.submittedBy }}</span>
                    <span class="submit-date">{{ formatDate(slotProps.data.submittedAt) }}</span>
                  </div>
                </template>
              </Column>
              
              <Column field="status" header="Статус" :sortable="true">
                <template #body="slotProps">
                  <Tag
                    :value="slotProps.data.status"
                    :severity="getStatusSeverity(slotProps.data.status)"
                    class="status-tag"
                  />
                </template>
              </Column>
              
              <Column field="actions" header="Действия" style="width: 100px">
                <template #body="slotProps">
                  <div class="action-buttons">
                    <Button
                      label="Открыть"
                      icon="pi pi-external-link"
                      class="p-button-sm p-button-secondary"
                      @click="viewSections(slotProps.data)"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
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
import Tag from 'primevue/tag'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'

const router = useRouter()
const toast = useToast()

// Состояние
const activeTab = ref<'new' | 'rejected' | 'pending'>('new')
const selectedYear = ref(null)
const loading = ref(false)

// Данные справок
const reports = ref([
  {
    id: '001',
    title: 'Справка о деятельности ДОД за 2024 год',
    institution: 'МБОУ СОШ №1',
    district: 'Центральный район',
    status: 'Новая',
    submittedBy: 'Иванова А.С.',
    submittedAt: new Date('2024-01-15'),
    year: 2024,
    completedSections: 16,
    totalSections: 16
  },
  {
    id: '002',
    title: 'Справка о деятельности ДОД за 2023 год',
    institution: 'МБОУ СОШ №2',
    district: 'Северный район',
    status: 'На проверке',
    submittedBy: 'Петров В.И.',
    submittedAt: new Date('2023-12-20'),
    year: 2023,
    completedSections: 16,
    totalSections: 16
  },
  {
    id: '003',
    title: 'Справка о деятельности ДОД за 2022 год',
    institution: 'МБОУ СОШ №3',
    district: 'Южный район',
    status: 'Отклонено',
    submittedBy: 'Сидорова М.В.',
    submittedAt: new Date('2022-12-15'),
    year: 2022,
    completedSections: 16,
    totalSections: 16,
    rejectionReason: 'Неполные данные по разделу 3'
  },
  {
    id: '004',
    title: 'Справка о деятельности ДОД за 2025 год',
    institution: 'МБОУ СОШ №4',
    district: 'Восточный район',
    status: 'Новая',
    submittedBy: 'Козлов А.П.',
    submittedAt: new Date('2025-01-10'),
    year: 2025,
    completedSections: 16,
    totalSections: 16
  },
  {
    id: '005',
    title: 'Справка о деятельности ДОД за 2024 год',
    institution: 'МБОУ СОШ №5',
    district: 'Западный район',
    status: 'На проверке',
    submittedBy: 'Смирнов Д.А.',
    submittedAt: new Date('2024-02-15'),
    year: 2024,
    completedSections: 16,
    totalSections: 16
  },
  {
    id: '006',
    title: 'Справка о деятельности ДОД за 2024 год',
    institution: 'МБОУ СОШ №6',
    district: 'Красногвардейский район',
    status: 'Принято',
    submittedBy: 'Кузнецова Е.В.',
    submittedAt: new Date('2024-03-10'),
    year: 2024,
    completedSections: 16,
    totalSections: 16
  },
  {
    id: '007',
    title: 'Справка о деятельности ДОД за 2023 год',
    institution: 'МБОУ СОШ №7',
    district: 'Калининский район',
    status: 'Новая',
    submittedBy: 'Морозов С.А.',
    submittedAt: new Date('2023-11-25'),
    year: 2023,
    completedSections: 16,
    totalSections: 16
  },
  {
    id: '008',
    title: 'Справка о деятельности ДОД за 2024 год',
    institution: 'МБОУ СОШ №8',
    district: 'Кировский район',
    status: 'На проверке',
    submittedBy: 'Волкова Н.П.',
    submittedAt: new Date('2024-04-05'),
    year: 2024,
    completedSections: 16,
    totalSections: 16
  },
  {
    id: '009',
    title: 'Справка о деятельности ДОД за 2022 год',
    institution: 'МБОУ СОШ №9',
    district: 'Колпинский район',
    status: 'Отклонено',
    submittedBy: 'Федоров И.М.',
    submittedAt: new Date('2022-10-30'),
    year: 2022,
    completedSections: 16,
    totalSections: 16,
    rejectionReason: 'Отсутствуют документы по финансированию'
  },
  {
    id: '010',
    title: 'Справка о деятельности ДОД за 2025 год',
    institution: 'МБОУ СОШ №10',
    district: 'Красносельский район',
    status: 'Новая',
    submittedBy: 'Соколова Л.К.',
    submittedAt: new Date('2025-01-20'),
    year: 2025,
    completedSections: 16,
    totalSections: 16
  },
  {
    id: '011',
    title: 'Справка о деятельности ДОД за 2024 год',
    institution: 'МБОУ СОШ №11',
    district: 'Кронштадтский район',
    status: 'Принято',
    submittedBy: 'Лебедев А.В.',
    submittedAt: new Date('2024-05-12'),
    year: 2024,
    completedSections: 16,
    totalSections: 16
  },
  {
    id: '012',
    title: 'Справка о деятельности ДОД за 2023 год',
    institution: 'МБОУ СОШ №12',
    district: 'Курортный район',
    status: 'На проверке',
    submittedBy: 'Новикова Т.С.',
    submittedAt: new Date('2023-09-18'),
    year: 2023,
    completedSections: 16,
    totalSections: 16
  },
  {
    id: '013',
    title: 'Справка о деятельности ДОД за 2024 год',
    institution: 'МБОУ СОШ №13',
    district: 'Московский район',
    status: 'Новая',
    submittedBy: 'Попов Р.Д.',
    submittedAt: new Date('2024-06-08'),
    year: 2024,
    completedSections: 16,
    totalSections: 16
  },
  {
    id: '014',
    title: 'Справка о деятельности ДОД за 2022 год',
    institution: 'МБОУ СОШ №14',
    district: 'Невский район',
    status: 'Отклонено',
    submittedBy: 'Семенова О.И.',
    submittedAt: new Date('2022-08-22'),
    year: 2022,
    completedSections: 16,
    totalSections: 16,
    rejectionReason: 'Некорректные данные по контингенту'
  },
  {
    id: '015',
    title: 'Справка о деятельности ДОД за 2025 год',
    institution: 'МБОУ СОШ №15',
    district: 'Петроградский район',
    status: 'На проверке',
    submittedBy: 'Тихонов В.Г.',
    submittedAt: new Date('2025-02-03'),
    year: 2025,
    completedSections: 16,
    totalSections: 16
  },
  {
    id: '016',
    title: 'Справка о деятельности ДОД за 2024 год',
    institution: 'МБОУ СОШ №16',
    district: 'Петродворцовый район',
    status: 'Принято',
    submittedBy: 'Ушакова М.А.',
    submittedAt: new Date('2024-07-14'),
    year: 2024,
    completedSections: 16,
    totalSections: 16
  },
  {
    id: '017',
    title: 'Справка о деятельности ДОД за 2023 год',
    institution: 'МБОУ СОШ №17',
    district: 'Приморский район',
    status: 'Новая',
    submittedBy: 'Харитонов К.Е.',
    submittedAt: new Date('2023-07-30'),
    year: 2023,
    completedSections: 16,
    totalSections: 16
  },
  {
    id: '018',
    title: 'Справка о деятельности ДОД за 2024 год',
    institution: 'МБОУ СОШ №18',
    district: 'Пушкинский район',
    status: 'На проверке',
    submittedBy: 'Цветкова А.Н.',
    submittedAt: new Date('2024-08-25'),
    year: 2024,
    completedSections: 16,
    totalSections: 16
  },
  {
    id: '019',
    title: 'Справка о деятельности ДОД за 2022 год',
    institution: 'МБОУ СОШ №19',
    district: 'Фрунзенский район',
    status: 'Отклонено',
    submittedBy: 'Шаповалов Д.С.',
    submittedAt: new Date('2022-06-12'),
    year: 2022,
    completedSections: 16,
    totalSections: 16,
    rejectionReason: 'Несоответствие требованиям по отчетности'
  },
  {
    id: '020',
    title: 'Справка о деятельности ДОД за 2025 год',
    institution: 'МБОУ СОШ №20',
    district: 'Центральный район',
    status: 'Новая',
    submittedBy: 'Щербакова Е.В.',
    submittedAt: new Date('2025-02-15'),
    year: 2025,
    completedSections: 16,
    totalSections: 16
  }
])

// Computed properties
const availableYears = computed(() => {
  const years = [...new Set(reports.value.map(r => r.year))].sort((a, b) => b - a)
  return years.map(year => ({
    label: `${year} год`,
    value: year
  }))
})

const newReports = computed(() => {
  let filtered = reports.value.filter(r => r.status === 'Новая')
  if (selectedYear.value) {
    filtered = filtered.filter(r => r.year === selectedYear.value)
  }
  return filtered
})

const rejectedReports = computed(() => {
  let filtered = reports.value.filter(r => r.status === 'Отклонено')
  if (selectedYear.value) {
    filtered = filtered.filter(r => r.year === selectedYear.value)
  }
  return filtered
})

const pendingReports = computed(() => {
  let filtered = reports.value.filter(r => r.status === 'На проверке')
  if (selectedYear.value) {
    filtered = filtered.filter(r => r.year === selectedYear.value)
  }
  return filtered
})

const currentReports = computed(() => {
  switch (activeTab.value) {
    case 'new':
      return newReports.value
    case 'rejected':
      return rejectedReports.value
    case 'pending':
      return pendingReports.value
    default:
      return newReports.value
  }
})

// Methods
const filterByYear = () => {
  console.log('Фильтрация по году:', selectedYear.value)
}

const getStatusSeverity = (status: string) => {
  const severityMap: Record<string, string> = {
    'Новая': 'info',
    'На проверке': 'warning',
    'Отклонено': 'danger',
    'Принято': 'success'
  }
  return severityMap[status] || 'info'
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('ru-RU')
}

const onRowSelect = (event: any) => {
  console.log('Выбрана справка:', event.data)
}

const onRowClick = (event: any) => {
  console.log('Клик по строке:', event.data)
  viewSections(event.data)
}

const viewSections = (report: any) => {
  router.push(`/system/report-sections/${report.id}`)
}

// Lifecycle
onMounted(() => {
  console.log('Загружена страница справок ДОД для системного администратора')
})
</script>

<style scoped>
.dod-reports-system {
  width: 100%;
}

.reports-main-card {
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
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0;
}

.reports-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 2rem;
}

.year-filter {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-label {
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
}

.year-dropdown {
  min-width: 150px;
}

.reports-tabs {
  flex-shrink: 0;
}

.tab-buttons {
  display: flex;
  gap: 1rem;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  border: 2px solid rgba(22, 63, 94, 0.2);
  background: rgba(255, 255, 255, 0.6);
  color: #2c3e50;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.tab-button:hover {
  background: rgba(22, 63, 94, 0.1);
  border-color: rgba(22, 63, 94, 0.3);
}

.tab-button.active {
  background: #163F5E;
  color: white;
  border-color: #163F5E;
}

.reports-table {
  margin-top: 2rem;
}

.report-id {
  font-weight: 600;
  color: #163F5E;
  font-size: 0.9rem;
}

.report-title-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.report-title {
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  font-size: 0.95rem;
}

.report-institution {
  color: #6b7280;
  margin: 0;
  font-size: 0.85rem;
}

.report-district {
  color: #4a5568;
  font-weight: 500;
}

.submitter-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.submitter-name {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.submit-date {
  color: #6b7280;
  font-size: 0.8rem;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.action-buttons .p-button {
  font-size: 0.8rem;
  padding: 0.4rem 0.8rem;
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
</style>
