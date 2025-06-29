<template>
  <div class="relative">
    <canvas ref="chartCanvas" class="w-full h-full"></canvas>
  </div>
</template>

<script setup>
import { Chart, registerables } from "chart.js";

// Register Chart.js components
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
  const fpsData = props.data.map((row) => parseFloat(row.FPS) || 0);
  const frameTimeData = props.data.map(
    (row) => parseFloat(row["AVG FRAME TIME"]) || 0
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
          label: "FPS",
          data: fpsData,
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          tension: 0.1,
          yAxisID: "y",
        },
        {
          label: "Frame Time (ms)",
          data: frameTimeData,
          borderColor: "rgb(251, 191, 36)",
          backgroundColor: "rgba(251, 191, 36, 0.1)",
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
          text: "Performance FPS et Frame Time",
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
            text: "FPS",
          },
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
            text: "Frame Time (ms)",
          },
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
