<template>
  <Layout>
    <div class="create-page">
      <Card class="create-card">
        <template #title>
          <div class="page-header modern-header">
            <div class="header-leading">
              <Button label="" icon="pi pi-arrow-left" class="p-button-text back-button" aria-label="Назад" @click="goBack" />
              <div class="title-block">
              <div class="title-eyebrow">Образовательные учреждения</div>
              <h1 class="page-title">Создать образовательное учреждение</h1>
              <p class="page-subtitle">Заполните базовые сведения, чтобы зарегистрировать новое ОУ и его администратора.</p>
              </div>
            </div>
          </div>
        </template>

        <template #content>
          <div class="form-grid modern-form">
            <div class="field">
              <label>Название учреждения</label>
              <InputText v-model="form.institutionName" placeholder="Например, Центр детского творчества" />
            </div>
            <div class="field">
              <label>Email администратора</label>
              <InputText v-model="form.email" type="email" placeholder="login@example.com" />
            </div>
            <div class="field">
              <label>ФИО администратора</label>
              <InputText v-model="form.adminName" placeholder="Иванов Иван Иванович" />
            </div>
            <div class="field">
              <label>Должность администратора</label>
              <InputText v-model="form.position" placeholder="Директор, заместитель..." />
            </div>
            <div class="field">
              <label>Район</label>
              <Dropdown v-model="form.district" :options="districtOptions" placeholder="Выберите район" option-label="label" option-value="value" />
            </div>
            <div class="field">
              <label>Телефон</label>
              <InputText v-model="form.phone" placeholder="+7 (000) 000-00-00" />
            </div>
            <div class="field full">
              <label>Адрес</label>
              <InputText v-model="form.address" placeholder="г. Санкт-Петербург, ул. Ленина, 1" />
            </div>
          </div>

          <div class="actions modern-actions">
            <Button label="Создать учреждение" icon="pi pi-check" class="p-button-primary" :loading="loading" @click="submit" />
            <Button label="Отмена" icon="pi pi-times" class="p-button-text" @click="goBack" />
          </div>
        </template>
      </Card>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Layout from '@/components/Layout.vue'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import { createInstitution } from '@/services/admin'

const router = useRouter()
const toast = useToast()
const loading = ref(false)

const districtLabels: Record<string, string> = {
  central: 'Центральный район',
  north: 'Северный район',
  south: 'Южный район',
  east: 'Восточный район',
  west: 'Западный район'
}

const districtOptions = computed(() => [
  { label: 'Не указан', value: '' },
  ...Object.entries(districtLabels).map(([value, label]) => ({ label, value }))
])

const form = reactive({
  institutionName: '',
  email: '',
  adminName: '',
  position: '',
  district: '',
  phone: '',
  address: ''
})

const goBack = () => {
  router.push('/system/institutions')
}

const submit = async () => {
  if (!form.institutionName || !form.email || !form.adminName) {
    toast.add({ severity: 'warn', summary: 'ОУ', detail: 'Заполните название, email и ФИО администратора', life: 3000 })
    return
  }
  loading.value = true
  try {
    await createInstitution({
      institutionName: form.institutionName,
      email: form.email,
      adminName: form.adminName,
      position: form.position,
      district: form.district,
      phone: form.phone,
      address: form.address
    })
    toast.add({ severity: 'success', summary: 'ОУ', detail: 'Учреждение добавлено', life: 3000 })
    goBack()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'ОУ', detail: (error as Error).message || 'Не удалось создать ОУ', life: 3000 })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.create-page {
  width: 100%;
}

.create-card {
  max-width: none;
  width: 100%;
  margin: 0;
  border-radius: 20px;
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

.back-button {
  color: #1f2937;
  width: 38px;
  height: 38px;
  border-radius: 999px;
}

.back-button:hover {
  background: rgba(22, 63, 94, 0.08);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.modern-form {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(22, 63, 94, 0.12);
  border-radius: 16px;
  padding: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field.full {
  grid-column: 1 / -1;
}

.field label {
  font-weight: 600;
  color: #2c3e50;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.modern-actions {
  align-items: center;
}
</style>
