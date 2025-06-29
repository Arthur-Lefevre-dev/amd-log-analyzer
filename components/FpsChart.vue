<template>
  <div class="fps-chart-container">
    <div v-if="!data || data.length === 0" class="no-data">
      <p class="text-gray-500">Aucune donnée FPS disponible</p>
    </div>
    <div v-else class="chart-wrapper">
      <!-- Chart Header -->
      <div class="chart-header mb-4">
        <div class="flex justify-between items-center">
          <h4 class="font-semibold">Performance FPS</h4>
        </div>
      </div>

      <!-- Simple Bar Chart -->
      <div class="simple-chart">
        <div
          class="chart-bars flex items-end justify-between h-64 bg-gray-50 p-4 rounded"
        >
          <div
            v-for="(item, index) in limitedData"
            :key="index"
            class="chart-bar bg-blue-500 rounded-t"
            :style="{
              height: getBarHeight(item.FPS) + '%',
              width: barWidth + '%',
            }"
            :title="`FPS: ${item.FPS} | Frame Time: ${item.FrameTime}ms`"
          ></div>
        </div>

        <!-- Y-axis labels -->
        <div
          class="chart-labels flex justify-between mt-2 text-xs text-gray-500"
        >
          <span>Min: {{ minFps }}</span>
          <span>Moy: {{ avgFps }}</span>
          <span>Max: {{ maxFps }}</span>
        </div>
      </div>

      <!-- Data Summary -->
      <div class="chart-summary mt-4 flex gap-4 text-center">
        <div class="summary-item">
          <div class="text-lg font-bold text-green-600">{{ minFps }}</div>
          <div class="text-xs text-gray-500">FPS Min</div>
        </div>
        <div class="summary-item">
          <div class="text-lg font-bold text-blue-600">{{ avgFps }}</div>
          <div class="text-xs text-gray-500">FPS Moyen</div>
        </div>
        <div class="summary-item">
          <div class="text-lg font-bold text-red-600">{{ maxFps }}</div>
          <div class="text-xs text-gray-500">FPS Max</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
});

// Computed properties
const limitedData = computed(() => {
  // Limit to 50 bars for visual clarity
  if (props.data.length <= 50) return props.data;
  const step = Math.floor(props.data.length / 50);
  return props.data.filter((_, index) => index % step === 0).slice(0, 50);
});

const barWidth = computed(() => {
  const totalBars = limitedData.value.length;
  return Math.max(0.5, Math.min(3, 100 / totalBars - 1)); // Réduit la largeur max et augmente l'espacement
});

const fpsValues = computed(() => {
  return props.data
    .map((item) => parseFloat(item.FPS))
    .filter((fps) => !isNaN(fps) && fps > 0);
});

const minFps = computed(() => {
  return fpsValues.value.length > 0
    ? Math.min(...fpsValues.value).toFixed(1)
    : "0";
});

const maxFps = computed(() => {
  return fpsValues.value.length > 0
    ? Math.max(...fpsValues.value).toFixed(1)
    : "0";
});

const avgFps = computed(() => {
  if (fpsValues.value.length === 0) return "0";
  const avg =
    fpsValues.value.reduce((a, b) => a + b, 0) / fpsValues.value.length;
  return avg.toFixed(1);
});

// Methods
const getBarHeight = (fps) => {
  const numFps = parseFloat(fps);
  if (isNaN(numFps) || numFps <= 0) return 0;

  const max = Math.max(...fpsValues.value);
  const min = Math.min(...fpsValues.value);
  const range = max - min;

  if (range === 0) return 50; // If all values are the same

  return Math.max(5, ((numFps - min) / range) * 85 + 10); // Réduit légèrement la hauteur max
};
</script>

<style scoped>
.fps-chart-container {
  width: 100%;
  height: 400px;
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
}

.chart-wrapper {
  height: 100%;
}

.simple-chart {
  width: 100%;
}

.chart-bars {
  height: 16rem;
  gap: 2px; /* Augmente l'espacement entre les barres */
  padding: 4px; /* Ajoute un peu de padding */
}

.chart-bar {
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 4px;
}

.chart-bar:hover {
  opacity: 0.8;
  transform: translateY(-2px);
}

.summary-item {
  padding: 0.5rem;
  background-color: #f9fafb;
  border-radius: 0.375rem;
}

.h-64 {
  height: 16rem;
}
.bg-gray-50 {
  background-color: #f9fafb;
}
.text-green-600 {
  color: #059669;
}
.text-blue-600 {
  color: #2563eb;
}
.text-red-600 {
  color: #dc2626;
}
.text-xs {
  font-size: 0.75rem;
}
</style>
