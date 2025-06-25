<template>
  <!-- Template ส่วนนี้เหมือนเดิม -->
  <div class="image-upload-container">
    <div class="clearfix">
      <a-upload
        v-model:file-list="fileList"
        :action="uploadAction"
        :list-type="listType"
        :multiple="multiple"
        :accept="accept"
        :max-count="maxCount"
        :before-upload="beforeUpload"
        :on-preview="handlePreview"
        :on-remove="handleRemove"
        :on-change="handleChange"
        :custom-request="customRequest"
        :show-upload-list="showUploadList"
        :disabled="disabled"
        class="custom-upload-size"
      >
        <div v-if="fileList.length < maxCount" class="upload-button">
          <div class="upload-icon">
            <plus-outlined />
          </div>
          <div class="upload-text">{{ uploadText }}</div>
          <div class="upload-hint">{{ uploadHint }}</div>
        </div>
      </a-upload>

      <!-- Preview Modal -->
      <a-modal
        :open="previewVisible"
        :title="previewTitle"
        :footer="null"
        @cancel="handleCancel"
        :width="800"
      >
        <img
          alt="preview"
          style="width: 100%; max-height: 600px; object-fit: contain"
          :src="previewImage"
        />
      </a-modal>

      <!-- Progress Modal for Multiple Upload -->
      <a-modal
        :open="uploadProgressVisible"
        title="ກຳລັງອັບໂຫລດ..."
        :footer="null"
        :closable="false"
        :mask-closable="false"
      >
        <div class="upload-progress-container">
          <div v-for="(progress, index) in uploadProgress" :key="index" class="progress-item">
            <div class="progress-info">
              <span>{{ progress.name }}</span>
              <span>{{ progress.percent }}%</span>
            </div>
            <a-progress
              :percent="progress.percent"
              :status="progress.status"
              :stroke-color="progress.status === 'exception' ? '#ff4d4f' : '#1890ff'"
            />
          </div>
          <div class="progress-summary">
            <p>{{ uploadedCount }}/{{ totalUploadCount }} ໄຟລ໌ສຳເລັດ</p>
            <a-button v-if="allUploadsComplete" type="primary" @click="closeProgressModal">
              ປິດ
            </a-button>
          </div>
        </div>
      </a-modal>
    </div>

    <!-- Upload Summary -->
    <div v-if="showSummary && fileList.length > 0" class="upload-summary">
      <a-space>
        <a-tag color="blue"
          ><span>ທັງໝົດ: {{ fileList.length }}</span></a-tag
        >
        <a-tag color="green"
          ><span>ສຳເລັດ: {{ successCount }}</span></a-tag
        >
        <a-tag color="orange"
          ><span>ກຳລັງອັບໂຫລດ: {{ uploadingCount }}</span></a-tag
        >
        <a-tag color="red"
          ><span>ຜິດພາດ: {{ errorCount }}</span></a-tag
        >
      </a-space>
      <a-space style="margin-top: 8px">
        <a-button size="small" @click="clearAll">ລົບທັງໝົດ</a-button>
        <a-button size="small" @click="retryFailed">ລອງໃຫມ່ (ທີຜິດພາດ)</a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
// Script ส่วนนี้เหมือนเดิม - ไม่ต้องเปลี่ยน
import { ref, computed, watch } from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import type { UploadFile } from "ant-design-vue";

// Props interface - เพิ่ม props สำหรับกำหนดระยะห่าง
interface Props {
  modelValue?: UploadFile[];
  uploadAction?: string;
  listType?: "text" | "picture" | "picture-card" | "picture-circle";
  multiple?: boolean;
  accept?: string;
  maxCount?: number;
  maxSize?: number; // MB
  uploadText?: string;
  uploadHint?: string;
  showSummary?: boolean;
  disabled?: boolean;
  customUpload?: (file: File) => Promise<string>; // Custom upload function that returns URL
  // เพิ่ม props สำหรับกำหนดขนาด
  uploadWidth?: string;
  uploadHeight?: string;
  uploadButtonWidth?: string;
  uploadButtonHeight?: string;
  iconSize?: string;
  textSize?: string;
  hintSize?: string;
  // เพิ่ม props สำหรับกำหนดระยะห่าง
  itemSpacing?: string;
  rowSpacing?: string;
}

// Emits interface
interface Emits {
  (e: "update:modelValue", value: UploadFile[]): void;
  (e: "change", fileList: UploadFile[]): void;
  (e: "preview", file: UploadFile): void;
  (e: "remove", file: UploadFile): void;
  (e: "upload-complete", fileList: UploadFile[]): void;
}

// Define props with defaults - เพิ่ม default values สำหรับระยะห่าง
const props = withDefaults(defineProps<Props>(), {
  uploadAction: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
  listType: "picture-card",
  multiple: true,
  accept: "image/*",
  maxCount: 10,
  maxSize: 5,
  uploadText: "ອັບໂຫລດເອກະສານ",
  uploadHint: "ຫຼືລາກວາງຮູບພາບ (JPG, PNG) ຂະໜາດເທົ່າ 5MB",
  showSummary: true,
  disabled: false,
  // Default values สำหรับขนาด
  uploadWidth: "100%",
  uploadHeight: "auto",
  uploadButtonWidth: "200px",
  uploadButtonHeight: "150px",
  iconSize: "48px",
  textSize: "16px",
  hintSize: "14px",
  // Default values สำหรับระยะห่าง
  itemSpacing: "16px",
  rowSpacing: "16px",
});

// Define emits
const emit = defineEmits<Emits>();

// State
const fileList = ref<UploadFile[]>([]);

const previewVisible = ref(false);
const previewImage = ref("");
const previewTitle = ref("");

// Multiple upload progress
const uploadProgressVisible = ref(false);
const uploadProgress = ref<
  Array<{
    name: string;
    percent: number;
    status: "normal" | "exception" | "success";
  }>
>([]);

// Computed properties
const successCount = computed(() => fileList.value.filter((file) => file.status === "done").length);

const uploadingCount = computed(
  () => fileList.value.filter((file) => file.status === "uploading").length
);

const errorCount = computed(() => fileList.value.filter((file) => file.status === "error").length);

const uploadedCount = computed(
  () =>
    uploadProgress.value.filter((p) => p.status === "success" || p.status === "exception").length
);

const totalUploadCount = computed(() => uploadProgress.value.length);

const allUploadsComplete = computed(
  () => uploadedCount.value === totalUploadCount.value && totalUploadCount.value > 0
);

const showUploadList = computed(() => ({
  showPreviewIcon: true,
  showRemoveIcon: !props.disabled,
  showDownloadIcon: false,
}));

// Watch for modelValue changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      fileList.value = [...newValue];
    }
  },
  { immediate: true }
);

// Watch fileList changes
watch(
  fileList,
  (newFileList) => {
    emit("update:modelValue", newFileList);
    emit("change", newFileList);
  },
  { deep: true }
);

// Utility functions
function getBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

function generateUid(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Event handlers (เหมือนเดิม)
const beforeUpload = (file: File, fileList: File[]) => {
  const isImage = file.type.startsWith("image/");
  if (!isImage) {
    message.error("ກະລຸນາອັບໂຫລດໄຟຮູບພາບເທົ່ານັ້ນ!");
    return false;
  }

  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize;
  if (!isLtMaxSize) {
    message.error(`ຂະໜາດໄຟບໍ່ຄວນເກີນ ${props.maxSize}MB!`);
    return false;
  }

  if (fileList.length > 1) {
    uploadProgressVisible.value = true;
    uploadProgress.value = fileList.map((f) => ({
      name: f.name,
      percent: 0,
      status: "normal" as const,
    }));
  }

  return true;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const customRequest = async (options: any) => {
  const { file, onProgress, onSuccess, onError } = options;

  try {
    if (props.customUpload) {
      const url = await props.customUpload(file);
      onSuccess({ url }, file);
    } else {
      let percent = 0;
      const interval = setInterval(() => {
        percent += Math.random() * 30;
        if (percent > 100) {
          percent = 100;
          clearInterval(interval);

          setTimeout(() => {
            const url = URL.createObjectURL(file);
            onSuccess({ url }, file);
          }, 500);
        }

        onProgress({ percent: Math.floor(percent) }, file);

        const progressIndex = uploadProgress.value.findIndex((p) => p.name === file.name);
        if (progressIndex !== -1) {
          uploadProgress.value[progressIndex].percent = Math.floor(percent);
          if (percent >= 100) {
            uploadProgress.value[progressIndex].status = "success";
          }
        }
      }, 200);
    }
  } catch (error) {
    console.error("Upload error:", error);
    onError(error);

    const progressIndex = uploadProgress.value.findIndex((p) => p.name === file.name);
    if (progressIndex !== -1) {
      uploadProgress.value[progressIndex].status = "exception";
      uploadProgress.value[progressIndex].percent = 0;
    }
  }
};

const handleChange = (info: { fileList: UploadFile[] }) => {
  fileList.value = info.fileList.map((file) => {
    if (file.response) {
      file.url = file.response.url || file.url;
      file.thumbUrl = file.response.url || file.thumbUrl;
    }
    return file;
  });

  const allDone = info.fileList.every((file) => file.status === "done" || file.status === "error");

  if (allDone && uploadProgressVisible.value) {
    setTimeout(() => {
      if (allUploadsComplete.value) {
        emit("upload-complete", fileList.value);
      }
    }, 1000);
  }
};

const handlePreview = async (file: UploadFile) => {
  if (!file.url && !file.preview) {
    if (file.originFileObj) {
      file.preview = await getBase64(file.originFileObj);
    }
  }

  previewImage.value = file.url || file.preview || "";
  previewVisible.value = true;
  previewTitle.value = file.name || "Preview";

  emit("preview", file);
};

const handleRemove = (file: UploadFile) => {
  emit("remove", file);
  return true;
};

const handleCancel = () => {
  previewVisible.value = false;
  previewTitle.value = "";
};

const closeProgressModal = () => {
  uploadProgressVisible.value = false;
  uploadProgress.value = [];
};

const clearAll = () => {
  fileList.value = [];
  message.success("ລົບໄຟລ໌ທັງໝົດ!");
};

const retryFailed = () => {
  const failedFiles = fileList.value.filter((file) => file.status === "error");
  if (failedFiles.length === 0) {
    message.info("ບໍ່ມີໄຟລ໌ທີ່ຜິດພາດໃນການອັບໂຫລດ");
    return;
  }

  failedFiles.forEach((file) => {
    file.status = "uploading";
    file.percent = 0;
  });

  message.info(`ກຳລັງລອງອັບໂຫລດໃຫມ່ ${failedFiles.length} ໄຟລ໌`);
};

const addSampleImages = (count: number = 3) => {
  for (let i = 0; i < count; i++) {
    const uid = generateUid();
    fileList.value.push({
      uid,
      name: `sample-${uid}.jpg`,
      status: "done",
      url: `https://picsum.photos/300/200?random=${Date.now() + i}`,
      thumbUrl: `https://picsum.photos/300/200?random=${Date.now() + i}`,
    });
  }
};

defineExpose({
  clearAll,
  retryFailed,
  addSampleImages,
  getFileList: () => fileList.value,
  getSuccessFiles: () => fileList.value.filter((f) => f.status === "done"),
});
</script>

<style scoped>
.image-upload-container {
  width: v-bind("props.uploadWidth");
  height: v-bind("props.uploadHeight");
}

/* ปรับแต่ง upload container */
.custom-upload-size :deep(.ant-upload) {
  width: 100% !important;
  height: 100% !important;
}

.custom-upload-size :deep(.ant-upload-select) {
  width: 100% !important;
  height: 100% !important;
}

.custom-upload-size :deep(.ant-upload-select-picture-card) {
  width: v-bind("props.uploadButtonWidth") !important;
  height: v-bind("props.uploadButtonHeight") !important;
  margin: 0 !important;
}

/* 🎯 สำคัญ! - จัดเรียงแบบ Grid พร้อมระยะห่าง */
.custom-upload-size :deep(.ant-upload-list-picture-card) {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, v-bind("props.uploadButtonWidth")) !important;
  gap: v-bind("props.itemSpacing") v-bind("props.itemSpacing") !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* บังคับขนาดของไฟล์ที่อัปโหลดแล้วให้เท่ากับปุ่ม upload */
.custom-upload-size :deep(.ant-upload-list-picture-card .ant-upload-list-item) {
  width: v-bind("props.uploadButtonWidth") !important;
  height: v-bind("props.uploadButtonHeight") !important;
  margin: 0 !important;
  border-radius: 8px !important;
  overflow: hidden !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.3s ease !important;
}

/* Hover effect สำหรับไฟล์ที่อัปโหลดแล้ว */
.custom-upload-size :deep(.ant-upload-list-picture-card .ant-upload-list-item:hover) {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;
}

/* บังคับขนาดของ thumbnail ในรายการไฟล์ */
.custom-upload-size :deep(.ant-upload-list-picture-card .ant-upload-list-item-thumbnail) {
  width: 100% !important;
  height: 100% !important;
  border-radius: 8px !important;
  overflow: hidden !important;
}

.custom-upload-size :deep(.ant-upload-list-picture-card .ant-upload-list-item-thumbnail img) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  transition: transform 0.3s ease !important;
}

/* Zoom effect เมื่อ hover บนรูป */
.custom-upload-size
  :deep(
    .ant-upload-list-picture-card .ant-upload-list-item:hover .ant-upload-list-item-thumbnail img
  ) {
  transform: scale(1.05) !important;
}

/* ปรับแต่ง actions (preview, delete buttons) */
.custom-upload-size :deep(.ant-upload-list-picture-card .ant-upload-list-item-actions) {
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  background-color: rgba(0, 0, 0, 0.7) !important;
  border-radius: 8px !important;
  padding: 10px 16px !important;
  opacity: 0 !important;
  transition: opacity 0.3s ease !important;
}

.custom-upload-size
  :deep(.ant-upload-list-picture-card .ant-upload-list-item:hover .ant-upload-list-item-actions) {
  opacity: 1 !important;
}

.custom-upload-size :deep(.ant-upload-list-picture-card .ant-upload-list-item-actions .anticon) {
  color: white !important;
  font-size: 18px !important;
  margin: 0 6px !important;
  cursor: pointer !important;
  transition: color 0.2s ease !important;
}

.custom-upload-size
  :deep(.ant-upload-list-picture-card .ant-upload-list-item-actions .anticon:hover) {
  color: #1890ff !important;
}

/* ปรับแต่ง progress bar สำหรับไฟล์ที่กำลังอัปโหลด */
.custom-upload-size :deep(.ant-upload-list-picture-card .ant-upload-list-item-uploading) {
  width: v-bind("props.uploadButtonWidth") !important;
  height: v-bind("props.uploadButtonHeight") !important;
  border: 2px solid #1890ff !important;
}

.custom-upload-size
  :deep(
    .ant-upload-list-picture-card .ant-upload-list-item-uploading .ant-upload-list-item-progress
  ) {
  position: absolute !important;
  bottom: 12px !important;
  left: 12px !important;
  right: 12px !important;
}

/* ปรับแต่ง error state */
.custom-upload-size :deep(.ant-upload-list-picture-card .ant-upload-list-item-error) {
  width: v-bind("props.uploadButtonWidth") !important;
  height: v-bind("props.uploadButtonHeight") !important;
  border: 2px solid #ff4d4f !important;
}

/* ปรับแต่ง success state */
.custom-upload-size :deep(.ant-upload-list-picture-card .ant-upload-list-item-done) {
  width: v-bind("props.uploadButtonWidth") !important;
  height: v-bind("props.uploadButtonHeight") !important;
  border: 1px solid #f0f0f0 !important;
}

/* จัดการ upload button ให้อยู่ในตำแหน่งที่ถูกต้อง */
.custom-upload-size :deep(.ant-upload-list-picture-card .ant-upload-select) {
  width: v-bind("props.uploadButtonWidth") !important;
  height: v-bind("props.uploadButtonHeight") !important;
  margin: 0 !important;
}

.upload-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: v-bind("props.uploadButtonWidth");
  height: v-bind("props.uploadButtonHeight");
  background-color: #fafafa;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-button:hover {
  border-color: #1890ff;
  background-color: #f0f7ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.15);
}

.upload-icon {
  font-size: v-bind("props.iconSize");
  color: #bfbfbf;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.upload-button:hover .upload-icon {
  color: #1890ff;
  transform: scale(1.1);
}

.upload-text {
  font-size: v-bind("props.textSize");
  color: #666;
  margin-bottom: 6px;
  font-weight: 500;
  transition: color 0.3s ease;
}

.upload-button:hover .upload-text {
  color: #1890ff;
}

.upload-hint {
  font-size: v-bind("props.hintSize");
  color: #999;
  text-align: center;
  line-height: 1.4;
  padding: 0 8px;
  transition: color 0.3s ease;
}

.upload-button:hover .upload-hint {
  color: #666;
}

.upload-summary {
  margin-top: 24px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.upload-progress-container {
  max-height: 400px;
  overflow-y: auto;
}

.progress-item {
  margin-bottom: 16px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 14px;
}

.progress-summary {
  text-align: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

/* Responsive design */
@media (max-width: 768px) {
  .custom-upload-size :deep(.ant-upload-list-picture-card) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
    gap: 12px !important;
  }

  .upload-button {
    min-width: 150px;
    min-height: 120px;
  }

  .upload-icon {
    font-size: calc(v-bind("props.iconSize") * 0.8);
  }

  .upload-text {
    font-size: calc(v-bind("props.textSize") * 0.9);
  }

  .upload-hint {
    font-size: calc(v-bind("props.hintSize") * 0.9);
  }
}

/* Animation สำหรับไฟล์ใหม่ที่เพิ่มเข้ามา */
.custom-upload-size :deep(.ant-upload-list-picture-card .ant-upload-list-item) {
  animation: slideInUp 0.3s ease-out !important;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
