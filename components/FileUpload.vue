<template>
  <div class="file-upload-container">
    <!-- Upload Instructions -->
    <div class="upload-instructions">
      <Icon name="lucide:file-text" class="instruction-icon" />
      <h3 class="instruction-title">
        Sélectionnez vos fichiers AMD Adrenaline
      </h3>
      <p class="instruction-text">
        Chargez les fichiers CSV générés par AMD Adrenaline pour analyser vos
        performances gaming
      </p>
    </div>

    <!-- File Upload Areas -->
    <div class="upload-grid">
      <!-- FPS File Upload -->
      <div class="upload-card fps-card">
        <div class="upload-header">
          <Icon name="lucide:activity" class="upload-icon" />
          <h4 class="upload-title">Fichier FPS/Latency</h4>
        </div>

        <div
          ref="fpsUploadArea"
          class="upload-zone"
          :class="{
            'upload-zone-active': isDragOverFps,
            'upload-zone-success': fpsFile,
          }"
          @drop.prevent="handleFpsDrop"
          @dragover.prevent="isDragOverFps = true"
          @dragenter.prevent="isDragOverFps = true"
          @dragleave.prevent="isDragOverFps = false"
          @click="triggerFpsInput"
        >
          <div v-if="!fpsFile" class="upload-placeholder">
            <Icon name="lucide:upload-cloud" class="placeholder-icon" />
            <div class="placeholder-text">
              <p class="placeholder-main">Glissez votre fichier FPS ici</p>
              <p class="placeholder-sub">ou cliquez pour sélectionner</p>
              <p class="placeholder-format">Format: FPS.Latency.*.CSV</p>
            </div>
          </div>

          <div v-else class="upload-success">
            <Icon name="lucide:check-circle" class="success-icon" />
            <div class="success-content">
              <p class="success-title">Fichier FPS chargé</p>
              <p class="success-filename">{{ fpsFile.name }}</p>
              <p class="success-size">{{ formatFileSize(fpsFile.size) }}</p>
            </div>
            <button @click.stop="clearFpsFile" class="clear-button">
              <Icon name="lucide:x" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Hardware File Upload -->
      <div class="upload-card hardware-card">
        <div class="upload-header">
          <Icon name="lucide:cpu" class="upload-icon" />
          <h4 class="upload-title">Fichier Hardware</h4>
        </div>

        <div
          ref="hardwareUploadArea"
          class="upload-zone"
          :class="{
            'upload-zone-active': isDragOverHardware,
            'upload-zone-success': hardwareFile,
          }"
          @drop.prevent="handleHardwareDrop"
          @dragover.prevent="isDragOverHardware = true"
          @dragenter.prevent="isDragOverHardware = true"
          @dragleave.prevent="isDragOverHardware = false"
          @click="triggerHardwareInput"
        >
          <div v-if="!hardwareFile" class="upload-placeholder">
            <Icon name="lucide:upload-cloud" class="placeholder-icon" />
            <div class="placeholder-text">
              <p class="placeholder-main">Glissez votre fichier Hardware ici</p>
              <p class="placeholder-sub">ou cliquez pour sélectionner</p>
              <p class="placeholder-format">Format: Hardware.*.CSV</p>
            </div>
          </div>

          <div v-else class="upload-success">
            <Icon name="lucide:check-circle" class="success-icon" />
            <div class="success-content">
              <p class="success-title">Fichier Hardware chargé</p>
              <p class="success-filename">{{ hardwareFile.name }}</p>
              <p class="success-size">
                {{ formatFileSize(hardwareFile.size) }}
              </p>
            </div>
            <button @click.stop="clearHardwareFile" class="clear-button">
              <Icon name="lucide:x" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Status -->
    <div class="upload-status">
      <div class="status-indicators">
        <div class="status-item" :class="{ 'status-complete': fpsFile }">
          <Icon name="lucide:activity" class="status-icon" />
          <span>FPS/Latency</span>
          <Icon v-if="fpsFile" name="lucide:check" class="status-check" />
        </div>
        <div class="status-divider"></div>
        <div class="status-item" :class="{ 'status-complete': hardwareFile }">
          <Icon name="lucide:cpu" class="status-icon" />
          <span>Hardware</span>
          <Icon v-if="hardwareFile" name="lucide:check" class="status-check" />
        </div>
      </div>

      <div v-if="fpsFile && hardwareFile" class="status-ready">
        <Icon name="lucide:check-circle" class="ready-icon" />
        <span class="ready-text">Prêt pour l'analyse !</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p class="loading-text">Préparation de l'analyse...</p>
      </div>
    </div>

    <!-- Hidden File Inputs -->
    <input
      ref="fpsFileInput"
      type="file"
      accept=".csv"
      class="hidden"
      @change="handleFpsFileSelect"
    />
    <input
      ref="hardwareFileInput"
      type="file"
      accept=".csv"
      class="hidden"
      @change="handleHardwareFileSelect"
    />
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(["fps-file", "hardware-file"]);

// State
const fpsFile = ref(null);
const hardwareFile = ref(null);
const isDragOverFps = ref(false);
const isDragOverHardware = ref(false);

// Methods
const handleFpsDrop = (event) => {
  isDragOverFps.value = false;
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (isValidCSV(file)) {
      fpsFile.value = file;
      emit("fps-file", file);
    } else {
      alert("Veuillez sélectionner un fichier CSV valide");
    }
  }
};

const handleHardwareDrop = (event) => {
  isDragOverHardware.value = false;
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (isValidCSV(file)) {
      hardwareFile.value = file;
      emit("hardware-file", file);
    } else {
      alert("Veuillez sélectionner un fichier CSV valide");
    }
  }
};

const triggerFpsInput = () => {
  if (!props.isLoading) {
    document.querySelector("#fpsFileInput")?.click();
  }
};

const triggerHardwareInput = () => {
  if (!props.isLoading) {
    document.querySelector("#hardwareFileInput")?.click();
  }
};

const handleFpsFileSelect = (event) => {
  const file = event.target.files[0];
  if (file && isValidCSV(file)) {
    fpsFile.value = file;
    emit("fps-file", file);
  } else if (file) {
    alert("Veuillez sélectionner un fichier CSV valide");
  }
};

const handleHardwareFileSelect = (event) => {
  const file = event.target.files[0];
  if (file && isValidCSV(file)) {
    hardwareFile.value = file;
    emit("hardware-file", file);
  } else if (file) {
    alert("Veuillez sélectionner un fichier CSV valide");
  }
};

const isValidCSV = (file) => {
  return file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv");
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const clearFpsFile = () => {
  fpsFile.value = null;
  emit("fps-file", null);
};

const clearHardwareFile = () => {
  hardwareFile.value = null;
  emit("hardware-file", null);
};

// Update refs for inputs
onMounted(() => {
  const fpsInput = document.querySelector('input[type="file"]:first-of-type');
  const hardwareInput = document.querySelector(
    'input[type="file"]:last-of-type'
  );
  if (fpsInput) fpsInput.id = "fpsFileInput";
  if (hardwareInput) hardwareInput.id = "hardwareFileInput";
});
</script>

<style scoped>
.file-upload-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.upload-instructions {
  text-align: center;
  margin-bottom: 2rem;
}

.instruction-icon {
  width: 3rem;
  height: 3rem;
  color: #667eea;
  margin: 0 auto 1rem;
}

.instruction-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.instruction-text {
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.5;
}

.upload-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .upload-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

.upload-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.upload-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.fps-card {
  border-top: 4px solid #10b981;
}

.hardware-card {
  border-top: 4px solid #3b82f6;
}

.upload-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.upload-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.fps-card .upload-icon {
  color: #10b981;
}

.hardware-card .upload-icon {
  color: #3b82f6;
}

.upload-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.upload-zone {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 2rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-zone:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.upload-zone-active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  transform: scale(1.02);
}

.upload-zone-success {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.placeholder-icon {
  width: 3rem;
  height: 3rem;
  color: #9ca3af;
}

.placeholder-text {
  text-align: center;
}

.placeholder-main {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.placeholder-sub {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.placeholder-format {
  font-size: 0.75rem;
  color: #9ca3af;
  font-family: monospace;
  background: rgba(0, 0, 0, 0.05);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.upload-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  position: relative;
  width: 100%;
}

.success-icon {
  width: 3rem;
  height: 3rem;
  color: #10b981;
}

.success-content {
  text-align: center;
  flex: 1;
}

.success-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #065f46;
  margin-bottom: 0.25rem;
}

.success-filename {
  font-size: 0.875rem;
  color: #374151;
  margin-bottom: 0.25rem;
  word-break: break-all;
}

.success-size {
  font-size: 0.75rem;
  color: #6b7280;
}

.clear-button {
  position: absolute;
  top: 0;
  right: 0;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-button:hover {
  background: #fecaca;
  transform: scale(1.1);
}

.upload-status {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.status-indicators {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: #6b7280;
}

.status-item.status-complete {
  background: rgba(16, 185, 129, 0.1);
  color: #065f46;
}

.status-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.status-check {
  width: 1rem;
  height: 1rem;
  color: #10b981;
}

.status-divider {
  width: 3rem;
  height: 2px;
  background: linear-gradient(90deg, #d1d5db, #667eea, #d1d5db);
  border-radius: 2px;
}

.status-ready {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 12px;
  color: #065f46;
}

.ready-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #10b981;
}

.ready-text {
  font-weight: 600;
  font-size: 1.125rem;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(5px);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #f3f4f6;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.hidden {
  display: none;
}

.w-4 {
  width: 1rem;
}
.h-4 {
  height: 1rem;
}
</style>
