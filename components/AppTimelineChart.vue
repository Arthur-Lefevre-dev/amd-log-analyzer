<template>
  <div class="app-timeline-container">
    <div v-if="!data || data.length === 0" class="no-data">
      <p class="text-gray-500">Aucune donnée de timeline disponible</p>
    </div>
    <div v-else class="chart-wrapper">
      <!-- Chart Header -->
      <div class="chart-header mb-4">
        <div class="flex justify-between items-center">
          <h4 class="font-semibold">Timeline des Applications</h4>
          <div class="chart-stats text-sm text-gray-600">
            {{ data.length }} échantillons | App: {{ currentApp }}
          </div>
        </div>
      </div>

      <!-- Application Info -->
      <div class="app-info bg-blue-50 p-3 rounded-lg mb-4">
        <div class="flex items-center gap-4">
          <div class="app-icon">
            <Icon name="lucide:gamepad-2" class="w-8 h-8 text-blue-600" />
          </div>
          <div class="app-details">
            <h3 class="font-bold text-lg text-blue-800">{{ currentApp }}</h3>
            <p class="text-sm text-blue-600">
              Session: {{ formatDuration(sessionDuration) }} | FPS Moyen:
              {{ avgFps }} | Échantillons: {{ timelineData.length }}
            </p>
          </div>
        </div>
      </div>

      <!-- Timeline Chart -->
      <div class="timeline-chart">
        <div
          class="timeline-header flex justify-between text-xs text-gray-500 mb-2"
        >
          <span>{{ startTime }}</span>
          <span>FPS au fil du temps</span>
          <span>{{ endTime }}</span>
        </div>

        <div
          class="timeline-area bg-gray-50 p-4 rounded relative"
          style="height: 250px"
        >
          <!-- FPS Timeline -->
          <div class="fps-timeline" v-if="timelineData.length > 0">
            <div
              v-for="(point, index) in timelineData"
              :key="'timeline-' + index"
              class="timeline-point"
              :class="getFpsColorClass(point.fps)"
              :style="getTimelinePointStyle(point, index)"
              :title="getTooltipText(point)"
            ></div>
          </div>

          <!-- Time markers -->
          <div class="time-markers">
            <div
              v-for="marker in timeMarkers"
              :key="marker.label"
              class="time-marker"
              :style="{ left: marker.position + '%' }"
            >
              <div class="marker-line"></div>
              <div class="marker-label">{{ marker.label }}</div>
            </div>
          </div>
        </div>

        <!-- FPS Color Legend -->
        <div class="fps-legend flex gap-4 mt-3 text-sm justify-center">
          <div class="legend-item flex items-center">
            <div class="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span>&lt; 30 FPS</span>
          </div>
          <div class="legend-item flex items-center">
            <div class="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
            <span>30-60 FPS</span>
          </div>
          <div class="legend-item flex items-center">
            <div class="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span>&gt; 60 FPS</span>
          </div>
        </div>
      </div>

      <!-- Performance Summary -->
      <div class="performance-summary mt-4 grid grid-cols-3 gap-4 text-center">
        <div class="summary-item">
          <div class="text-lg font-bold text-green-600">
            {{ smoothPercentage }}%
          </div>
          <div class="text-xs text-gray-500">
            Performance Fluide (&gt;60 FPS)
          </div>
        </div>
        <div class="summary-item">
          <div class="text-lg font-bold text-yellow-600">
            {{ mediumPercentage }}%
          </div>
          <div class="text-xs text-gray-500">
            Performance Moyenne (30-60 FPS)
          </div>
        </div>
        <div class="summary-item">
          <div class="text-lg font-bold text-red-600">{{ lowPercentage }}%</div>
          <div class="text-xs text-gray-500">
            Performance Faible (&lt;30 FPS)
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
});

// Computed properties
const timelineData = computed(() => {
  const maxPoints = 100; // Limite pour la performance
  const step = Math.max(1, Math.floor(props.data.length / maxPoints));

  return props.data
    .filter((_, index) => index % step === 0)
    .slice(0, maxPoints)
    .map((item, index) => ({
      fps: parseFloat(item.FPS),
      frameTime: parseFloat(item.FrameTime),
      process: item.Process || "Unknown",
      timestamp: item.Timestamp || `Point ${index + 1}`,
      index: index,
      raw: item,
    }))
    .filter((point) => !isNaN(point.fps) && point.fps > 0);
});

const currentApp = computed(() => {
  if (props.data.length === 0) return "Aucune application";
  const firstProcess = props.data[0]?.Process || "Unknown";
  // Nettoie le nom du processus (.exe, chemins, etc.)
  return firstProcess.replace(/\.exe$/i, "").replace(/.*[\\/]/, "");
});

const sessionDuration = computed(() => {
  if (timelineData.value.length < 2) return 0;
  // Estimation basée sur le nombre d'échantillons (généralement 1 par seconde)
  return timelineData.value.length;
});

const startTime = computed(() => {
  if (timelineData.value.length === 0) return "--:--";
  const first = timelineData.value[0];
  return formatTime(first.timestamp, 0);
});

const endTime = computed(() => {
  if (timelineData.value.length === 0) return "--:--";
  const last = timelineData.value[timelineData.value.length - 1];
  return formatTime(last.timestamp, timelineData.value.length - 1);
});

const avgFps = computed(() => {
  if (timelineData.value.length === 0) return "0";
  const avg =
    timelineData.value.reduce((sum, point) => sum + point.fps, 0) /
    timelineData.value.length;
  return avg.toFixed(1);
});

const timeMarkers = computed(() => {
  const markers = [];
  const total = timelineData.value.length;
  if (total === 0) return markers;

  // Ajoute des marqueurs temporels à 25%, 50%, 75%
  for (let i = 1; i <= 3; i++) {
    const position = i * 25;
    const dataIndex = Math.floor((total * i) / 4);
    if (dataIndex < total) {
      markers.push({
        position: position,
        label: formatTime(timelineData.value[dataIndex].timestamp, dataIndex),
      });
    }
  }

  return markers;
});

// Performance percentages
const smoothPercentage = computed(() => {
  if (timelineData.value.length === 0) return 0;
  const smooth = timelineData.value.filter((p) => p.fps > 60).length;
  return Math.round((smooth / timelineData.value.length) * 100);
});

const mediumPercentage = computed(() => {
  if (timelineData.value.length === 0) return 0;
  const medium = timelineData.value.filter(
    (p) => p.fps >= 30 && p.fps <= 60
  ).length;
  return Math.round((medium / timelineData.value.length) * 100);
});

const lowPercentage = computed(() => {
  if (timelineData.value.length === 0) return 0;
  const low = timelineData.value.filter((p) => p.fps < 30).length;
  return Math.round((low / timelineData.value.length) * 100);
});

// Methods
const getTimelinePointStyle = (point, index) => {
  const x = (index / Math.max(1, timelineData.value.length - 1)) * 100;
  const maxFps = Math.max(...timelineData.value.map((p) => p.fps));
  const minFps = Math.min(...timelineData.value.map((p) => p.fps));
  const range = maxFps - minFps;

  let y = 50; // Valeur par défaut au milieu
  if (range > 0) {
    y = 90 - ((point.fps - minFps) / range) * 80; // Inverse Y (haut = plus de FPS)
  }

  return {
    position: "absolute",
    left: x + "%",
    top: y + "%",
    transform: "translate(-50%, -50%)",
  };
};

const getFpsColorClass = (fps) => {
  if (fps >= 60) return "fps-high";
  if (fps >= 30) return "fps-medium";
  return "fps-low";
};

const getTooltipText = (point) => {
  return `${point.fps} FPS | ${point.frameTime}ms | ${point.process} | ${formatTime(point.timestamp, point.index)}`;
};

const formatTime = (timestamp, index) => {
  // Si on a un vrai timestamp, on l'utilise
  if (timestamp && timestamp !== `Point ${index + 1}`) {
    return timestamp;
  }

  // Sinon on simule le temps basé sur l'index (1 seconde par échantillon)
  const minutes = Math.floor(index / 60);
  const seconds = index % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};
</script>

<style scoped>
.app-timeline-container {
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
}

.app-info {
  border-left: 4px solid #2563eb;
}

.app-icon {
  flex-shrink: 0;
}

.timeline-area {
  position: relative;
  overflow: hidden;
}

.fps-timeline {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.timeline-point {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.timeline-point:hover {
  transform: translate(-50%, -50%) scale(1.5);
  z-index: 10;
}

.fps-high {
  background-color: #10b981;
}

.fps-medium {
  background-color: #f59e0b;
}

.fps-low {
  background-color: #ef4444;
}

.time-markers {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.time-marker {
  position: absolute;
  top: 0;
  height: 100%;
}

.marker-line {
  width: 1px;
  height: 100%;
  background-color: #d1d5db;
  opacity: 0.5;
}

.marker-label {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  color: #6b7280;
  background-color: white;
  padding: 2px 4px;
  border-radius: 3px;
  white-space: nowrap;
}

.timeline-header {
  font-weight: 500;
}

.fps-legend {
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
.w-8 {
  width: 2rem;
}
.h-8 {
  height: 2rem;
}
.bg-red-500 {
  background-color: #ef4444;
}
.bg-yellow-500 {
  background-color: #f59e0b;
}
.bg-green-500 {
  background-color: #10b981;
}
.text-red-600 {
  color: #dc2626;
}
.text-yellow-600 {
  color: #d97706;
}
.text-green-600 {
  color: #059669;
}
.text-blue-600 {
  color: #2563eb;
}
.text-blue-800 {
  color: #1e40af;
}
.bg-blue-50 {
  background-color: #eff6ff;
}
.text-xs {
  font-size: 0.75rem;
}
.rounded {
  border-radius: 0.25rem;
}
</style>
