<script setup lang="ts">
import { defineProps, defineEmits, computed } from "vue";
import type { PropType } from "vue";

const props = defineProps({
  modelValue: {
    type: [String, Number, null] as PropType<string | number | null>,
    default: null,
  },
  options: {
    type: Array as PropType<{ label: string; value: string | number }[]>,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: "ກະລູນາເລືອກຂໍ້ມູນ",
  },
  width: {
    type: String,
    default: "100%",
  },
  size: {
    type: String as PropType<"large" | "middle" | "small">,
    default: "middle",
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

// Compute a safe value - ensure empty string is represented as null
const safeValue = computed(() => {
  return props.modelValue === "" ? null : props.modelValue;
});

function onChange(value: string | number | null) {
  // Ensure empty string is converted to null
  const newValue = value === "" ? null : value;
  emit("update:modelValue", newValue);
  emit("change", newValue);
}
</script>

<template>
  <a-select
    :value="safeValue"
    @change="onChange"
    :placeholder="placeholder"
    :style="{ width }"
    :size="size"
    :loading="loading"
    :disabled="disabled"
    allow-clear
    :dropdown-match-select-width="false"
    class="custom-select"
    show-search
  >
    <a-select-option
      v-for="option in options"
      :key="option.value"
      :value="option.value"
      :title="option.label"
    >
      {{ option.label }}
    </a-select-option>
  </a-select>
</template>

<style scoped>
:deep(.ant-select-dropdown) {
  min-width: 200px !important;
  max-width: 400px !important;
}

:deep(.ant-select-item) {
  white-space: normal !important;
  height: auto !important;
  padding: 8px 12px !important;
}

:deep(.ant-select-item-option-content) {
  white-space: normal !important;
  word-break: break-word !important;
  line-height: 1.4 !important;
}

:deep(.ant-select-selection-item) {
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

:deep(.ant-select-item:hover) {
  background-color: rgba(0, 0, 0, 0.04);
}

:deep(.ant-select-item-option) {
  min-height: 32px;
  height: auto !important;
}
</style>
<style>
/* Dark Mode Styles สำหรับ Select */
.dark .ant-select-selector {
  background-color: #1f2937 !important; /* gray.800 */
  border-color: #4b5563 !important; /* gray.600 */
  color: #ffffff !important;
}

.dark .ant-select-selection-placeholder {
  color: #6b7280 !important; /* gray.500 */
}

.dark .ant-select-arrow {
  color: #9ca3af !important; /* gray.400 */
}

.dark .ant-select-focused .ant-select-selector,
.dark .ant-select-selector:hover {
  border-color: #3b82f6 !important; /* blue.500 */
}

.dark .ant-select-focused .ant-select-selector {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
}

.dark .ant-select-dropdown {
  background-color: #1f2937 !important; /* gray.800 */
  border-color: #4b5563 !important; /* gray.600 */
}

.dark .ant-select-item {
  color: #ffffff !important;
}

.dark .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
  background-color: #374151 !important; /* gray.700 */
}

.dark .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
  background-color: #3b82f6 !important; /* blue.500 */
  color: #ffffff !important;
}

.dark .ant-select-item-option:hover:not(.ant-select-item-option-disabled) {
  background-color: #374151 !important; /* gray.700 */
}

.dark .ant-select-clear {
  background-color: #1f2937 !important; /* gray.800 */
  color: #9ca3af !important; /* gray.400 */
}
</style>

<style scoped>
/* ปรับแต่ง dropdown ให้กว้างขึ้น และรองรับข้อความยาว */
:deep(.ant-select-dropdown) {
  min-width: 200px !important;
  max-width: 400px !important;
}

/* ปรับแต่งตัวเลือกให้แสดงข้อความยาวได้ */
:deep(.ant-select-item) {
  white-space: normal !important;
  height: auto !important;
  padding: 8px 12px !important;
}

:deep(.ant-select-item-option-content) {
  white-space: normal !important;
  word-break: break-word !important;
  line-height: 1.4 !important;
}

/* สำหรับตัว select เมื่อเลือกแล้ว */
:deep(.ant-select-selection-item) {
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

/* เพิ่ม hover effect */
:deep(.ant-select-item:hover) {
  background-color: rgba(0, 0, 0, 0.04);
}

/* ปรับความสูงของแต่ละ option ให้พอดีกับเนื้อหา */
:deep(.ant-select-item-option) {
  min-height: 32px;
  height: auto !important;
}
</style>
