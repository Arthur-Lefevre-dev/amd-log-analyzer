<template>
  <div class="app-layout">
    <div class="app-container">
      <!-- Header global -->
      <AppHeader />

      <!-- Contenu des pages -->
      <main class="app-main">
        <slot />
      </main>

      <!-- Footer optionnel pour l'avenir -->
      <footer class="app-footer">
        <!-- Footer peut être ajouté ici plus tard -->
      </footer>
    </div>
  </div>
</template>

<script setup>
// Layout par défaut pour toute l'application
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-container {
  min-height: 100vh;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.app-main {
  /* Le contenu principal n'a pas besoin de styles spéciaux */
  /* Les pages gèrent leur propre contenu */
}

.app-footer {
  /* Préparé pour un futur footer */
  margin-top: 2rem;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .app-container {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .app-container {
    padding: 0.75rem;
  }
}
</style>
