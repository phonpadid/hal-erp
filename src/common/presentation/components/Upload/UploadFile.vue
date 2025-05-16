<script setup lang="ts">
import { ref, defineEmits } from "vue";
import { message } from "ant-design-vue";

interface FileItem {
  uid: string;
  name: string;
  status: string;
  url?: string;
  thumbUrl?: string;
  type?: string;
  size?: number;
  percent?: number;
  originFileObj?: File;
  response?: unknown;
}

interface CustomRequestOptions {
  file: File;
  filename?: string;
  data?: Record<string, unknown>;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  action?: string;
  onProgress?: (event: { percent: number }) => void;
  onSuccess?: (response: unknown, xhr?: XMLHttpRequest) => void;
  onError?: (error: Error | ProgressEvent<EventTarget>) => void;
}

const fileList = ref<FileItem[]>([]);
const previewImage = ref<string>("");
const previewVisible = ref<boolean>(false);
const emit = defineEmits<{
  (e: "onFileSelect", file: File): void;
}>();

const beforeUpload = (file: File): boolean => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("You can only upload JPG/PNG files!");
    return false;
  }
  return true;
};

const customUpload = (options: CustomRequestOptions): void => {
  const { file, onSuccess, onError } = options;

  setTimeout(() => {
    if (file) {
      // สร้าง FileItem จาก File object
      const fileWithUrl = {
        uid: Date.now().toString(),
        name: file.name,
        status: "done",
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        originFileObj: file,
      };

      fileList.value = [fileWithUrl];
      emit("onFileSelect", file);
      if (onSuccess) onSuccess("ok");
    } else {
      if (onError) onError(new Error("Upload failed"));
    }
  }, 500);
};

const handlePreview = (file: FileItem): void => {
  previewImage.value = file.url || file.thumbUrl || "";
  previewVisible.value = true;
};
</script>

<template>
  <div>
    <a-upload
      v-model:file-list="fileList"
      :before-upload="beforeUpload"
      :show-upload-list="true"
      :custom-request="customUpload"
      list-type="picture-card"
      @preview="handlePreview"
    >
      <div v-if="fileList.length < 1">
        <div class="text-4xl flex flex-col">
          +
          <span class="text-[12px]">ອັບໂຫລດ</span>
        </div>
      </div>
    </a-upload>

    <a-modal v-model:visible="previewVisible" :footer="null">
      <img alt="preview" style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>
</template>
