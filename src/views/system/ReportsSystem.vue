<template>
  <Layout>
    <div class="reports-page">
      <Card class="reports-card">
        <template #title>
          <div class="page-header modern-header">
            <div class="title-block">
              <div class="title-eyebrow">Отчеты</div>
              <h1 class="page-title">Отчеты и выгрузки</h1>
              <p class="page-subtitle">Формирование Excel-отчетов по справкам ДОД</p>
            </div>
          </div>
        </template>

        <template #content>
          <div class="export-panel">
            <div class="panel-header">
              <h3>Быстрая выгрузка</h3>
              <p>Сформируйте Excel по организации и разделу 3–8</p>
            </div>
            <div class="panel-grid">
              <div class="field">
                <label>Организация</label>
                <Dropdown
                  v-model="selectedOrg"
                  :options="filteredOrganizations"
                  option-label="label"
                  option-value="value"
                  filter
                  placeholder="Выберите организацию"
                  class="full"
                  @change="applySelectedOrg"
                  :disabled="isDistrictMode"
                />
                <small class="hint">
                  {{ isDistrictMode ? 'При выборе района выгрузка включает все ОУ этого района.' : 'Если нет в списке — введите вручную' }}
                </small>
                <InputText
                  v-model="organizationName"
                  placeholder="Введите название организации"
                  class="full"
                  :disabled="isDistrictMode"
                />
              </div>
              <div class="field">
                <label>Район</label>
                <Dropdown
                  v-model="selectedDistrict"
                  :options="districtOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Все районы"
                  class="full"
                />
              </div>
              <div class="field">
                <label>Раздел</label>
                <Dropdown v-model="selectedUnit" :options="unitOptions" option-label="label" option-value="value" placeholder="Выберите раздел" />
              </div>
              <div class="field actions">
                <Button label="Скачать Excel" icon="pi pi-download" class="p-button-primary" :loading="loading" @click="downloadSelected" />
              </div>
            </div>
          </div>

          <div class="report-sections">
            <div class="section-card full-width">
              <h3>Типовые отчеты</h3>
              <div class="report-grid">
                <div class="report-item" v-for="item in reportTemplates" :key="item.title">
                  <div class="report-info">
                    <div class="report-title">{{ item.title }}</div>
                    <div class="report-desc">{{ item.description }}</div>
                  </div>
                  <Button
                    v-if="item.unit"
                    label="Скачать"
                    icon="pi pi-download"
                    class="p-button-sm p-button-secondary"
                    :loading="loading && activeTemplate === item.title"
                    @click="downloadTemplate(item)"
                  />
                  <span v-else class="report-note">Скоро</span>
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
import { computed, onMounted, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import Layout from '@/components/Layout.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import { fetchUsers } from '@/services/users'
import { downloadUnitExcel, downloadUnitExcelByDistrict } from '@/services/reports'

const toast = useToast()
const loading = ref(false)
const organizationName = ref('')
const selectedOrg = ref<string | null>(null)
const selectedUnit = ref<number | null>(null)
const activeTemplate = ref('')
const selectedDistrict = ref<string | null>(null)

const organizations = ref<Array<{ label: string; value: string; district?: string }>>([])

const unitOptions = [
  { label: 'Раздел 3 — Контингент по направленностям', value: 3 },
  { label: 'Раздел 4 — Возрастная структура', value: 4 },
  { label: 'Раздел 5 — Источники финансирования', value: 5 },
  { label: 'Раздел 6 — Походы и экспедиции', value: 6 },
  { label: 'Раздел 7 — Кадровый профиль', value: 7 },
  { label: 'Раздел 8 — Инфраструктура', value: 8 }
]

const reportTemplates = [
  {
    title: 'Контингент по направленностям',
    description: 'Всего обучающихся + распределение по ключевым группам.',
    unit: 3
  },
  {
    title: 'Возрастная пирамида',
    description: 'Возрастные группы по направленностям (по разделу 4).',
    unit: 4
  },
  {
    title: 'Финансы: доходы/расходы',
    description: 'Источники финансирования (раздел 5).',
    unit: 5
  },
  {
    title: 'Доступность и инклюзия',
    description: 'ОВЗ и дети-инвалиды с учетом форм обучения.',
    unit: 3
  },
  {
    title: 'Кадровый профиль',
    description: 'Численность и структура персонала (раздел 7).',
    unit: 7
  },
  {
    title: 'Инфраструктурная готовность',
    description: 'Наличие помещений и оборудования (раздел 8).',
    unit: 8
  }
]

const districtLabels: Record<string, string> = {
  central: 'Центральный район',
  north: 'Северный район',
  south: 'Южный район',
  east: 'Восточный район',
  west: 'Западный район'
}

const districtOptions = computed(() => [
  { label: 'Все районы', value: null },
  ...Object.entries(districtLabels).map(([value, label]) => ({ label, value }))
])

const filteredOrganizations = computed(() => {
  if (!selectedDistrict.value) return organizations.value
  return organizations.value.filter(org => org.district === selectedDistrict.value)
})

const isDistrictMode = computed(() => Boolean(selectedDistrict.value))

const applySelectedOrg = () => {
  if (selectedOrg.value) {
    organizationName.value = selectedOrg.value
  }
}

const ensureOrg = () => {
  const name = organizationName.value.trim()
  if (!name) {
    toast.add({ severity: 'warn', summary: 'Отчеты', detail: 'Укажите организацию', life: 3000 })
    return null
  }
  return name
}

const downloadSelected = async () => {
  if (!selectedUnit.value) {
    toast.add({ severity: 'warn', summary: 'Отчеты', detail: 'Выберите раздел', life: 3000 })
    return
  }
  if (isDistrictMode.value && selectedDistrict.value) {
    await runDownloadByDistrict(selectedUnit.value, selectedDistrict.value, 'report')
    return
  }
  const org = ensureOrg()
  if (!org) return
  await runDownload(selectedUnit.value, org, 'report')
}

const downloadTemplate = async (item: { title: string; unit: number | null }) => {
  if (!item.unit) return
  if (isDistrictMode.value && selectedDistrict.value) {
    activeTemplate.value = item.title
    await runDownloadByDistrict(item.unit, selectedDistrict.value, item.title.replace(/\s+/g, '-').toLowerCase())
    activeTemplate.value = ''
    return
  }
  const org = ensureOrg()
  if (!org) return
  activeTemplate.value = item.title
  await runDownload(item.unit, org, item.title.replace(/\s+/g, '-').toLowerCase())
  activeTemplate.value = ''
}

const runDownload = async (unit: number, org: string, namePrefix: string) => {
  loading.value = true
  try {
    const blob = await downloadUnitExcel(unit, org)
    const filename = `${namePrefix}-unit${unit}.xlsx`
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
    toast.add({ severity: 'success', summary: 'Отчеты', detail: 'Файл сформирован', life: 3000 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Отчеты', detail: (error as Error).message || 'Не удалось скачать отчет', life: 3000 })
  } finally {
    loading.value = false
  }
}

const runDownloadByDistrict = async (unit: number, district: string, namePrefix: string) => {
  loading.value = true
  try {
    const blob = await downloadUnitExcelByDistrict(unit, district)
    const filename = `${namePrefix}-unit${unit}-${district}.xlsx`
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
    toast.add({ severity: 'success', summary: 'Отчеты', detail: 'Файл сформирован', life: 3000 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Отчеты', detail: (error as Error).message || 'Не удалось скачать отчет', life: 3000 })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const users = await fetchUsers()
    const map = new Map<string, { label: string; value: string; district?: string }>()
    users.forEach(user => {
      const name = user.educationalInstitution
      if (!name) return
      if (!map.has(name)) {
        map.set(name, { label: name, value: name, district: user.district || undefined })
      }
    })
    organizations.value = Array.from(map.values())
  } catch {
    toast.add({ severity: 'warn', summary: 'Отчеты', detail: 'Не удалось загрузить список организаций', life: 3000 })
  }
})
</script>

<style scoped>
.reports-page {
  width: 100%;
}

.reports-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.6s ease-out;
}

.page-header {
  text-align: left;
  margin-bottom: 1.5rem;
}

.modern-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
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

.export-panel {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(22, 63, 94, 0.12);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.panel-header h3 {
  margin: 0 0 0.25rem 0;
  color: #1f2937;
}

.panel-header p {
  margin: 0 0 1rem 0;
  color: #6b7280;
}

.panel-grid {
  display: grid;
  grid-template-columns: minmax(280px, 1.4fr) minmax(220px, 0.6fr) minmax(200px, 0.6fr) auto;
  gap: 1rem;
  align-items: end;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field.actions {
  align-items: flex-end;
}

.field label {
  font-weight: 600;
  color: #2c3e50;
}

.field .full {
  width: 100%;
}

.hint {
  color: #6b7280;
  font-size: 0.8rem;
}

.report-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-card {
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(22, 63, 94, 0.12);
  border-radius: 16px;
  padding: 1.5rem;
}

.section-card.full-width {
  width: 100%;
}

.report-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.report-item {
  flex: 1 1 calc(25% - 1rem);
  min-width: 240px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(22, 63, 94, 0.1);
  background: rgba(255, 255, 255, 0.8);
}

.report-item .p-button {
  align-self: flex-start;
}

.report-title {
  font-weight: 600;
  color: #1f2937;
}

.report-desc {
  color: #6b7280;
  font-size: 0.9rem;
}

.report-note {
  color: #9ca3af;
  font-size: 0.85rem;
}

.bullet-list {
  margin: 0;
  padding-left: 1.25rem;
  color: #4b5563;
  display: grid;
  gap: 0.6rem;
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
