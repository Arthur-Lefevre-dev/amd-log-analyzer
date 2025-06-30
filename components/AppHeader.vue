<template>
  <header class="app-header">
    <div class="header-content">
      <div class="header-text">
        <h1 class="header-title">{{ $t("app.title") }}</h1>
        <p class="header-subtitle">{{ $t("app.subtitle") }}</p>
      </div>
      <div class="header-controls">
        <SettingsMenu />
      </div>
    </div>
  </header>
</template>

<script setup>
// Le composant header ne nécessite pas de logique spécifique
</script>

<style scoped>
.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1000;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header-text {
  flex: 1;
}

.header-title {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
  line-height: 1.1;
}

.header-subtitle {
  color: #6b7280;
  font-size: 1.125rem;
  font-weight: 400;
  margin: 0;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .app-header {
    padding: 1.5rem;
  }

  .header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1.5rem;
  }

  .header-title {
    font-size: 2rem;
  }

  .header-subtitle {
    font-size: 1rem;
  }

  .header-controls {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .header-title {
    font-size: 1.75rem;
  }

  .header-subtitle {
    font-size: 0.9rem;
  }
}
</style>
