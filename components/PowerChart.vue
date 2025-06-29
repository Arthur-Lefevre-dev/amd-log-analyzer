<template>
  <div class="power-chart-container">
    <div v-if="!data || data.length === 0" class="no-data">
      <p class="text-gray-500">Aucune donnée de consommation disponible</p>
    </div>
    <div v-else class="chart-wrapper">
      <!-- Chart Header -->
      <div class="chart-header mb-4">
        <div class="flex justify-between items-center">
          <h4 class="font-semibold">Consommation</h4>
          <div class="chart-stats text-sm text-gray-600">
            {{ data.length }} échantillons
          </div>
        </div>
      </div>

      <!-- Power Area Chart -->
      <div class="simple-chart">
        <div
          class="chart-area bg-gray-50 p-4 rounded relative"
          style="height: 200px"
        >
          <!-- GPU Power Area -->
          <div class="power-area gpu-power" v-if="gpuPowerPoints.length > 0">
            <div
              v-for="(point, index) in gpuPowerPoints"
              :key="'gpu-power-' + index"
              class="power-bar bg-yellow-500"
              :style="
                getBarStyle(point.power, index, gpuPowerPoints.length, 'gpu')
              "
              :title="`GPU: ${point.power}W`"
            ></div>
          </div>

          <!-- CPU Power Area -->
          <div class="power-area cpu-power" v-if="cpuPowerPoints.length > 0">
            <div
              v-for="(point, index) in cpuPowerPoints"
              :key="'cpu-power-' + index"
              class="power-bar bg-orange-500"
              :style="
                getBarStyle(point.power, index, cpuPowerPoints.length, 'cpu')
              "
              :title="`CPU: ${point.power}W`"
            ></div>
          </div>
        </div>

        <!-- Legend -->
        <div class="chart-legend flex gap-4 mt-2 text-sm justify-center">
          <div class="legend-item flex items-center">
            <div class="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
            <span>GPU ({{ avgGpuPower }}W)</span>
          </div>
          <div class="legend-item flex items-center">
            <div class="w-3 h-3 bg-orange-500 rounded mr-2"></div>
            <span>CPU ({{ avgCpuPower }}W)</span>
          </div>
        </div>
      </div>

      <!-- Power Summary -->
      <div class="chart-summary mt-4 flex gap-4 text-center">
        <div class="summary-item">
          <div class="text-lg font-bold text-yellow-600">
            {{ maxGpuPower }}W
          </div>
          <div class="text-xs text-gray-500">GPU Max</div>
        </div>
        <div class="summary-item">
          <div class="text-lg font-bold text-orange-600">
            {{ maxCpuPower }}W
          </div>
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
const gpuPowerValues = computed(() => {
  return props.data
    .map((item) => parseFloat(item["GPU BRD PWR"]))
    .filter((power) => !isNaN(power) && power > 0);
});

const cpuPowerValues = computed(() => {
  return props.data
    .map((item) => parseFloat(item["CPU PWR"]))
    .filter((power) => !isNaN(power) && power > 0);
});

const gpuPowerPoints = computed(() => {
  const maxPoints = 40;
  const step = Math.max(1, Math.floor(props.data.length / maxPoints));

  return props.data
    .filter((_, index) => index % step === 0)
    .slice(0, maxPoints)
    .map((item) => ({
      power: parseFloat(item["GPU BRD PWR"]),
      raw: item,
    }))
    .filter((point) => !isNaN(point.power) && point.power > 0);
});

const cpuPowerPoints = computed(() => {
  const maxPoints = 40;
  const step = Math.max(1, Math.floor(props.data.length / maxPoints));

  return props.data
    .filter((_, index) => index % step === 0)
    .slice(0, maxPoints)
    .map((item) => ({
      power: parseFloat(item["CPU PWR"]),
      raw: item,
    }))
    .filter((point) => !isNaN(point.power) && point.power > 0);
});

const maxGpuPower = computed(() => {
  return gpuPowerValues.value.length > 0
    ? Math.max(...gpuPowerValues.value).toFixed(0)
    : "0";
});

const maxCpuPower = computed(() => {
  return cpuPowerValues.value.length > 0
    ? Math.max(...cpuPowerValues.value).toFixed(0)
    : "0";
});

const avgGpuPower = computed(() => {
  if (gpuPowerValues.value.length === 0) return "0";
  const avg =
    gpuPowerValues.value.reduce((a, b) => a + b, 0) /
    gpuPowerValues.value.length;
  return avg.toFixed(0);
});

const avgCpuPower = computed(() => {
  if (cpuPowerValues.value.length === 0) return "0";
  const avg =
    cpuPowerValues.value.reduce((a, b) => a + b, 0) /
    cpuPowerValues.value.length;
  return avg.toFixed(0);
});

const powerRange = computed(() => {
  const allPowers = [...gpuPowerValues.value, ...cpuPowerValues.value];
  if (allPowers.length === 0) return { min: 0, max: 300 };

  return {
    min: 0, // Start from 0 for power consumption
    max: Math.max(...allPowers),
  };
});

// Methods
const getBarStyle = (power, index, totalPoints, type) => {
  const x = (index / Math.max(1, totalPoints - 1)) * 100;
  const height = (power / powerRange.value.max) * 80; // Réduit la hauteur pour éviter les débordements
  const width = Math.max(0.8, 100 / totalPoints - 0.5); // Réduit la largeur pour éviter les chevauchements

  return {
    position: "absolute",
    left: x + "%",
    bottom: "0%", // Tous les barres partent du bas
    width: width + "%",
    height: height + "%",
    opacity: type === "cpu" ? "0.6" : "0.8", // CPU plus transparent pour voir la superposition
    zIndex: type === "gpu" ? "2" : "1", // GPU au-dessus
  };
};
</script>

<style scoped>
.power-chart-container {
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

.power-area {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.power-bar {
  cursor: pointer;
  transition: all 0.2s ease;
}

.power-bar:hover {
  opacity: 1 !important;
  transform: scaleY(1.05);
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
.bg-yellow-500 {
  background-color: #eab308;
}
.bg-orange-500 {
  background-color: #f97316;
}
.text-yellow-600 {
  color: #ca8a04;
}
.text-orange-600 {
  color: #ea580c;
}
.text-xs {
  font-size: 0.75rem;
}
.rounded {
  border-radius: 0.25rem;
}
</style>
