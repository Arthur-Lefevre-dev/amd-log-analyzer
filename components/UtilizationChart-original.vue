<template>
  <div class="relative">
    <canvas ref="chartCanvas" class="w-full h-full"></canvas>
  </div>
</template>

<script setup>
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
});

const chartCanvas = ref(null);
let chartInstance = null;

const createChart = () => {
  if (!chartCanvas.value || !props.data?.length) return;

  const ctx = chartCanvas.value.getContext("2d");

  // Prepare data for Chart.js
  const labels = props.data.map((_, index) => `${index + 1}`);
  const gpuUtilData = props.data.map((row) => parseFloat(row["GPU UTIL"]) || 0);
  const cpuUtilData = props.data.map((row) => parseFloat(row["CPU UTIL"]) || 0);
  const memUtilData = props.data.map(
    (row) => parseFloat(row["SYSTEM MEM UTIL"]) || 0
  );
  const gpuMemUtilData = props.data.map(
    (row) => parseFloat(row["GPU MEM UTIL"]) / 1000 || 0
  ); // Convert MB to GB

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "GPU Util (%)",
          data: gpuUtilData,
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          tension: 0.1,
          yAxisID: "y",
        },
        {
          label: "CPU Util (%)",
          data: cpuUtilData,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.1,
          yAxisID: "y",
        },
        {
          label: "System Memory (%)",
          data: memUtilData,
          borderColor: "rgb(168, 85, 247)",
          backgroundColor: "rgba(168, 85, 247, 0.1)",
          tension: 0.1,
          yAxisID: "y",
        },
        {
          label: "GPU Memory (GB)",
          data: gpuMemUtilData,
          borderColor: "rgb(239, 68, 68)",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.1,
          yAxisID: "y1",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Utilisation des Ressources",
        },
        legend: {
          display: true,
          position: "top",
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Échantillons",
          },
        },
        y: {
          type: "linear",
          display: true,
          position: "left",
          title: {
            display: true,
            text: "Utilisation (%)",
          },
          min: 0,
          max: 100,
          grid: {
            drawOnChartArea: false,
          },
        },
        y1: {
          type: "linear",
          display: true,
          position: "right",
          title: {
            display: true,
            text: "Mémoire GPU (GB)",
          },
          min: 0,
          grid: {
            drawOnChartArea: false,
          },
        },
      },
      interaction: {
        mode: "index",
        intersect: false,
      },
    },
  });
};

onMounted(() => {
  nextTick(() => {
    createChart();
  });
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});

watch(
  () => props.data,
  () => {
    nextTick(() => {
      createChart();
    });
  },
  { deep: true }
);
</script>
