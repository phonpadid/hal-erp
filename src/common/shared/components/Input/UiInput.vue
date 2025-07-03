<script setup lang="ts">
import { computed, defineProps, defineEmits } from "vue";

interface UiInputProps {
  modelValue: string | number;
  placeholder?: string;
  type?: string;
  size?: "small" | "middle" | "large";
  disabled?: boolean;
  allowClear?: boolean;
  prefixIcon?: string;
  suffixIcon?: string;
  className?: string;
  maxlength?: number;
  pattern?: string;
  inputmode?: "numeric" | "text" | "tel" | "email" | "url" | "search";
}

const props = defineProps<UiInputProps>();
const emit = defineEmits<{
  "update:modelValue": [value: string | number];
  input: [value: string];
  change: [event: Event];
  keydown: [event: KeyboardEvent];
  paste: [event: ClipboardEvent];
}>();

const computedClass = computed(() => `w-full ${props.className || ""}`);

// ปรับปรุงฟังก์ชัน handleInput
const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const value = target.value;
  emit("update:modelValue", value);
  emit("input", value);
};

// ปรับปรุงฟังก์ชัน handleChange
const handleChange = (e: Event) => {
  emit("change", e);
};

// ปรับปรุงฟังก์ชัน handleKeydown
const handleKeydown = (e: KeyboardEvent) => {
  emit("keydown", e);
};

// เพิ่มฟังก์ชัน handlePaste
const handlePaste = (e: ClipboardEvent) => {
  emit("paste", e);
};
</script>

<template>
  <a-input
    :value="modelValue"
    :placeholder="placeholder"
    :type="type"
    :size="size"
    :disabled="disabled"
    :allow-clear="allowClear"
    :maxlength="maxlength"
    :pattern="pattern"
    :inputmode="inputmode"
    @input="handleInput"
    @change="handleChange"
    @keydown="handleKeydown"
    @paste="handlePaste"
    :class="computedClass"
  >
    <template v-if="prefixIcon" #prefix>
      <span :class="prefixIcon"></span>
    </template>
    <template v-if="suffixIcon" #suffix>
      <span :class="suffixIcon"></span>
    </template>
  </a-input>
</template>

<style scoped>
/* สำหรับ OTP input styling */
:deep(.ant-input) {
  font-size: 1.25rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
}

:deep(.ant-input:focus) {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* ซ่อน spin buttons สำหรับ input type number */
:deep(.ant-input::-webkit-outer-spin-button),
:deep(.ant-input::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}

/* :deep(.ant-input[type="number"]) {
  -moz-appearance: textfield;
} */
</style>
