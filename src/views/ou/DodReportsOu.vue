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
                  <span>{{ formatDistrict(report.district) }}</span>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Layout from '@/components/Layout.vue'
import { fetchUsers, type BackendUser } from '@/services/users'
import { fetchMainInfoList, type MainInfo } from '@/services/reports'
import { getStoredUser } from '@/services/auth'

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
const reports = ref<Array<{
  id: string
  title: string
  institution: string
  district: string
  status: string
  isChecked: boolean
  isRejected?: boolean
  submittedBy: string
  submittedAt: Date
  year: number
  completedSections: number
  totalSections: number
  submitterDetails: {
    fullName: string
    position: string
    district: string
    institution: string
    phone: string
    email: string
  }
  sections: any[]
}>>([])

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

const resolveSubmitter = (organizationName: string, users: BackendUser[]) => {
  return users.find(user => user.educationalInstitution === organizationName)
}

const mapReport = (info: MainInfo, users: BackendUser[]) => {
  const dateSource = info.changeDate2 || info.changeDate1
  const submittedAt = dateSource ? new Date(dateSource) : new Date()
  const year = submittedAt.getFullYear()
  const submitter = resolveSubmitter(info.organizationName, users)
  const isChecked = Boolean(info.changeNumber2)
  return {
    id: String(info.id),
    title: `Справка о деятельности ДОД за ${year} год`,
    institution: info.organizationName,
    district: submitter?.district || 'Не указан',
    status: isChecked ? 'Проверено' : 'Не проверено',
    isChecked,
    submittedBy: submitter?.name || submitter?.email || 'Не указано',
    submittedAt,
    year,
    completedSections: 0,
    totalSections: 18,
    submitterDetails: {
      fullName: submitter?.name || 'Не указано',
      position: submitter?.position || 'Не указано',
      district: formatDistrict(submitter?.district || 'Не указан'),
      institution: submitter?.educationalInstitution || info.organizationName,
      phone: '',
      email: submitter?.email || 'Не указано'
    },
    sections: []
  }
}

onMounted(async () => {
  try {
    const [mainInfoPage, users] = await Promise.all([
      fetchMainInfoList(0, 100),
      fetchUsers()
    ])
    const currentUser = getStoredUser()
    const userInstitution = currentUser?.institutionName

    const mapped = mainInfoPage.content.map(info => mapReport(info, users))
    reports.value = userInstitution
      ? mapped.filter(report => report.institution === userInstitution)
      : mapped
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Справки ДОД',
      detail: 'Не удалось загрузить список справок',
      life: 3000
    })
  }
})
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
