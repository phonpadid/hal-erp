<script setup lang="ts">
import { ref } from 'vue';
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import { UploadOutlined } from "@ant-design/icons-vue";

// Props
defineProps<{
  visible: boolean;
  loading?: boolean;
}>();

// Emits
const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "upload", files: File[]): void;
}>();

// State
const selectedFiles = ref<File[]>([]);
const previewUrls = ref<string[]>([]);
const dragOver = ref(false);
const fileInputRef = ref<HTMLInputElement>();

// Handle file select from input
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    processFiles(files);
  }
};

// Handle drag drop
const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  dragOver.value = false;
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    processFiles(files);
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  dragOver.value = true;
};

const handleDragLeave = () => {
  dragOver.value = false;
};

// Handle multiple files
const processFiles = (files: FileList | File[]) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  selectedFiles.value = [];
  previewUrls.value = [];

  Array.from(files).forEach((file) => {
    if (!allowedTypes.includes(file.type)) {
      alert(`❌ ${file.name} is not a valid image.`);
      return;
    }
    if (file.size > maxSize) {
      alert(`❌ ${file.name} exceeds 5MB.`);
      return;
    }

    selectedFiles.value.push(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      previewUrls.value.push(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  });
};

// Trigger input
const triggerFileInput = () => {
  fileInputRef.value?.click();
};

// Upload - emit files to parent
const handleUpload = () => {
  if (selectedFiles.value.length > 0) {
    // console.log('Emitting upload event with files:', selectedFiles.value);
    emit('upload', selectedFiles.value);
    // Clear after successful upload
    clearSelectedFiles();
  }
};

// Clear selected files and previews
const clearSelectedFiles = () => {
  selectedFiles.value = [];
  previewUrls.value = [];
  if (fileInputRef.value) fileInputRef.value.value = '';
};

// Reset on close - clear in ALL cases
const handleModalClose = (val: boolean) => {
  // Always clear when modal closes (regardless of val)
  clearSelectedFiles();
  emit('update:visible', val);
};

// Remove selected file
const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
  previewUrls.value.splice(index, 1);
};
</script>

<template>
  <UiModal
    title="ຮູບພາບຕົວຢ່າງ"
    :visible="visible"
    :confirm-loading="loading"
    :footer="null"
    @update:visible="handleModalClose"
  >
    <div class="space-y-4">
      <p class="text-slate-600">ກະລຸນາເລືອກຮູບພາບສິນຄ້າທີ່ຈະອັບໂຫຼດ</p>

      <!-- Hidden input -->
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        multiple
        style="display: none"
        @change="handleFileSelect"
      />

      <!-- Dropzone -->
      <div
        :class="[
          'w-full flex flex-col items-center justify-center border-dashed border-2 cursor-pointer rounded-md transition-colors text-center px-0',
          dragOver ? 'border-red-400 bg-red-50' : 'border-red-100',
          selectedFiles.length ? 'border-red-300 bg-slate-50' : ''
        ]"
        @click="triggerFileInput"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
      >
        <!-- Show image previews -->
        <div v-if="previewUrls.length" class="flex flex-wrap justify-center gap-1 p-2">
          <div
            v-for="(url, index) in previewUrls"
            :key="index"
            class="w-[100px] h-[200px] rounded-md relative shadow border group"
          >
            <img :src="url" class="w-[120px] h-[200px]" />
            <!-- Remove button -->
            <button
              class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              @click.stop="removeFile(index)"
            >
              ×
            </button>
          </div>
        </div>

        <!-- Upload prompt -->
        <div v-else class="description flex-col flex items-center">
          <p class="text-2xl text-red-500 mb-2">
            <UploadOutlined />
          </p>
          <p class="font-medium">Click to upload file</p>
          <p class="text-sm text-gray-500">ຫຼື ລາກໄຟລ໌ມາວາງທີ່ນີ້</p>
          <p class="text-xs text-gray-400 mt-1">SVG, PNG, JPG, GIF, ≤ 5MB</p>
        </div>
      </div>

      <!-- File count info -->
      <div v-if="selectedFiles.length" class="text-sm text-gray-600 text-center">
        ເລືອກແລ້ວ {{ selectedFiles.length }} ຮູບ
      </div>

      <!-- Action buttons -->
      <div class="flex justify-center w-full gap-2 mt-6">
        <button
          v-if="selectedFiles.length && !loading"
          class="px-4 py-2 w-full rounded-md bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          @click="handleUpload"
        >
          {{ loading ? 'ກຳລັງອັບໂຫລດ...' : 'ຢືນຢັນການອັບໂຫຼດ' }}
        </button>
      </div>
    </div>
  </UiModal>
</template>
