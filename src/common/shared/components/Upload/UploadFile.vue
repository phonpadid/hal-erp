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
  defaultUrl: {
    type: [String, null],
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
  (e: "onFileRemove"): void;
}>();

const fileList = ref<FileItem[]>([]);
const previewImage = ref<string>("");
const previewVisible = ref<boolean>(false);

// --- Handle external v-model and defaultUrl change
watch(
  [() => props.modelValue, () => props.defaultUrl],
  ([modelVal, defaultUrl]) => {
    // console.log("UploadFile watch - modelValue:", modelVal);
    // console.log("UploadFile watch - defaultUrl:", defaultUrl);
    // console.log("UploadFile watch - types:", typeof modelVal, typeof defaultUrl);

    // Use defaultUrl if available, otherwise use modelValue
    const imageUrl = defaultUrl || modelVal;

    if (typeof imageUrl === "string" && imageUrl !== "") {
      // console.log("UploadFile - Setting up image display for URL:", imageUrl);
      // Check if this URL is not already displayed
      if (!fileList.value.length || (fileList.value[0].url !== imageUrl && fileList.value[0].thumbUrl !== imageUrl)) {
        fileList.value = [
          {
            uid: Date.now().toString(),
            name: "uploaded-image",
            status: "done",
            url: imageUrl,
            thumbUrl: imageUrl,
          },
        ];
        // Set previewImage for a-modal
        previewImage.value = imageUrl;
        // console.log("UploadFile - FileList set:", fileList.value);
      }
    } else if (imageUrl === null || imageUrl === "") {
      // console.log("UploadFile - Clearing file list");
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

const handleRemove = (file: FileItem): void => {
  fileList.value = [];
  previewImage.value = "";
  emit("update:modelValue", null);
  emit("onFileRemove");
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
      @remove="handleRemove"
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
