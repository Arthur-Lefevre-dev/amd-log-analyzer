<template>
  <div class="multi-axis-chart-container">
    <div v-if="!data || data.length === 0" class="no-data">
      <p class="text-gray-500">Aucune donnée disponible</p>
    </div>
    <div v-else class="chart-wrapper">
      <!-- Chart Header -->
      <div class="chart-header mb-4">
        <div class="app-details">
          <h4 class="font-semibold text-lg">{{ currentApp }}</h4>
          <p class="text-sm text-gray-600">
            Session:
            {{ sessionDurationFormatted }}
          </p>
        </div>
      </div>

      <!-- Visibility Controls -->
      <div class="visibility-controls-bottom mb-4">
        <div class="flex gap-2">
          <button
            @click="toggleVisibility('fps')"
            :class="[
              'visibility-btn',
              { active: showLines.fps, 'fps-btn': true },
            ]"
            title="Afficher/Masquer FPS"
          >
            <div class="btn-color bg-blue-500"></div>
            <span>FPS</span>
          </button>
          <button
            @click="toggleVisibility('gpu')"
            :class="[
              'visibility-btn',
              { active: showLines.gpu, 'gpu-btn': true },
            ]"
            title="Afficher/Masquer GPU Usage"
          >
            <div class="btn-color bg-green-500"></div>
            <span>GPU</span>
          </button>
          <button
            @click="toggleVisibility('cpu')"
            :class="[
              'visibility-btn',
              { active: showLines.cpu, 'cpu-btn': true },
            ]"
            title="Afficher/Masquer CPU Usage"
          >
            <div class="btn-color bg-orange-500"></div>
            <span>CPU</span>
          </button>
        </div>
      </div>

      <!-- Multi-Axis Line Chart -->
      <div ref="chartContainer" class="line-chart-container">
        <svg
          class="line-chart-svg"
          :viewBox="`-50 -20 ${chartWidth + 100} ${chartHeight + 80}`"
          preserveAspectRatio="none"
        >
          <!-- Grid Lines -->
          <g class="grid-lines">
            <!-- Horizontal grid lines for FPS (left axis) -->
            <template v-if="showLines.fps">
              <line
                v-for="(line, index) in horizontalGridLinesFps"
                :key="'h-fps-' + index"
                :x1="0"
                :y1="line.y"
                :x2="chartWidth"
                :y2="line.y"
                stroke="#e5e7eb"
                stroke-width="1"
                stroke-dasharray="2,2"
              />
            </template>
            <!-- Horizontal grid lines for Usage (right axis) -->
            <template v-if="(showLines.gpu || showLines.cpu) && !showLines.fps">
              <line
                v-for="(line, index) in horizontalGridLinesUsage"
                :key="'h-usage-' + index"
                :x1="0"
                :y1="line.y"
                :x2="chartWidth"
                :y2="line.y"
                stroke="#e5e7eb"
                stroke-width="1"
                stroke-dasharray="2,2"
              />
            </template>
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
            v-if="showLines.fps"
            :d="fpsLinePath"
            fill="none"
            stroke="#3b82f6"
            stroke-width="3"
            stroke-linejoin="round"
            stroke-linecap="round"
            class="fps-line"
          />

          <!-- GPU Usage Line Path -->
          <path
            v-if="showLines.gpu"
            :d="gpuUsageLinePath"
            fill="none"
            stroke="#10b981"
            stroke-width="2"
            stroke-linejoin="round"
            stroke-linecap="round"
            class="gpu-line"
          />

          <!-- CPU Usage Line Path -->
          <path
            v-if="showLines.cpu"
            :d="cpuUsageLinePath"
            fill="none"
            stroke="#f97316"
            stroke-width="2"
            stroke-linejoin="round"
            stroke-linecap="round"
            class="cpu-line"
          />

          <!-- Frame Time Line Path -->
          <path
            v-if="showFrameTime"
            :d="frameTimeLinePath"
            fill="none"
            stroke="#7c3aed"
            stroke-width="2"
            stroke-linejoin="round"
            stroke-linecap="round"
            class="frametime-line"
          />

          <!-- Interactive Points -->
          <g class="chart-points">
            <!-- FPS Points -->
            <template v-if="showLines.fps">
              <circle
                v-for="(point, index) in chartData"
                :key="'fps-point-' + index"
                :cx="point.x"
                :cy="point.fpsY"
                r="3"
                fill="#3b82f6"
                stroke="white"
                stroke-width="1"
                class="chart-point fps-point"
                @mouseover="showTooltip($event, point, 'fps')"
                @mouseleave="hideTooltip"
              />
            </template>

            <!-- GPU Points -->
            <template v-if="showLines.gpu">
              <circle
                v-for="(point, index) in chartData"
                :key="'gpu-point-' + index"
                :cx="point.x"
                :cy="point.gpuUsageY"
                r="2.5"
                fill="#10b981"
                stroke="white"
                stroke-width="1"
                class="chart-point gpu-point"
                @mouseover="showTooltip($event, point, 'gpu')"
                @mouseleave="hideTooltip"
              />
            </template>

            <!-- CPU Points -->
            <template v-if="showLines.cpu">
              <circle
                v-for="(point, index) in chartData"
                :key="'cpu-point-' + index"
                :cx="point.x"
                :cy="point.cpuUsageY"
                r="2.5"
                fill="#f97316"
                stroke="white"
                stroke-width="1"
                class="chart-point cpu-point"
                @mouseover="showTooltip($event, point, 'cpu')"
                @mouseleave="hideTooltip"
              />
            </template>

            <!-- Frame Time Points -->
            <template v-if="showFrameTime">
              <circle
                v-for="(point, index) in chartData"
                :key="'frametime-point-' + index"
                :cx="point.x"
                :cy="point.frameTimeY"
                r="2.5"
                fill="#7c3aed"
                stroke="white"
                stroke-width="1"
                class="chart-point frametime-point"
                @mouseover="showTooltip($event, point, 'frametime')"
                @mouseleave="hideTooltip"
              />
            </template>
          </g>
        </svg>
      </div>

      <!-- Tooltip -->
      <div
        v-if="tooltip.visible"
        class="chart-tooltip"
        :style="{
          left: tooltip.x + 'px',
          top: tooltip.y + 'px',
        }"
      >
        <div class="tooltip-content">
          <div class="tooltip-title">{{ tooltip.title }}</div>
          <div class="tooltip-value">{{ tooltip.value }}</div>
          <div v-if="tooltip.timestamp" class="tooltip-time">
            {{ tooltip.timestamp }}
          </div>
        </div>
      </div>

      <!-- Legend Section -->
      <div class="legend-section">
        <!-- Legend -->
        <div class="chart-legend flex gap-4 text-xs justify-center">
          <div v-if="showLines.fps" class="legend-item">
            <div class="legend-color bg-blue-500"></div>
            <span>FPS ({{ minFps }} - {{ maxFps }})</span>
          </div>
          <div v-if="showLines.gpu" class="legend-item">
            <div class="legend-color bg-green-500"></div>
            <span>GPU Usage ({{ minGpuUsage }}% - {{ maxGpuUsage }}%)</span>
          </div>
          <div v-if="showLines.cpu" class="legend-item">
            <div class="legend-color bg-orange-500"></div>
            <span>CPU Usage ({{ minCpuUsage }}% - {{ maxCpuUsage }}%)</span>
          </div>
          <div v-if="showFrameTime" class="legend-item">
            <div class="legend-color bg-purple-500"></div>
            <span>Frame Time ({{ minFrameTime }} - {{ maxFrameTime }} ms)</span>
          </div>
        </div>

        <!-- Performance Summary -->
        <div class="chart-summary mt-4 flex gap-4 text-center">
          <div v-if="showLines.fps" class="summary-item">
            <div class="text-lg font-bold text-blue-600">{{ avgFps }}</div>
            <div class="text-xs text-gray-500">FPS Moyen</div>
          </div>
          <div v-if="showLines.gpu" class="summary-item">
            <div class="text-lg font-bold text-green-600">
              {{ avgGpuUsage }}%
            </div>
            <div class="text-xs text-gray-500">GPU Moyen</div>
          </div>
          <div v-if="showLines.cpu" class="summary-item">
            <div class="text-lg font-bold text-orange-600">
              {{ avgCpuUsage }}%
            </div>
            <div class="text-xs text-gray-500">CPU Moyen</div>
          </div>
          <div v-if="showLines.gpu" class="summary-item">
            <div class="text-lg font-bold text-purple-600">
              {{ maxGpuUsage }}%
            </div>
            <div class="text-xs text-gray-500">GPU Max</div>
          </div>
          <div v-if="showLines.cpu" class="summary-item">
            <div class="text-lg font-bold text-red-600">{{ maxCpuUsage }}%</div>
            <div class="text-xs text-gray-500">CPU Max</div>
          </div>
          <div
            v-if="showFrameTime && frameTimeValues.length > 0"
            class="summary-item"
          >
            <div class="text-lg font-bold text-purple-600">
              {{ avgFrameTime }}ms
            </div>
            <div class="text-xs text-gray-500">Frame Time Moy</div>
          </div>
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
  hardwareData: {
    type: Array,
    default: () => [],
  },
  frametimeData: {
    type: Array,
    default: () => [],
  },
});

// Chart dimensions (responsive)
const chartContainer = ref(null);
const chartWidth = ref(1200);
const chartHeight = ref(400);

// Responsive chart sizing
const updateChartSize = () => {
  if (chartContainer.value) {
    const containerWidth = chartContainer.value.clientWidth - 120; // Account for padding and labels
    const aspectRatio = 3; // Width to height ratio

    chartWidth.value = Math.max(800, containerWidth); // Minimum 800px width
    chartHeight.value = Math.max(300, chartWidth.value / aspectRatio); // Maintain aspect ratio
  }
};

// Set up resize observer
onMounted(() => {
  updateChartSize();

  if (typeof window !== "undefined") {
    const resizeObserver = new ResizeObserver(() => {
      updateChartSize();
    });

    if (chartContainer.value) {
      resizeObserver.observe(chartContainer.value);
    }

    // Cleanup
    onUnmounted(() => {
      resizeObserver.disconnect();
    });
  }
});

// Visibility controls
const showLines = ref({
  fps: true,
  gpu: true,
  cpu: true,
});

// Frame Time is NOT shown on Performance FPS chart
const showFrameTime = computed(() => {
  return false; // Disable Frame Time on this chart
});

// Tooltip state
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  title: "",
  value: "",
  timestamp: "",
});

// Methods for visibility control
const toggleVisibility = (lineType) => {
  showLines.value[lineType] = !showLines.value[lineType];
};

// Tooltip methods
const showTooltip = (event, point, type) => {
  const rect = event.target
    .closest(".line-chart-container")
    .getBoundingClientRect();

  let title = "";
  let value = "";

  switch (type) {
    case "fps":
      title = "FPS";
      value = point.fps.toFixed(1);
      break;
    case "gpu":
      title = "GPU Usage";
      value = point.gpuUsage.toFixed(1) + "%";
      break;
    case "cpu":
      title = "CPU Usage";
      value = point.cpuUsage.toFixed(1) + "%";
      break;
    case "frametime":
      title = "Frame Time";
      value = point.frameTime.toFixed(1) + "ms";
      break;
  }

  tooltip.value = {
    visible: true,
    x: event.clientX - rect.left + 10,
    y: event.clientY - rect.top - 10,
    title: title,
    value: value,
    timestamp: point.timestamp,
  };
};

const hideTooltip = () => {
  tooltip.value.visible = false;
};

// Computed properties for merged data
const chartData = computed(() => {
  if (!props.data || props.data.length === 0) return [];

  // Create FPS data
  const fpsData = props.data
    .map((item, index) => ({
      fps: parseFloat(item.FPS),
      frameTime:
        parseFloat(item["AVG FRAME TIME"]) || parseFloat(item.FrameTime) || 0,
      process: item.PROCESS || "Unknown",
      timestamp: item["TIME STAMP"] || item.Timestamp || `Point ${index + 1}`,
      index: index,
    }))
    .filter((point) => !isNaN(point.fps) && point.fps > 0);

  let mergedData = [];

  // If hardware data is available, merge it with FPS data
  if (props.hardwareData && props.hardwareData.length > 0) {
    const hardwareData = props.hardwareData
      .map((item, index) => ({
        gpuUsage:
          parseFloat(item["GPU Usage"]) || parseFloat(item["GPU UTIL"]) || 0,
        cpuUsage:
          parseFloat(item["CPU Usage"]) || parseFloat(item["CPU UTIL"]) || 0,
        timestamp: item["TIME STAMP"] || item.Timestamp || `Point ${index + 1}`,
        index: index,
      }))
      .filter((point) => !isNaN(point.gpuUsage) && !isNaN(point.cpuUsage));

    // Merge data by matching closest indices
    const minLength = Math.min(fpsData.length, hardwareData.length);

    for (let i = 0; i < minLength; i++) {
      const fpsIndex = Math.floor((i / minLength) * fpsData.length);
      const hwIndex = Math.floor((i / minLength) * hardwareData.length);

      // Get frameTime data if available
      let frameTime = 0;
      if (props.frametimeData && props.frametimeData.length > 0) {
        const ftIndex = Math.floor(
          (i / minLength) * props.frametimeData.length
        );
        frameTime = props.frametimeData[ftIndex]?.frameTime || 0;
      }

      mergedData.push({
        fps: fpsData[fpsIndex]?.fps || 0,
        gpuUsage: hardwareData[hwIndex]?.gpuUsage || 0,
        cpuUsage: hardwareData[hwIndex]?.cpuUsage || 0,
        frameTime: frameTime,
        process: fpsData[fpsIndex]?.process || "Unknown",
        index: i,
      });
    }
  } else {
    // Fallback: use only FPS data with 0% usage values
    mergedData = fpsData.map((point, index) => {
      // Get frameTime data if available
      let frameTime = 0;
      if (props.frametimeData && props.frametimeData.length > 0) {
        const ftIndex = Math.floor(
          (index / fpsData.length) * props.frametimeData.length
        );
        frameTime = props.frametimeData[ftIndex]?.frameTime || 0;
      }

      return {
        ...point,
        gpuUsage: 0,
        cpuUsage: 0,
        frameTime: frameTime,
      };
    });
  }

  // Smart sampling to reduce points and smooth the graph
  const maxPoints = 250; // Maximum number of points to display
  let sampledData = mergedData;

  if (mergedData.length > maxPoints) {
    // Calculate sampling ratio
    const ratio = mergedData.length / maxPoints;
    sampledData = [];

    // Always keep first and last points
    sampledData.push(mergedData[0]);

    for (let i = 1; i < mergedData.length - 1; i += ratio) {
      const index = Math.floor(i);
      if (index < mergedData.length) {
        // Apply light smoothing using simple moving average (window of 3)
        const prev = mergedData[Math.max(0, index - 1)];
        const curr = mergedData[index];
        const next = mergedData[Math.min(mergedData.length - 1, index + 1)];

        sampledData.push({
          fps: (prev.fps + curr.fps + next.fps) / 3,
          gpuUsage: (prev.gpuUsage + curr.gpuUsage + next.gpuUsage) / 3,
          cpuUsage: (prev.cpuUsage + curr.cpuUsage + next.cpuUsage) / 3,
          process: curr.process,
          index: index,
        });
      }
    }

    // Always keep last point
    if (mergedData.length > 1) {
      sampledData.push(mergedData[mergedData.length - 1]);
    }
  }

  // Calculate positions for each data point
  return sampledData.map((point, index, array) => {
    const x = (index / Math.max(1, array.length - 1)) * chartWidth.value;

    // FPS positioning (using FPS min/max range)
    const fpsValues = array.map((p) => p.fps);
    const minFps = Math.min(...fpsValues);
    const maxFps = Math.max(...fpsValues);
    const fpsY =
      chartHeight.value -
      ((point.fps - minFps) / (maxFps - minFps)) * chartHeight.value;

    // Usage positioning (0-100% range)
    const gpuUsageY =
      chartHeight.value - (point.gpuUsage / 100) * chartHeight.value;
    const cpuUsageY =
      chartHeight.value - (point.cpuUsage / 100) * chartHeight.value;

    // Frame Time positioning (scale to 0-100ms range for display)
    const maxFrameTimeForScale = 100; // 100ms max for scaling
    const frameTimeY =
      chartHeight.value -
      Math.min(point.frameTime / maxFrameTimeForScale, 1) * chartHeight.value;

    return {
      ...point,
      x: Math.max(0, Math.min(chartWidth.value, x)),
      fpsY: Math.max(5, Math.min(chartHeight.value - 5, fpsY)),
      gpuUsageY: Math.max(5, Math.min(chartHeight.value - 5, gpuUsageY)),
      cpuUsageY: Math.max(5, Math.min(chartHeight.value - 5, cpuUsageY)),
      frameTimeY: Math.max(5, Math.min(chartHeight.value - 5, frameTimeY)),
    };
  });
});

const currentApp = computed(() => {
  if (props.data.length === 0) return "Aucune application";
  const firstProcess = props.data[0]?.PROCESS || "Unknown";
  return firstProcess.replace(/\.exe$/i, "").replace(/.*[\\/]/, "");
});

const sessionDuration = computed(() => {
  if (props.data.length < 2) return 0;

  // Try to calculate duration from timestamps
  const firstTimestamp =
    props.data[0]?.["TIME STAMP"] || props.data[0]?.Timestamp;
  const lastTimestamp =
    props.data[props.data.length - 1]?.["TIME STAMP"] ||
    props.data[props.data.length - 1]?.Timestamp;

  if (firstTimestamp && lastTimestamp) {
    try {
      // Parse timestamps (format: "2025-06-29 19:33:30.230")
      const startTime = new Date(firstTimestamp);
      const endTime = new Date(lastTimestamp);

      if (!isNaN(startTime.getTime()) && !isNaN(endTime.getTime())) {
        const durationMs = endTime.getTime() - startTime.getTime();
        return Math.floor(durationMs / 1000); // Return duration in seconds
      }
    } catch {
      console.warn("Could not parse timestamps, falling back to estimation");
    }
  }

  // Fallback: estimate based on sample count (assuming ~250ms between samples)
  return Math.floor(chartData.value.length * 0.25); // 0.25 seconds per sample
});

const sessionDurationFormatted = computed(() => {
  const totalSeconds = sessionDuration.value;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
});

// FPS Statistics
const fpsValues = computed(() => chartData.value.map((point) => point.fps));
const minFpsValue = computed(() =>
  fpsValues.value.length > 0 ? Math.min(...fpsValues.value) : 0
);
const maxFpsValue = computed(() =>
  fpsValues.value.length > 0 ? Math.max(...fpsValues.value) : 100
);
const minFps = computed(() => minFpsValue.value.toFixed(1));
const maxFps = computed(() => maxFpsValue.value.toFixed(1));
const avgFps = computed(() => {
  if (fpsValues.value.length === 0) return "0";
  const avg =
    fpsValues.value.reduce((a, b) => a + b, 0) / fpsValues.value.length;
  return avg.toFixed(1);
});

// GPU Usage Statistics
const gpuUsageValues = computed(() =>
  chartData.value.map((point) => point.gpuUsage)
);
const minGpuUsageValue = computed(() =>
  gpuUsageValues.value.length > 0 ? Math.min(...gpuUsageValues.value) : 0
);
const maxGpuUsageValue = computed(() =>
  gpuUsageValues.value.length > 0 ? Math.max(...gpuUsageValues.value) : 100
);
const minGpuUsage = computed(() => minGpuUsageValue.value.toFixed(1));
const maxGpuUsage = computed(() => maxGpuUsageValue.value.toFixed(1));
const avgGpuUsage = computed(() => {
  if (gpuUsageValues.value.length === 0) return "0";
  const avg =
    gpuUsageValues.value.reduce((a, b) => a + b, 0) /
    gpuUsageValues.value.length;
  return avg.toFixed(1);
});

// CPU Usage Statistics
const cpuUsageValues = computed(() =>
  chartData.value.map((point) => point.cpuUsage)
);
const minCpuUsageValue = computed(() =>
  cpuUsageValues.value.length > 0 ? Math.min(...cpuUsageValues.value) : 0
);
const maxCpuUsageValue = computed(() =>
  cpuUsageValues.value.length > 0 ? Math.max(...cpuUsageValues.value) : 100
);
const minCpuUsage = computed(() => minCpuUsageValue.value.toFixed(1));
const maxCpuUsage = computed(() => maxCpuUsageValue.value.toFixed(1));
const avgCpuUsage = computed(() => {
  if (cpuUsageValues.value.length === 0) return "0";
  const avg =
    cpuUsageValues.value.reduce((a, b) => a + b, 0) /
    cpuUsageValues.value.length;
  return avg.toFixed(1);
});

// Frame Time Statistics
const frameTimeValues = computed(() =>
  chartData.value.map((point) => point.frameTime).filter((ft) => ft > 0)
);
const minFrameTimeValue = computed(() =>
  frameTimeValues.value.length > 0 ? Math.min(...frameTimeValues.value) : 0
);
const maxFrameTimeValue = computed(() =>
  frameTimeValues.value.length > 0 ? Math.max(...frameTimeValues.value) : 0
);
const minFrameTime = computed(() => minFrameTimeValue.value.toFixed(1));
const maxFrameTime = computed(() => maxFrameTimeValue.value.toFixed(1));
const avgFrameTime = computed(() => {
  if (frameTimeValues.value.length === 0) return "0";
  const avg =
    frameTimeValues.value.reduce((a, b) => a + b, 0) /
    frameTimeValues.value.length;
  return avg.toFixed(1);
});

// Line paths for SVG
const fpsLinePath = computed(() => {
  if (chartData.value.length === 0) return "";
  let path = `M ${chartData.value[0].x} ${chartData.value[0].fpsY}`;
  for (let i = 1; i < chartData.value.length; i++) {
    path += ` L ${chartData.value[i].x} ${chartData.value[i].fpsY}`;
  }
  return path;
});

const gpuUsageLinePath = computed(() => {
  if (chartData.value.length === 0) return "";
  let path = `M ${chartData.value[0].x} ${chartData.value[0].gpuUsageY}`;
  for (let i = 1; i < chartData.value.length; i++) {
    path += ` L ${chartData.value[i].x} ${chartData.value[i].gpuUsageY}`;
  }
  return path;
});

const cpuUsageLinePath = computed(() => {
  if (chartData.value.length === 0) return "";
  let path = `M ${chartData.value[0].x} ${chartData.value[0].cpuUsageY}`;
  for (let i = 1; i < chartData.value.length; i++) {
    path += ` L ${chartData.value[i].x} ${chartData.value[i].cpuUsageY}`;
  }
  return path;
});

// Frame Time Line Path
const frameTimeLinePath = computed(() => {
  if (props.frametimeData.length === 0) return "";
  let path = `M ${chartData.value[0].x} ${chartData.value[0].frameTimeY}`;
  for (let i = 1; i < chartData.value.length; i++) {
    path += ` L ${chartData.value[i].x} ${chartData.value[i].frameTimeY}`;
  }
  return path;
});

// Grid lines for FPS (left axis)
const horizontalGridLinesFps = computed(() => {
  const lines = [];
  const step = (maxFpsValue.value - minFpsValue.value) / 5;

  for (let i = 0; i <= 5; i++) {
    const fps = minFpsValue.value + step * i;
    const y =
      chartHeight.value -
      ((fps - minFpsValue.value) / (maxFpsValue.value - minFpsValue.value)) *
        chartHeight.value;
    lines.push({ y, fps });
  }

  return lines;
});

// Grid lines for Usage (right axis)
const horizontalGridLinesUsage = computed(() => {
  const lines = [];

  for (let i = 0; i <= 5; i++) {
    const usage = i * 20; // 0%, 20%, 40%, 60%, 80%, 100%
    const y = chartHeight.value - (usage / 100) * chartHeight.value;
    lines.push({ y, usage });
  }

  return lines;
});

const verticalGridLines = computed(() => {
  const lines = [];
  const step = chartWidth.value / 10;

  for (let i = 0; i <= 10; i++) {
    lines.push({ x: i * step });
  }

  return lines;
});

// Axis labels
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
</script>

<style scoped>
.multi-axis-chart-container {
  width: 100%;
  height: 700px;
  min-height: 650px;
  display: flex;
  flex-direction: column;
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
  overflow: hidden;
}

.chart-header {
  flex-shrink: 0;
}

.legend-section {
  flex-shrink: 0;
  flex-grow: 0;
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  max-height: 200px;
  overflow-y: auto;
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
  padding-bottom: 2rem;
  overflow: visible;
  min-height: 0;
}

.line-chart-svg {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.fps-line {
  filter: drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3));
}

.gpu-line {
  filter: drop-shadow(0 1px 2px rgba(16, 185, 129, 0.3));
}

.cpu-line {
  filter: drop-shadow(0 1px 2px rgba(249, 115, 22, 0.3));
}

.frametime-line {
  filter: drop-shadow(0 1px 2px rgba(124, 58, 234, 0.3));
}

.chart-labels {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.y-labels-left {
  position: absolute;
  left: -70px;
  top: 1rem;
  bottom: 1rem;
}

.y-labels-right {
  position: absolute;
  right: -40px;
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
  bottom: -40px;
  height: 30px;
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
  min-width: 100px;
  max-width: 150px;
  background: rgba(249, 250, 251, 0.8);
  border-radius: 12px;
  padding: 0.75rem;
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
.text-orange-600 {
  color: #ea580c;
}
.text-purple-600 {
  color: #7c3aed;
}
.bg-green-500 {
  background-color: #10b981;
}
.bg-blue-500 {
  background-color: #3b82f6;
}
.bg-orange-500 {
  background-color: #f97316;
}
.bg-purple-500 {
  background-color: #7c3aed;
}

/* Visibility Controls */
.visibility-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.visibility-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.visibility-btn:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.visibility-btn.active {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #1d4ed8;
}

.visibility-btn.fps-btn.active {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #1d4ed8;
}

.visibility-btn.gpu-btn.active {
  border-color: #10b981;
  background: #ecfdf5;
  color: #047857;
}

.visibility-btn.cpu-btn.active {
  border-color: #f97316;
  background: #fff7ed;
  color: #c2410c;
}

.visibility-btn.frametime-btn.active {
  border-color: #7c3aed;
  background: #f5f3ff;
  color: #5b21b6;
}

.btn-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.visibility-btn:not(.active) .btn-color {
  opacity: 0.4;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.text-gray-700 {
  color: #374151;
}

/* Chart Title */
.chart-title {
  margin-bottom: 1rem;
}

/* Axis Labels */
.axis-label {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  user-select: none;
  fill: #374151 !important;
  font-weight: 600;
}

/* Chart Container */
.line-chart-container {
  position: relative;
  margin: 0 auto;
  padding: 0 60px;
  padding-bottom: 40px;
  width: 100%;
  min-height: 400px;
}

/* SVG Chart */
.line-chart-svg {
  width: 100%;
  height: 100%;
  min-height: 400px;
  max-height: 500px;
  overflow: visible;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .multi-axis-chart-container {
    height: 620px;
    min-height: 580px;
  }

  .line-chart-container {
    padding: 0 40px;
    padding-bottom: 30px;
    min-height: 350px;
  }

  .legend-section {
    max-height: 180px;
  }
}

@media (max-width: 768px) {
  .multi-axis-chart-container {
    height: 550px;
    min-height: 520px;
  }

  .line-chart-container {
    padding: 0 20px;
    padding-bottom: 20px;
    min-height: 300px;
  }

  .line-chart-svg {
    min-height: 300px;
    max-height: 350px;
  }

  .legend-section {
    max-height: 160px;
    padding: 0.75rem;
  }

  .chart-summary {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .summary-item {
    min-width: 80px;
    max-width: 120px;
    padding: 0.5rem;
  }
}

/* Chart Points */
.chart-point {
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0;
  animation: fadeInPoints 1s ease-out 0.5s forwards;
}

.chart-point:hover {
  r: 5;
  opacity: 1 !important;
}

.fps-point:hover {
  filter: drop-shadow(0 0 8px #3b82f6);
}

.gpu-point:hover {
  filter: drop-shadow(0 0 6px #10b981);
}

.cpu-point:hover {
  filter: drop-shadow(0 0 6px #f97316);
}

.frametime-point:hover {
  filter: drop-shadow(0 0 6px #7c3aed);
}

@keyframes fadeInPoints {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.7;
  }
}

/* Tooltip */
.chart-tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  pointer-events: none;
  z-index: 1000;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
}

.tooltip-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tooltip-title {
  font-weight: 600;
  color: #e5e7eb;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tooltip-value {
  font-weight: 700;
  font-size: 14px;
  color: white;
}

.tooltip-time {
  font-size: 10px;
  color: #9ca3af;
  margin-top: 2px;
}
</style>
