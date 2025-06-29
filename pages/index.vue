<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navigation Bar -->
    <div class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <Icon name="lucide:cpu" class="w-6 h-6 mr-2 text-red-500" />
            <span class="text-xl font-bold">AMD Log Analyzer</span>
          </div>
          <div class="relative">
            <button
              @click="showThemeMenu = !showThemeMenu"
              class="p-2 rounded-full hover:bg-gray-100"
            >
              <Icon name="lucide:palette" class="w-5 h-5" />
            </button>
            <div v-if="showThemeMenu" class="dropdown-menu">
              <div class="py-1">
                <button @click="changeTheme('light')" class="dropdown-item">
                  Light
                </button>
                <button @click="changeTheme('dark')" class="dropdown-item">
                  Dark
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto p-6">
      <!-- Upload Section -->
      <div class="mb-8" v-show="!analysisData">
        <h1 class="text-3xl font-bold mb-6 text-center text-gray-900">
          Analyseur de Logs AMD Adrenaline
        </h1>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- FPS/Latency Upload -->
          <div class="bg-white rounded-lg shadow-xl p-6">
            <h2 class="text-lg font-semibold mb-4 flex items-center">
              <Icon name="lucide:zap" class="w-5 h-5 mr-2 text-yellow-500" />
              Fichier FPS/Latency
            </h2>
            <FileUpload
              @file-selected="handleFpsFileSelect"
              accept=".csv"
              :file-name="fpsFile?.name"
              placeholder="Sélectionnez le fichier FPS.Latency.CSV"
            />
          </div>

          <!-- Hardware Upload -->
          <div class="bg-white rounded-lg shadow-xl p-6">
            <h2 class="text-lg font-semibold mb-4 flex items-center">
              <Icon name="lucide:cpu" class="w-5 h-5 mr-2 text-blue-500" />
              Fichier Hardware
            </h2>
            <FileUpload
              @file-selected="handleHardwareFileSelect"
              accept=".csv"
              :file-name="hardwareFile?.name"
              placeholder="Sélectionnez le fichier Hardware.CSV"
            />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-center gap-4 mb-6">
          <button
            class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            :disabled="!fpsFile || !hardwareFile || isLoading"
            @click="analyzeFiles"
          >
            <Icon name="lucide:play" class="w-4 h-4 mr-2" />
            <span
              v-if="isLoading"
              class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
            ></span>
            {{ isLoading ? "Analyse en cours..." : "Analyser les Fichiers" }}
          </button>

          <button
            class="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            @click="clearFiles"
            :disabled="!fpsFile && !hardwareFile"
          >
            <Icon name="lucide:trash-2" class="w-4 h-4 mr-2" />
            Effacer
          </button>
        </div>
      </div>

      <!-- Analysis Results -->
      <div v-if="analysisData" class="space-y-8">
        <!-- Header with controls -->
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-900">
            Résultats d'Analyse AMD
          </h1>
          <button class="btn btn-outline" @click="clearFiles">
            <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" />
            Nouvelle Analyse
          </button>
        </div>

        <!-- Chart Toggle Controls -->
        <div class="bg-white rounded-lg shadow-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center">
            <Icon name="lucide:eye" class="w-5 h-5 mr-2 text-blue-500" />
            Affichage des Graphiques
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
            <button
              class="btn"
              :class="showCharts.timeline ? 'btn-primary' : 'btn-outline'"
              @click="showCharts.timeline = !showCharts.timeline"
            >
              <Icon name="lucide:clock" class="w-4 h-4 mr-2" />
              Timeline App
            </button>
            <button
              class="btn"
              :class="showCharts.fps ? 'btn-primary' : 'btn-outline'"
              @click="showCharts.fps = !showCharts.fps"
            >
              <Icon name="lucide:activity" class="w-4 h-4 mr-2" />
              FPS
            </button>
            <button
              class="btn"
              :class="showCharts.temperature ? 'btn-primary' : 'btn-outline'"
              @click="showCharts.temperature = !showCharts.temperature"
            >
              <Icon name="lucide:thermometer" class="w-4 h-4 mr-2" />
              Températures
            </button>
            <button
              class="btn"
              :class="showCharts.power ? 'btn-primary' : 'btn-outline'"
              @click="showCharts.power = !showCharts.power"
            >
              <Icon name="lucide:zap" class="w-4 h-4 mr-2" />
              Consommation
            </button>
            <button
              class="btn"
              :class="showCharts.utilization ? 'btn-primary' : 'btn-outline'"
              @click="showCharts.utilization = !showCharts.utilization"
            >
              <Icon name="lucide:bar-chart-3" class="w-4 h-4 mr-2" />
              Utilisation
            </button>
          </div>
        </div>

        <!-- Summary Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="metric-card text-center">
            <div class="metric-value">
              {{ analysisData.avgFPS?.toFixed(1) || "N/A" }}
            </div>
            <div class="metric-label">FPS Moyen</div>
          </div>
          <div class="metric-card text-center">
            <div class="metric-value">
              {{ analysisData.maxTemp?.toFixed(1) || "N/A" }}°C
            </div>
            <div class="metric-label">Temp. Max GPU</div>
          </div>
          <div class="metric-card text-center">
            <div class="metric-value">
              {{ analysisData.avgPower?.toFixed(0) || "N/A" }}W
            </div>
            <div class="metric-label">Conso. Moy. GPU</div>
          </div>
          <div class="metric-card text-center">
            <div class="metric-value">
              {{ analysisData.avgCpuUtil?.toFixed(1) || "N/A" }}%
            </div>
            <div class="metric-label">Util. Moy. CPU</div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="space-y-6">
          <!-- App Timeline Chart -->
          <div
            v-if="showCharts.timeline"
            class="bg-white rounded-lg shadow-xl p-6"
          >
            <h3 class="text-lg font-semibold mb-4 flex items-center">
              <Icon name="lucide:clock" class="w-5 h-5 mr-2 text-purple-500" />
              Timeline des Applications
            </h3>
            <div class="chart-container">
              <AppTimelineChart :data="analysisData.fpsData" />
            </div>
          </div>

          <!-- FPS Chart -->
          <div v-if="showCharts.fps" class="bg-white rounded-lg shadow-xl p-6">
            <h3 class="text-lg font-semibold mb-4 flex items-center">
              <Icon
                name="lucide:activity"
                class="w-5 h-5 mr-2 text-green-500"
              />
              Performance FPS
            </h3>
            <div class="chart-container">
              <FpsChart :data="analysisData.fpsData" />
            </div>
          </div>

          <!-- Temperature Chart -->
          <div
            v-if="showCharts.temperature"
            class="bg-white rounded-lg shadow-xl p-6"
          >
            <h3 class="text-lg font-semibold mb-4 flex items-center">
              <Icon
                name="lucide:thermometer"
                class="w-5 h-5 mr-2 text-red-500"
              />
              Températures
            </h3>
            <div class="chart-container">
              <TemperatureChart :data="analysisData.temperatureData" />
            </div>
          </div>

          <!-- Power Chart -->
          <div
            v-if="showCharts.power"
            class="bg-white rounded-lg shadow-xl p-6"
          >
            <h3 class="text-lg font-semibold mb-4 flex items-center">
              <Icon name="lucide:zap" class="w-5 h-5 mr-2 text-yellow-500" />
              Consommation
            </h3>
            <div class="chart-container">
              <PowerChart :data="analysisData.powerData" />
            </div>
          </div>

          <!-- Utilization Chart -->
          <div
            v-if="showCharts.utilization"
            class="bg-white rounded-lg shadow-xl p-6"
          >
            <h3 class="text-lg font-semibold mb-4 flex items-center">
              <Icon
                name="lucide:bar-chart-3"
                class="w-5 h-5 mr-2 text-blue-500"
              />
              Utilisation
            </h3>
            <div class="chart-container">
              <UtilizationChart :data="analysisData.utilizationData" />
            </div>
          </div>
        </div>

        <!-- Comparison Tools -->
        <div class="bg-white rounded-lg shadow-xl p-6">
          <h3 class="text-lg font-semibold mb-4 flex items-center">
            <Icon name="lucide:compare" class="w-5 h-5 mr-2 text-purple-500" />
            Outils de Comparaison
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <button
              class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-center"
              @click="showTimeRange = !showTimeRange"
            >
              <Icon name="lucide:clock" class="w-4 h-4 mr-2" />
              Filtrer par Temps
            </button>
            <button
              class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-center"
              @click="exportData"
            >
              <Icon name="lucide:download" class="w-4 h-4 mr-2" />
              Exporter Données
            </button>
            <button
              class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-center"
              @click="generateReport"
            >
              <Icon name="lucide:file-text" class="w-4 h-4 mr-2" />
              Générer Rapport
            </button>
          </div>

          <!-- Time Range Filter -->
          <div v-if="showTimeRange" class="mt-4 p-4 bg-gray-100 rounded-lg">
            <h4 class="font-semibold mb-2">Filtrer par Période</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Début</label
                >
                <input
                  type="datetime-local"
                  class="w-full p-2 border border-gray-300 rounded-md"
                  v-model="timeFilter.start"
                  @change="applyTimeFilter"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Fin</label
                >
                <input
                  type="datetime-local"
                  class="w-full p-2 border border-gray-300 rounded-md"
                  v-model="timeFilter.end"
                  @change="applyTimeFilter"
                />
              </div>
            </div>
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
const showTimeRange = ref(false);
const showThemeMenu = ref(false);
const timeFilter = ref({
  start: "",
  end: "",
});

// Chart visibility controls
const showCharts = ref({
  timeline: true,
  fps: true,
  temperature: true,
  power: true,
  utilization: true,
});

// Theme management (simplified)
const changeTheme = (theme) => {
  console.log("Changing theme to:", theme);
  showThemeMenu.value = false;
};

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
    fps: true,
    temperature: true,
    power: true,
    utilization: true,
  };
  showTimeRange.value = false;
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

// Analyze files
const analyzeFiles = async () => {
  if (!fpsFile.value || !hardwareFile.value) return;

  isLoading.value = true;

  try {
    const [fpsData, hardwareData] = await Promise.all([
      parseCSV(fpsFile.value),
      parseCSV(hardwareFile.value),
    ]);

    // Process and analyze data
    const analysis = processData(fpsData, hardwareData);
    analysisData.value = analysis;
  } catch (error) {
    console.error("Error analyzing files:", error);
    alert("Erreur lors de l'analyse des fichiers");
  } finally {
    isLoading.value = false;
  }
};

// Process data for analysis
const processData = (fpsData, hardwareData) => {
  // Filter valid FPS data
  const validFpsData = fpsData.filter(
    (row) => row.FPS && row.FPS !== "N/A" && !isNaN(parseFloat(row.FPS))
  );

  // Filter valid hardware data
  const validHardwareData = hardwareData.filter(
    (row) =>
      row["GPU TEMP"] &&
      row["GPU TEMP"] !== "N/A" &&
      !isNaN(parseFloat(row["GPU TEMP"]))
  );

  // Calculate statistics
  const fpsList = validFpsData.map((row) => parseFloat(row.FPS));
  const avgFPS = fpsList.reduce((a, b) => a + b, 0) / fpsList.length;

  const tempList = validHardwareData.map((row) => parseFloat(row["GPU TEMP"]));
  const maxTemp = Math.max(...tempList);

  const powerList = validHardwareData
    .filter((row) => row["GPU BRD PWR"] && row["GPU BRD PWR"] !== "N/A")
    .map((row) => parseFloat(row["GPU BRD PWR"]));
  const avgPower = powerList.reduce((a, b) => a + b, 0) / powerList.length;

  const cpuUtilList = validHardwareData
    .filter((row) => row["CPU UTIL"] && row["CPU UTIL"] !== "N/A")
    .map((row) => parseFloat(row["CPU UTIL"]));
  const avgCpuUtil =
    cpuUtilList.reduce((a, b) => a + b, 0) / cpuUtilList.length;

  return {
    avgFPS,
    maxTemp,
    avgPower,
    avgCpuUtil,
    fpsData: validFpsData.slice(0, 100), // Limit for performance
    temperatureData: validHardwareData.slice(0, 100),
    powerData: validHardwareData.slice(0, 100),
    utilizationData: validHardwareData.slice(0, 100),
  };
};

// Time filter
const applyTimeFilter = () => {
  console.log("Applying time filter:", timeFilter.value);
};

// Export functionality
const exportData = () => {
  if (!analysisData.value) return;

  const dataStr = JSON.stringify(analysisData.value, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download =
    "amd-analysis-" + new Date().toISOString().slice(0, 10) + ".json";
  link.click();

  URL.revokeObjectURL(url);
};

// Generate report
const generateReport = () => {
  if (!analysisData.value) return;

  const report = `
Rapport d'Analyse AMD Adrenaline
================================

Date: ${new Date().toLocaleDateString("fr-FR")}

RÉSUMÉ DES PERFORMANCES:
- FPS Moyen: ${analysisData.value.avgFPS?.toFixed(1)} FPS
- Température Max GPU: ${analysisData.value.maxTemp?.toFixed(1)}°C
- Consommation Moyenne GPU: ${analysisData.value.avgPower?.toFixed(0)}W
- Utilisation Moyenne CPU: ${analysisData.value.avgCpuUtil?.toFixed(1)}%

ANALYSE:
${analysisData.value.avgFPS > 60 ? "✓ Performance FPS excellente" : "⚠ Performance FPS à améliorer"}
${analysisData.value.maxTemp < 80 ? "✓ Températures GPU acceptables" : "⚠ Températures GPU élevées"}
${analysisData.value.avgCpuUtil < 80 ? "✓ Utilisation CPU normale" : "⚠ Utilisation CPU élevée"}
  `;

  const reportBlob = new Blob([report], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(reportBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download =
    "rapport-amd-" + new Date().toISOString().slice(0, 10) + ".txt";
  link.click();

  URL.revokeObjectURL(url);
};
</script>
