<template>
  <div class="upload-wrapper">
    <div
      ref="uploadArea"
      class="upload-area p-6 text-center"
      :class="{ dragover: isDragOver }"
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragOver = true"
      @dragenter.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
    >
      <div v-if="!fileName" class="upload-content">
        <Icon
          name="lucide:upload"
          class="w-12 h-12 text-gray-400 mx-auto mb-4"
        />
        <p class="text-lg font-medium text-gray-700 mb-2">
          Glissez-déposez votre fichier ici
        </p>
        <p class="text-sm text-gray-500 mb-4">
          {{ placeholder }}
        </p>
        <button
          type="button"
          class="btn btn-outline"
          @click="$refs.fileInput.click()"
        >
          <Icon name="lucide:folder-open" class="w-4 h-4 mr-2" />
          Choisir un fichier
        </button>
      </div>

      <div v-else class="upload-success">
        <Icon
          name="lucide:check-circle"
          class="w-12 h-12 text-green-500 mx-auto mb-4"
        />
        <p class="text-lg font-medium text-gray-700 mb-2">
          Fichier sélectionné
        </p>
        <p class="text-sm text-gray-600 mb-4">{{ fileName }}</p>
        <button type="button" class="btn btn-outline" @click="clearFile">
          <Icon name="lucide:x" class="w-4 h-4 mr-2" />
          Supprimer
        </button>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      class="hidden"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  accept: {
    type: String,
    default: "*",
  },
  fileName: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Sélectionnez un fichier",
  },
});

// Emits
const emit = defineEmits(["file-selected"]);

// State
const isDragOver = ref(false);

// Methods
const handleDrop = (event) => {
  isDragOver.value = false;
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (isValidFile(file)) {
      emit("file-selected", file);
    } else {
      alert("Type de fichier non supporté");
    }
  }
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file && isValidFile(file)) {
    emit("file-selected", file);
  } else if (file) {
    alert("Type de fichier non supporté");
  }
};

const isValidFile = (file) => {
  if (props.accept === "*") return true;
  const acceptedTypes = props.accept.split(",").map((type) => type.trim());
  return acceptedTypes.some((type) => {
    if (type.startsWith(".")) {
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    }
    return file.type.includes(type.replace("*", ""));
  });
};

const clearFile = () => {
  emit("file-selected", null);
};
</script>

<style scoped>
.upload-wrapper {
  width: 100%;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #3b82f6;
  background-color: #f8fafc;
}

.upload-area.dragover {
  border-color: #10b981;
  background-color: #ecfdf5;
}

.upload-content,
.upload-success {
  padding: 1rem;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.text-gray-400 {
  color: #9ca3af;
}
.text-gray-500 {
  color: #6b7280;
}
.text-gray-600 {
  color: #4b5563;
}
.text-green-500 {
  color: #10b981;
}

.h-12 {
  height: 3rem;
}
.w-12 {
  width: 3rem;
}
</style>
