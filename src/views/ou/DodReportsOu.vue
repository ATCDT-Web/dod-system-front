<template>
  <Layout>
    <div class="dod-reports-detailed">
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
                  :label="`Проверено (${checkedReports.length})`"
                  :class="['tab-button', { active: activeTab === 'checked' }]"
                  @click="activeTab = 'checked'"
                />
                <Button
                  :label="`Не проверено (${uncheckedReports.length})`"
                  :class="['tab-button', { active: activeTab === 'unchecked' }]"
                  @click="activeTab = 'unchecked'"
                />
                <Button
                  :label="`Отклоненные (${rejectedReports.length})`"
                  :class="['tab-button', { active: activeTab === 'rejected' }]"
                  @click="activeTab = 'rejected'"
                />
              </div>
            </div>
          </div>
          
          <!-- Список справок -->
          <div class="reports-list">
            <div
              v-for="report in currentReports"
              :key="report.id"
              class="report-card"
              @click="selectReport(report)"
            >
              <div class="report-header">
                <div class="report-title">
                  <h3>{{ report.title }}</h3>
                  <p class="report-subtitle">{{ report.institution }}</p>
                </div>
                <div class="report-status">
                  <Tag
                    :value="report.status"
                    :severity="getStatusSeverity(report.status)"
                    class="status-tag"
                  />
                </div>
              </div>
              
              <div class="report-info">
                <div class="info-item">
                  <i class="pi pi-user"></i>
                  <span>{{ report.submittedBy }}</span>
                </div>
                <div class="info-item">
                  <i class="pi pi-calendar"></i>
                  <span>{{ formatDate(report.submittedAt) }}</span>
                </div>
                <div class="info-item">
                  <i class="pi pi-building"></i>
                  <span>{{ report.district }}</span>
                </div>
              </div>
              
              <!-- Прогресс-бар для обычных справок -->
              <div v-if="!report.isRejected" class="report-progress">
                <div class="progress-info">
                  <span>Заполнено разделов: {{ report.completedSections }}/{{ report.totalSections }}</span>
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ width: `${(report.completedSections / report.totalSections) * 100}%` }"
                    ></div>
                  </div>
                </div>
              </div>
              
              <!-- Комментарий для отклоненных справок -->
              <div v-if="report.isRejected" class="report-rejection">
                <div class="rejection-reason">
                  <i class="pi pi-exclamation-triangle rejection-icon"></i>
                  <span class="rejection-text">{{ report.rejectionReason }}</span>
                </div>
              </div>
              
              <div class="report-actions">
                <Button
                  label="Разделы справки"
                  icon="pi pi-list"
                  class="sections-button"
                  @click.stop="openSections(report)"
                />
              </div>
            </div>
          </div>
        </template>
      </Card>
      
      <!-- Модальное окно с детальной информацией -->
      <Dialog
        v-model:visible="showReportDetails"
        :header="selectedReport?.title"
        :modal="true"
        :style="{ width: '90vw', maxWidth: '1200px' }"
        class="report-details-dialog"
      >
        <div v-if="selectedReport" class="report-details">
          <!-- Информация о подавшем -->
          <div class="submitter-info">
            <h3>Информация о подавшем</h3>
            <div class="info-grid">
              <div class="info-field">
                <label>ФИО:</label>
                <span>{{ selectedReport.submitterDetails.fullName }}</span>
              </div>
              <div class="info-field">
                <label>Должность:</label>
                <span>{{ selectedReport.submitterDetails.position }}</span>
              </div>
              <div class="info-field">
                <label>Район:</label>
                <span>{{ selectedReport.submitterDetails.district }}</span>
              </div>
              <div class="info-field">
                <label>Образовательное учреждение:</label>
                <span>{{ selectedReport.submitterDetails.institution }}</span>
              </div>
              <div class="info-field">
                <label>Контактный телефон:</label>
                <span>{{ selectedReport.submitterDetails.phone }}</span>
              </div>
              <div class="info-field">
                <label>Email:</label>
                <span>{{ selectedReport.submitterDetails.email }}</span>
              </div>
              <div class="info-field">
                <label>Дата подачи:</label>
                <span>{{ formatDate(selectedReport.submittedAt) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Разделы справки -->
          <div class="report-sections">
            <h3>Разделы справки</h3>
            <div class="sections-list">
              <div
                v-for="(section, index) in selectedReport.sections"
                :key="section.id"
                class="section-item"
                :class="{ completed: section.completed, active: activeSection === index }"
                @click="openSection(index)"
              >
                <div class="section-header">
                  <div class="section-title">
                    <i :class="section.completed ? 'pi pi-check-circle' : 'pi pi-circle'"></i>
                    <span>{{ section.title }}</span>
                  </div>
                  <div class="section-status">
                    <Tag
                      :value="section.completed ? 'Заполнено' : 'Не заполнено'"
                      :severity="section.completed ? 'success' : 'warning'"
                    />
                  </div>
                </div>
                <p class="section-description">{{ section.description }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <template #footer>
          <Button
            label="Закрыть"
            icon="pi pi-times"
            class="p-button-text"
            @click="showReportDetails = false"
          />
          <Button
            v-if="selectedReport && !selectedReport.isChecked"
            label="Отправить на проверку"
            icon="pi pi-send"
            class="submit-button"
            :disabled="!isAllSectionsCompleted"
            @click="submitReport"
          />
        </template>
      </Dialog>
      
      <!-- Модальное окно для заполнения раздела -->
      <Dialog
        v-model:visible="showSectionForm"
        :header="activeSectionData?.title"
        :modal="true"
        :style="{ width: '80vw', maxWidth: '1000px' }"
        class="section-form-dialog"
      >
        <div v-if="activeSectionData" class="section-form">
          <div class="form-description">
            <p>{{ activeSectionData.description }}</p>
          </div>
          
          <div class="form-content">
            <!-- Динамические поля формы -->
            <div
              v-for="field in activeSectionData.fields"
              :key="field.id"
              class="form-field"
            >
              <label class="field-label">{{ field.label }}</label>
              <div class="field-input">
                <InputText
                  v-if="field.type === 'text'"
                  v-model="field.value"
                  :placeholder="field.placeholder"
                  class="modern-input"
                />
                <Textarea
                  v-else-if="field.type === 'textarea'"
                  v-model="field.value"
                  :placeholder="field.placeholder"
                  :rows="4"
                  class="modern-textarea"
                />
                <Dropdown
                  v-else-if="field.type === 'select'"
                  v-model="field.value"
                  :options="field.options"
                  :placeholder="field.placeholder"
                  class="modern-dropdown"
                />
                <InputNumber
                  v-else-if="field.type === 'number'"
                  v-model="field.value"
                  :placeholder="field.placeholder"
                  class="modern-input"
                />
              </div>
            </div>
          </div>
        </div>
        
        <template #footer>
          <Button
            label="Отмена"
            icon="pi pi-times"
            class="p-button-text"
            @click="showSectionForm = false"
          />
          <Button
            label="Сохранить раздел"
            icon="pi pi-save"
            class="save-button"
            @click="saveSection"
          />
        </template>
      </Dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Layout from '@/components/Layout.vue'

const router = useRouter()
const toast = useToast()

// Состояние
const activeTab = ref<'checked' | 'unchecked' | 'rejected'>('unchecked')
const showReportDetails = ref(false)
const showSectionForm = ref(false)
const selectedReport = ref<any>(null)
const activeSection = ref<number>(-1)
const selectedYear = ref(null)
const filteredReports = ref([])

// Данные справок
const reports = ref([
  {
    id: '001',
    title: 'Справка о деятельности ДОД за 2024 год',
    institution: 'МБОУ СОШ №1',
    district: 'Центральный район',
    status: 'Не проверено',
    isChecked: false,
    submittedBy: 'Иванова А.С.',
    submittedAt: new Date('2024-01-15'),
    year: 2024,
    completedSections: 2,
    totalSections: 5,
    submitterDetails: {
      fullName: 'Иванова Анна Сергеевна',
      position: 'Заместитель директора по УВР',
      district: 'Центральный район',
      institution: 'МБОУ СОШ №1',
      phone: '+7 (812) 123-45-67',
      email: 'ivanova@school1.spb.ru'
    },
    sections: [
      {
        id: 's1',
        title: 'Общая информация об учреждении',
        description: 'Основные сведения об образовательном учреждении',
        completed: true,
        fields: [
          { id: 'f1', label: 'Название учреждения', type: 'text', value: 'МБОУ СОШ №1', placeholder: 'Введите название' },
          { id: 'f2', label: 'Адрес', type: 'text', value: 'ул. Невский проспект, 1', placeholder: 'Введите адрес' },
          { id: 'f3', label: 'Количество обучающихся', type: 'number', value: 500, placeholder: 'Введите количество' }
        ]
      },
      {
        id: 's2',
        title: 'Программы дополнительного образования',
        description: 'Информация о реализуемых программах ДОД',
        completed: true,
        fields: [
          { id: 'f4', label: 'Количество программ', type: 'number', value: 15, placeholder: 'Введите количество' },
          { id: 'f5', label: 'Направления программ', type: 'textarea', value: 'Художественное, спортивное, техническое', placeholder: 'Опишите направления' }
        ]
      },
      {
        id: 's3',
        title: 'Контингент обучающихся',
        description: 'Данные о количестве и составе обучающихся',
        completed: false,
        fields: [
          { id: 'f6', label: 'Общее количество обучающихся ДОД', type: 'number', value: null, placeholder: 'Введите количество' },
          { id: 'f7', label: 'По возрастным группам', type: 'textarea', value: '', placeholder: 'Опишите распределение по возрастам' }
        ]
      },
      {
        id: 's4',
        title: 'Кадровое обеспечение',
        description: 'Информация о педагогических кадрах',
        completed: false,
        fields: [
          { id: 'f8', label: 'Количество педагогов ДОД', type: 'number', value: null, placeholder: 'Введите количество' },
          { id: 'f9', label: 'Квалификация педагогов', type: 'select', value: null, options: ['Высшая', 'Первая', 'Соответствие'], placeholder: 'Выберите квалификацию' }
        ]
      },
      {
        id: 's5',
        title: 'Материально-техническое обеспечение',
        description: 'Состояние материальной базы для ДОД',
        completed: false,
        fields: [
          { id: 'f10', label: 'Количество кабинетов для ДОД', type: 'number', value: null, placeholder: 'Введите количество' },
          { id: 'f11', label: 'Оборудование', type: 'textarea', value: '', placeholder: 'Опишите имеющееся оборудование' }
        ]
      }
    ]
  },
  {
    id: '002',
    title: 'Справка о деятельности ДОД за 2023 год',
    institution: 'МБОУ СОШ №2',
    district: 'Северный район',
    status: 'Проверено',
    isChecked: true,
    submittedBy: 'Петров В.И.',
    submittedAt: new Date('2023-12-20'),
    year: 2023,
    completedSections: 4,
    totalSections: 4,
    submitterDetails: {
      fullName: 'Петров Владимир Иванович',
      position: 'Директор',
      district: 'Северный район',
      institution: 'МБОУ СОШ №2',
      phone: '+7 (812) 234-56-78',
      email: 'petrov@school2.spb.ru'
    },
    sections: []
  },
  {
    id: '003',
    title: 'Справка о деятельности ДОД за 2022 год',
    institution: 'МБОУ СОШ №3',
    district: 'Южный район',
    status: 'Проверено',
    isChecked: true,
    submittedBy: 'Сидорова М.В.',
    submittedAt: new Date('2022-12-15'),
    year: 2022,
    completedSections: 5,
    totalSections: 5,
    submitterDetails: {
      fullName: 'Сидорова Мария Владимировна',
      position: 'Заместитель директора по УВР',
      district: 'Южный район',
      institution: 'МБОУ СОШ №3',
      phone: '+7 (812) 345-67-89',
      email: 'sidorova@school3.spb.ru'
    },
    sections: []
  },
  {
    id: '004',
    title: 'Справка о деятельности ДОД за 2025 год',
    institution: 'МБОУ СОШ №4',
    district: 'Восточный район',
    status: 'Не проверено',
    isChecked: false,
    submittedBy: 'Козлов А.П.',
    submittedAt: new Date('2025-01-10'),
    year: 2025,
    completedSections: 1,
    totalSections: 5,
    submitterDetails: {
      fullName: 'Козлов Алексей Петрович',
      position: 'Директор',
      district: 'Восточный район',
      institution: 'МБОУ СОШ №4',
      phone: '+7 (812) 456-78-90',
      email: 'kozlov@school4.spb.ru'
    },
    sections: []
  },
  {
    id: '005',
    title: 'Справка о деятельности ДОД за 2023 год',
    institution: 'МБОУ СОШ №5',
    district: 'Западный район',
    status: 'Отклонено',
    isChecked: false,
    isRejected: true,
    submittedBy: 'Смирнов Д.А.',
    submittedAt: new Date('2023-11-20'),
    year: 2023,
    completedSections: 0,
    totalSections: 16,
    rejectionReason: 'Неполные данные по разделу 3. Требуется указать возрастной состав обучающихся с разбивкой по возрастным группам.',
    submittedByDetails: {
      fullName: 'Смирнов Дмитрий Александрович',
      position: 'Заместитель директора по УВР',
      district: 'Западный район',
      institution: 'МБОУ СОШ №5',
      phone: '+7 (812) 567-89-01',
      email: 'smirnov@school5.spb.ru'
    },
    sections: []
  },
  {
    id: '006',
    title: 'Справка о деятельности ДОД за 2024 год',
    institution: 'МБОУ СОШ №6',
    district: 'Южный район',
    status: 'Отклонено',
    isChecked: false,
    isRejected: true,
    submittedBy: 'Кузнецова Е.В.',
    submittedAt: new Date('2024-02-15'),
    year: 2024,
    completedSections: 0,
    totalSections: 16,
    rejectionReason: 'Отсутствуют данные по источникам финансирования (раздел 4). Необходимо предоставить полную информацию о бюджетном и внебюджетном финансировании.',
    submittedByDetails: {
      fullName: 'Кузнецова Елена Владимировна',
      position: 'Директор',
      district: 'Южный район',
      institution: 'МБОУ СОШ №6',
      phone: '+7 (812) 678-90-12',
      email: 'kuznetsova@school6.spb.ru'
    },
    sections: []
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

const checkedReports = computed(() => {
  let filtered = reports.value.filter(r => r.isChecked)
  if (selectedYear.value) {
    filtered = filtered.filter(r => r.year === selectedYear.value)
  }
  return filtered
})

const uncheckedReports = computed(() => {
  let filtered = reports.value.filter(r => !r.isChecked && !r.isRejected)
  if (selectedYear.value) {
    filtered = filtered.filter(r => r.year === selectedYear.value)
  }
  return filtered
})

const rejectedReports = computed(() => {
  let filtered = reports.value.filter(r => r.isRejected)
  if (selectedYear.value) {
    filtered = filtered.filter(r => r.year === selectedYear.value)
  }
  return filtered
})

const currentReports = computed(() => {
  switch (activeTab.value) {
    case 'checked':
      return checkedReports.value
    case 'unchecked':
      return uncheckedReports.value
    case 'rejected':
      return rejectedReports.value
    default:
      return uncheckedReports.value
  }
})
const activeSectionData = computed(() => selectedReport.value?.sections[activeSection.value])
const isAllSectionsCompleted = computed(() => {
  if (!selectedReport.value) return false
  return selectedReport.value.sections.every(section => section.completed)
})

// Methods
const filterByYear = () => {
  // Фильтрация происходит автоматически через computed свойства
  console.log('Фильтрация по году:', selectedYear.value)
}

const selectReport = (report: any) => {
  selectedReport.value = report
  showReportDetails.value = true
}

const openSections = (report: any) => {
  // Переходим к странице разделов справки
  router.push(`/ou/report-sections/${report.id}`)
}

const openSection = (index: number) => {
  activeSection.value = index
  showSectionForm.value = true
}

const saveSection = () => {
  if (activeSectionData.value) {
    activeSectionData.value.completed = true
    selectedReport.value.completedSections++
    
    toast.add({
      severity: 'success',
      summary: 'Раздел сохранен',
      detail: `Раздел "${activeSectionData.value.title}" успешно заполнен`,
      life: 3000
    })
    
    showSectionForm.value = false
  }
}

const submitReport = () => {
  if (selectedReport.value) {
    selectedReport.value.status = 'Проверено'
    selectedReport.value.isChecked = true
    
    toast.add({
      severity: 'success',
      summary: 'Справка отправлена',
      detail: 'Справка успешно отправлена на проверку',
      life: 3000
    })
    
    showReportDetails.value = false
  }
}

const getStatusSeverity = (status: string) => {
  const severityMap: Record<string, string> = {
    'Проверено': 'success',
    'Не проверено': 'warning',
    'В работе': 'info',
    'Отклонено': 'danger'
  }
  return severityMap[status] || 'info'
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('ru-RU')
}
</script>

<style scoped>
.dod-reports-detailed {
  width: 100%;
}

.reports-main-card {
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

.report-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}

.sections-button {
  background: #163F5E;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
}

.sections-button:hover {
  background: #1e4a6b;
}

.report-rejection {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
}

.rejection-reason {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.rejection-icon {
  color: #ef4444;
  font-size: 1.2rem;
  margin-top: 0.1rem;
  flex-shrink: 0;
}

.rejection-text {
  color: #dc2626;
  font-size: 0.9rem;
  line-height: 1.4;
  font-weight: 500;
}

.tab-buttons {
  display: flex;
  gap: 1rem;
}

.tab-button {
  background: rgba(22, 63, 94, 0.1);
  border: 1px solid rgba(22, 63, 94, 0.3);
  color: #163F5E;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.tab-button.active {
  background: #163F5E;
  color: white;
  border-color: #163F5E;
}

.tab-button:hover {
  background: rgba(22, 63, 94, 0.2);
  border-color: rgba(22, 63, 94, 0.5);
}

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.report-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.8);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.report-title h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
}

.report-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 0.9rem;
}

.report-info {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.9rem;
}

.info-item i {
  color: #163F5E;
}

.report-progress {
  margin-top: 1rem;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(22, 63, 94, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #163F5E;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.report-details {
  max-height: 70vh;
  overflow-y: auto;
}

.submitter-info {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(22, 63, 94, 0.05);
  border-radius: 12px;
}

.submitter-info h3 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.info-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-field label {
  font-weight: 600;
  color: #163F5E;
  font-size: 0.9rem;
}

.info-field span {
  color: #2c3e50;
  font-size: 1rem;
}

.report-sections h3 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
}

.sections-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-item {
  padding: 1rem;
  border: 1px solid rgba(22, 63, 94, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.section-item:hover {
  background: rgba(22, 63, 94, 0.05);
  border-color: rgba(22, 63, 94, 0.4);
}

.section-item.completed {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
}

.section-item.active {
  background: rgba(22, 63, 94, 0.1);
  border-color: #163F5E;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.section-title i {
  color: #163F5E;
}

.section-description {
  color: #6b7280;
  margin: 0;
  font-size: 0.9rem;
}

.section-form {
  max-height: 60vh;
  overflow-y: auto;
}

.form-description {
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(22, 63, 94, 0.05);
  border-radius: 8px;
}

.form-content {
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
.modern-textarea,
.modern-dropdown {
  width: 100%;
  border-radius: 8px;
  border: 1px solid rgba(22, 63, 94, 0.3);
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.modern-input:focus,
.modern-textarea:focus,
.modern-dropdown:focus {
  border-color: #163F5E;
  box-shadow: 0 0 0 2px rgba(22, 63, 94, 0.2);
}

.submit-button,
.save-button {
  background: #163F5E;
  border: none;
  color: white;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.submit-button:hover,
.save-button:hover {
  background: #1e4a6b;
  transform: translateY(-1px);
}

.status-tag {
  font-size: 0.8rem;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
}
</style>
