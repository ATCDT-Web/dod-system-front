<template>
  <Layout>
    <div class="section-detail">
      <div class="page-header">
        <div class="header-content">
          <Button
            icon="pi pi-arrow-left"
            label="Назад к разделам"
            class="p-button-text back-button"
            @click="goBack"
          />
          <div class="header-info">
            <h1 class="page-title">{{ pageTitle }}</h1>
            <p class="page-subtitle">{{ reportTitle }}</p>
            <p v-if="sectionName" class="page-section-name">{{ sectionName }}</p>
          </div>
          <Tag
            :value="completionLabel"
            :severity="completionSeverity"
            class="completion-tag"
          />
        </div>
      </div>

      <Card class="section-card">
        <template #content>
          <div v-if="loading" class="loading-state">Загрузка...</div>
          <div v-else class="fields-content">
            <div class="fields-toolbar">
              <div class="search-wrap">
                <i class="pi pi-search search-icon" />
                <InputText
                  v-model="searchQuery"
                  placeholder="Поиск по полям"
                  class="search-input"
                  @input="handleSearch"
                />
              </div>
              <div class="fields-count">Найдено: {{ filteredFields.length }}</div>
            </div>
            <div v-if="sectionNoteLines.length" class="section-note" role="note" aria-label="Информационная сноска">
              <div class="section-note-header">
                <i class="pi pi-info-circle section-note-icon" aria-hidden="true"></i>
                <span class="section-note-title">Информационная сноска</span>
              </div>
              <div class="section-note-body">
                <p v-for="(line, index) in sectionNoteLines" :key="`${sectionTitle}-${index}`" class="section-note-line">
                  {{ line }}
                </p>
              </div>
              <ul v-if="sectionNoteCodes.length" class="section-note-codes">
                <li v-for="code in sectionNoteCodes" :key="code">{{ code }}</li>
              </ul>
            </div>

            <TransitionGroup name="field-fade" tag="div" class="fields-grid">
            <div
              v-for="field in pagedFields"
              :key="field.key"
              class="field-row"
            >
              <div class="field-label">{{ field.label }}</div>
              <div class="field-value">{{ field.value }}</div>
            </div>
            </TransitionGroup>

            <Paginator
              v-if="filteredFields.length > pageSize"
              :rows="pageSize"
              :totalRecords="filteredFields.length"
              :first="currentPage * pageSize"
              @page="handlePage"
              class="fields-paginator"
            />
          </div>
        </template>
      </Card>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Layout from '@/components/Layout.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import InputText from 'primevue/inputtext'
import Paginator from 'primevue/paginator'
import { fetchContactInfo, fetchMainInfo, fetchUnit, type ContactInfo, type MainInfo } from '@/services/reports'
import { mapSectionFields } from '@/utils/dodFieldLabels'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const loading = ref(false)
const reportTitle = ref('')
const sectionTitle = ref('')
const completionPercentage = ref(0)
const fields = ref<Array<{ key: string; label: string; value: string }>>([])
const searchQuery = ref('')
const currentPage = ref(0)
const pageSize = 20

const completionLabel = computed(() => `${completionPercentage.value}%`)
const completionSeverity = computed(() => {
  if (completionPercentage.value === 100) return 'success'
  if (completionPercentage.value > 0) return 'warning'
  return 'info'
})

const sectionNameMap: Record<string, string> = {
  'Общая информация': 'Основные сведения об организации',
  'Контактная информация': 'Контакты и ответственные лица',
  'Раздел 1': 'Сведения об организации',
  'Раздел 2': 'Сведения о наличии лицензии',
  'Раздел 3': 'Распределение обучающихся по направлениям дополнительных общеобразовательных программ, полу и формам обучения, человек',
  'Раздел 4': 'Возрастной состав обучающихся, человек',
  'Раздел 5': 'Распределение численности обучающихся по источникам финансирования, человек',
  'Раздел 6': 'Сведения об обучающихся по дополнительным общеобразовательным программам, принимавших участие в походах, экскурсиях и экспедициях, человек',
  'Раздел 7': 'Распределение работников по уровню образования и полу, человек',
  'Раздел 8': 'Распределение работников по возрасту, человек',
  'Раздел 9': 'Характеристика здания (зданий) и помещений организации, единица',
  'Раздел 10': 'Сведения о помещениях',
  'Раздел 11': 'Наличие и использование площадей, квадратный метр',
  'Раздел 12': 'Количество персональных компьютеров и информационного оборудования, штука',
  'Раздел 13': 'Информационная открытость организации',
  'Раздел 14': 'Максимальная скорость доступа к сети Интернет',
  'Раздел 15': 'Распределение объема средств организации по источникам их получения и видам деятельности, тысяча рублей (с одним десятичным знаком)',
  'Раздел 16': 'Расходы организации, тысяча рублей (с одним десятичным знаком)',
  'Раздел 17': 'Затраты на внедрение и использование цифровых технологий в отчетном году, тысяча рублей',
  'Раздел 18': 'Источники финансирования внутренних затрат на внедрение и использование цифровых технологий, тысяча рублей (с одним десятичным знаком)'
}

const sectionName = computed(() => sectionNameMap[sectionTitle.value] || '')
const sectionNoteMap: Record<string, string[]> = {
  'Раздел 7': ['(по состоянию на конец отчетного года)'],
  'Раздел 8': ['(без внешних совместителей и работавших по договорам гражданско-правового характера)'],
  'Раздел 9': [
    '(по состоянию на конец отчетного года)',
    '(раздел заполняет только организация дополнительного образования детей, являющаяся самостоятельным юридическим лицом (с учетом обособленных подразделений (в том числе филиалов), у которой основной вид экономической деятельности по ОКВЭД2 ОК 029-2014 (КДЕС Ред. 2) «Образование дополнительное» (коды 85.4; 85.41; 85.41.1; 85.41.2; 85.41.9))'
  ],
  'Раздел 10': [
    '(по состоянию на конец отчетного года)',
    '(раздел заполняет только организация дополнительного образования детей, являющаяся самостоятельным юридическим лицом (с учетом обособленных подразделений (в том числе филиалов), у которой основной вид экономической деятельности по ОКВЭД2 ОК 029-2014 (КДЕС Ред. 2) «Образование дополнительное» (коды 85.4; 85.41; 85.41.1; 85.41.2; 85.41.9))'
  ],
  'Раздел 11': [
    '(с одним десятичным знаком, по состоянию на конец отчетного года)',
    '(раздел заполняет только организация дополнительного образования детей, являющаяся самостоятельным юридическим лицом (с учетом обособленных подразделений (в том числе филиалов), у которой основной вид экономической деятельности по ОКВЭД2 ОК 029-2014 (КДЕС Ред. 2) «Образование дополнительное» (коды 85.4; 85.41; 85.41.1; 85.41.2; 85.41.9))'
  ],
  'Раздел 12': [
    '(по состоянию на конец отчетного года)',
    '(раздел заполняет только организация дополнительного образования детей, являющаяся самостоятельным юридическим лицом (с учетом обособленных подразделений (в том числе филиалов), у которой основной вид экономической деятельности по ОКВЭД2 ОК 029-2014 (КДЕС Ред. 2) «Образование дополнительное» (коды 85.4; 85.41; 85.41.1; 85.41.2; 85.41.9))'
  ],
  'Раздел 13': [
    '(по состоянию на конец отчетного года)',
    '(раздел заполняет только организация дополнительного образования детей, являющаяся самостоятельным юридическим лицом (с учетом обособленных подразделений (в том числе филиалов), у которой основной вид экономической деятельности по ОКВЭД2 ОК 029-2014 (КДЕС Ред. 2) «Образование дополнительное» (коды 85.4; 85.41; 85.41.1; 85.41.2; 85.41.9))'
  ],
  'Раздел 14': [
    '(заполняют организации, имеющие доступ к сети Интернет), (по состоянию на конец отчетного года)',
    '(раздел заполняет только организация дополнительного образования детей, являющаяся самостоятельным юридическим лицом (с учетом обособленных подразделений (в том числе филиалов), у которой основной вид экономической деятельности по ОКВЭД2 ОК 029-2014 (КДЕС Ред. 2) «Образование дополнительное» (коды 85.4; 85.41; 85.41.1; 85.41.2; 85.41.9))'
  ],
  'Раздел 15': [
    '(раздел заполняет только организация дополнительного образования детей, являющаяся самостоятельным юридическим лицом (с учетом обособленных подразделений (в том числе филиалов), у которой основной вид экономической деятельности ОКВЭД2 ОК 029-2014 (КДЕС Ред. 2) «Образование дополнительное» (коды 85.4; 85.41; 85.41.1; 85.41.2; 85.41.9))'
  ],
  'Раздел 16': [
    '(раздел заполняет только организация дополнительного образования детей, являющаяся самостоятельным юридическим лицом (с учетом обособленных подразделений (в том числе филиалов), у которой основной вид экономической деятельности ОКВЭД2 ОК 029-2014 (КДЕС Ред. 2) «Образование дополнительное» (коды 85.4; 85.41; 85.41.1; 85.41.2; 85.41.9))'
  ],
  'Раздел 17': [
    '(раздел заполняет только организация дополнительного образования детей, являющаяся самостоятельным юридическим лицом (с учетом обособленных подразделений (в том числе филиалов), у которой основной вид экономической деятельности ОКВЭД2 ОК 029-2014 (КДЕС Ред. 2) «Образование дополнительное» (коды 85.4; 85.41; 85.41.1; 85.41.2; 85.41.9))'
  ],
  'Раздел 18': [
    '(раздел заполняет только организация дополнительного образования детей, являющаяся самостоятельным юридическим лицом (с учетом обособленных подразделений (в том числе филиалов), у которой основной вид экономической деятельности ОКВЭД2 ОК 029-2014 (КДЕС Ред. 2) «Образование дополнительное» (коды 85.4; 85.41; 85.41.1; 85.41.2; 85.41.9))'
  ]
}

const sectionNoteCodesMap: Record<string, string[]> = {
  'Раздел 14': [
    'Ниже 256 Кбит/сек – код 3',
    '256 −511 Кбит/сек – код 4',
    '512 Кбит/сек–999 Кбит/сек – код 18',
    '1.0−1.9 Мбит/сек – код 19',
    '2.0−9.9 Мбит/сек – код 20',
    '30.0−49.9 Мбит/сек – код 21',
    '50.0−99.9 Мбит/сек – код 22',
    '100 Мбит/сек и выше – код 10',
    'Этот вид доступа не используется – код 13'
  ]
}

const sectionNoteLines = computed(() => sectionNoteMap[sectionTitle.value] || [])
const sectionNoteCodes = computed(() => sectionNoteCodesMap[sectionTitle.value] || [])
const pageTitle = computed(() => {
  if (!sectionName.value) return sectionTitle.value
  return `${sectionTitle.value} — ${sectionName.value}`
})

const filteredFields = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return fields.value
  return fields.value.filter(field => {
    const label = field.label.toLowerCase()
    const value = field.value.toLowerCase()
    return label.includes(query) || value.includes(query)
  })
})

const pagedFields = computed(() => {
  const start = currentPage.value * pageSize
  return filteredFields.value.slice(start, start + pageSize)
})

const formatFieldValue = (value: any) => {
  if (value === null || value === undefined || value === '') return '—'
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}

const countFilledFields = (data: Record<string, any>) => {
  const entries = Object.entries(data).filter(([key]) => key !== 'id')
  if (entries.length === 0) return { filled: 0, total: 0 }
  const filled = entries.filter(([, value]) => {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim().length > 0
    if (Array.isArray(value)) return value.some(item => item !== null && item !== undefined && item !== '')
    return true
  }).length
  return { filled, total: entries.length }
}

const resolveSectionData = async (reportId: string, sectionId: string): Promise<Record<string, any>> => {
  if (sectionId === 'Общая информация') {
    return await fetchMainInfo(reportId)
  }
  if (sectionId === 'Контактная информация') {
    return await fetchContactInfo(reportId)
  }

  const match = sectionId.match(/\d+/)
  if (!match) {
    throw new Error('Не удалось определить раздел')
  }

  const unitNumber = Number(match[0])
  return await fetchUnit(unitNumber, reportId)
}

const loadSection = async () => {
  const reportId = route.params.id
  const rawSectionId = route.params.sectionId
  if (!reportId || !rawSectionId) {
    router.back()
    return
  }

  sectionTitle.value = String(rawSectionId)
  loading.value = true
  try {
    const reportInfo = await fetchMainInfo(String(reportId))
    reportTitle.value = reportInfo.organizationName

    const data = await resolveSectionData(String(reportId), sectionTitle.value)
    const { filled, total } = countFilledFields(data)
    completionPercentage.value = total === 0 ? 0 : Math.round((filled / total) * 100)

    fields.value = mapSectionFields(sectionTitle.value, data).map(field => ({
      key: field.key,
      label: field.label,
      value: formatFieldValue(field.value)
    }))
    currentPage.value = 0
    searchQuery.value = ''
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Раздел',
      detail: 'Не удалось загрузить данные раздела',
      life: 3000
    })
    router.back()
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  const reportId = route.params.id
  const base = route.path.startsWith('/system') ? '/system' : '/ou'
  router.push(`${base}/report-sections/${reportId}`)
}

const handlePage = (event: { first: number }) => {
  currentPage.value = Math.floor(event.first / pageSize)
}

const handleSearch = () => {
  currentPage.value = 0
}

onMounted(loadSection)
</script>

<style scoped>
.section-detail {
  width: 100%;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin: 1rem;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.back-button {
  color: #163F5E !important;
  border-color: rgba(22, 63, 94, 0.2) !important;
}

.header-info {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.page-section-name {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0.25rem 0 0;
}

.section-note {
  border: none;
  background: #ffffff;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  color: #1f2937;
  line-height: 1.45;
  box-shadow: none;
}

.section-note-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #163F5E;
}

.section-note-icon {
  font-size: 1.1rem;
}

.section-note-title {
  font-weight: 600;
  font-size: 0.9rem;
}

.section-note-body {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.section-note-line {
  margin: 0;
}

.section-note-codes {
  margin: 0.5rem 0 0 0;
  padding-left: 1.2rem;
  color: #1f2937;
}

.section-note-codes li + li {
  margin-top: 0.25rem;
}

.completion-tag {
  margin-left: auto;
}

.section-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-name {
  margin: 0;
}

.fields-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fields-toolbar {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.75rem;
}

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 18px;
  color: #9ca3af;
  pointer-events: none;
}

.search-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  padding: 0.65rem 1rem 0.65rem 2.4rem;
  border: 1px solid rgba(22, 63, 94, 0.2);
  transition: all 0.25s ease;
}

.search-input:focus {
  border-color: rgba(22, 63, 94, 0.45);
  box-shadow: 0 0 0 3px rgba(22, 63, 94, 0.12);
}

.fields-count {
  align-self: flex-end;
  color: #6b7280;
  font-size: 0.9rem;
}

.fields-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.field-row {
  padding: 1rem;
  border-radius: 12px;
  background: rgba(22, 63, 94, 0.05);
  border: 1px solid rgba(22, 63, 94, 0.1);
}

.field-label {
  font-weight: 600;
  color: #163F5E;
  margin-bottom: 0.5rem;
}

.field-value {
  color: #2c3e50;
}

.fields-paginator {
  align-self: center;
  margin: 0.5rem auto 0;
}

.field-fade-enter-active,
.field-fade-leave-active {
  transition: all 0.25s ease;
}

.field-fade-enter-from,
.field-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.loading-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}
</style>
