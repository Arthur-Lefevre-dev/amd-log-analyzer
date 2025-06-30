<template>
  <div class="settings-menu" @click.stop>
    <button
      class="settings-button"
      @click="toggleMenu"
      :class="{ active: isOpen }"
    >
      <Icon
        name="lucide:settings"
        class="settings-icon"
        :class="{ rotating: isOpen }"
      />
    </button>

    <div v-if="isOpen" class="settings-dropdown">
      <div class="settings-header">
        <Icon name="lucide:settings" class="header-icon" />
        <span class="header-title">{{ $t("settings.title") }}</span>
      </div>

      <div class="settings-section">
        <div class="section-label">
          <Icon name="lucide:globe" class="section-icon" />
          <span>{{ $t("settings.language") }}</span>
        </div>
        <div class="language-options">
          <div
            v-for="availableLocale in locales"
            :key="availableLocale.code"
            class="language-option"
            :class="{ active: locale === availableLocale.code }"
            @click="selectLanguage(availableLocale.code)"
          >
            <span class="language-flag">{{
              getLanguageFlag(availableLocale.code)
            }}</span>
            <span class="language-name">{{ availableLocale.name }}</span>
            <Icon
              v-if="locale === availableLocale.code"
              name="lucide:check"
              class="check-icon"
            />
          </div>
        </div>
      </div>

      <!-- Placeholder pour futures options -->
      <div class="settings-section">
        <div class="section-label">
          <Icon name="lucide:palette" class="section-icon" />
          <span>{{ $t("settings.theme") }}</span>
        </div>
        <div class="theme-options">
          <div class="theme-option active">
            <div class="theme-preview gradient"></div>
            <span>{{ $t("settings.modernGradient") }}</span>
            <Icon name="lucide:check" class="check-icon" />
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="section-label">
          <Icon name="lucide:info" class="section-icon" />
          <span>{{ $t("settings.about") }}</span>
        </div>
        <div class="about-content">
          <p class="app-version">{{ $t("settings.version") }}</p>
          <p class="app-description">{{ $t("settings.description") }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// Use i18n composable
const { locale, locales, setLocale } = useI18n();

// State for dropdown
const isOpen = ref(false);

// Get language flag emoji
const getLanguageFlag = (code) => {
  const flags = {
    fr: "🇫🇷",
    en: "🇺🇸",
  };
  return flags[code] || "🌐";
};

// Toggle menu
const toggleMenu = (event) => {
  event.stopPropagation();
  isOpen.value = !isOpen.value;
};

// Select language
const selectLanguage = (code) => {
  setLocale(code);
  // Ne pas fermer le menu pour permettre d'autres ajustements
  console.log("Language changed to:", code);
};

// Close menu when clicking outside
const closeMenu = () => {
  isOpen.value = false;
};

onMounted(() => {
  document.addEventListener("click", closeMenu);
});

onUnmounted(() => {
  document.removeEventListener("click", closeMenu);
});
</script>

<style scoped>
.settings-menu {
  @apply relative;
  z-index: 9999;
}

.settings-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 10000;
}

.settings-button:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.settings-button.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.settings-icon {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 0.3s ease;
}

.settings-icon.rotating {
  transform: rotate(90deg);
}

.settings-dropdown {
  position: absolute;
  top: calc(100% + 0.75rem);
  right: 0;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  overflow: hidden;
  z-index: 10001;
  min-width: 280px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-15px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.settings-header {
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.header-title {
  font-weight: 600;
  font-size: 1rem;
}

.settings-section {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f3f4f6;
}

.settings-section:last-child {
  border-bottom: none;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
}

.section-icon {
  width: 1rem;
  height: 1rem;
  color: #667eea;
}

.language-options {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.language-option {
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  color: #374151;
  border-radius: 8px;
}

.language-option:hover {
  background: rgba(102, 126, 234, 0.08);
  color: #667eea;
}

.language-option.active {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  font-weight: 600;
}

.language-flag {
  font-size: 1.125rem;
  line-height: 1;
}

.language-name {
  flex: 1;
  font-weight: 500;
}

.check-icon {
  width: 1rem;
  height: 1rem;
  color: #10b981;
}

.theme-options {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.theme-option {
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  color: #374151;
  border-radius: 8px;
}

.theme-option.active {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  font-weight: 600;
}

.theme-preview {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 4px;
  border: 2px solid #e5e7eb;
}

.theme-preview.gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
}

.about-content {
  color: #6b7280;
  font-size: 0.875rem;
}

.app-version {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.app-description {
  margin: 0;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .settings-dropdown {
    right: -1rem;
    min-width: 260px;
  }
}
</style>
 