<template>
  <div class="dashboard-container">
    <div class="dashboard-content">
      <!-- Header -->
      <div class="dashboard-header">
        <h1 class="dashboard-title">AMD Log Analyzer</h1>
        <p class="dashboard-subtitle">
          Analysez vos performances gaming avec AMD Adrenaline
        </p>
      </div>

      <!-- Upload Section (visible when no data) -->
      <div v-if="!analysisData" class="upload-section">
        <h2 class="text-2xl font-bold mb-6 text-center">Commencer l'Analyse</h2>
        <FileUpload
          @fps-file="handleFpsFileSelect"
          @hardware-file="handleHardwareFileSelect"
          :is-loading="isLoading"
        />
        <div
          v-if="(fpsFile || hardwareFile) && !isLoading"
          class="flex justify-center mt-6"
        >
          <button
            @click="startAnalysis"
            :disabled="!fpsFile || !hardwareFile"
            class="btn btn-primary"
          >
            <Icon name="lucide:play-circle" class="w-5 h-5" />
            Lancer l'Analyse
          </button>
        </div>
      </div>

      <!-- Analysis Results -->
      <div v-else>
        <!-- Action Bar -->
        <div class="control-panel">
          <div class="flex justify-between items-center">
            <h3 class="control-title">Contrôles d'Affichage</h3>
            <button @click="clearFiles" class="btn btn-outline">
              <Icon name="lucide:refresh-cw" class="w-4 h-4" />
              Nouvelle Analyse
            </button>
          </div>
          <div class="control-buttons">
            <button
              @click="showCharts.timeline = !showCharts.timeline"
              :class="['control-button', { active: showCharts.timeline }]"
            >
              <Icon name="lucide:activity" class="w-4 h-4" />
              Performance FPS
            </button>
            <button
              @click="showCharts.temperature = !showCharts.temperature"
              :class="['control-button', { active: showCharts.temperature }]"
            >
              <Icon name="lucide:thermometer" class="w-4 h-4" />
              Températures
            </button>
            <button
              @click="showCharts.power = !showCharts.power"
              :class="['control-button', { active: showCharts.power }]"
            >
              <Icon name="lucide:zap" class="w-4 h-4" />
              Consommation
            </button>
            <button
              @click="showCharts.utilization = !showCharts.utilization"
              :class="['control-button', { active: showCharts.utilization }]"
            >
              <Icon name="lucide:bar-chart-3" class="w-4 h-4" />
              Utilisation
            </button>
          </div>
        </div>

        <!-- Key Metrics -->
        <div class="metrics-grid">
          <div
            class="metric-card"
            style="--accent-color: #10b981; --accent-color-light: #34d399"
          >
            <div class="metric-value">
              {{ analysisData.avgFps?.toFixed(1) || "N/A" }}
            </div>
            <div class="metric-label">FPS Moyen</div>
            <div
              class="metric-trend"
              style="background: #dcfce7; color: #16a34a"
            >
              Gaming
            </div>
          </div>
          <div
            class="metric-card"
            style="--accent-color: #ef4444; --accent-color-light: #f87171"
          >
            <div class="metric-value">
              {{ analysisData.maxGpuTemp?.toFixed(0) || "N/A" }}°
            </div>
            <div class="metric-label">Temp GPU Max</div>
            <div
              class="metric-trend"
              style="background: #fee2e2; color: #dc2626"
            >
              Hardware
            </div>
          </div>
          <div
            class="metric-card"
            style="--accent-color: #f59e0b; --accent-color-light: #fbbf24"
          >
            <div class="metric-value">
              {{ analysisData.maxGpuPower?.toFixed(0) || "N/A" }}W
            </div>
            <div class="metric-label">Puissance GPU</div>
            <div
              class="metric-trend"
              style="background: #fef3c7; color: #d97706"
            >
              Énergie
            </div>
          </div>
          <div
            class="metric-card"
            style="--accent-color: #3b82f6; --accent-color-light: #60a5fa"
          >
            <div class="metric-value">
              {{ analysisData.avgGpuUtil?.toFixed(1) || "N/A" }}%
            </div>
            <div class="metric-label">Util. GPU Moy.</div>
            <div
              class="metric-trend"
              style="background: #dbeafe; color: #2563eb"
            >
              Performance
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-section">
          <!-- Performance FPS Chart -->
          <div v-if="showCharts.timeline" class="chart-card timeline">
            <div class="chart-header">
              <h3 class="chart-title">
                <Icon name="lucide:activity" class="w-5 h-5" />
                Performance FPS
              </h3>
              <div class="chart-stats">
                {{ analysisData.fpsData?.length || 0 }} échantillons
              </div>
            </div>
            <div class="chart-container">
              <AppTimelineChart :data="analysisData.fpsData" />
            </div>
          </div>

          <!-- Section Separator -->
          <div
            v-if="
              showCharts.timeline &&
              (showCharts.temperature ||
                showCharts.power ||
                showCharts.utilization)
            "
            class="section-separator"
          >
            <div class="separator-line"></div>
            <div class="separator-text">Métriques Hardware</div>
            <div class="separator-line"></div>
          </div>

          <!-- Temperature Chart -->
          <div v-if="showCharts.temperature" class="chart-card temperature">
            <div class="chart-header">
              <h3 class="chart-title">
                <Icon name="lucide:thermometer" class="w-5 h-5" />
                Températures Hardware
              </h3>
              <div class="chart-stats">
                {{ analysisData.temperatureData?.length || 0 }} échantillons
              </div>
            </div>
            <div class="chart-container">
              <TemperatureChart :data="analysisData.temperatureData" />
            </div>
          </div>

          <!-- Power Chart -->
          <div v-if="showCharts.power" class="chart-card power">
            <div class="chart-header">
              <h3 class="chart-title">
                <Icon name="lucide:zap" class="w-5 h-5" />
                Consommation Énergétique
              </h3>
              <div class="chart-stats">
                {{ analysisData.powerData?.length || 0 }} échantillons
              </div>
            </div>
            <div class="chart-container">
              <PowerChart :data="analysisData.powerData" />
            </div>
          </div>

          <!-- Utilization Chart -->
          <div v-if="showCharts.utilization" class="chart-card utilization">
            <div class="chart-header">
              <h3 class="chart-title">
                <Icon name="lucide:bar-chart-3" class="w-5 h-5" />
                Utilisation Système
              </h3>
              <div class="chart-stats">
                {{ analysisData.utilizationData?.length || 0 }} échantillons
              </div>
            </div>
            <div class="chart-container">
              <UtilizationChart :data="analysisData.utilizationData" />
            </div>
          </div>
        </div>

        <!-- Export Tools -->
        <div class="control-panel">
          <h3 class="control-title">Outils d'Export</h3>
          <div class="control-buttons">
            <button @click="exportData" class="control-button">
              <Icon name="lucide:download" class="w-4 h-4" />
              Exporter JSON
            </button>
            <button @click="generateReport" class="control-button">
              <Icon name="lucide:file-text" class="w-4 h-4" />
              Rapport Détaillé
            </button>
            <button @click="shareResults" class="control-button">
              <Icon name="lucide:share-2" class="w-4 h-4" />
              Partager Résultats
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Papa from "papaparse";

// State
const fpsFile = ref(null);
const hardwareFile = ref(null);
const isLoading = ref(false);
const analysisData = ref(null);

// Chart visibility controls
const showCharts = ref({
  timeline: true,
  temperature: true,
  power: true,
  utilization: true,
});

// File handling
const handleFpsFileSelect = (file) => {
  fpsFile.value = file;
};

const handleHardwareFileSelect = (file) => {
  hardwareFile.value = file;
};

const clearFiles = () => {
  fpsFile.value = null;
  hardwareFile.value = null;
  analysisData.value = null;
  // Reset chart visibility to all visible
  showCharts.value = {
    timeline: true,
    temperature: true,
    power: true,
    utilization: true,
  };
};

// Parse CSV files
const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

// Start analysis
const startAnalysis = async () => {
  if (!fpsFile.value || !hardwareFile.value) return;

  isLoading.value = true;

  try {
    // Parse both CSV files
    const [fpsData, hardwareData] = await Promise.all([
      parseCSV(fpsFile.value),
      parseCSV(hardwareFile.value),
    ]);

    // Process and analyze data
    const processedData = {
      fpsData: fpsData.filter((row) => row.FPS && !isNaN(parseFloat(row.FPS))),
      temperatureData: hardwareData.filter(
        (row) =>
          (row["GPU TEMP"] && !isNaN(parseFloat(row["GPU TEMP"]))) ||
          (row["CPU TEMP"] && !isNaN(parseFloat(row["CPU TEMP"])))
      ),
      powerData: hardwareData.filter(
        (row) =>
          (row["GPU BRD PWR"] && !isNaN(parseFloat(row["GPU BRD PWR"]))) ||
          (row["CPU PWR"] && !isNaN(parseFloat(row["CPU PWR"])))
      ),
      utilizationData: hardwareData.filter(
        (row) =>
          (row["GPU UTIL"] && !isNaN(parseFloat(row["GPU UTIL"]))) ||
          (row["CPU UTIL"] && !isNaN(parseFloat(row["CPU UTIL"]))) ||
          (row["SYS MEM UTIL"] && !isNaN(parseFloat(row["SYS MEM UTIL"])))
      ),
    };

    // Calculate summary statistics
    const fpsValues = processedData.fpsData.map((row) => parseFloat(row.FPS));
    const gpuTempValues = processedData.temperatureData
      .map((row) => parseFloat(row["GPU TEMP"]))
      .filter((val) => !isNaN(val));
    const gpuPowerValues = processedData.powerData
      .map((row) => parseFloat(row["GPU BRD PWR"]))
      .filter((val) => !isNaN(val));
    const gpuUtilValues = processedData.utilizationData
      .map((row) => parseFloat(row["GPU UTIL"]))
      .filter((val) => !isNaN(val));

    processedData.avgFps =
      fpsValues.length > 0
        ? fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length
        : 0;
    processedData.maxGpuTemp =
      gpuTempValues.length > 0 ? Math.max(...gpuTempValues) : 0;
    processedData.maxGpuPower =
      gpuPowerValues.length > 0 ? Math.max(...gpuPowerValues) : 0;
    processedData.avgGpuUtil =
      gpuUtilValues.length > 0
        ? gpuUtilValues.reduce((a, b) => a + b, 0) / gpuUtilValues.length
        : 0;

    analysisData.value = processedData;
  } catch (error) {
    console.error("Erreur lors de l'analyse :", error);
    alert(
      "Erreur lors de l'analyse des fichiers. Vérifiez le format des fichiers CSV."
    );
  } finally {
    isLoading.value = false;
  }
};

// Export functions
const exportData = () => {
  if (!analysisData.value) return;

  const dataStr = JSON.stringify(analysisData.value, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `amd-analysis-${new Date().getTime()}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

const generateReport = () => {
  if (!analysisData.value) return;

  const report = `
=== RAPPORT D'ANALYSE AMD ADRENALINE ===
Date: ${new Date().toLocaleString("fr-FR")}

RÉSUMÉ PERFORMANCE:
- FPS Moyen: ${analysisData.value.avgFps?.toFixed(1)} FPS
- Température GPU Max: ${analysisData.value.maxGpuTemp?.toFixed(0)}°C
- Puissance GPU Max: ${analysisData.value.maxGpuPower?.toFixed(0)}W
- Utilisation GPU Moy.: ${analysisData.value.avgGpuUtil?.toFixed(1)}%

DONNÉES COLLECTÉES:
- Échantillons FPS: ${analysisData.value.fpsData?.length || 0}
- Échantillons Hardware: ${analysisData.value.temperatureData?.length || 0}

Rapport généré par AMD Log Analyzer
  `;

  const reportBlob = new Blob([report], { type: "text/plain" });
  const url = URL.createObjectURL(reportBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `rapport-amd-${new Date().getTime()}.txt`;
  link.click();
  URL.revokeObjectURL(url);
};

const shareResults = () => {
  if (!analysisData.value) return;

  const shareText =
    `🎮 Analyse AMD Gaming:\n` +
    `📊 FPS Moyen: ${analysisData.value.avgFps?.toFixed(1)}\n` +
    `🌡️ Temp GPU Max: ${analysisData.value.maxGpuTemp?.toFixed(0)}°C\n` +
    `⚡ Puissance: ${analysisData.value.maxGpuPower?.toFixed(0)}W`;

  if (navigator.share) {
    navigator.share({
      title: "Résultats AMD Log Analyzer",
      text: shareText,
    });
  } else {
    navigator.clipboard.writeText(shareText);
    alert("Résultats copiés dans le presse-papiers !");
  }
};
</script>

<style>
/* Component-specific styles if needed */
</style>
