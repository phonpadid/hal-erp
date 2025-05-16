<script setup lang="ts">
import { defineProps, defineExpose, ref } from "vue";
import { type FormInstance } from "ant-design-vue";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  model: Record<string, unknown>;
  rules?: Record<string, unknown>;
}>();

const formRef = ref<FormInstance>();

const validate = async (nameList?: string | string[]) => {
  try {
    if (nameList) {
      return await formRef.value?.validateFields(nameList);
    } else {
      return await formRef.value?.validate();
    }
  } catch (errors) {
    console.error("Validation errors:", errors);
    throw errors;
  }
};

const submitForm = async (nameList?: string | string[]) => {
  try {
    if (formRef.value) {
      if (nameList) {
        await formRef.value.validateFields(nameList);
      } else {
        await formRef.value.validate();
      }
      return true;
    }
    return false;
  } catch (errors) {
    console.error("Form validation failed:", errors);
    // ส่งคืนข้อผิดพลาดเพื่อให้ parent component จัดการได้
    throw errors;
  }
};

// เพิ่มฟังก์ชันสำหรับรีเซ็ตฟอร์ม
const resetFields = () => {
  formRef.value?.resetFields();
};

// ให้ Parent Component เรียกใช้ฟังก์ชันได้
defineExpose({
  submitForm,
  validate,
  resetFields,
  formRef,
});
</script>

<template>
  <a-form ref="formRef" :model="model" :rules="rules" layout="vertical">
    <slot />
  </a-form>
</template>
