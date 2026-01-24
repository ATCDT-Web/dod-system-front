<template>
  <Layout>
    <div class="dod-reports">
      <div class="page-header">
        <h1 class="page-title">Справки ДОД</h1>
        <p class="page-subtitle">Управление справками дополнительного образования</p>
      </div>
    
    <div class="reports-actions">
      <Button
        label="Создать справку"
        icon="pi pi-plus"
        class="create-button"
        @click="createReport"
      />
      <Button
        label="Экспорт"
        icon="pi pi-download"
        class="export-button"
        @click="exportReports"
      />
    </div>
    
    <div class="reports-filters">
      <div class="filter-group">
        <label class="filter-label">Статус:</label>
        <Dropdown
          v-model="selectedStatus"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Все статусы"
          class="filter-dropdown"
        />
      </div>
      <div class="filter-group">
        <label class="filter-label">Период:</label>
        <Dropdown
          v-model="selectedPeriod"
          :options="periodOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Все периоды"
          class="filter-dropdown"
        />
      </div>
    </div>
    
    <div class="reports-table">
      <DataTable
        :value="reports"
        :paginator="true"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20]"
        class="modern-datatable"
      >
        <Column field="id" header="ID" :sortable="true" style="width: 80px"></Column>
        <Column field="title" header="Название" :sortable="true"></Column>
        <Column field="institution" header="Учреждение" :sortable="true"></Column>
        <Column field="status" header="Статус" :sortable="true">
          <template #body="slotProps">
            <Tag
              :value="slotProps.data.status"
              :severity="getStatusSeverity(slotProps.data.status)"
              class="status-tag"
            />
          </template>
        </Column>
        <Column field="createdAt" header="Дата создания" :sortable="true">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.createdAt) }}
          </template>
        </Column>
        <Column header="Действия" style="width: 120px">
          <template #body="slotProps">
            <div class="action-buttons">
              <Button
                icon="pi pi-eye"
                class="p-button-text p-button-sm"
                @click="viewReport(slotProps.data)"
              />
              <Button
                icon="pi pi-pencil"
                class="p-button-text p-button-sm"
                @click="editReport(slotProps.data)"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-text p-button-sm p-button-danger"
                @click="deleteReport(slotProps.data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import Layout from '@/components/Layout.vue'

const toast = useToast()

// Фильтры
const selectedStatus = ref('')
const selectedPeriod = ref('')

const statusOptions = [
  { label: 'Все статусы', value: '' },
  { label: 'Черновик', value: 'draft' },
  { label: 'На рассмотрении', value: 'pending' },
  { label: 'Утверждено', value: 'approved' },
  { label: 'Отклонено', value: 'rejected' }
]

const periodOptions = [
  { label: 'Все периоды', value: '' },
  { label: 'Текущий месяц', value: 'current_month' },
  { label: 'Прошлый месяц', value: 'last_month' },
  { label: 'Текущий квартал', value: 'current_quarter' },
  { label: 'Текущий год', value: 'current_year' }
]

// Данные справок
const reports = ref([
  {
    id: '001',
    title: 'Справка о деятельности ДОД за I квартал',
    institution: 'МБОУ СОШ №1',
    status: 'Утверждено',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '002',
    title: 'Отчет по программам дополнительного образования',
    institution: 'МБОУ СОШ №2',
    status: 'На рассмотрении',
    createdAt: new Date('2024-01-20')
  },
  {
    id: '003',
    title: 'Справка о контингенте обучающихся ДОД',
    institution: 'МБОУ СОШ №3',
    status: 'Черновик',
    createdAt: new Date('2024-01-25')
  }
])

// Методы
const createReport = () => {
  toast.add({
    severity: 'info',
    summary: 'Создание справки',
    detail: 'Функция создания справки будет реализована',
    life: 3000
  })
}

const exportReports = () => {
  toast.add({
    severity: 'info',
    summary: 'Экспорт',
    detail: 'Функция экспорта будет реализована',
    life: 3000
  })
}

const getStatusSeverity = (status: string) => {
  const severityMap: Record<string, string> = {
    'Черновик': 'warning',
    'На рассмотрении': 'info',
    'Утверждено': 'success',
    'Отклонено': 'danger'
  }
  return severityMap[status] || 'info'
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('ru-RU')
}

const viewReport = (report: any) => {
  toast.add({
    severity: 'info',
    summary: 'Просмотр',
    detail: `Просмотр справки: ${report.title}`,
    life: 3000
  })
}

const editReport = (report: any) => {
  toast.add({
    severity: 'info',
    summary: 'Редактирование',
    detail: `Редактирование справки: ${report.title}`,
    life: 3000
  })
}

const deleteReport = (report: any) => {
  toast.add({
    severity: 'warn',
    summary: 'Удаление',
    detail: `Удаление справки: ${report.title}`,
    life: 3000
  })
}
</script>

<style scoped>
.dod-reports {
  max-width: 1200px;
  margin: 0 auto;
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

.reports-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.create-button {
  background: #163F5E;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.create-button:hover {
  background: #1e4a6b;
  transform: translateY(-1px);
}

.export-button {
  background: rgba(22, 63, 94, 0.1);
  border: 1px solid rgba(22, 63, 94, 0.3);
  color: #163F5E;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.export-button:hover {
  background: rgba(22, 63, 94, 0.2);
  border-color: rgba(22, 63, 94, 0.5);
}

.reports-filters {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.filter-dropdown {
  min-width: 200px;
}

.reports-table {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.status-tag {
  font-size: 0.8rem;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-buttons .p-button {
  padding: 0.5rem;
  min-width: auto;
}
</style>
