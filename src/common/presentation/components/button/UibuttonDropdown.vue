<template>
  <a-button
    :type="type"
    :size="size"
    :block="block"
    :disabled="disabled"
    :class="[customClass, 'ui-button']"
  >
    <Icon v-if="icon" :icon="icon" class="mr-2" />
    <slot></slot>
    <Icon v-if="iconRight" :icon="iconRight" class="ml-2" />
  </a-button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";

const props = defineProps({
  type: {
    type: String,
    default: "default",
  },
  size: {
    type: String,
    default: "middle",
  },
  colorClass: {
    type: String,
    default: "",
  },
  block: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: "", // ใส่ชื่อไอคอนที่ต้องการ เช่น "ant-design:plus-outlined"
  },
  iconRight: {
    type: String,
    default: "", // Icon that will appear at the right side of the button
  },
});

const customClass = computed(() => props.colorClass);
</script>

<style lang="scss" scoped>
/* ปรับแต่งปุ่มในโหมดกลางคืน */
.dark .ant-btn {
  color: #e5e7eb !important; /* gray.200 */
  border-color: #4b5563 !important; /* gray.600 */
  background: #1f2937 !important; /* gray.800 */
}

.dark .ant-btn:hover,
.dark .ant-btn:focus {
  color: #f3f4f6 !important; /* gray.100 */
  border-color: #60a5fa !important; /* blue.400 */
  background: #374151 !important; /* gray.700 */
}

/* ปรับแต่งปุ่มแบบ primary ในโหมดกลางคืน */
.dark .ant-btn-primary:not(.ui-button[class*="bg-"]):not(.ui-button[class*="text-"]) {
  color: #ffffff !important;
  background: #3b82f6 !important; /* blue.500 */
  border-color: #3b82f6 !important; /* blue.500 */
}

.dark .ant-btn-primary:not(.ui-button[class*="bg-"]):not(.ui-button[class*="text-"]):hover,
.dark .ant-btn-primary:not(.ui-button[class*="bg-"]):not(.ui-button[class*="text-"]):focus {
  background: #2563eb !important; /* blue.600 */
  border-color: #1154e6 !important; /* blue.600 */
}

/* ปรับแต่งปุ่มแบบ default ในโหมดกลางคืน */
.dark .ant-btn-default {
  background: #1f2937 !important; /* gray.800 */
  border-color: #4b5563 !important; /* gray.600 */
}

.dark .ant-btn-default:hover,
.dark .ant-btn-default:focus {
  color: #f9fafb !important; /* gray.50 */
  border-color: #60a5fa !important; /* blue.400 */
}

/* ปรับแต่งปุ่มแบบ dashed ในโหมดกลางคืน */
.dark .ant-btn-dashed {
  color: #e5e7eb !important; /* gray.200 */
  border-color: #4b5563 !important; /* gray.600 */
  background: #1f2937 !important; /* gray.800 */
}

.dark .ant-btn-dashed:hover,
.dark .ant-btn-dashed:focus {
  color: #f9fafb !important; /* gray.50 */
  border-color: #60a5fa !important; /* blue.400 */
}

/* ปุ่ม disabled ในโหมดกลางคืน */
.dark .ant-btn-disabled,
.dark .ant-btn-disabled:hover,
.dark .ant-btn-disabled:focus,
.dark .ant-btn-disabled:active {
  color: #6b7280 !important; /* gray.500 */
  border-color: #374151 !important; /* gray.700 */
  background: #1f2937 !important; /* gray.800 */
  text-shadow: none;
  box-shadow: none;
}

/* ปรับแต่งปุ่ม loading ในโหมดกลางคืน */
.dark .ant-btn-loading {
  opacity: 0.8;
  cursor: default;
}

.dark .ant-btn-loading .anticon-loading {
  color: currentColor !important;
}

/* เพิ่มความเฉพาะเจาะจงใน selector เพื่อ override default styles */
html.dark .ant-btn,
body.dark .ant-btn {
  color: #e5e7eb !important;
  border-color: #4b5563 !important;
  background: #1f2937 !important;
}
</style>
