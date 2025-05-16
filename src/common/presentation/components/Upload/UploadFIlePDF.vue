<script setup lang="ts">
import { ref, watch } from "vue";
import { message } from "ant-design-vue";
import axios from "axios";

// รับค่า modelValue จาก parent component และ emit เมื่อมีการเปลี่ยนแปลง
const props = defineProps<{
  modelValue: string | File | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string | File | null): void;
}>();

// เก็บไฟล์ในตัวแปร local
const file = ref<File | null | string>(props.modelValue);
const isUploading = ref(false);

// เมื่อ props.modelValue เปลี่ยน ให้อัปเดต file.value
watch(
  () => props.modelValue,
  (newValue) => {
    file.value = newValue;
  }
);

// เมื่อ file.value เปลี่ยน ให้ emit ค่าใหม่กลับไป
watch(file, (newValue) => {
  emit("update:modelValue", newValue);
});

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const selectedFile = target.files[0];
    console.log("File selected:", selectedFile);

    // ตรวจสอบว่าเป็น PDF เท่านั้น
    if (selectedFile.type !== "application/pdf") {
      message.error("You can only upload PDF files!");
      target.value = ""; // ล้างค่า input
      return;
    }

    // อัปเดต file.value และ emit ค่าใหม่
    file.value = selectedFile;
    emit("update:modelValue", selectedFile);
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const uploadFile = async () => {
  if (!file.value) {
    message.error("Please select a file first!");
    return;
  }

  // ตรวจสอบว่า file.value เป็น File object จริง
  if (!(file.value instanceof File)) {
    message.error("Invalid file format");
    return;
  }

  const formData = new FormData();
  formData.append("file", file.value);

  isUploading.value = true;

  try {
    const response = await axios.post("/api/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.status === 200) {
      message.success("File uploaded successfully!");
      file.value = null; // ล้างค่าหลังอัปโหลดสำเร็จ
      emit("update:modelValue", null);
    }
  } catch (error) {
    message.error("File upload failed.");
    console.error("Upload error:", error);
  } finally {
    isUploading.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col gap-3">
    <input type="file" accept=".pdf" @change="handleFileChange" class="border p-2 rounded" />
  </div>
</template>
