<template>
  <div class="fps-line-chart-container">
    <div v-if="!data || data.length === 0" class="no-data">
      <p class="text-gray-500">Aucune donnée FPS disponible</p>
    </div>
    <div v-else class="chart-wrapper">
      <!-- Chart Header -->
      <div class="chart-header mb-4">
        <div class="flex justify-between items-center">
          <div class="app-details">
            <h4 class="font-semibold text-lg">{{ currentApp }}</h4>
            <p class="text-sm text-gray-600">
              {{ chartData.length }} échantillons | FPS Moyen: {{ avgFps }} |
              Session: {{ formatDuration(sessionDuration) }}
            </p>
          </div>
          <div class="chart-legend flex gap-4 text-xs">
            <div class="legend-item">
              <div class="legend-color bg-green-500"></div>
              <span>&gt; 60 FPS ({{ smoothPercentage }}%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color bg-yellow-500"></div>
              <span>30-60 FPS ({{ mediumPercentage }}%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color bg-red-500"></div>
              <span>&lt; 30 FPS ({{ lowPercentage }}%)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Line Chart -->
      <div class="line-chart-container">
        <svg
          class="line-chart-svg"
          :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
          preserveAspectRatio="none"
        >
          <!-- Grid Lines -->
          <g class="grid-lines">
            <!-- Horizontal grid lines (FPS levels) -->
            <line
              v-for="(line, index) in horizontalGridLines"
              :key="'h-' + index"
              :x1="0"
              :y1="line.y"
              :x2="chartWidth"
              :y2="line.y"
              stroke="#e5e7eb"
              stroke-width="1"
              stroke-dasharray="2,2"
            />
            <!-- Vertical grid lines (time) -->
            <line
              v-for="(line, index) in verticalGridLines"
              :key="'v-' + index"
              :x1="line.x"
              :y1="0"
              :x2="line.x"
              :y2="chartHeight"
              stroke="#e5e7eb"
              stroke-width="1"
              stroke-dasharray="2,2"
            />
          </g>

          <!-- FPS Line Path -->
          <path
            :d="linePath"
            fill="none"
            stroke="#3b82f6"
            stroke-width="2"
            stroke-linejoin="round"
            stroke-linecap="round"
            class="fps-line"
          />
        </svg>

        <!-- Chart Labels -->
        <div class="chart-labels">
          <!-- Y-axis labels (FPS) -->
          <div class="y-labels">
            <div
              v-for="label in yAxisLabels"
              :key="label.value"
              class="y-label"
              :style="{ top: label.position + '%' }"
            >
              {{ label.value }} FPS
            </div>
          </div>

          <!-- X-axis labels (Time) -->
          <div class="x-labels">
            <div
              v-for="label in xAxisLabels"
              :key="label.index"
              class="x-label"
              :style="{ left: label.position + '%' }"
            >
              {{ label.time }}
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Summary -->
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
        <div class="summary-item">
          <div class="text-lg font-bold text-purple-600">
            {{ chartData.length }}
          </div>
          <div class="text-xs text-gray-500">Échantillons</div>
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

// Chart dimensions
const chartWidth = 1000;
const chartHeight = 300;

// Computed properties
const chartData = computed(() => {
  // Prendre TOUS les échantillons sans limitation
  return props.data
    .map((item, index) => ({
      fps: parseFloat(item.FPS),
      frameTime:
        parseFloat(item["AVG FRAME TIME"]) || parseFloat(item.FrameTime) || 0,
      process: item.PROCESS || "Unknown",
      timestamp: item["TIME STAMP"] || item.Timestamp || `Point ${index + 1}`,
      index: index,
      raw: item,
    }))
    .filter((point) => !isNaN(point.fps) && point.fps > 0)
    .map((point, index, array) => {
      // Calculate position
      const x = (index / Math.max(1, array.length - 1)) * chartWidth;
      const minFps = Math.min(...array.map((p) => p.fps));
      const maxFps = Math.max(...array.map((p) => p.fps));
      const y =
        chartHeight - ((point.fps - minFps) / (maxFps - minFps)) * chartHeight;

      return {
        ...point,
        x: x,
        y: Math.max(5, Math.min(chartHeight - 5, y)), // Clamp to visible area
      };
    });
});

const currentApp = computed(() => {
  if (props.data.length === 0) return "Aucune application";
  const firstProcess = props.data[0]?.PROCESS || "Unknown";
  return firstProcess.replace(/\.exe$/i, "").replace(/.*[\\/]/, "");
});

const sessionDuration = computed(() => {
  return Math.floor(chartData.value.length / 60); // Estimation en minutes
});

const fpsValues = computed(() => {
  return chartData.value.map((point) => point.fps);
});

const minFpsValue = computed(() => {
  return fpsValues.value.length > 0 ? Math.min(...fpsValues.value) : 0;
});

const maxFpsValue = computed(() => {
  return fpsValues.value.length > 0 ? Math.max(...fpsValues.value) : 100;
});

const minFps = computed(() => {
  return minFpsValue.value.toFixed(1);
});

const maxFps = computed(() => {
  return maxFpsValue.value.toFixed(1);
});

const avgFps = computed(() => {
  if (fpsValues.value.length === 0) return "0";
  const avg =
    fpsValues.value.reduce((a, b) => a + b, 0) / fpsValues.value.length;
  return avg.toFixed(1);
});

// Performance percentages
const smoothPercentage = computed(() => {
  if (chartData.value.length === 0) return 0;
  const smooth = chartData.value.filter((p) => p.fps > 60).length;
  return Math.round((smooth / chartData.value.length) * 100);
});

const mediumPercentage = computed(() => {
  if (chartData.value.length === 0) return 0;
  const medium = chartData.value.filter(
    (p) => p.fps >= 30 && p.fps <= 60
  ).length;
  return Math.round((medium / chartData.value.length) * 100);
});

const lowPercentage = computed(() => {
  if (chartData.value.length === 0) return 0;
  const low = chartData.value.filter((p) => p.fps < 30).length;
  return Math.round((low / chartData.value.length) * 100);
});

// Line path for SVG
const linePath = computed(() => {
  if (chartData.value.length === 0) return "";

  let path = `M ${chartData.value[0].x} ${chartData.value[0].y}`;

  for (let i = 1; i < chartData.value.length; i++) {
    path += ` L ${chartData.value[i].x} ${chartData.value[i].y}`;
  }

  return path;
});

// Grid lines
const horizontalGridLines = computed(() => {
  const lines = [];
  const step = (maxFpsValue.value - minFpsValue.value) / 5;

  for (let i = 0; i <= 5; i++) {
    const fps = minFpsValue.value + step * i;
    const y =
      chartHeight -
      ((fps - minFpsValue.value) / (maxFpsValue.value - minFpsValue.value)) *
        chartHeight;
    lines.push({ y, fps });
  }

  return lines;
});

const verticalGridLines = computed(() => {
  const lines = [];
  const step = chartWidth / 10;

  for (let i = 0; i <= 10; i++) {
    lines.push({ x: i * step });
  }

  return lines;
});

// Axis labels
const yAxisLabels = computed(() => {
  const labels = [];
  const step = (maxFpsValue.value - minFpsValue.value) / 5;

  for (let i = 0; i <= 5; i++) {
    const value = Math.round(minFpsValue.value + step * i);
    const position = 100 - i * 20; // Inverse position for top-to-bottom
    labels.push({ value, position });
  }

  return labels;
});

const xAxisLabels = computed(() => {
  const labels = [];
  const totalPoints = chartData.value.length;
  const step = totalPoints / 5;

  for (let i = 0; i <= 5; i++) {
    const index = Math.round(i * step);
    const position = (i / 5) * 100;
    const time = formatTime(index);
    labels.push({ index, position, time });
  }

  return labels;
});

// Methods

const formatTime = (index) => {
  const minutes = Math.floor(index / 60);
  const seconds = index % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}min`;
};
</script>

<style scoped>
.fps-line-chart-container {
  width: 100%;
  height: 500px;
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
  display: flex;
  flex-direction: column;
}

.chart-header {
  flex-shrink: 0;
}

.app-details h4 {
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.chart-legend {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.line-chart-container {
  flex: 1;
  position: relative;
  background: #f9fafb;
  border-radius: 8px;
  padding: 1rem;
  overflow: hidden;
}

.line-chart-svg {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.fps-line {
  filter: drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3));
}

.chart-labels {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.y-labels {
  position: absolute;
  left: -40px;
  top: 1rem;
  bottom: 1rem;
}

.y-label {
  position: absolute;
  font-size: 0.75rem;
  color: #6b7280;
  transform: translateY(-50%);
  white-space: nowrap;
}

.x-labels {
  position: absolute;
  left: 1rem;
  right: 1rem;
  bottom: -25px;
  height: 20px;
}

.x-label {
  position: absolute;
  font-size: 0.75rem;
  color: #6b7280;
  transform: translateX(-50%);
  white-space: nowrap;
}

.summary-item {
  flex: 1;
  min-width: 120px;
  max-width: 200px;
  background: rgba(249, 250, 251, 0.8);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  backdrop-filter: blur(5px);
}

.flex {
  display: flex;
}
.justify-between {
  justify-content: space-between;
}
.items-center {
  align-items: center;
}
.gap-4 {
  gap: 1rem;
}
.mb-4 {
  margin-bottom: 1rem;
}
.mt-4 {
  margin-top: 1rem;
}
.text-center {
  text-align: center;
}
.text-sm {
  font-size: 0.875rem;
}
.text-xs {
  font-size: 0.75rem;
}
.text-lg {
  font-size: 1.125rem;
}
.font-semibold {
  font-weight: 600;
}
.font-bold {
  font-weight: 700;
}
.text-gray-500 {
  color: #6b7280;
}
.text-gray-600 {
  color: #4b5563;
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
.text-purple-600 {
  color: #7c3aed;
}
.bg-green-500 {
  background-color: #10b981;
}
.bg-yellow-500 {
  background-color: #f59e0b;
}
.bg-red-500 {
  background-color: #ef4444;
}
</style>
