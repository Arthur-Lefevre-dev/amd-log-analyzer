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
  const gpuTempData = props.data.map((row) => parseFloat(row["GPU TEMP"]) || 0);
  const gpuHotspotData = props.data.map(
    (row) => parseFloat(row["GPU HOTSPOT TEMP"]) || 0
  );
  const cpuTempData = props.data.map(
    (row) => parseFloat(row["CPU TEMPERATURE"]) || 0
  );
  const gpuMemTempData = props.data.map(
    (row) => parseFloat(row["GPU MEM TEMP"]) || 0
  );

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "GPU Temp (°C)",
          data: gpuTempData,
          borderColor: "rgb(239, 68, 68)",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.1,
        },
        {
          label: "GPU Hotspot (°C)",
          data: gpuHotspotData,
          borderColor: "rgb(220, 38, 127)",
          backgroundColor: "rgba(220, 38, 127, 0.1)",
          tension: 0.1,
        },
        {
          label: "CPU Temp (°C)",
          data: cpuTempData,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.1,
        },
        {
          label: "GPU Mem Temp (°C)",
          data: gpuMemTempData,
          borderColor: "rgb(251, 146, 60)",
          backgroundColor: "rgba(251, 146, 60, 0.1)",
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Températures des Composants",
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
          display: true,
          title: {
            display: true,
            text: "Température (°C)",
          },
          min: 30,
          max: 100,
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
