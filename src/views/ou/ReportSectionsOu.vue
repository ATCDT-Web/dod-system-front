<template>
  <Layout>
    <div class="report-sections">
      <Card class="sections-main-card">
        <template #title>
          <div class="page-header modern-header">
            <div class="header-leading">
              <Button
                icon="pi pi-arrow-left"
                class="p-button-text back-button"
                aria-label="Назад"
                @click="router.push('/ou/dod-reports')"
              />
              <div class="title-block">
              <div class="title-eyebrow">Справки ДОД</div>
              <h1 class="page-title">Разделы справки ДОД</h1>
              <p class="page-subtitle">{{ reportTitle }}</p>
              </div>
            </div>
            <div class="header-actions">
              <Button
                label="Импорт из Excel"
                icon="pi pi-upload"
                class="p-button-info"
                @click="showImportDialog = true"
              />
            </div>
          </div>
        </template>
        
        <template #content>
          <!-- Информация о справке -->
          <div class="report-info">
            <div class="info-grid">
              <div class="info-item">
                <label>Учреждение:</label>
                <span>{{ report.institution }}</span>
              </div>
              <div class="info-item">
                <label>Район:</label>
                <span>{{ formatDistrict(report.district) }}</span>
              </div>
              <div class="info-item">
                <label>Статус:</label>
                <Tag 
                  :value="report.status" 
                  :severity="getStatusSeverity(report.status)"
                />
              </div>
              <div class="info-item">
                <label>Заполнено разделов:</label>
                <span class="completion-info">
                  {{ completedSections }}/{{ totalSections }} 
                  ({{ completionPercentage }}%)
                </span>
              </div>
            </div>
          </div>

          <!-- Прогресс-бар -->
          <div class="progress-section">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: completionPercentage + '%' }"
              ></div>
            </div>
            <div class="progress-text">
              Общий прогресс заполнения: {{ completionPercentage }}%
            </div>
          </div>

          <!-- Кнопка отправки -->
          <div class="submit-section">
            <Button
              label="Отправить на проверку"
              icon="pi pi-send"
              class="submit-button"
              :disabled="!isAllSectionsCompleted"
              @click="submitReport"
            />
          </div>

          <!-- Список разделов -->
          <div class="sections-list">
            <div 
              v-for="(section, index) in sections" 
              :key="section.id"
              class="section-card"
              :class="{ 
                'completed': section.completed,
                'in-progress': section.inProgress,
                'not-started': !section.completed && !section.inProgress
              }"
              @click="openSection(section)"
            >
              <div class="section-header">
                <div class="section-number">
                  {{ section.id }}
                </div>
                <div class="section-status">
                  <i 
                    :class="getSectionIcon(section)" 
                    class="status-icon"
                  ></i>
                </div>
              </div>
              
              <div class="section-content">
                <h3 class="section-title">{{ section.title }}</h3>
                
                <div class="section-progress">
                  <div class="progress-info">
                    <span class="progress-label">Заполнено:</span>
                    <span class="progress-value">{{ section.completionPercentage }}%</span>
                  </div>
                  <div class="mini-progress-bar">
                    <div 
                      class="mini-progress-fill" 
                      :style="{ width: section.completionPercentage + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <Dialog
      v-model:visible="showImportDialog"
      header="Импорт справки из Excel"
      :modal="true"
      :style="{ width: '640px' }"
      class="import-dialog"
    >
      <div class="import-card">
        <div class="import-header">
          <h3 class="import-title">Выберите файлы</h3>
          <span class="import-subtitle">Можно загрузить один или несколько файлов с разделами</span>
        </div>
        <div class="import-controls">
          <input
            class="import-input"
            type="file"
            multiple
            accept=".xls,.xlsx"
            @change="handleImportFiles"
          />
          <label class="import-toggle">
            <input type="checkbox" v-model="isFullImport" />
            Полная справка (по шаблону)
          </label>
        </div>
        <div v-if="importResult.updatedSections.length" class="import-success">
          Обновлены разделы: {{ importResult.updatedSections.join(', ') }}
        </div>
        <div v-if="importResult.errors.length" class="import-errors">
          <div class="import-errors-title">Ошибки импорта:</div>
          <ul>
            <li v-for="(error, index) in importResult.errors" :key="index">
              {{ error.section }} · {{ error.message }}
            </li>
          </ul>
        </div>
      </div>

      <template #footer>
        <Button
          label="Отмена"
          icon="pi pi-times"
          class="p-button-text"
          @click="showImportDialog = false"
        />
        <Button
          label="Импортировать"
          icon="pi pi-upload"
          class="p-button-info"
          :loading="isImporting"
          :disabled="importFiles.length === 0 || isImporting"
          @click="runImport"
        />
      </template>
    </Dialog>

  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Layout from '@/components/Layout.vue'
import { fetchUsers, type BackendUser } from '@/services/users'
import {
  fetchContactInfo,
  fetchMainInfo,
  fetchUnit,
  importReportExcel,
  type ImportExcelResponse,
  type MainInfo
} from '@/services/reports'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const importFiles = ref<File[]>([])
const isImporting = ref(false)
const importResult = ref<ImportExcelResponse>({ updatedSections: [], errors: [] })
const isFullImport = ref(false)
const showImportDialog = ref(false)

// Данные справки
const report = ref({
  id: '',
  title: '',
  institution: '',
  district: '',
  status: 'Не проверено',
  completedSections: 0,
  totalSections: 0
})

// Разделы справки
const sections = ref<Array<{
  id: string
  title: string
  description: string
  completed: boolean
  inProgress: boolean
  completionPercentage: number
}>>([])

// Computed properties
const reportTitle = computed(() => report.value.title)
const completedSections = computed(() => sections.value.filter(s => s.completed).length)
const totalSections = computed(() => sections.value.length)
const completionPercentage = computed(() => 
  Math.round((completedSections.value / totalSections.value) * 100)
)
const isAllSectionsCompleted = computed(() => 
  sections.value.every(section => section.completed)
)

// Methods
const getStatusSeverity = (status: string) => {
  const severityMap: Record<string, string> = {
    'Проверено': 'success',
    'Не проверено': 'warning',
    'В работе': 'info'
  }
  return severityMap[status] || 'info'
}

const getSectionIcon = (section: any) => {
  if (section.completed) return 'pi pi-check-circle'
  if (section.inProgress) return 'pi pi-clock'
  return 'pi pi-circle'
}

const openSection = (section: { id: string }) => {
  const reportId = route.params.id
  if (!reportId) return
  router.push(`/ou/report-sections/${reportId}/section/${encodeURIComponent(section.id)}`)
}


const submitReport = () => {
  if (isAllSectionsCompleted.value) {
    report.value.status = 'Не проверено'
    toast.add({
      severity: 'success',
      summary: 'Справка отправлена',
      detail: 'Справка успешно отправлена на проверку',
      life: 3000
    })
  }
}

const handleImportFiles = (event: Event) => {
  const input = event.target as HTMLInputElement
  importFiles.value = input.files ? Array.from(input.files) : []
}

const runImport = async () => {
  const reportId = report.value.id
  if (!reportId || importFiles.value.length === 0) return
  isImporting.value = true
  importResult.value = { updatedSections: [], errors: [] }
  try {
    importResult.value = await importReportExcel(reportId, importFiles.value, isFullImport.value ? 'full' : 'partial')
    if (importResult.value.updatedSections.length) {
      toast.add({
        severity: 'success',
        summary: 'Импорт завершен',
        detail: `Обновлены разделы: ${importResult.value.updatedSections.join(', ')}`,
        life: 4000
      })
    }
    if (importResult.value.errors.length) {
      toast.add({
        severity: 'warn',
        summary: 'Импорт с ошибками',
        detail: `Ошибок: ${importResult.value.errors.length}`,
        life: 4000
      })
    }
    await loadReportSections(String(reportId))
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Импорт',
      detail: 'Не удалось импортировать Excel',
      life: 4000
    })
  } finally {
    isImporting.value = false
  }
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

const countFilledFields = (data: Record<string, any>) => {
  const entries = Object.entries(data).filter(([key]) => key !== 'id')
  if (entries.length === 0) return { filled: 0, total: 0 }
  const filled = entries.filter(([, value]) => {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim().length > 0
    return true
  }).length
  return { filled, total: entries.length }
}

const buildSection = (id: string, title: string, description: string, payload: Record<string, any>) => {
  const { filled, total } = countFilledFields(payload)
  const completionPercentage = total === 0 ? 0 : Math.round((filled / total) * 100)
  return {
    id,
    title,
    description,
    completed: completionPercentage === 100 && total > 0,
    inProgress: completionPercentage > 0 && completionPercentage < 100,
    completionPercentage
  }
}

const sectionDefinitions = [
  { id: 'Общая информация', title: 'Общая информация', description: 'Основные сведения о справке и периоде отчетности' },
  { id: 'Контактная информация', title: 'Контактная информация', description: 'Контакты и ответственные лица' },
  { id: 'Раздел 1', title: 'Сведения об организации', description: 'Информация о наименовании, адресе, контактах организации' },
  { id: 'Раздел 2', title: 'Распределение обучающихся по направлениям дополнительных общеобразовательных программ, полу и формам обучения', description: 'Структура контингента обучающихся по различным критериям' },
  { id: 'Раздел 3', title: 'Возрастной состав обучающихся', description: 'Распределение обучающихся по возрастным группам' },
  { id: 'Раздел 4', title: 'Распределение численности обучающихся по источникам финансирования', description: 'Финансирование образовательных программ' },
  { id: 'Раздел 5', title: 'Распределение работников по уровню образования и полу', description: 'Характеристика кадрового состава организации' },
  { id: 'Раздел 6', title: 'Распределение работников по возрасту', description: 'Возрастная структура персонала' },
  { id: 'Раздел 7', title: 'Характеристика здания (зданий) и помещений организации', description: 'Информация о материально-технической базе' },
  { id: 'Раздел 8', title: 'Сведения о помещениях', description: 'Детальная информация о помещениях организации' },
  { id: 'Раздел 9', title: 'Наличие и использование площадей, квадратный метр', description: 'Площади помещений и их использование' },
  { id: 'Раздел 10', title: 'Количество персональных компьютеров и информационного оборудования', description: 'Техническое оснащение организации' },
  { id: 'Раздел 11', title: 'Информационная открытость организации', description: 'Наличие и использование информационных ресурсов' },
  { id: 'Раздел 12', title: 'Максимальная скорость доступа к сети Интернет', description: 'Технические характеристики интернет-соединения' },
  { id: 'Раздел 13', title: 'Распределение объема средств организации по источникам их получения и видам деятельности', description: 'Финансовые потоки организации' },
  { id: 'Раздел 14', title: 'Расходы организации', description: 'Структура расходов по различным статьям' },
  { id: 'Раздел 15', title: 'Источники финансирования внутренних затрат на внедрение и использование цифровых технологий', description: 'Финансирование цифровизации образовательного процесса' },
  { id: 'Раздел 16', title: 'Финансирование программ', description: 'Дополнительные сведения о расходах' },
  { id: 'Раздел 17', title: 'Безопасность и охрана', description: 'Сведения о безопасности' },
  { id: 'Раздел 18', title: 'Затраты на цифровые технологии', description: 'Внутренние затраты на ИКТ' }
]

const resolveSubmitter = (organizationName: string, users: BackendUser[]) => {
  return users.find(user => user.educationalInstitution === organizationName)
}

const applyReportInfo = (info: MainInfo, submitter?: BackendUser) => {
  const dateSource = info.changeDate2 || info.changeDate1
  const submittedAt = dateSource ? new Date(dateSource) : new Date()
  const year = submittedAt.getFullYear()
  const resolvedTitle = info.reportTitle?.trim()
  report.value = {
    id: String(info.id),
    title: resolvedTitle && resolvedTitle.length > 0 ? resolvedTitle : `Справка о деятельности ДОД за ${year} год`,
    institution: info.organizationName,
    district: formatDistrict(submitter?.district || 'Не указан'),
    status: info.changeNumber2 ? 'Проверено' : 'Не проверено',
    completedSections: 0,
    totalSections: 0
  }
}

const loadReportSections = async (reportId: string) => {
  try {
    const [mainInfo, contactInfo, users] = await Promise.all([
      fetchMainInfo(reportId),
      fetchContactInfo(reportId),
      fetchUsers()
    ])

    const submitter = resolveSubmitter(mainInfo.organizationName, users)
    applyReportInfo(mainInfo, submitter)

    const unitNumbers = Array.from({ length: 18 }, (_, index) => index + 1)
    const unitResults = await Promise.all(unitNumbers.map(num => fetchUnit(num, reportId)))

    const sectionsList = [
      buildSection(sectionDefinitions[0].id, sectionDefinitions[0].title, sectionDefinitions[0].description, mainInfo as unknown as Record<string, any>),
      buildSection(sectionDefinitions[1].id, sectionDefinitions[1].title, sectionDefinitions[1].description, contactInfo as unknown as Record<string, any>),
      ...unitResults.map((payload, index) => {
        const def = sectionDefinitions[index + 2]
        return buildSection(def.id, def.title, def.description, payload)
      })
    ]

    sections.value = sectionsList
    report.value.completedSections = sectionsList.filter(section => section.completed).length
    report.value.totalSections = sectionsList.length
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Справка',
      detail: 'Не удалось загрузить разделы справки',
      life: 3000
    })
    router.push('/ou/dod-reports')
  }
}

// Lifecycle
onMounted(() => {
  const reportId = route.params.id
  if (!reportId) {
    router.push('/ou/dod-reports')
    return
  }
  loadReportSections(String(reportId))
})
</script>

<style scoped>
.report-sections {
  width: 100%;
}

.sections-main-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.6s ease-out;
}

.page-header {
  text-align: left;
  margin-bottom: 2rem;
}

.modern-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
}

.header-leading {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.title-block {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.title-eyebrow {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #6b7280;
}

.page-title {
  font-size: 2.1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.page-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.back-button {
  color: #1f2937;
  width: 38px;
  height: 38px;
  border-radius: 999px;
}

.back-button:hover {
  background: rgba(22, 63, 94, 0.08);
}

.report-info {
  background: rgba(22, 63, 94, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.import-card {
  margin-bottom: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(22, 63, 94, 0.12);
  background: rgba(255, 255, 255, 0.7);
  padding: 1.5rem;
}

.import-header {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

.import-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.import-subtitle {
  color: #6b7280;
  font-size: 0.9rem;
}

.import-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.import-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: #2c3e50;
}

.import-toggle input {
  width: 16px;
  height: 16px;
}

.import-input {
  flex: 1 1 280px;
  padding: 0.4rem 0.6rem;
  border: 1px solid rgba(22, 63, 94, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.8);
}

.import-success {
  margin-top: 0.75rem;
  color: #15803d;
  font-weight: 500;
}

.import-errors {
  margin-top: 0.75rem;
  color: #b91c1c;
  font-size: 0.9rem;
}

.import-errors-title {
  font-weight: 600;
  margin-bottom: 0.35rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.info-item span {
  color: #4a5568;
  font-size: 1rem;
}

.completion-info {
  font-weight: 600;
  color: #163F5E;
}

.progress-section {
  margin-bottom: 2rem;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: rgba(22, 63, 94, 0.1);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #163F5E, #2c5aa0);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.sections-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.section-card {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(22, 63, 94, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.section-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(22, 63, 94, 0.15);
  border-color: rgba(22, 63, 94, 0.3);
}

.section-card.completed {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.section-card.in-progress {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.05);
}

.section-card.not-started {
  border-color: #6b7280;
  background: rgba(107, 114, 128, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-number {
  background: #163F5E;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.8rem;
}

.section-status {
  display: flex;
  align-items: center;
}

.status-icon {
  font-size: 1.5rem;
}

.section-card.completed .status-icon {
  color: #10b981;
}

.section-card.in-progress .status-icon {
  color: #f59e0b;
}

.section-card.not-started .status-icon {
  color: #6b7280;
}

.section-content {
  flex: 1;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.section-description {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.section-progress {
  margin-top: 1rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-label {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.progress-value {
  font-size: 0.8rem;
  font-weight: 600;
  color: #163F5E;
}

.mini-progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(22, 63, 94, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.mini-progress-fill {
  height: 100%;
  background: #163F5E;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.submit-section {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(22, 63, 94, 0.05);
  border-radius: 12px;
  border: 2px solid rgba(22, 63, 94, 0.1);
}

.submit-button {
  background: #163F5E;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
