<template>
  <div class="fps-chart-container">
    <div v-if="!data || data.length === 0" class="no-data">
      <p class="text-gray-500">Aucune donnée de performance disponible</p>
    </div>
    <div v-else class="chart-wrapper">
      <!-- Chart Header -->
      <div class="chart-header mb-4">
        <div class="flex justify-between items-center">
          <div class="app-details">
            <h4 class="font-semibold text-lg">{{ currentApp }}</h4>
            <p class="text-sm text-gray-600">
              Session: {{ sessionDurationFormatted }}
            </p>
          </div>
          <div class="stats-summary text-sm text-gray-600">
            <span>FPS Moy: {{ avgFps }}</span>
            <span class="ml-3">FPS Min: {{ minFps }}</span>
            <span class="ml-3">GPU: {{ maxGpuUtil }}%</span>
            <span class="ml-3">CPU: {{ maxCpuUtil }}%</span>
          </div>
        </div>
      </div>

      <!-- Chart.js Chart -->
      <div class="chart-container" style="height: 400px; position: relative">
        <Bar ref="chart" :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "vue-chartjs";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

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

// Computed properties for app info
const currentApp = computed(() => {
  if (!props.data || props.data.length === 0) return "Application inconnue";

  const firstEntry = props.data[0];
  return firstEntry["Application"] || firstEntry["App"] || "Gaming Session";
});

const sessionDurationFormatted = computed(() => {
  if (!props.data || props.data.length < 2) return "0:00";

  const duration = props.data.length * 0.1; // Approximation
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
});

// Computed properties for data processing
const processedData = computed(() => {
  const maxPoints = 80;
  const step = Math.max(1, Math.floor(props.data.length / maxPoints));

  return props.data
    .filter((_, index) => index % step === 0)
    .slice(0, maxPoints)
    .map((item, index) => {
      // Find corresponding hardware data
      const hardwarePoint =
        props.hardwareData?.find(
          (hw) => Math.abs(new Date(hw["DATE"]) - new Date(item["DATE"])) < 1000
        ) || {};

      return {
        index,
        fps: parseFloat(item["FPS"]) || parseFloat(item["Fps"]) || 0,
        frameTime:
          parseFloat(item["Frame Time"]) || parseFloat(item["MsPerFrame"]) || 0,
        gpuUtil: parseFloat(hardwarePoint["GPU UTIL"]) || 0,
        cpuUtil: parseFloat(hardwarePoint["CPU UTIL"]) || 0,
        timestamp: item["DATE"] || `${index}s`,
      };
    })
    .filter((point) => point.fps > 0 || point.gpuUtil > 0 || point.cpuUtil > 0);
});

// Chart data configuration
const chartData = computed(() => ({
  labels: processedData.value.map((point, index) => {
    // Simplified time labels
    return `${Math.floor(index * 0.5)}s`;
  }),
  datasets: [
    // Bar dataset for FPS
    {
      type: "bar",
      label: "FPS",
      data: processedData.value.map((point) => point.fps),
      backgroundColor: "rgba(59, 130, 246, 0.7)",
      borderColor: "rgba(59, 130, 246, 1)",
      borderWidth: 1,
      yAxisID: "y",
      order: 3,
    },
    // Line datasets for utilization
    {
      type: "line",
      label: "GPU UTIL",
      data: processedData.value.map((point) => point.gpuUtil),
      borderColor: "rgba(16, 185, 129, 1)",
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      borderWidth: 2,
      fill: false,
      tension: 0.4,
      pointRadius: 2,
      pointHoverRadius: 4,
      pointBackgroundColor: "rgba(16, 185, 129, 1)",
      yAxisID: "y1",
      order: 1,
    },
    {
      type: "line",
      label: "CPU UTIL",
      data: processedData.value.map((point) => point.cpuUtil),
      borderColor: "rgba(249, 115, 22, 1)",
      backgroundColor: "rgba(249, 115, 22, 0.1)",
      borderWidth: 2,
      fill: false,
      tension: 0.4,
      pointRadius: 2,
      pointHoverRadius: 4,
      pointBackgroundColor: "rgba(249, 115, 22, 1)",
      yAxisID: "y1",
      order: 2,
    },
    // Optional Frame Time line (if data available)
    ...(processedData.value.some((p) => p.frameTime > 0)
      ? [
          {
            type: "line",
            label: "Frame Time",
            data: processedData.value.map((point) => point.frameTime),
            borderColor: "rgba(124, 58, 237, 1)",
            backgroundColor: "rgba(124, 58, 237, 0.1)",
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 2,
            pointHoverRadius: 4,
            pointBackgroundColor: "rgba(124, 58, 237, 1)",
            borderDash: [5, 5],
            yAxisID: "y2",
            order: 4,
          },
        ]
      : []),
  ],
}));

// Chart options configuration
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: "index",
    intersect: false,
  },
  plugins: {
    title: {
      display: false,
    },
    legend: {
      display: true,
      position: "top",
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "#fff",
      bodyColor: "#fff",
      borderColor: "rgba(255, 255, 255, 0.1)",
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      callbacks: {
        label: function (context) {
          const label = context.dataset.label || "";
          const value = context.parsed.y;
          if (label === "FPS") {
            return `${label}: ${value} fps`;
          } else if (label === "GPU UTIL" || label === "CPU UTIL") {
            return `${label}: ${value}%`;
          } else if (label === "Frame Time") {
            return `${label}: ${value}ms`;
          } else {
            return `${label}: ${value}`;
          }
        },
      },
    },
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: "Temps de session",
        font: {
          size: 14,
          weight: "bold",
        },
      },
      ticks: {
        maxTicksLimit: 15,
        font: {
          size: 11,
        },
      },
    },
    y: {
      type: "linear",
      display: true,
      position: "left",
      title: {
        display: true,
        text: "FPS",
        color: "rgba(59, 130, 246, 1)",
        font: {
          size: 14,
          weight: "bold",
        },
      },
      ticks: {
        callback: function (value) {
          return value + " fps";
        },
        color: "rgba(59, 130, 246, 0.8)",
        font: {
          size: 11,
        },
      },
      grid: {
        color: "rgba(0, 0, 0, 0.1)",
      },
    },
    y1: {
      type: "linear",
      display: true,
      position: "right",
      title: {
        display: true,
        text: "Utilisation (%)",
        color: "rgba(16, 185, 129, 1)",
        font: {
          size: 14,
          weight: "bold",
        },
      },
      min: 0,
      max: 100,
      ticks: {
        callback: function (value) {
          return value + "%";
        },
        color: "rgba(16, 185, 129, 0.8)",
        font: {
          size: 11,
        },
      },
      grid: {
        drawOnChartArea: false,
      },
    },
    // Optional third axis for Frame Time
    y2: {
      type: "linear",
      display: false,
      position: "right",
      min: 0,
      grid: {
        drawOnChartArea: false,
      },
    },
  },
  elements: {
    bar: {
      borderRadius: 2,
    },
    point: {
      radius: 2,
      hoverRadius: 4,
    },
  },
}));

// Statistics
const avgFps = computed(() => {
  const fps = processedData.value.map((p) => p.fps).filter((f) => f > 0);
  return fps.length > 0
    ? (fps.reduce((a, b) => a + b, 0) / fps.length).toFixed(1)
    : "0";
});

const minFps = computed(() => {
  const fps = processedData.value.map((p) => p.fps).filter((f) => f > 0);
  return fps.length > 0 ? Math.min(...fps).toFixed(0) : "0";
});

const maxGpuUtil = computed(() => {
  const utils = processedData.value.map((p) => p.gpuUtil).filter((u) => u > 0);
  return utils.length > 0 ? Math.max(...utils).toFixed(1) : "0";
});

const maxCpuUtil = computed(() => {
  const utils = processedData.value.map((p) => p.cpuUtil).filter((u) => u > 0);
  return utils.length > 0 ? Math.max(...utils).toFixed(1) : "0";
});
</script>

<style scoped>
.fps-chart-container {
  width: 100%;
  height: 500px;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
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

.chart-container {
  flex: 1;
  min-height: 0;
}

.app-details h4 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.app-details p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.stats-summary {
  font-size: 0.875rem;
  color: #4b5563;
}

.font-semibold {
  font-weight: 600;
}

.text-lg {
  font-size: 1.125rem;
}

.text-sm {
  font-size: 0.875rem;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-600 {
  color: #4b5563;
}

.mb-4 {
  margin-bottom: 1rem;
}

.ml-3 {
  margin-left: 0.75rem;
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
</style>
