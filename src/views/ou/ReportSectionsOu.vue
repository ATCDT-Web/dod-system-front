<template>
  <Layout>
    <div class="report-sections">
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
            <div class="info-grid">
              <div class="info-item">
                <label>Учреждение:</label>
                <span>{{ report.institution }}</span>
              </div>
              <div class="info-item">
                <label>Район:</label>
                <span>{{ report.district }}</span>
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
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Layout from '@/components/Layout.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

// Данные справки
const report = ref({
  id: '001',
  title: 'Справка о деятельности ДОД за 2024 год',
  institution: 'МБОУ СОШ №1',
  district: 'Центральный район',
  status: 'В работе',
  completedSections: 3,
  totalSections: 16
})

// Разделы справки
const sections = ref([
  {
    id: 'Общая информация',
    title: 'Общая информация',
    description: 'Основные сведения о справке и периоде отчетности',
    completed: true,
    inProgress: false,
    completionPercentage: 100
  },
  {
    id: 'Раздел 1',
    title: 'Сведения об организации',
    description: 'Информация о наименовании, адресе, контактах организации',
    completed: true,
    inProgress: false,
    completionPercentage: 100
  },
  {
    id: 'Раздел 2',
    title: 'Распределение обучающихся по направлениям дополнительных общеобразовательных программ, полу и формам обучения',
    description: 'Структура контингента обучающихся по различным критериям',
    completed: true,
    inProgress: false,
    completionPercentage: 100
  },
  {
    id: 'Раздел 3',
    title: 'Возрастной состав обучающихся',
    description: 'Распределение обучающихся по возрастным группам',
    completed: false,
    inProgress: true,
    completionPercentage: 60
  },
  {
    id: 'Раздел 4',
    title: 'Распределение численности обучающихся по источникам финансирования',
    description: 'Финансирование образовательных программ',
    completed: false,
    inProgress: false,
    completionPercentage: 0
  },
  {
    id: 'Раздел 5',
    title: 'Распределение работников по уровню образования и полу',
    description: 'Характеристика кадрового состава организации',
    completed: false,
    inProgress: false,
    completionPercentage: 0
  },
  {
    id: 'Раздел 6',
    title: 'Распределение работников по возрасту',
    description: 'Возрастная структура персонала',
    completed: false,
    inProgress: false,
    completionPercentage: 0
  },
  {
    id: 'Раздел 7',
    title: 'Характеристика здания (зданий) и помещений организации',
    description: 'Информация о материально-технической базе',
    completed: false,
    inProgress: false,
    completionPercentage: 0
  },
  {
    id: 'Раздел 8',
    title: 'Сведения о помещениях',
    description: 'Детальная информация о помещениях организации',
    completed: false,
    inProgress: false,
    completionPercentage: 0
  },
  {
    id: 'Раздел 9',
    title: 'Наличие и использование площадей, квадратный метр',
    description: 'Площади помещений и их использование',
    completed: false,
    inProgress: false,
    completionPercentage: 0
  },
  {
    id: 'Раздел 10',
    title: 'Количество персональных компьютеров и информационного оборудования',
    description: 'Техническое оснащение организации',
    completed: false,
    inProgress: false,
    completionPercentage: 0
  },
  {
    id: 'Раздел 11',
    title: 'Информационная открытость организации',
    description: 'Наличие и использование информационных ресурсов',
    completed: false,
    inProgress: false,
    completionPercentage: 0
  },
  {
    id: 'Раздел 12',
    title: 'Максимальная скорость доступа к сети Интернет',
    description: 'Технические характеристики интернет-соединения',
    completed: false,
    inProgress: false,
    completionPercentage: 0
  },
  {
    id: 'Раздел 13',
    title: 'Распределение объема средств организации по источникам их получения и видам деятельности',
    description: 'Финансовые потоки организации',
    completed: false,
    inProgress: false,
    completionPercentage: 0
  },
  {
    id: 'Раздел 14',
    title: 'Расходы организации',
    description: 'Структура расходов по различным статьям',
    completed: false,
    inProgress: false,
    completionPercentage: 0
  },
  {
    id: 'Раздел 15',
    title: 'Источники финансирования внутренних затрат на внедрение и использование цифровых технологий',
    description: 'Финансирование цифровизации образовательного процесса',
    completed: false,
    inProgress: false,
    completionPercentage: 0
  }
])

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

const openSection = (section: any) => {
  toast.add({
    severity: 'info',
    summary: 'Открытие раздела',
    detail: `Переход к заполнению "${section.title}"`,
    life: 2000
  })
  // Здесь будет логика открытия формы заполнения раздела
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

// Lifecycle
onMounted(() => {
  // Инициализация данных справки на основе ID из роута
  const reportId = route.params.id
  console.log('Загружаем справку:', reportId)
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
  background: rgba(22, 63, 94, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
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
