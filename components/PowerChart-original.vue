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
  const gpuPowerData = props.data.map(
    (row) => parseFloat(row["GPU BRD PWR"]) || 0
  );
  const cpuPowerData = props.data.map(
    (row) => parseFloat(row["CPU POWER"]) || 0
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
          label: "GPU Power (W)",
          data: gpuPowerData,
          borderColor: "rgb(251, 191, 36)",
          backgroundColor: "rgba(251, 191, 36, 0.1)",
          tension: 0.1,
          fill: true,
        },
        {
          label: "CPU Power (W)",
          data: cpuPowerData,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.1,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Consommation Électrique",
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
            text: "Puissance (W)",
          },
          beginAtZero: true,
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
