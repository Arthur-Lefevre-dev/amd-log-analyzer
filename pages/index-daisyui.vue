<template>
  <div class="min-h-screen bg-base-200">
    <!-- Navigation Bar -->
    <div class="navbar bg-base-100 shadow-lg">
      <div class="flex-1">
        <a class="btn btn-ghost text-xl">
          <Icon name="lucide:cpu" class="w-6 h-6 mr-2 text-error" />
          AMD Log Analyzer
        </a>
      </div>
      <div class="flex-none">
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
            <Icon name="lucide:palette" class="w-5 h-5" />
          </div>
          <ul
            tabindex="0"
            class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            <li><a @click="changeTheme('light')">Light</a></li>
            <li><a @click="changeTheme('dark')">Dark</a></li>
            <li><a @click="changeTheme('cyberpunk')">Cyberpunk</a></li>
            <li><a @click="changeTheme('synthwave')">Synthwave</a></li>
            <li><a @click="changeTheme('retro')">Retro</a></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto p-6">
      <!-- Upload Section -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-6 text-center">
          Analyseur de Logs AMD Adrenaline
        </h1>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- FPS/Latency Upload -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">
                <Icon name="lucide:zap" class="w-5 h-5 text-warning" />
                Fichier FPS/Latency
              </h2>
              <FileUpload
                @file-selected="handleFpsFileSelect"
                accept=".csv"
                :file-name="fpsFile?.name"
                placeholder="Sélectionnez le fichier FPS.Latency.CSV"
              />
            </div>
          </div>

          <!-- Hardware Upload -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">
                <Icon name="lucide:cpu" class="w-5 h-5 text-info" />
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
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-center gap-4 mb-6">
          <button
            class="btn btn-primary"
            :disabled="!fpsFile || !hardwareFile || isLoading"
            @click="analyzeFiles"
          >
            <Icon name="lucide:play" class="w-4 h-4 mr-2" />
            <span
              v-if="isLoading"
              class="loading loading-spinner loading-sm"
            ></span>
            {{ isLoading ? "Analyse en cours..." : "Analyser les Fichiers" }}
          </button>

          <button
            class="btn btn-outline"
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
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <!-- FPS Chart -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h3 class="card-title">
                <Icon name="lucide:activity" class="w-5 h-5 text-success" />
                Performance FPS
              </h3>
              <div class="chart-container">
                <FpsChart :data="analysisData.fpsData" />
              </div>
            </div>
          </div>

          <!-- Temperature Chart -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h3 class="card-title">
                <Icon name="lucide:thermometer" class="w-5 h-5 text-error" />
                Températures
              </h3>
              <div class="chart-container">
                <TemperatureChart :data="analysisData.temperatureData" />
              </div>
            </div>
          </div>

          <!-- Power Chart -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h3 class="card-title">
                <Icon name="lucide:zap" class="w-5 h-5 text-warning" />
                Consommation
              </h3>
              <div class="chart-container">
                <PowerChart :data="analysisData.powerData" />
              </div>
            </div>
          </div>

          <!-- Utilization Chart -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h3 class="card-title">
                <Icon name="lucide:bar-chart-3" class="w-5 h-5 text-info" />
                Utilisation
              </h3>
              <div class="chart-container">
                <UtilizationChart :data="analysisData.utilizationData" />
              </div>
            </div>
          </div>
        </div>

        <!-- Comparison Tools -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h3 class="card-title">
              <Icon name="lucide:compare" class="w-5 h-5 text-secondary" />
              Outils de Comparaison
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <button
                class="btn btn-outline"
                @click="showTimeRange = !showTimeRange"
              >
                <Icon name="lucide:clock" class="w-4 h-4 mr-2" />
                Filtrer par Temps
              </button>
              <button class="btn btn-outline" @click="exportData">
                <Icon name="lucide:download" class="w-4 h-4 mr-2" />
                Exporter Données
              </button>
              <button class="btn btn-outline" @click="generateReport">
                <Icon name="lucide:file-text" class="w-4 h-4 mr-2" />
                Générer Rapport
              </button>
            </div>

            <!-- Time Range Filter -->
            <div v-if="showTimeRange" class="mt-4 p-4 bg-base-200 rounded-lg">
              <h4 class="font-semibold mb-2">Filtrer par Période</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="label">Début</label>
                  <input
                    type="datetime-local"
                    class="input input-bordered w-full"
                    v-model="timeFilter.start"
                    @change="applyTimeFilter"
                  />
                </div>
                <div>
                  <label class="label">Fin</label>
                  <input
                    type="datetime-local"
                    class="input input-bordered w-full"
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
const timeFilter = ref({
  start: "",
  end: "",
});

// Theme management
const changeTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
};

// Initialize theme
onMounted(() => {
  const savedTheme = localStorage.getItem("theme") || "dark";
  changeTheme(savedTheme);
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
  // Implementation for time filtering
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
