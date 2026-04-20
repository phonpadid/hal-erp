<script setup lang="ts">
import { ref } from 'vue';
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import { UploadOutlined, FilePdfOutlined } from "@ant-design/icons-vue";

defineProps<{
  visible: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "upload", files: File[]): void;
}>();

const selectedFiles = ref<File[]>([]);
const previewUrls = ref<string[]>([]);
const fileTypes = ref<string[]>([]); // track type per file
const dragOver = ref(false);
const fileInputRef = ref<HTMLInputElement>();

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) processFiles(target.files);
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  dragOver.value = false;
  if (event.dataTransfer?.files?.length) processFiles(event.dataTransfer.files);
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  dragOver.value = true;
};

const handleDragLeave = () => { dragOver.value = false; };

const processFiles = (files: FileList | File[]) => {
  // ✅ เพิ่ม PDF ใน allowed types
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml',
    'application/pdf'
  ];
  const maxSize = 10 * 1024 * 1024; // ขยายเป็น 10MB สำหรับ PDF

  selectedFiles.value = [];
  previewUrls.value = [];
  fileTypes.value = [];

  Array.from(files).forEach((file) => {
    if (!allowedTypes.includes(file.type)) {
      alert(`❌ ${file.name} ບໍ່ແມ່ນໄຟລ໌ທີ່ຮອງຮັບ (ຮູບພາບ ຫຼື PDF)`);
      return;
    }
    if (file.size > maxSize) {
      alert(`❌ ${file.name} ເກີນ 10MB`);
      return;
    }

    selectedFiles.value.push(file);
    fileTypes.value.push(file.type);

    if (file.type === 'application/pdf') {
      // PDF ไม่มี preview รูป ใช้ placeholder
      previewUrls.value.push('pdf');
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewUrls.value.push(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  });
};

const triggerFileInput = () => fileInputRef.value?.click();

const handleUpload = () => {
  if (selectedFiles.value.length > 0) {
    emit('upload', selectedFiles.value);
    clearSelectedFiles();
  }
};

const clearSelectedFiles = () => {
  selectedFiles.value = [];
  previewUrls.value = [];
  fileTypes.value = [];
  if (fileInputRef.value) fileInputRef.value.value = '';
};

const handleModalClose = (val: boolean) => {
  clearSelectedFiles();
  emit('update:visible', val);
};

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
  previewUrls.value.splice(index, 1);
  fileTypes.value.splice(index, 1);
};

const isPdf = (index: number) => fileTypes.value[index] === 'application/pdf';
</script>

<template>
  <UiModal
    title="ອັບໂຫຼດໄຟລ໌"
    :visible="visible"
    :confirm-loading="loading"
    :footer="null"
    @update:visible="handleModalClose"
  >
    <div class="space-y-4">
      <p class="text-slate-600">ກະລຸນາເລືອກຮູບພາບ ຫຼື ໄຟລ໌ PDF ທີ່ຈະອັບໂຫຼດ</p>

      <!-- Hidden input — accept images + PDF -->
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*,application/pdf"
        multiple
        style="display: none"
        @change="handleFileSelect"
      />

      <!-- Dropzone -->
      <div
        :class="[
          'w-full flex flex-col items-center justify-center min-h-[200px] border-dashed border-2 cursor-pointer rounded-md transition-colors text-center px-4',
          dragOver ? 'border-red-400 bg-red-50' : 'border-red-100',
          selectedFiles.length ? 'border-red-300 bg-slate-50' : ''
        ]"
        @click="triggerFileInput"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
      >
        <!-- Previews -->
        <div v-if="previewUrls.length" class="flex flex-wrap justify-center gap-3 p-4">
          <div
            v-for="(url, index) in previewUrls"
            :key="index"
            class="w-[140px] h-[100px] rounded-md relative overflow-hidden shadow border group"
          >
            <!-- PDF preview -->
            <div
              v-if="isPdf(index)"
              class="w-full h-full flex flex-col items-center justify-center bg-red-50"
            >
              <FilePdfOutlined class="text-3xl text-red-500 mb-1" />
              <p class="text-xs text-gray-600 px-2 truncate w-full text-center">
                {{ selectedFiles[index]?.name }}
              </p>
            </div>

            <!-- Image preview -->
            <img v-else :src="url" class="w-full h-full object-cover" />

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
          <!-- ✅ อัปเดต hint -->
          <p class="text-xs text-gray-400 mt-1">SVG, PNG, JPG, GIF, PDF ≤ 999K</p>
        </div>
      </div>

      <!-- File count -->
      <div v-if="selectedFiles.length" class="text-sm text-gray-600 text-center">
        ເລືອກແລ້ວ {{ selectedFiles.length }} ໄຟລ໌
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