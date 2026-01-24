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
  id: '001',
  title: 'Справка о деятельности ДОД за 2024 год',
  institution: 'МБОУ СОШ №1',
  district: 'Центральный район',
  status: 'Новая',
  submittedBy: 'Иванова А.С.',
  submittedAt: new Date('2024-01-15'),
  year: 2024,
  completedSections: 16,
  totalSections: 16,
  rejectionReason: ''
})

// Разделы справки
const sections = ref([
  {
    id: 'Общая информация',
    title: 'Общая информация',
    description: 'Основные сведения об организации',
    completed: true,
    pending: false,
    completionPercentage: 100
  },
  {
    id: 'Раздел 1',
    title: 'Сведения об организации',
    description: 'Информация о юридическом лице',
    completed: true,
    pending: false,
    completionPercentage: 100
  },
  {
    id: 'Раздел 2',
    title: 'Распределение обучающихся по направлениям',
    description: 'Данные о контингенте обучающихся',
    completed: true,
    pending: false,
    completionPercentage: 100
  },
  {
    id: 'Раздел 3',
    title: 'Возрастной состав обучающихся',
    description: 'Возрастные характеристики контингента',
    completed: true,
    pending: false,
    completionPercentage: 100
  },
  {
    id: 'Раздел 4',
    title: 'Распределение численности обучающихся',
    description: 'Источники финансирования',
    completed: true,
    pending: false,
    completionPercentage: 100
  },
  {
    id: 'Раздел 5',
    title: 'Распределение работников по уровню образования',
    description: 'Кадровый состав организации',
    completed: true,
    pending: false,
    completionPercentage: 100
  },
  {
    id: 'Раздел 6',
    title: 'Распределение работников по возрасту',
    description: 'Возрастные характеристики персонала',
    completed: true,
    pending: false,
    completionPercentage: 100
  },
  {
    id: 'Раздел 7',
    title: 'Характеристика здания и помещений',
    description: 'Информация о материально-технической базе',
    completed: true,
    pending: false,
    completionPercentage: 100
  },
  {
    id: 'Раздел 8',
    title: 'Сведения о помещениях',
    description: 'Детальная информация о помещениях',
    completed: true,
    pending: false,
    completionPercentage: 100
  },
  {
    id: 'Раздел 9',
    title: 'Наличие и использование площадей',
    description: 'Площади и их использование',
    completed: true,
    pending: false,
    completionPercentage: 100
  },
  {
    id: 'Раздел 10',
    title: 'Количество персональных компьютеров',
    description: 'Информационное оборудование',
    completed: true,
    pending: false,
    completionPercentage: 100
  },
  {
    id: 'Раздел 11',
    title: 'Информационная открытость организации',
    description: 'Публичная информация об организации',
    completed: true,
    pending: false,
    completionPercentage: 100
  },
  {
    id: 'Раздел 12',
    title: 'Максимальная скорость доступа к сети Интернет',
    description: 'Технические характеристики подключения',
    completed: true,
    pending: false,
    completionPercentage: 100
  },
  {
    id: 'Раздел 13',
    title: 'Распределение объема средств организации',
    description: 'Финансовые потоки организации',
    completed: true,
    pending: false,
    completionPercentage: 100
  },
  {
    id: 'Раздел 14',
    title: 'Расходы организации',
    description: 'Структура расходов',
    completed: true,
    pending: false,
    completionPercentage: 100
  },
  {
    id: 'Раздел 15',
    title: 'Источники финансирования внутренних затрат',
    description: 'Финансирование цифровых технологий',
    completed: true,
    pending: false,
    completionPercentage: 100
  }
])

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
  reportData.value.status = 'На проверке'
  toast.add({
    severity: 'success',
    summary: 'Справка взята на проверку',
    detail: `Справка "${reportData.value.title}" взята на проверку`,
    life: 3000
  })
  showTakeDialog.value = false
}

const confirmApprove = () => {
  reportData.value.status = 'Принято'
  toast.add({
    severity: 'success',
    summary: 'Справка принята',
    detail: `Справка "${reportData.value.title}" успешно принята`,
    life: 3000
  })
  showApproveDialog.value = false
}

const confirmReject = () => {
  if (rejectionReason.value.trim()) {
    reportData.value.status = 'Отклонено'
    reportData.value.rejectionReason = rejectionReason.value
    toast.add({
      severity: 'warn',
      summary: 'Справка отклонена',
      detail: `Справка "${reportData.value.title}" отклонена`,
      life: 3000
    })
    showRejectDialog.value = false
    rejectionReason.value = ''
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

// Lifecycle
onMounted(() => {
  const reportId = route.params.id
  console.log('Загружена страница разделов справки:', reportId)
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
