<script setup lang="ts">
import { ref, defineEmits, defineProps, watch } from "vue";
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
  onSuccess?: (response: unknown, xhr?: XMLHttpRequest) => void;
  onError?: (error: Error | ProgressEvent<EventTarget>) => void;
}

// Props
const props = defineProps({
  modelValue: {
    type: [File, String, null],
    default: null,
  },
  uploadText: {
    type: String,
    default: "ອັບໂຫລດ",
  },
  uploadIcon: {
    type: String,
    default: "+",
  },
  iconSize: {
    type: String,
    default: "text-4xl",
  },
  textSize: {
    type: String,
    default: "text-[12px]",
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: File | null | string): void;
  (e: "onFileSelect", file: File): void;
}>();

const fileList = ref<FileItem[]>([]);
const previewImage = ref<string>("");
const previewVisible = ref<boolean>(false);

// --- Handle external v-model change (string URL from getOne)
// --- Handle external v-model change (string URL from getOne)
watch(
  () => props.modelValue,
  (val) => {
    if (typeof val === "string" && val !== "") {
      // ตรวจสอบว่า URL นี้ไม่ใช่ชื่อไฟล์ที่เพิ่งอัปโหลดใหม่แต่เป็น URL เต็ม
      // เพื่อป้องกันการสร้าง FileItem ซ้ำซ้อนเมื่อมีการอัปโหลดใหม่
      if (!fileList.value.length || (fileList.value[0].url !== val && fileList.value[0].thumbUrl !== val)) {
        fileList.value = [
          {
            uid: Date.now().toString(),
            name: "uploaded-image",
            status: "done",
            url: val,
            thumbUrl: val, // *** เพิ่ม thumbUrl เข้ามาด้วย ***
          },
        ];
        // ตั้งค่า previewImage เพื่อใช้ใน a-modal ด้วย
        previewImage.value = val; 
      }
    } else if (val === null || val === "") { // เคลียร์ fileList เมื่อ modelValue เป็น null หรือ string ว่าง
      fileList.value = [];
      previewImage.value = "";
    }
  },
  { immediate: true }
);

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
      const objectUrl = URL.createObjectURL(file);

      const fileWithUrl: FileItem = {
        uid: Date.now().toString(),
        name: file.name,
        status: "done",
        size: file.size,
        type: file.type,
        url: objectUrl,
        originFileObj: file,
      };

      fileList.value = [fileWithUrl];
      previewImage.value = objectUrl;

      // Emit both the File object and its URL
      emit("onFileSelect", file);
      emit("update:modelValue", file);

      onSuccess?.({ url: objectUrl });
    } else {
      onError?.(new Error("Upload failed"));
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
        <div class="flex flex-col items-center justify-center">
          <span :class="[iconSize]">{{ uploadIcon }}</span>
          <span :class="[textSize]">{{ uploadText }}</span>
        </div>
      </div>
    </a-upload>

    <a-modal v-model:visible="previewVisible" :footer="null">
      <img alt="preview" style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>
</template>
