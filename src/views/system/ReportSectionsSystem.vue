<template>
  <Layout>
    <div class="report-sections-system">
      <Card class="sections-main-card">
        <template #title>
          <div class="page-header">
            <h1 class="page-title">Разделы справки ДОД</h1>
            <p class="page-subtitle">{{ reportTitle }}</p>
          </div>
        </template>
        
        <template #content>
          <!-- Информация о справке -->
          <div class="report-info">
            <div class="info-card">
              <h3 class="info-title">Информация о справке</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">ID справки:</span>
                  <span class="info-value">{{ reportData.id }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Учреждение:</span>
                  <span class="info-value">{{ reportData.institution }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Район:</span>
                  <span class="info-value">{{ reportData.district }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Подал:</span>
                  <span class="info-value">{{ reportData.submittedBy }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Дата подачи:</span>
                  <span class="info-value">{{ formatDate(reportData.submittedAt) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Статус:</span>
                  <Tag
                    :value="reportData.status"
                    :severity="getStatusSeverity(reportData.status)"
                    class="status-tag"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <!-- Прогресс выполнения -->
          <div class="progress-section">
            <div class="progress-header">
              <h3 class="progress-title">Прогресс заполнения</h3>
              <div class="progress-stats">
                <span class="progress-text">
                  Заполнено: {{ completedSections }} из {{ totalSections }} разделов
                </span>
                <span class="progress-percentage">{{ completionPercentage }}%</span>
              </div>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: completionPercentage + '%' }"></div>
            </div>
          </div>
          
          <!-- Кнопки управления справкой -->
          <div class="report-actions">
            <div class="action-buttons">
              <Button
                v-if="reportData.status === 'Новая'"
                label="Взять на проверку"
                icon="pi pi-eye"
                class="p-button-info"
                @click="takeForReview"
              />
              <Button
                v-if="reportData.status === 'На проверке'"
                label="Принять справку"
                icon="pi pi-check"
                class="p-button-success"
                @click="approveReport"
              />
              <Button
                v-if="reportData.status !== 'Отклонено'"
                label="Отклонить справку"
                icon="pi pi-times"
                class="p-button-danger"
                @click="rejectReport"
              />
              <Button
                label="Вернуться к списку"
                icon="pi pi-arrow-left"
                class="p-button-secondary"
                @click="goBack"
              />
            </div>
          </div>

          <div v-if="reportData.status === 'Отклонено' && reportData.rejectionReason" class="rejection-block">
            <div class="rejection-header">
              <i class="pi pi-exclamation-triangle"></i>
              <span>Причина отклонения</span>
            </div>
            <div class="rejection-body">{{ reportData.rejectionReason }}</div>
          </div>
          
          <!-- Список разделов -->
          <div class="sections-list">
            <h3 class="sections-title">Разделы справки</h3>
            <div class="sections-grid">
              <div
                v-for="(section, index) in sections"
                :key="section.id"
                class="section-card"
                :class="{ 
                  'completed': section.completed,
                  'in-progress': section.pending,
                  'not-started': !section.completed && !section.pending
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
          </div>
        </template>
      </Card>
    </div>
    
    <!-- Модальное окно отклонения справки -->
    <Dialog
      v-model:visible="showRejectDialog"
      header="Отклонение справки"
      :modal="true"
      :style="{ width: '500px' }"
      class="reject-dialog"
    >
      <div class="reject-form">
        <div class="form-group">
          <label class="form-label">Причина отклонения:</label>
          <Textarea
            v-model="rejectionReason"
            placeholder="Укажите причину отклонения справки..."
            :rows="4"
            class="rejection-textarea"
          />
        </div>
      </div>
      
      <template #footer>
        <Button
          label="Отмена"
          icon="pi pi-times"
          class="p-button-text"
          @click="cancelReject"
        />
        <Button
          label="Отклонить справку"
          icon="pi pi-times"
          class="p-button-danger"
          @click="confirmReject"
        />
      </template>
    </Dialog>
    
    <!-- Модальное окно подтверждения принятия -->
    <Dialog
      v-model:visible="showApproveDialog"
      header="Принятие справки"
      :modal="true"
      :style="{ width: '400px' }"
      class="approve-dialog"
    >
      <div class="approve-content">
        <i class="pi pi-check-circle approve-icon"></i>
        <p class="approve-text">Вы уверены, что хотите принять эту справку?</p>
        <p class="approve-details">{{ reportData.title }}</p>
      </div>
      
      <template #footer>
        <Button
          label="Отмена"
          icon="pi pi-times"
          class="p-button-text"
          @click="cancelApprove"
        />
        <Button
          label="Принять справку"
          icon="pi pi-check"
          class="p-button-success"
          @click="confirmApprove"
        />
      </template>
    </Dialog>
    
    <!-- Модальное окно подтверждения взятия на проверку -->
    <Dialog
      v-model:visible="showTakeDialog"
      header="Взятие на проверку"
      :modal="true"
      :style="{ width: '400px' }"
      class="take-dialog"
    >
      <div class="take-content">
        <i class="pi pi-eye take-icon"></i>
        <p class="take-text">Вы уверены, что хотите взять эту справку на проверку?</p>
        <p class="take-details">{{ reportData.title }}</p>
      </div>
      
      <template #footer>
        <Button
          label="Отмена"
          icon="pi pi-times"
          class="p-button-text"
          @click="cancelTake"
        />
        <Button
          label="Взять на проверку"
          icon="pi pi-eye"
          class="p-button-info"
          @click="confirmTake"
        />
      </template>
    </Dialog>

  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Layout from '@/components/Layout.vue'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { fetchUsers, type BackendUser } from '@/services/users'
import { fetchContactInfo, fetchMainInfo, fetchUnit, updateReportStatus, type MainInfo } from '@/services/reports'

const router = useRouter()
const route = useRoute()
const toast = useToast()

// Состояние
const loading = ref(false)
const showRejectDialog = ref(false)
const showApproveDialog = ref(false)
const showTakeDialog = ref(false)
const rejectionReason = ref('')

// Данные справки
const reportData = ref({
  id: '',
  title: '',
  institution: '',
  district: '',
  status: 'Новая',
  submittedBy: '',
  submittedAt: new Date(),
  year: new Date().getFullYear(),
  completedSections: 0,
  totalSections: 0,
  rejectionReason: ''
})

// Разделы справки
const sections = ref<Array<{
  id: string
  title: string
  description: string
  completed: boolean
  pending: boolean
  completionPercentage: number
}>>([])

// Computed properties
const reportTitle = computed(() => reportData.value.title)

const completedSections = computed(() => {
  return sections.value.filter(s => s.completed).length
})

const totalSections = computed(() => sections.value.length)

const completionPercentage = computed(() => {
  return Math.round((completedSections.value / totalSections.value) * 100)
})

// Methods
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

const getSectionIcon = (section: any) => {
  if (section.completed) return 'pi pi-check-circle'
  if (section.pending) return 'pi pi-clock'
  return 'pi pi-circle'
}

const openSection = (section: { id: string }) => {
  const reportId = route.params.id
  if (!reportId) return
  router.push(`/system/report-sections/${reportId}/section/${encodeURIComponent(section.id)}`)
}


const goBack = () => {
  router.push('/system/dod-reports')
}

// Действия со справками
const takeForReview = () => {
  showTakeDialog.value = true
}

const approveReport = () => {
  showApproveDialog.value = true
}

const rejectReport = () => {
  showRejectDialog.value = true
}

// Подтверждения действий
const confirmTake = () => {
  updateStatus('На проверке')
    .then(() => {
      toast.add({
        severity: 'success',
        summary: 'Справка взята на проверку',
        detail: `Справка "${reportData.value.title}" взята на проверку`,
        life: 3000
      })
      showTakeDialog.value = false
    })
    .catch(() => {
      toast.add({
        severity: 'error',
        summary: 'Справка',
        detail: 'Не удалось обновить статус справки',
        life: 3000
      })
    })
}

const confirmApprove = () => {
  updateStatus('Принято')
    .then(() => {
      toast.add({
        severity: 'success',
        summary: 'Справка принята',
        detail: `Справка "${reportData.value.title}" успешно принята`,
        life: 3000
      })
      showApproveDialog.value = false
    })
    .catch(() => {
      toast.add({
        severity: 'error',
        summary: 'Справка',
        detail: 'Не удалось обновить статус справки',
        life: 3000
      })
    })
}

const confirmReject = () => {
  if (rejectionReason.value.trim()) {
    const reason = rejectionReason.value
    updateStatus('Отклонено', reason)
      .then(() => {
        toast.add({
          severity: 'warn',
          summary: 'Справка отклонена',
          detail: `Справка "${reportData.value.title}" отклонена`,
          life: 3000
        })
        showRejectDialog.value = false
        rejectionReason.value = ''
      })
      .catch(() => {
        toast.add({
          severity: 'error',
          summary: 'Справка',
          detail: 'Не удалось обновить статус справки',
          life: 3000
        })
      })
  } else {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Необходимо указать причину отклонения',
      life: 3000
    })
  }
}

// Отмена действий
const cancelTake = () => {
  showTakeDialog.value = false
}

const cancelApprove = () => {
  showApproveDialog.value = false
}

const cancelReject = () => {
  showRejectDialog.value = false
  rejectionReason.value = ''
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
    pending: completionPercentage > 0 && completionPercentage < 100,
    completionPercentage
  }
}

const sectionDefinitions = [
  { id: 'Общая информация', title: 'Общая информация', description: 'Основные сведения об организации' },
  { id: 'Контактная информация', title: 'Контактная информация', description: 'Контакты и ответственные лица' },
  { id: 'Раздел 1', title: 'Сведения об организации', description: 'Информация о юридическом лице' },
  { id: 'Раздел 2', title: 'Распределение обучающихся по направлениям', description: 'Данные о контингенте обучающихся' },
  { id: 'Раздел 3', title: 'Возрастной состав обучающихся', description: 'Возрастные характеристики контингента' },
  { id: 'Раздел 4', title: 'Распределение численности обучающихся', description: 'Источники финансирования' },
  { id: 'Раздел 5', title: 'Распределение работников по уровню образования', description: 'Кадровый состав организации' },
  { id: 'Раздел 6', title: 'Распределение работников по возрасту', description: 'Возрастные характеристики персонала' },
  { id: 'Раздел 7', title: 'Характеристика здания и помещений', description: 'Информация о материально-технической базе' },
  { id: 'Раздел 8', title: 'Сведения о помещениях', description: 'Детальная информация о помещениях' },
  { id: 'Раздел 9', title: 'Наличие и использование площадей', description: 'Площади и их использование' },
  { id: 'Раздел 10', title: 'Количество персональных компьютеров', description: 'Информационное оборудование' },
  { id: 'Раздел 11', title: 'Информационная открытость организации', description: 'Публичная информация об организации' },
  { id: 'Раздел 12', title: 'Максимальная скорость доступа к сети Интернет', description: 'Технические характеристики подключения' },
  { id: 'Раздел 13', title: 'Распределение объема средств организации', description: 'Финансовые потоки организации' },
  { id: 'Раздел 14', title: 'Расходы организации', description: 'Структура расходов' },
  { id: 'Раздел 15', title: 'Источники финансирования внутренних затрат', description: 'Финансирование цифровых технологий' },
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
  reportData.value = {
    id: String(info.id),
    title: `Справка о деятельности ДОД за ${year} год`,
    institution: info.organizationName,
    district: formatDistrict(submitter?.district || 'Не указан'),
    status: info.status || (info.changeNumber2 ? 'На проверке' : 'Новая'),
    submittedBy: submitter?.name || submitter?.email || 'Не указано',
    submittedAt,
    year,
    completedSections: 0,
    totalSections: 0,
    rejectionReason: info.rejectionReason || ''
  }
}

const updateStatus = async (status: string, reason?: string) => {
  await updateReportStatus(reportData.value.id, status, reason)
  reportData.value.status = status
  reportData.value.rejectionReason = reason || ''
}

const loadReportSections = async (reportId: string) => {
  loading.value = true
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
    reportData.value.completedSections = sectionsList.filter(section => section.completed).length
    reportData.value.totalSections = sectionsList.length
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Справка',
      detail: 'Не удалось загрузить разделы справки',
      life: 3000
    })
    router.push('/system/dod-reports')
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  const reportId = route.params.id
  if (!reportId) {
    router.push('/system/dod-reports')
    return
  }
  loadReportSections(String(reportId))
})
</script>

<style scoped>
.report-sections-system {
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

.report-info {
  margin-bottom: 2rem;
}

.info-card {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.info-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-weight: 500;
  color: #6b7280;
  font-size: 0.9rem;
}

.info-value {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
}

.progress-section {
  margin-bottom: 2rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.progress-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-text {
  color: #6b7280;
  font-size: 0.9rem;
}

.progress-percentage {
  font-weight: 600;
  color: #163F5E;
  font-size: 1.1rem;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: rgba(22, 63, 94, 0.1);
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #163F5E, #2c5aa0);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.report-actions {
  margin-bottom: 2rem;
}

.rejection-block {
  margin-bottom: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(220, 53, 69, 0.2);
  background: rgba(220, 53, 69, 0.06);
  padding: 1rem 1.25rem;
}

.rejection-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #b91c1c;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.rejection-body {
  color: #2c3e50;
  white-space: pre-wrap;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.sections-list {
  margin-top: 2rem;
}

.sections-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
}

.sections-list {
  margin-bottom: 2rem;
}

.sections-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-card {
  flex: 1 1 calc(33.333% - 1rem);
  min-width: 300px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(22, 63, 94, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
}

.section-number {
  background: #163F5E;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.8rem;
}

.section-content {
  flex: 1;
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

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
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

/* Модальные окна - стили перенесены в App.vue */

.reject-form {
  padding: 1rem 0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.rejection-textarea {
  width: 100%;
  resize: vertical;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(22, 63, 94, 0.2);
  border-radius: 12px;
  padding: 0.75rem;
  font-family: inherit;
  transition: all 0.3s ease;
}

.rejection-textarea:focus {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(22, 63, 94, 0.4);
  box-shadow: 0 0 0 3px rgba(22, 63, 94, 0.1);
  outline: none;
}

.approve-content,
.take-content {
  text-align: center;
  padding: 1rem 0;
}

.approve-icon,
.take-icon {
  font-size: 3rem;
  color: #10b981;
  margin-bottom: 1rem;
  background: rgba(16, 185, 129, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  padding: 1rem;
  border: 2px solid rgba(16, 185, 129, 0.2);
}

.take-icon {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.2);
}

.approve-text,
.take-text {
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.approve-details,
.take-details {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0;
}

/* Стили кнопок - перенесены в App.vue */

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
