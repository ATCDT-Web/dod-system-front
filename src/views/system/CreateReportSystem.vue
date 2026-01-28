<template>
  <Layout>
    <div class="create-page">
      <Card class="create-card">
        <template #title>
          <div class="page-header modern-header">
            <div class="header-leading">
              <Button label="" icon="pi pi-arrow-left" class="p-button-text back-button" aria-label="Назад" @click="goBack" />
              <div class="title-block">
              <div class="title-eyebrow">Справки ДОД</div>
              <h1 class="page-title">Создать справку</h1>
              <p class="page-subtitle">Выберите образовательное учреждение и укажите название справки. Разделы останутся пустыми.</p>
              </div>
            </div>
          </div>
        </template>

        <template #content>
          <div class="form-grid modern-form">
            <div class="field full">
              <label>Название справки</label>
              <InputText v-model="form.title" placeholder="Справка о деятельности ДОД 2026" />
            </div>
            <div class="field full">
              <label>Образовательное учреждение</label>
              <Dropdown
                v-model="form.userId"
                :options="ouOptions"
                option-label="label"
                option-value="value"
                placeholder="Выберите ОУ"
              />
            </div>
          </div>
          <div class="actions modern-actions">
            <Button label="Создать справку" icon="pi pi-file" class="p-button-primary" :loading="loading" @click="submit" />
            <Button label="Отмена" icon="pi pi-times" class="p-button-text" @click="goBack" />
          </div>
        </template>
      </Card>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Layout from '@/components/Layout.vue'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import { fetchUsers, type BackendUser } from '@/services/users'
import { createReport } from '@/services/admin'

const router = useRouter()
const toast = useToast()
const loading = ref(false)
const users = ref<BackendUser[]>([])

const form = reactive({
  title: '',
  userId: null as number | null
})

const ouOptions = computed(() =>
  users.value.map(user => ({
    label: `${user.educationalInstitution || 'Не указано'} — ${user.name || user.email}`,
    value: user.id
  }))
)

const goBack = () => {
  router.push('/system/dod-reports')
}

const submit = async () => {
  if (!form.title || !form.userId) {
    toast.add({ severity: 'warn', summary: 'Справка', detail: 'Укажите название и образовательное учреждение', life: 3000 })
    return
  }

  loading.value = true
  try {
    const id = await createReport({ title: form.title, userId: form.userId })
    toast.add({ severity: 'success', summary: 'Справка', detail: 'Справка создана', life: 3000 })
    router.push(`/system/report-sections/${id}`)
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Справка', detail: (error as Error).message || 'Не удалось создать справку', life: 3000 })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const fetched = await fetchUsers()
    users.value = fetched.filter(user => !user.admin && Boolean(user.educationalInstitution))
  } catch {
    toast.add({ severity: 'error', summary: 'Справка', detail: 'Не удалось загрузить список ОУ', life: 3000 })
  }
})
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
