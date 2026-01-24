<template>
  <div class="layout">
    <Sidebar :user="user" />
    
    <main class="layout-main">
      <div class="layout-content">
        <slot />
      </div>
    </main>
    
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import Footer from '@/components/Footer.vue'
import type { User } from '@/types'
import { getStoredUser } from '@/services/auth'

// Props
interface Props {
  user?: User
}

const props = defineProps<Props>()

// Reactive data
const user = ref<User>({} as User)
const router = useRouter()

// Lifecycle
onMounted(() => {
  if (props.user) {
    user.value = props.user
  } else {
    const storedUser = getStoredUser()
    if (storedUser) {
      user.value = storedUser
    } else {
      router.push('/login')
    }
  }
})
</script>

<style scoped>
.layout {
  height: 100vh;
  width: 100vw;
  display: flex;
  position: relative;
  overflow: hidden;
  background-attachment: fixed;
  background-image: url('/src/assets/bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.layout::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.layout-main {
  position: relative;
  z-index: 2;
  padding: 2rem;
  height: 100vh;
  width: 100%;
  overflow-y: auto;
  margin-left: 280px;
  transition: margin-left 0.3s ease;
  padding-bottom: 80px; /* Отступ для футера */
}

.layout-content {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
