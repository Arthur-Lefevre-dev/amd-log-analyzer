<template>
  <div v-if="isOpen" class="fullscreen-modal" @click="closeModal">
    <div class="fullscreen-container" @click.stop>
      <!-- Header with controls -->
      <div class="fullscreen-header">
        <div class="header-left">
          <h2 class="chart-title">{{ currentChartTitle }}</h2>
          <span class="chart-counter"
            >{{ currentIndex + 1 }} / {{ totalCharts }}</span
          >
        </div>
        <div class="header-controls">
          <!-- Navigation buttons -->
          <button
            v-if="totalCharts > 1"
            @click="previousChart"
            :disabled="currentIndex === 0"
            class="nav-button"
            title="Précédent"
          >
            <Icon name="lucide:chevron-left" class="w-5 h-5" />
          </button>
          <button
            v-if="totalCharts > 1"
            @click="nextChart"
            :disabled="currentIndex === totalCharts - 1"
            class="nav-button"
            title="Suivant"
          >
            <Icon name="lucide:chevron-right" class="w-5 h-5" />
          </button>
          <!-- Close button -->
          <button @click="closeModal" class="close-button" title="Fermer">
            <Icon name="lucide:x" class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Chart content -->
      <div class="fullscreen-content">
        <!-- Performance FPS Chart -->
        <div v-if="currentChart === 'fps'" class="chart-fullscreen">
          <FpsChart
            :data="analysisData.fpsData"
            :hardwareData="analysisData.utilizationData"
            :frametimeData="analysisData.frametimeData"
          />
        </div>

        <!-- Temperature Chart -->
        <div v-if="currentChart === 'temperature'" class="chart-fullscreen">
          <TemperatureChart :data="analysisData.temperatureData" />
        </div>

        <!-- Power Chart -->
        <div v-if="currentChart === 'power'" class="chart-fullscreen">
          <PowerChart :data="analysisData.powerData" />
        </div>

        <!-- Utilization Chart -->
        <div v-if="currentChart === 'utilization'" class="chart-fullscreen">
          <UtilizationChart :data="analysisData.utilizationData" />
        </div>
      </div>

      <!-- Footer with keyboard shortcuts -->
      <div class="fullscreen-footer">
        <div class="keyboard-shortcuts">
          <span class="shortcut"> <kbd>ESC</kbd> Fermer </span>
          <span v-if="totalCharts > 1" class="shortcut">
            <kbd>←</kbd> / <kbd>→</kbd> Naviguer
          </span>
          <span class="shortcut"> <kbd>F</kbd> Basculer plein écran </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  initialChart: {
    type: String,
    default: "fps",
  },
  availableCharts: {
    type: Array,
    default: () => ["fps", "temperature", "power", "utilization"],
  },
  analysisData: {
    type: Object,
    required: true,
  },
});

// Emits
const emit = defineEmits(["close"]);

// State
const currentIndex = ref(0);

// Computed
const currentChart = computed(() => {
  return props.availableCharts[currentIndex.value] || "fps";
});

const totalCharts = computed(() => {
  return props.availableCharts.length;
});

const currentChartTitle = computed(() => {
  // Static titles for now (will fix i18n later)
  const titles = {
    fps: "Performance & FPS",
    temperature: "Températures Hardware",
    power: "Consommation Électrique",
    utilization: "Utilisation Hardware",
  };
  return titles[currentChart.value] || currentChart.value;
});

// Methods
const closeModal = () => {
  emit("close");
};

const nextChart = () => {
  if (currentIndex.value < totalCharts.value - 1) {
    currentIndex.value++;
  }
};

const previousChart = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

// Handle keyboard events
const handleKeydown = (event) => {
  if (!props.isOpen) return;

  switch (event.key) {
    case "Escape":
      closeModal();
      break;
    case "ArrowLeft":
      event.preventDefault();
      previousChart();
      break;
    case "ArrowRight":
      event.preventDefault();
      nextChart();
      break;
    case "f":
    case "F":
      // Toggle browser fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen();
      }
      break;
  }
};

// Set initial chart
watch(
  () => props.initialChart,
  (newChart) => {
    const index = props.availableCharts.indexOf(newChart);
    if (index !== -1) {
      currentIndex.value = index;
    }
  },
  { immediate: true }
);

// Lifecycle
onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
.fullscreen-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(5px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fullscreen-container {
  width: 95vw;
  height: 95vh;
  background: white;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.fullscreen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.chart-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.chart-counter {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.header-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.nav-button,
.close-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 8px;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-button:hover:not(:disabled),
.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.close-button:hover {
  background: rgba(239, 68, 68, 0.8);
  border-color: rgba(239, 68, 68, 1);
}

.fullscreen-content {
  flex: 1;
  padding: 0.5rem 1rem;
  overflow: auto;
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.chart-fullscreen {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  justify-content: center;
  flex-direction: column;
}

.chart-fullscreen :deep(.chart-container) {
  height: calc(100vh - 140px) !important;
  width: 100%;
  min-height: 600px !important;
}

.chart-fullscreen :deep(.chart-wrapper) {
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
}

.chart-fullscreen :deep(.chart-header) {
  margin-bottom: 8px !important;
  flex-shrink: 0;
}

.chart-fullscreen :deep(.fps-chart-container) {
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
}

.chart-fullscreen :deep(.temp-chart-container) {
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
}

/* Force Chart.js to use all available space */
.chart-fullscreen :deep(canvas) {
  max-height: none !important;
}

.chart-fullscreen :deep(.chartjs-render-monitor) {
  height: 100% !important;
}

/* Remove extra margins from chart components */
.chart-fullscreen :deep(.chart-wrapper > *) {
  margin: 0 !important;
}

/* Optimize chart positioning */
.chart-fullscreen :deep(.chart-container) {
  position: relative !important;
  margin: 0 !important;
  padding: 0 !important;
}

.fullscreen-footer {
  padding: 0.75rem 2rem;
  background: rgba(243, 244, 246, 0.8);
  border-top: 1px solid rgba(229, 231, 235, 0.8);
  flex-shrink: 0;
}

.keyboard-shortcuts {
  display: flex;
  gap: 2rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.shortcut {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

kbd {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0.125rem 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .fullscreen-container {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }

  .fullscreen-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .header-left {
    flex-direction: column;
    gap: 0.5rem;
  }

  .chart-title {
    font-size: 1.25rem;
  }

  .fullscreen-content {
    padding: 0.5rem;
  }

  .chart-fullscreen :deep(.chart-container) {
    height: calc(100vh - 120px) !important;
    min-height: 400px !important;
  }

  .keyboard-shortcuts {
    gap: 1rem;
    font-size: 0.75rem;
  }
}
</style>
