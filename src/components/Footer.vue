<template>
  <footer class="app-footer">
    <div class="footer-content">
      <p class="footer-text">
        Разработано Академией технического творчества и цифровых технологий, 2025
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Компонент футера
</script>

<style scoped>
.app-footer {
  position: fixed;
  bottom: 0;
  left: 280px;
  right: 0;
  height: 60px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: left 0.3s ease;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.footer-text {
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0;
  text-align: center;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .app-footer {
    left: 0;
  }
}
</style>
