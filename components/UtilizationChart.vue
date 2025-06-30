<template>
  <div class="util-chart-container">
    <div v-if="!data || data.length === 0" class="no-data">
      <p class="text-gray-500">Aucune donnée d'utilisation disponible</p>
    </div>
    <div v-else class="chart-wrapper">
      <!-- Chart Header -->
      <div class="chart-header mb-4">
        <div class="flex justify-between items-center">
          <h4 class="font-semibold">Utilisation</h4>
        </div>
      </div>

      <!-- Zoom Controls -->
      <div class="zoom-controls">
        <button @click="zoomIn" class="zoom-btn" title="Zoom In">🔍+</button>
        <button @click="zoomOut" class="zoom-btn" title="Zoom Out">🔍-</button>
        <button @click="resetZoom" class="zoom-btn" title="Reset Zoom">
          🔍 Reset
        </button>
      </div>

      <!-- Utilization Area Chart -->
      <div class="simple-chart">
        <div
          class="chart-area bg-gray-50 p-4 rounded relative"
          style="height: 200px; overflow-x: auto; overflow-y: hidden"
          ref="chartContainer"
        >
          <div
            class="chart-content"
            :style="{
              transform: `scaleX(${zoomLevel})`,
              transformOrigin: 'left center',
              width: '100%',
            }"
          >
            <!-- GPU Utilization -->
            <div class="util-area gpu-util" v-if="gpuUtilPoints.length > 0">
              <div
                v-for="(point, index) in gpuUtilPoints"
                :key="'gpu-util-' + index"
                class="util-bar bg-green-500"
                :style="getBarStyle(point.util, index, gpuUtilPoints.length)"
                :title="`GPU: ${point.util}%`"
              ></div>
            </div>

            <!-- CPU Utilization -->
            <div class="util-area cpu-util" v-if="cpuUtilPoints.length > 0">
              <div
                v-for="(point, index) in cpuUtilPoints"
                :key="'cpu-util-' + index"
                class="util-bar bg-purple-500"
                :style="
                  getBarStyle(point.util, index, cpuUtilPoints.length, true)
                "
                :title="`CPU: ${point.util}%`"
              ></div>
            </div>

            <!-- Memory Utilization -->
            <div class="util-area mem-util" v-if="memUtilPoints.length > 0">
              <div
                v-for="(point, index) in memUtilPoints"
                :key="'mem-util-' + index"
                class="util-bar bg-indigo-500"
                :style="
                  getBarStyle(
                    point.util,
                    index,
                    memUtilPoints.length,
                    false,
                    0.5
                  )
                "
                :title="`RAM: ${point.util}%`"
              ></div>
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div class="chart-legend flex gap-4 mt-2 text-sm justify-center">
          <div class="legend-item flex items-center">
            <div class="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span>GPU ({{ avgGpuUtil }}%)</span>
          </div>
          <div class="legend-item flex items-center">
            <div class="w-3 h-3 bg-purple-500 rounded mr-2"></div>
            <span>CPU ({{ avgCpuUtil }}%)</span>
          </div>
          <div class="legend-item flex items-center">
            <div class="w-3 h-3 bg-indigo-500 rounded mr-2"></div>
            <span>RAM ({{ avgMemUtil }}%)</span>
          </div>
        </div>
      </div>

      <!-- Utilization Summary -->
      <div class="chart-summary mt-4 flex gap-4 text-center">
        <div class="summary-item">
          <div class="text-lg font-bold text-green-600">{{ maxGpuUtil }}%</div>
          <div class="text-xs text-gray-500">GPU Max</div>
        </div>
        <div class="summary-item">
          <div class="text-lg font-bold text-purple-600">{{ maxCpuUtil }}%</div>
          <div class="text-xs text-gray-500">CPU Max</div>
        </div>
        <div class="summary-item">
          <div class="text-lg font-bold text-indigo-600">{{ maxMemUtil }}%</div>
          <div class="text-xs text-gray-500">RAM Max</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// Props
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
});

// Computed properties
const gpuUtilValues = computed(() => {
  return props.data
    .map((item) => parseFloat(item["GPU UTIL"]))
    .filter((util) => !isNaN(util) && util >= 0);
});

const cpuUtilValues = computed(() => {
  return props.data
    .map((item) => parseFloat(item["CPU UTIL"]))
    .filter((util) => !isNaN(util) && util >= 0);
});

const memUtilValues = computed(() => {
  return props.data
    .map((item) => {
      // Try multiple possible column names for memory utilization
      const memUtil =
        parseFloat(item["SYSTEM MEM UTIL"]) ||
        parseFloat(item["SYS MEM UTIL"]) ||
        parseFloat(item["SYSTEM_MEM_UTIL"]) ||
        parseFloat(item["SYS_MEM_UTIL"]) ||
        parseFloat(item["MEM UTIL"]) ||
        0;
      return memUtil;
    })
    .filter((util) => !isNaN(util) && util >= 0);
});

const gpuUtilPoints = computed(() => {
  // Display all data points for detailed view
  return props.data
    .map((item) => ({
      util: parseFloat(item["GPU UTIL"]),
      raw: item,
    }))
    .filter((point) => !isNaN(point.util) && point.util >= 0);
});

const cpuUtilPoints = computed(() => {
  // Display all data points for detailed view
  return props.data
    .map((item) => ({
      util: parseFloat(item["CPU UTIL"]),
      raw: item,
    }))
    .filter((point) => !isNaN(point.util) && point.util >= 0);
});

const memUtilPoints = computed(() => {
  // Display all data points for detailed view
  return props.data
    .map((item) => ({
      // Try multiple possible column names for memory utilization
      util:
        parseFloat(item["SYSTEM MEM UTIL"]) ||
        parseFloat(item["SYS MEM UTIL"]) ||
        parseFloat(item["SYSTEM_MEM_UTIL"]) ||
        parseFloat(item["SYS_MEM_UTIL"]) ||
        parseFloat(item["MEM UTIL"]) ||
        0,
      raw: item,
    }))
    .filter((point) => !isNaN(point.util) && point.util >= 0);
});

const maxGpuUtil = computed(() => {
  return gpuUtilValues.value.length > 0
    ? Math.max(...gpuUtilValues.value).toFixed(1)
    : "0";
});

const maxCpuUtil = computed(() => {
  return cpuUtilValues.value.length > 0
    ? Math.max(...cpuUtilValues.value).toFixed(1)
    : "0";
});

const maxMemUtil = computed(() => {
  return memUtilValues.value.length > 0
    ? Math.max(...memUtilValues.value).toFixed(1)
    : "0";
});

const avgGpuUtil = computed(() => {
  if (gpuUtilValues.value.length === 0) return "0";
  const avg =
    gpuUtilValues.value.reduce((a, b) => a + b, 0) / gpuUtilValues.value.length;
  return avg.toFixed(1);
});

const avgCpuUtil = computed(() => {
  if (cpuUtilValues.value.length === 0) return "0";
  const avg =
    cpuUtilValues.value.reduce((a, b) => a + b, 0) / cpuUtilValues.value.length;
  return avg.toFixed(1);
});

const avgMemUtil = computed(() => {
  if (memUtilValues.value.length === 0) return "0";
  const avg =
    memUtilValues.value.reduce((a, b) => a + b, 0) / memUtilValues.value.length;
  return avg.toFixed(1);
});

// Zoom functionality
const zoomLevel = ref(1);
const chartContainer = ref(null);

// Methods
const getBarStyle = (
  util,
  index,
  totalPoints,
  isOverlay = false,
  opacity = 0.8
) => {
  const x = (index / Math.max(1, totalPoints - 1)) * 100;
  const height = Math.min(90, Math.max(2, util)); // Réduit la hauteur max pour éviter les débordements
  const width = Math.max(0.2, Math.min(2, 100 / totalPoints - 0.1)); // Adapt width based on number of points

  return {
    position: "absolute",
    left: x + "%",
    bottom: "0%",
    width: width + "%",
    height: height + "%",
    opacity: opacity,
    borderRadius: "2px 2px 0 0", // Ajoute des coins arrondis en haut
  };
};

const zoomIn = () => {
  if (zoomLevel.value < 10) {
    zoomLevel.value = Math.min(10, zoomLevel.value * 1.5);
  }
};

const zoomOut = () => {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value = Math.max(0.5, zoomLevel.value / 1.5);
  }
};

const resetZoom = () => {
  zoomLevel.value = 1;
  if (chartContainer.value) {
    chartContainer.value.scrollLeft = 0;
  }
};
</script>

<style scoped>
.util-chart-container {
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

.util-area {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.util-bar {
  cursor: pointer;
  transition: all 0.2s ease;
}

.util-bar:hover {
  opacity: 1 !important;
  transform: scaleY(1.05);
}

.chart-legend {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
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
.bg-green-500 {
  background-color: #10b981;
}
.bg-purple-500 {
  background-color: #8b5cf6;
}
.bg-indigo-500 {
  background-color: #6366f1;
}
.text-green-600 {
  color: #059669;
}
.text-purple-600 {
  color: #7c3aed;
}
.text-indigo-600 {
  color: #4f46e5;
}
.text-xs {
  font-size: 0.75rem;
}
.rounded {
  border-radius: 0.25rem;
}

.zoom-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  justify-content: center;
}

.zoom-btn {
  background-color: #6366f1;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.zoom-btn:hover {
  background-color: #4f46e5;
}

.zoom-btn:active {
  transform: translateY(1px);
}

.chart-content {
  transition: transform 0.3s ease;
  position: relative;
  height: 100%;
}
</style>
