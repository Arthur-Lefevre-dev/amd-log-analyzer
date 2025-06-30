<template>
  <div class="temp-chart-container">
    <div v-if="!data || data.length === 0" class="no-data">
      <p class="text-gray-500">Aucune donnée de température disponible</p>
    </div>
    <div v-else class="chart-wrapper">
      <!-- Chart Header -->
      <div class="chart-header mb-4">
        <div class="flex justify-between items-center">
          <div class="stats-summary text-sm text-gray-600">
            <span>Max GPU: {{ maxGpuTemp }}°C</span>
            <span class="ml-3">Max CPU: {{ maxCpuTemp }}°C</span>
            <span class="ml-3">GPU Util: {{ maxGpuUtil }}%</span>
            <span class="ml-3">CPU Util: {{ maxCpuUtil }}%</span>
          </div>
        </div>
      </div>

      <!-- Chart.js Chart -->
      <div class="chart-container" style="height: 350px; position: relative">
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
});

// Computed properties for data processing
const processedData = computed(() => {
  // Display all data points for more detailed view
  return props.data
    .map((item, index) => ({
      index,
      gpuTemp: parseFloat(item["GPU TEMP"]) || 0,
      gpuHotspotTemp: parseFloat(item["GPU HOTSPOT TEMP"]) || 0,
      gpuMemTemp: parseFloat(item["GPU MEM TEMP"]) || 0,
      cpuTemp:
        parseFloat(item["CPU TEMPERATURE"]) ||
        parseFloat(item["CPU TEMP"]) ||
        0,
      gpuFan: parseFloat(item["GPU FAN"]) || 0,
      gpuUtil: parseFloat(item["GPU UTIL"]) || 0,
      cpuUtil: parseFloat(item["CPU UTIL"]) || 0,
      timestamp: item["DATE"] || `Point ${index + 1}`,
    }))
    .filter(
      (point) =>
        point.gpuTemp > 0 ||
        point.cpuTemp > 0 ||
        point.gpuHotspotTemp > 0 ||
        point.gpuMemTemp > 0 ||
        point.gpuFan > 0 ||
        point.gpuUtil > 0 ||
        point.cpuUtil > 0
    );
});

// Chart data configuration
const chartData = computed(() => ({
  labels: processedData.value.map((point) => point.timestamp),
  datasets: [
    // Bar datasets for temperatures
    {
      type: "bar",
      label: "GPU TEMP",
      data: processedData.value.map((point) => point.gpuTemp),
      backgroundColor: "rgba(239, 68, 68, 0.7)",
      borderColor: "rgba(239, 68, 68, 1)",
      borderWidth: 1,
      yAxisID: "y",
      order: 4,
    },
    {
      type: "bar",
      label: "GPU HOTSPOT TEMP",
      data: processedData.value.map((point) => point.gpuHotspotTemp),
      backgroundColor: "rgba(220, 38, 38, 0.7)",
      borderColor: "rgba(220, 38, 38, 1)",
      borderWidth: 1,
      yAxisID: "y",
      order: 5,
    },
    {
      type: "bar",
      label: "GPU MEM TEMP",
      data: processedData.value.map((point) => point.gpuMemTemp),
      backgroundColor: "rgba(251, 113, 133, 0.7)",
      borderColor: "rgba(251, 113, 133, 1)",
      borderWidth: 1,
      yAxisID: "y",
      order: 6,
    },
    {
      type: "bar",
      label: "CPU TEMPERATURE",
      data: processedData.value.map((point) => point.cpuTemp),
      backgroundColor: "rgba(59, 130, 246, 0.7)",
      borderColor: "rgba(59, 130, 246, 1)",
      borderWidth: 1,
      yAxisID: "y",
      order: 7,
    },
    // Line dataset for GPU FAN
    {
      type: "line",
      label: "GPU FAN",
      data: processedData.value.map((point) => point.gpuFan),
      borderColor: "rgba(34, 197, 94, 1)",
      backgroundColor: "rgba(34, 197, 94, 0.1)",
      borderWidth: 3,
      fill: false,
      tension: 0.4,
      pointRadius: 1,
      pointHoverRadius: 3,
      pointBackgroundColor: "rgba(34, 197, 94, 1)",
      borderDash: [8, 4],
      yAxisID: "y1",
      order: 1,
    },
    // Line datasets for utilization
    {
      type: "line",
      label: "GPU UTIL",
      data: processedData.value.map((point) => point.gpuUtil),
      borderColor: "rgba(168, 85, 247, 1)",
      backgroundColor: "rgba(168, 85, 247, 0.1)",
      borderWidth: 2,
      fill: false,
      tension: 0.4,
      pointRadius: 1,
      pointHoverRadius: 3,
      pointBackgroundColor: "rgba(168, 85, 247, 1)",
      yAxisID: "y2",
      order: 2,
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
      pointRadius: 1,
      pointHoverRadius: 3,
      pointBackgroundColor: "rgba(249, 115, 22, 1)",
      yAxisID: "y2",
      order: 3,
    },
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
          if (label === "GPU FAN") {
            return `${label}: ${value} RPM`;
          } else if (label === "GPU UTIL" || label === "CPU UTIL") {
            return `${label}: ${value}%`;
          } else {
            return `${label}: ${value}°C`;
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
        text: "Temps",
        font: {
          size: 14,
          weight: "bold",
        },
      },
      ticks: {
        maxTicksLimit: 15,
        maxRotation: 45,
        font: {
          size: 10,
        },
      },
    },
    y: {
      type: "linear",
      display: true,
      position: "left",
      title: {
        display: true,
        text: "Température (°C)",
        color: "rgba(239, 68, 68, 1)",
        font: {
          size: 14,
          weight: "bold",
        },
      },
      ticks: {
        callback: function (value) {
          return value + "°C";
        },
        color: "rgba(239, 68, 68, 0.8)",
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
        text: "Vitesse Ventilateur (RPM)",
        color: "rgba(34, 197, 94, 1)",
        font: {
          size: 14,
          weight: "bold",
        },
      },
      ticks: {
        callback: function (value) {
          return value + " RPM";
        },
        color: "rgba(34, 197, 94, 0.8)",
        font: {
          size: 11,
        },
      },
      grid: {
        drawOnChartArea: false,
      },
    },

    y2: {
      type: "linear",
      display: false,
      position: "right",
      min: 0,
      max: 100,
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
      radius: 3,
      hoverRadius: 5,
    },
  },
}));

// Statistics
const maxGpuTemp = computed(() => {
  const temps = processedData.value.map((p) => p.gpuTemp).filter((t) => t > 0);
  return temps.length > 0 ? Math.max(...temps).toFixed(1) : "0";
});

const maxCpuTemp = computed(() => {
  const temps = processedData.value.map((p) => p.cpuTemp).filter((t) => t > 0);
  return temps.length > 0 ? Math.max(...temps).toFixed(1) : "0";
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
.temp-chart-container {
  width: 100%;
  height: 450px;
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

.font-semibold {
  font-weight: 600;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-600 {
  color: #4b5563;
}

.text-sm {
  font-size: 0.875rem;
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
