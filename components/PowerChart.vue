<template>
  <div class="power-chart-container">
    <div v-if="!data || data.length === 0" class="no-data">
      <p class="text-gray-500">Aucune donnée de consommation disponible</p>
    </div>
    <div v-else class="chart-wrapper">
      <!-- Chart Header -->
      <div class="chart-header mb-4">
        <div class="flex justify-between items-center">
          <div class="stats-summary text-sm text-gray-600">
            <span>Max GPU: {{ maxGpuPower }}W</span>
            <span class="ml-3">Max CPU: {{ maxCpuPower }}W</span>
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
  const maxPoints = 50;
  const step = Math.max(1, Math.floor(props.data.length / maxPoints));

  return props.data
    .filter((_, index) => index % step === 0)
    .slice(0, maxPoints)
    .map((item, index) => ({
      index,
      gpuPower: parseFloat(item["GPU BRD PWR"]) || 0,
      cpuPower:
        parseFloat(item["CPU POWER"]) || parseFloat(item["CPU PWR"]) || 0,
      gpuUtil: parseFloat(item["GPU UTIL"]) || 0,
      cpuUtil: parseFloat(item["CPU UTIL"]) || 0,
      timestamp: item["DATE"] || `Point ${index + 1}`,
    }))
    .filter(
      (point) =>
        point.gpuPower > 0 ||
        point.cpuPower > 0 ||
        point.gpuUtil > 0 ||
        point.cpuUtil > 0
    );
});

// Chart data configuration
const chartData = computed(() => ({
  labels: processedData.value.map((point) => point.timestamp),
  datasets: [
    // Bar datasets for power consumption
    {
      type: "bar",
      label: "GPU POWER",
      data: processedData.value.map((point) => point.gpuPower),
      backgroundColor: "rgba(234, 179, 8, 0.7)",
      borderColor: "rgba(234, 179, 8, 1)",
      borderWidth: 1,
      yAxisID: "y",
      order: 3,
    },
    {
      type: "bar",
      label: "CPU POWER",
      data: processedData.value.map((point) => point.cpuPower),
      backgroundColor: "rgba(249, 115, 22, 0.7)",
      borderColor: "rgba(249, 115, 22, 1)",
      borderWidth: 1,
      yAxisID: "y",
      order: 4,
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
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: "rgba(168, 85, 247, 1)",
      yAxisID: "y1",
      order: 1,
    },
    {
      type: "line",
      label: "CPU UTIL",
      data: processedData.value.map((point) => point.cpuUtil),
      borderColor: "rgba(59, 130, 246, 1)",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      borderWidth: 2,
      fill: false,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: "rgba(59, 130, 246, 1)",
      yAxisID: "y1",
      order: 2,
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
          if (label === "GPU POWER" || label === "CPU POWER") {
            return `${label}: ${value}W`;
          } else if (label === "GPU UTIL" || label === "CPU UTIL") {
            return `${label}: ${value}%`;
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
        text: "Temps",
        font: {
          size: 14,
          weight: "bold",
        },
      },
      ticks: {
        maxTicksLimit: 10,
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
        text: "Consommation (W)",
        color: "rgba(234, 179, 8, 1)",
        font: {
          size: 14,
          weight: "bold",
        },
      },
      ticks: {
        callback: function (value) {
          return value + "W";
        },
        color: "rgba(234, 179, 8, 0.8)",
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
        color: "rgba(168, 85, 247, 1)",
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
        color: "rgba(168, 85, 247, 0.8)",
        font: {
          size: 11,
        },
      },
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
const maxGpuPower = computed(() => {
  const powers = processedData.value
    .map((p) => p.gpuPower)
    .filter((p) => p > 0);
  return powers.length > 0 ? Math.max(...powers).toFixed(0) : "0";
});

const maxCpuPower = computed(() => {
  const powers = processedData.value
    .map((p) => p.cpuPower)
    .filter((p) => p > 0);
  return powers.length > 0 ? Math.max(...powers).toFixed(0) : "0";
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
.power-chart-container {
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
