import { defineStore } from 'pinia'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null
  }),
  actions: {
    setUser(user: User | null) {
      this.user = user
    },
    clearUser() {
      this.user = null
    }
  }
})
