<script setup lang="ts">
import { defineProps, defineEmits, type PropType } from "vue";
import { SearchOutlined } from "@ant-design/icons-vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Search",
  },
  width: {
    type: String,
    default: "100%",
  },
  size: {
    type: String as PropType<"large" | "middle" | "small">,
    default: "middle",
  },
});

const emit = defineEmits(["update:modelValue", "input", "search"]);

const handleInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  emit("update:modelValue", value);
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter") {
    emit("search", props.modelValue);
  }
};

const handleClear = () => {
  emit("update:modelValue", "");
  emit("search", "");
};
</script>

<template>
  <a-input-search
    :value="modelValue"
    @input="handleInput"
    @keydown="handleKeyDown"
    @clear="handleClear"
    @search="(value:any) => emit('search', value)"
    :placeholder="placeholder"
    :style="{ width }"
    :size="size"
    allow-clear
    :enter-button="false"
    class="custom-input-search"
  >
    <template #prefix>
      <SearchOutlined />
    </template>
  </a-input-search>
</template>

<style>
/* ย้ายออกจาก scoped เพื่อให้มีความสำคัญมากขึ้น */
.dark .ant-input-search .ant-input,
.dark .ant-input-search .ant-input-affix-wrapper,
.dark .ant-input-affix-wrapper > input.ant-input {
  background-color: #1f2937 !important; /* gray.800 hardcoded */
  color: #ffffff !important; /* white hardcoded */
  border-color: #4b5563 !important; /* gray.600 hardcoded */
}

.dark .ant-input-search .ant-input-affix-wrapper:hover,
.dark .ant-input-search .ant-input-affix-wrapper-focused {
  border-color: #3b82f6 !important; /* blue.500 hardcoded */
}

.dark .ant-input-search .ant-input-affix-wrapper-focused {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
}

.dark .ant-input-search .anticon {
  color: #9ca3af !important; /* gray.400 hardcoded */
}

.dark .ant-input-search .ant-input-affix-wrapper:hover .anticon,
.dark .ant-input-search .ant-input-affix-wrapper-focused .anticon {
  color: #3b82f6 !important; /* blue.500 hardcoded */
}

.dark .ant-input-search input::placeholder {
  color: #6b7280 !important; /* gray.500 hardcoded */
}
</style>

<style scoped>
/* เก็บ style อื่นๆ ไว้เหมือนเดิม */
:deep(.ant-input-search) {
  width: 100%;
}

:deep(.ant-input-affix-wrapper) {
  border-radius: 6px;
}

:deep(.ant-input-search-button) {
  display: none; /* ซ่อนปุ่มค้นหา */
}

:deep(.anticon) {
  color: #bfbfbf;
}

:deep(.ant-input-affix-wrapper:hover .anticon) {
  color: var(--ant-primary-color);
}

:deep(.ant-input-affix-wrapper-focused .anticon) {
  color: var(--ant-primary-color);
}
</style>
