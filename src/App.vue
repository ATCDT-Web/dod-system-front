<template>
  <div id="app">
    <router-view />
    <Toast />
  </div>
</template>

<script setup lang="ts">
import Toast from 'primevue/toast'

// TypeScript setup для App.vue
</script>

<style>
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  overflow-y: hidden;
  width: 100%;
  height: 100%;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* Анимации появления плашек при загрузке */
.login-card,
.register-card,
.dashboard-card {
  animation: fadeIn 0.4s ease-out;
}

.login-card-inner,
.register-card-inner {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Глобальные стили скроллбара */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #163F5E;
  border-radius: 10px;
  transition: background 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: #1e4a6b;
}

/* Для Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: #163F5E rgba(0, 0, 0, 0.1);
}

/* Русификация индикатора силы пароля */
.p-password-meter {
  background: #e5e7eb;
  height: 4px;
  border-radius: 2px;
  margin-top: 0.5rem;
}

.p-password-meter-fill {
  background: #ef4444;
  height: 100%;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.p-password-meter-fill.medium {
  background: #f59e0b;
}

.p-password-meter-fill.strong {
  background: #10b981;
}

.p-password-info {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
  display: block;
  font-weight: 500;
}

.p-password-info.weak {
  color: #ef4444;
}

.p-password-info.medium {
  color: #f59e0b;
}

.p-password-info.strong {
  color: #10b981;
}

/* Убеждаемся, что текст виден */
.p-password .p-password-info {
  opacity: 1 !important;
  visibility: visible !important;
  display: block !important;
}

/* Дополнительные стили для индикатора пароля */
.p-password .p-password-panel {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 0.5rem;
  margin-top: 0.25rem;
}

.p-password .p-password-info {
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.p-password .p-password-info.weak {
  color: #ef4444;
}

.p-password .p-password-info.medium {
  color: #f59e0b;
}

.p-password .p-password-info.strong {
  color: #10b981;
}

/* Убираем встроенный индикатор пароля, используем кастомный */
.p-password .p-password-panel {
  display: none;
}

/* Глассморфизм для модальных окон PrimeVue */
.p-dialog-mask {
  background: rgba(0, 0, 0, 0.3) !important;
  backdrop-filter: blur(10px) !important;
  animation: fadeInOverlay 0.3s ease-out !important;
}

@keyframes fadeInOverlay {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(10px);
  }
}

.p-dialog {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 20px !important;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1) !important;
  animation: fadeInDialog 0.4s ease-out !important;
}

@keyframes fadeInDialog {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
    backdrop-filter: blur(20px);
  }
}

.p-dialog-header {
  background: rgba(22, 63, 94, 0.1) !important;
  border-bottom: 1px solid rgba(22, 63, 94, 0.2) !important;
  border-radius: 20px 20px 0 0 !important;
  padding: 1.5rem !important;
  backdrop-filter: blur(10px) !important;
}

.p-dialog-content {
  padding: 2rem !important;
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(10px) !important;
}

.p-dialog-footer {
  background: rgba(22, 63, 94, 0.05) !important;
  border-top: 1px solid rgba(22, 63, 94, 0.1) !important;
  border-radius: 0 0 20px 20px !important;
  padding: 1.5rem !important;
  backdrop-filter: blur(10px) !important;
}

/* Глассморфизм кнопки */
.p-button {
  background: rgba(22, 63, 94, 0.8) !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(22, 63, 94, 0.3) !important;
  border-radius: 8px !important;
  color: white !important;
  font-weight: 600 !important;
  transition: all 0.3s ease !important;
  animation: fadeInButton 0.5s ease-out !important;
}

@keyframes fadeInButton {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.p-button:hover {
  background: rgba(22, 63, 94, 0.9) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 15px rgba(22, 63, 94, 0.3) !important;
}

.p-button.p-button-success {
  background: rgba(16, 185, 129, 0.8) !important;
  border-color: rgba(16, 185, 129, 0.3) !important;
}

.p-button.p-button-success:hover {
  background: rgba(16, 185, 129, 0.9) !important;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3) !important;
}

.p-button.p-button-danger {
  background: rgba(239, 68, 68, 0.8) !important;
  border-color: rgba(239, 68, 68, 0.3) !important;
}

.p-button.p-button-danger:hover {
  background: rgba(239, 68, 68, 0.9) !important;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3) !important;
}

.p-button.p-button-info {
  background: rgba(59, 130, 246, 0.8) !important;
  border-color: rgba(59, 130, 246, 0.3) !important;
}

.p-button.p-button-info:hover {
  background: rgba(59, 130, 246, 0.9) !important;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3) !important;
}

.p-button.p-button-secondary {
  background: rgba(107, 114, 128, 0.8) !important;
  border-color: rgba(107, 114, 128, 0.3) !important;
}

.p-button.p-button-secondary:hover {
  background: rgba(107, 114, 128, 0.9) !important;
  box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3) !important;
}

.p-button.p-button-text {
  background: transparent !important;
  border: 1px solid rgba(22, 63, 94, 0.2) !important;
  color: #163F5E !important;
}

.p-button.p-button-text:hover {
  background: rgba(22, 63, 94, 0.1) !important;
  border-color: rgba(22, 63, 94, 0.3) !important;
}

/* Стили для таблицы справок */
.p-datatable {
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(10px) !important;
  border-radius: 12px !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

.p-datatable-header {
  background: rgba(22, 63, 94, 0.1) !important;
  border-bottom: 1px solid rgba(22, 63, 94, 0.2) !important;
  border-radius: 12px 12px 0 0 !important;
  padding: 1rem 1.5rem !important;
  backdrop-filter: blur(10px) !important;
}

.p-datatable-thead > tr > th {
  background: rgba(22, 63, 94, 0.05) !important;
  color: #2c3e50 !important;
  font-weight: 600 !important;
  border-bottom: 1px solid rgba(22, 63, 94, 0.1) !important;
  padding: 1rem !important;
  backdrop-filter: blur(5px) !important;
}

.p-datatable-tbody > tr {
  transition: all 0.3s ease !important;
}

.p-datatable-tbody > tr:hover {
  background: rgba(22, 63, 94, 0.05) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 2px 8px rgba(22, 63, 94, 0.1) !important;
}

.p-datatable-tbody > tr > td {
  padding: 1rem !important;
  border-bottom: 1px solid rgba(22, 63, 94, 0.05) !important;
  color: #4a5568 !important;
}

.p-datatable-footer {
  background: rgba(22, 63, 94, 0.05) !important;
  border-top: 1px solid rgba(22, 63, 94, 0.1) !important;
  border-radius: 0 0 12px 12px !important;
  padding: 1rem 1.5rem !important;
  backdrop-filter: blur(10px) !important;
}

/* Стили для пагинации */
.p-paginator {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
}

.p-paginator-page {
  background: rgba(22, 63, 94, 0.1) !important;
  border: 1px solid rgba(22, 63, 94, 0.2) !important;
  color: #163F5E !important;
  border-radius: 6px !important;
  margin: 0 2px !important;
  transition: all 0.3s ease !important;
}

.p-paginator-page:hover {
  background: rgba(22, 63, 94, 0.2) !important;
  transform: translateY(-1px) !important;
}

.p-paginator-page.p-highlight {
  background: #163F5E !important;
  color: white !important;
  border-color: #163F5E !important;
}

.p-paginator-first,
.p-paginator-prev,
.p-paginator-next,
.p-paginator-last {
  background: rgba(22, 63, 94, 0.1) !important;
  border: 1px solid rgba(22, 63, 94, 0.2) !important;
  color: #163F5E !important;
  border-radius: 6px !important;
  margin: 0 2px !important;
  transition: all 0.3s ease !important;
}

.p-paginator-first:hover,
.p-paginator-prev:hover,
.p-paginator-next:hover,
.p-paginator-last:hover {
  background: rgba(22, 63, 94, 0.2) !important;
  transform: translateY(-1px) !important;
}

/* Стили для тегов статусов */
.p-tag {
  border-radius: 20px !important;
  padding: 0.25rem 0.75rem !important;
  font-weight: 500 !important;
  font-size: 0.8rem !important;
  backdrop-filter: blur(5px) !important;
}

.p-tag.p-tag-success {
  background: rgba(16, 185, 129, 0.2) !important;
  color: #10b981 !important;
  border: 1px solid rgba(16, 185, 129, 0.3) !important;
}

.p-tag.p-tag-warning {
  background: rgba(245, 158, 11, 0.2) !important;
  color: #f59e0b !important;
  border: 1px solid rgba(245, 158, 11, 0.3) !important;
}

.p-tag.p-tag-danger {
  background: rgba(239, 68, 68, 0.2) !important;
  color: #ef4444 !important;
  border: 1px solid rgba(239, 68, 68, 0.3) !important;
}

.p-tag.p-tag-info {
  background: rgba(59, 130, 246, 0.2) !important;
  color: #3b82f6 !important;
  border: 1px solid rgba(59, 130, 246, 0.3) !important;
}

/* Дополнительные стили для таблицы ОУ */
.institutions-table .p-datatable-tbody > tr {
  cursor: pointer;
}

.institutions-table .p-datatable-tbody > tr:hover {
  background: rgba(22, 63, 94, 0.08) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(22, 63, 94, 0.15) !important;
}

/* Стили для карточек в детальной странице ОУ */
.info-card :deep(.p-card-content),
.stats-card :deep(.p-card-content),
.reports-card :deep(.p-card-content) {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

/* Стили для кнопок действий */
.p-button.p-button-text {
  color: #163F5E !important;
  border-color: rgba(22, 63, 94, 0.2) !important;
  transition: all 0.3s ease !important;
}

.p-button.p-button-text:hover {
  background: rgba(22, 63, 94, 0.1) !important;
  border-color: rgba(22, 63, 94, 0.3) !important;
  transform: translateY(-1px) !important;
}
</style>
