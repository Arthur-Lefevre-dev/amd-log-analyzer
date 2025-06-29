<template>
  <div
    class="upload-area p-6 text-center cursor-pointer"
    :class="{ dragover: isDragOver }"
    @click="triggerFileInput"
    @drop="handleDrop"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
  >
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      @change="handleFileSelect"
      class="hidden"
    />

    <div v-if="!fileName" class="space-y-4">
      <Icon
        name="lucide:upload-cloud"
        class="w-12 h-12 mx-auto text-base-content/50"
      />
      <div>
        <p class="text-lg font-medium">
          {{ placeholder || "Cliquez ou glissez-déposez" }}
        </p>
        <p class="text-sm text-base-content/70">Fichiers CSV acceptés</p>
      </div>
    </div>

    <div v-else class="space-y-4">
      <Icon name="lucide:file-check" class="w-12 h-12 mx-auto text-success" />
      <div>
        <p class="text-lg font-medium text-success">{{ fileName }}</p>
        <p class="text-sm text-base-content/70">Fichier sélectionné</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  accept: {
    type: String,
    default: ".csv",
  },
  fileName: {
    type: String,
    default: null,
  },
  placeholder: {
    type: String,
    default: "Sélectionnez un fichier",
  },
});

const emit = defineEmits(["file-selected"]);

const fileInput = ref(null);
const isDragOver = ref(false);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    emit("file-selected", file);
  }
};

const handleDrop = (event) => {
  event.preventDefault();
  isDragOver.value = false;

  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (file.name.endsWith(".csv")) {
      emit("file-selected", file);
    } else {
      alert("Veuillez sélectionner un fichier CSV");
    }
  }
};

const handleDragOver = (event) => {
  event.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = () => {
  isDragOver.value = false;
};
</script>
