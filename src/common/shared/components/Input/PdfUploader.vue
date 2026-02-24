<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue";
import { Upload, message } from "ant-design-vue";
import type { UploadFile } from "ant-design-vue";
import { uploadFile } from "@/modules/application/services/upload.service";
import { Icon } from "@iconify/vue";

const props = defineProps<{
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "uploaded", payload: { fileName: string; fileUrl: string }): void;
  (e: "remove"): void;
}>();

const fileList = ref<UploadFile[]>([]);
const previewUrl = ref<string>("");
const uploadedFileName = ref<string>("");
const uploadLoading = ref(false);

const beforeUpload = async (file: File) => {
  // ✅ รองรับทั้ง PDF และรูปภาพ
  const isPdf = file.type === "application/pdf";
  const isImage = file.type.startsWith("image/");

  if (!isPdf && !isImage) {
    message.error("ກະລຸນາເລືອກ PDF ຫຼື ຮູບພາບ (JPG, PNG, etc.) ເທົ່ານັ້ນ");
    return Upload.LIST_IGNORE;
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    message.error("ຂະໜາດໄຟຣຕ້ອງບໍ່ເກີນ 10MB");
    return Upload.LIST_IGNORE;
  }

  return false;
};

const handleChange = async (info: { file: UploadFile; fileList: UploadFile[] }) => {
  const latest = info.fileList.slice(-1);
  fileList.value = latest;

  const first = latest[0];
  if (first?.originFileObj) {
    previewUrl.value = URL.createObjectURL(first.originFileObj);
    try {
      uploadLoading.value = true;
      const fd = new FormData();
      fd.append("file", first.originFileObj as File);
      const { fileName } = await uploadFile(fd);
      uploadedFileName.value = fileName;
      emit("uploaded", {
        fileName: fileName,
        fileUrl: previewUrl.value,
      });
      message.success("ອັບໂຫລດສຳເລັດ");
    } catch (err) {
      console.error("upload api error", err);
      message.error("ອັບໂຫລດລົ້ມເລວ");
      fileList.value = [];
      previewUrl.value = "";
      uploadedFileName.value = "";
    } finally {
      uploadLoading.value = false;
    }
  } else {
    previewUrl.value = "";
  }
};

onBeforeUnmount(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
});

const handleRemove = () => {
  fileList.value = [];
  previewUrl.value = "";
  uploadedFileName.value = "";
  emit("remove");
};
</script>

<template>
  <Upload.Dragger
    v-model:file-list="fileList"
    :before-upload="beforeUpload"
    :show-upload-list="false"
    accept=".pdf,application/pdf,image/*,.jpg,.jpeg,.png,.gif,.webp"
    :multiple="false"
    :max-count="1"
    :disabled="disabled || uploadLoading"
    class="upload-dragger-pdf"
    @change="handleChange"
  >
    <div class="uploader-body-pdf">
      <div v-if="previewUrl" class="preview-wrapper-pdf">
        <div class="pdf-preview">
          <div class="pdf-icon-wrapper">
            <Icon icon="mdi:file-pdf-box" class="pdf-icon" />
          </div>
          <div class="pdf-info">
            <div class="pdf-filename">
              {{ fileList[0]?.name || "ไฟล์ PDF" }}
            </div>
            <div class="pdf-size" v-if="fileList[0]?.size">
              {{ (fileList[0].size / 1024 / 1024).toFixed(2) }} MB
            </div>
          </div>
        </div>
        <button
          type="button"
          class="remove-btn-pdf"
          @click.stop="handleRemove"
          aria-label="remove"
          :disabled="uploadLoading"
        >
          <Icon icon="mdi:delete" class="text-xs" />
        </button>

        <div v-if="uploadLoading" class="overlay-pdf">
          <a-spin size="large" />
          <div class="overlay-text-pdf">ກຳລັງອັບໂຫລດ...</div>
        </div>
      </div>
      <div v-else class="placeholder-pdf">
        <div class="icon-pdf">
          <Icon icon="mdi:cloud-upload" class="text-4xl" />
        </div>
        <div class="title-pdf">
          ຄິກຫຼືລາກໄຟລ໌ມາວາງທີ່ນີ່
        </div>
        <div class="hint-pdf">
          ຮອງຮັບໄຟລ໌ PDF ແລະ ຮູບພາບ (ສູງສຸດ 10MB)
        </div>
      </div>
    </div>
  </Upload.Dragger>
</template>

<style scoped>
/* Upload area styles */
.upload-dragger-pdf {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px dashed #f59e0b !important;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.upload-dragger-pdf:hover:not(.ant-upload-disabled) {
  border-color: #d97706 !important;
  background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%);
}

.uploader-body-pdf {
  position: relative;
  min-height: 200px;
}

.placeholder-pdf {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #92400e;
  padding: 32px;
}

.icon-pdf {
  color: #f59e0b;
  opacity: 0.8;
}

.title-pdf {
  color: #78350f;
  font-weight: 600;
  font-size: 14px;
}

.hint-pdf {
  font-size: 12px;
  color: #92400e;
}

/* Preview styles */
.preview-wrapper-pdf {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 24px;
}

.pdf-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  background: white;
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
  max-width: 400px;
}

.pdf-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-radius: 12px;
  flex-shrink: 0;
}

.pdf-icon {
  color: white;
  font-size: 32px;
}

.pdf-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.pdf-filename {
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
  word-break: break-word;
}

.pdf-size {
  font-size: 12px;
  color: #6b7280;
}

.remove-btn-pdf {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  transition: all 0.2s ease;
}

.remove-btn-pdf:hover:not(:disabled) {
  background: #dc2626;
  transform: scale(1.1);
}

.remove-btn-pdf:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.overlay-pdf {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 12px;
}

.overlay-text-pdf {
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
}

/* Disabled state */
.upload-dragger-pdf.ant-upload-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
