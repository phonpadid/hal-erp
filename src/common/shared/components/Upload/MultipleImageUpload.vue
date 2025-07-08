<template>
  <div class="image-upload-container">
    <div class="upload-area">
      <!-- ส่วนแสดงรูปภาพที่อัปโหลดแล้ว -->
      <div class="uploaded-images" v-if="fileList.length > 0">
        <div v-for="file in fileList" :key="file.uid" class="uploaded-image-item">
          <img :src="file.url || file.thumbUrl" :alt="file.name" class="uploaded-image" />
          <div class="image-actions">
            <a-button type="text" class="action-btn" @click="handlePreview(file)">
              <eye-outlined />
            </a-button>
            <a-button type="text" class="action-btn" @click="handleRemove(file)">
              <delete-outlined />
            </a-button>
          </div>
          <div class="image-status" v-if="file.status === 'uploading'">
            <a-progress :percent="file.percent || 0" size="small" />
          </div>
        </div>
      </div>

      <!-- ปุ่มอัปโหลด -->
      <div class="upload-button-container">
        <a-upload
          v-model:file-list="fileList"
          :action="uploadAction"
          :multiple="multiple"
          :accept="accept"
          :max-count="maxCount"
          :before-upload="beforeUpload"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :on-change="handleChange"
          :custom-request="customRequest"
          :show-upload-list="false"
          :disabled="disabled || fileList.length >= maxCount"
        >
          <div class="upload-button" v-if="fileList.length < maxCount">
            <div class="upload-icon">
              <Icon icon="material-symbols:cloud-upload" />
            </div>
            <div class="upload-text">{{ uploadText }}</div>
            <div class="upload-hint">{{ uploadHint }}</div>
          </div>
        </a-upload>
      </div>
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
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { Icon } from "@iconify/vue";
import { message } from "ant-design-vue";
import type { UploadFile } from "ant-design-vue";

// Props interface
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
  // ขนาด
  uploadWidth?: string;
  uploadHeight?: string;
  uploadButtonWidth?: string;
  uploadButtonHeight?: string;
  iconSize?: string;
  textSize?: string;
  hintSize?: string;
  // ระยะห่าง
  itemSpacing?: string;
  rowSpacing?: string;
  thumbnailFit?: "cover" | "contain" | "fill";
}

// Emits interface
interface Emits {
  (e: "update:modelValue", value: UploadFile[]): void;
  (e: "change", fileList: UploadFile[]): void;
  (e: "preview", file: UploadFile): void;
  (e: "remove", file: UploadFile): void;
  (e: "upload-complete", fileList: UploadFile[]): void;
}

// Define props with defaults
const props = withDefaults(defineProps<Props>(), {
  uploadAction: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
  listType: "picture-card",
  multiple: false,
  accept: "image/*",
  maxCount: 10,
  maxSize: 5,
  uploadText: "ອັບໂຫລດເອກະສານ",
  uploadHint: "ຫຼືລາກວາງຮູບພາບ (JPG, PNG) ຂະໜາດເທົ່າ 5MB",
  showSummary: true,
  disabled: false,
  uploadWidth: "100%",
  uploadHeight: "auto",
  uploadButtonWidth: "150px",
  uploadButtonHeight: "150px",
  iconSize: "40px",
  textSize: "16px",
  hintSize: "14px",
  // ระยะห่าง
  itemSpacing: "20px",
  rowSpacing: "20px",
  thumbnailFit: "contain",
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

// Event handlers
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
  fileList.value = fileList.value.filter((item) => item.uid !== file.uid);
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
  padding: 16px;
}

/* พื้นที่อัปโหลดหลัก */
.upload-area {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: v-bind("props.rowSpacing");
}

/* พื้นที่สำหรับรูปที่อัปโหลดแล้ว */
.uploaded-images {
  display: flex;
  flex-wrap: wrap;
  gap: v-bind("props.itemSpacing");
}

.uploaded-image-item {
  width: v-bind("props.uploadButtonWidth");
  height: v-bind("props.uploadButtonHeight");
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  animation: slideInRight 0.4s ease-out;
}

.uploaded-image-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: v-bind("props.thumbnailFit");
  object-position: center;
  transition: transform 0.3s ease;
}

.uploaded-image-item:hover .uploaded-image {
  transform: scale(1.05);
}

/* ปุ่มควบคุมต่างๆ (ดู, ลบ) */
.image-actions {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  padding: 8px 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  gap: 8px;
}

.uploaded-image-item:hover .image-actions {
  opacity: 1;
}

.action-btn {
  color: white !important;
  font-size: 18px !important;
}

.action-btn:hover {
  color: #1890ff !important;
}

/* แสดงสถานะการอัปโหลด */
.image-status {
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 5px;
  border-radius: 4px;
}

/* ปุ่มอัปโหลด */
.upload-button-container {
  flex-shrink: 0;
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

/* สรุปการอัปโหลด */
.upload-summary {
  margin-top: 24px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

/* โมดัลแสดงความคืบหน้า */
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

/* แอนิเมชัน */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .upload-area {
    flex-direction: column;
    align-items: center;
  }

  .uploaded-images {
    justify-content: center;
  }

  .uploaded-image-item {
    width: 150px;
    height: 150px;
  }

  .upload-button {
    width: 150px;
    height: 150px;
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
</style>
