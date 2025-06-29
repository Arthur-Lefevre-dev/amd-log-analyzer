<template>
  <div class="temp-chart-container">
    <div v-if="!data || data.length === 0" class="no-data">
      <p class="text-gray-500">Aucune donnée de température disponible</p>
    </div>
    <div v-else class="chart-wrapper">
      <!-- Chart Header -->
      <div class="chart-header mb-4">
        <div class="flex justify-between items-center">
          <h4 class="font-semibold">Températures</h4>
          <div class="chart-stats text-sm text-gray-600">
            {{ data.length }} échantillons
          </div>
        </div>
      </div>

      <!-- Temperature Lines Chart -->
      <div class="simple-chart">
        <div
          class="chart-area bg-gray-50 p-4 rounded relative"
          style="height: 200px"
        >
          <!-- GPU Temp Line -->
          <div class="temp-line gpu-temp" v-if="gpuTempPoints.length > 0">
            <div
              v-for="(point, index) in gpuTempPoints"
              :key="'gpu-' + index"
              class="temp-point bg-red-500"
              :style="getPointStyle(point, index, gpuTempPoints.length)"
              :title="`GPU: ${point.temp}°C`"
            ></div>
          </div>

          <!-- CPU Temp Line -->
          <div class="temp-line cpu-temp" v-if="cpuTempPoints.length > 0">
            <div
              v-for="(point, index) in cpuTempPoints"
              :key="'cpu-' + index"
              class="temp-point bg-blue-500"
              :style="getPointStyle(point, index, cpuTempPoints.length)"
              :title="`CPU: ${point.temp}°C`"
            ></div>
          </div>
        </div>

        <!-- Legend -->
        <div class="chart-legend flex gap-4 mt-2 text-sm">
          <div class="legend-item flex items-center">
            <div class="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span>GPU ({{ avgGpuTemp }}°C)</span>
          </div>
          <div class="legend-item flex items-center">
            <div class="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span>CPU ({{ avgCpuTemp }}°C)</span>
          </div>
        </div>
      </div>

      <!-- Temperature Summary -->
      <div class="chart-summary mt-4 flex gap-4 text-center">
        <div class="summary-item">
          <div class="text-lg font-bold text-red-600">{{ maxGpuTemp }}°C</div>
          <div class="text-xs text-gray-500">GPU Max</div>
        </div>
        <div class="summary-item">
          <div class="text-lg font-bold text-blue-600">{{ maxCpuTemp }}°C</div>
          <div class="text-xs text-gray-500">CPU Max</div>
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
const gpuTempValues = computed(() => {
  return props.data
    .map((item) => parseFloat(item["GPU TEMP"]))
    .filter((temp) => !isNaN(temp) && temp > 0);
});

const cpuTempValues = computed(() => {
  return props.data
    .map((item) => parseFloat(item["CPU TEMP"]))
    .filter((temp) => !isNaN(temp) && temp > 0);
});

const gpuTempPoints = computed(() => {
  const maxPoints = 50;
  const step = Math.max(1, Math.floor(props.data.length / maxPoints));

  return props.data
    .filter((_, index) => index % step === 0)
    .slice(0, maxPoints)
    .map((item) => ({
      temp: parseFloat(item["GPU TEMP"]),
      raw: item,
    }))
    .filter((point) => !isNaN(point.temp) && point.temp > 0);
});

const cpuTempPoints = computed(() => {
  const maxPoints = 50;
  const step = Math.max(1, Math.floor(props.data.length / maxPoints));

  return props.data
    .filter((_, index) => index % step === 0)
    .slice(0, maxPoints)
    .map((item) => ({
      temp: parseFloat(item["CPU TEMP"]),
      raw: item,
    }))
    .filter((point) => !isNaN(point.temp) && point.temp > 0);
});

const maxGpuTemp = computed(() => {
  return gpuTempValues.value.length > 0
    ? Math.max(...gpuTempValues.value).toFixed(1)
    : "0";
});

const maxCpuTemp = computed(() => {
  return cpuTempValues.value.length > 0
    ? Math.max(...cpuTempValues.value).toFixed(1)
    : "0";
});

const avgGpuTemp = computed(() => {
  if (gpuTempValues.value.length === 0) return "0";
  const avg =
    gpuTempValues.value.reduce((a, b) => a + b, 0) / gpuTempValues.value.length;
  return avg.toFixed(1);
});

const avgCpuTemp = computed(() => {
  if (cpuTempValues.value.length === 0) return "0";
  const avg =
    cpuTempValues.value.reduce((a, b) => a + b, 0) / cpuTempValues.value.length;
  return avg.toFixed(1);
});

const tempRange = computed(() => {
  const allTemps = [...gpuTempValues.value, ...cpuTempValues.value];
  if (allTemps.length === 0) return { min: 0, max: 100 };

  return {
    min: Math.min(...allTemps),
    max: Math.max(...allTemps),
  };
});

// Methods
const getPointStyle = (point, index, totalPoints) => {
  const x = (index / (totalPoints - 1)) * 100;
  const y =
    100 -
    ((point.temp - tempRange.value.min) /
      (tempRange.value.max - tempRange.value.min)) *
      100;

  return {
    position: "absolute",
    left: x + "%",
    top: Math.max(5, Math.min(95, y)) + "%",
    transform: "translate(-50%, -50%)",
  };
};
</script>

<style scoped>
.temp-chart-container {
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

.chart-area {
  position: relative;
  overflow: hidden;
}

.temp-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Permet le hover des points mais évite les conflits */
}

.temp-point {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.temp-point:hover {
  transform: translate(-50%, -50%) scale(1.5);
}

.chart-legend {
  display: flex;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
}

.summary-item {
  padding: 0.5rem;
  background-color: #f9fafb;
  border-radius: 0.375rem;
}

.w-3 {
  width: 0.75rem;
}
.h-3 {
  height: 0.75rem;
}
.bg-red-500 {
  background-color: #ef4444;
}
.bg-blue-500 {
  background-color: #3b82f6;
}
.text-red-600 {
  color: #dc2626;
}
.text-blue-600 {
  color: #2563eb;
}
.text-xs {
  font-size: 0.75rem;
}
.rounded {
  border-radius: 0.25rem;
}
</style>
