<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div
    :class="[
      'radio-group',
      direction === 'horizontal' ? 'radio-horizontal' : 'radio-vertical',
      className,
    ]"
    :style="{
      '--radio-gap': computedGap,
      ...style,
    }"
  >
    <a-radio-group v-model:value="innerValue" :name="name" :disabled="disabled" v-bind="$attrs">
      <template v-if="type === 'button'">
        <a-radio-button
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
          :class="['radio-button', { 'radio-button-disabled': option.disabled }]"
          :style="{ marginRight: computedGap }"
        >
          {{ option.label }}
        </a-radio-button>
      </template>
      <template v-else>
        <a-radio
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
          :class="['radio-item', { 'radio-item-disabled': option.disabled }]"
          :style="{ marginRight: computedGap }"
        >
          {{ option.label }}
        </a-radio>
      </template>
    </a-radio-group>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

interface RadioOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface Props {
  modelValue?: string | number;
  options: RadioOption[];
  name?: string;
  direction?: "horizontal" | "vertical";
  // ปรับปรุง type ของ gap ให้รองรับหลายรูปแบบ
  gap?: number | string;
  type?: "default" | "button";
  disabled?: boolean;
  className?: string;
  style?: Record<string, string>;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  name: "radio-group",
  direction: "horizontal",
  gap: "16px",
  type: "default",
  disabled: false,
  className: "",
  style: () => ({}),
});

// คำนวณค่า gap ที่จะใช้จริง
const computedGap = computed(() => {
  if (typeof props.gap === "number") {
    return `${props.gap}px`;
  }
  // ถ้าเป็นตัวเลขที่อยู่ในรูปแบบ string
  if (!isNaN(Number(props.gap))) {
    return `${props.gap}px`;
  }
  // ถ้าเป็น string ที่มีหน่วยอยู่แล้ว (px, rem, em, etc.)
  return props.gap;
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number): void;
  (e: "change", value: string | number): void;
}>();

const innerValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit("update:modelValue", value);
    emit("change", value);
  },
});
</script>

<style scoped>
.radio-group {
  --radio-primary-color: #1890ff;
  --radio-hover-color: #40a9ff;
  --radio-active-color: #096dd9;
  --radio-disabled-color: #d9d9d9;
}

.radio-horizontal {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.radio-vertical {
  display: flex;
  flex-direction: column;
}

/* ปรับปรุงการใช้ gap */
.radio-vertical .radio-item,
.radio-vertical .radio-button {
  margin-bottom: var(--radio-gap);
}

.radio-vertical .radio-item:last-child,
.radio-vertical .radio-button:last-child {
  margin-bottom: 0;
}

/* Default radio styles */
.radio-item :deep(.ant-radio-checked .ant-radio-inner) {
  border-color: var(--radio-primary-color);
  background-color: var(--radio-primary-color);
}

.radio-item :deep(.ant-radio:hover .ant-radio-inner) {
  border-color: var(--radio-hover-color);
}

/* Button styles */
.radio-button :deep(.ant-radio-button-wrapper-checked) {
  border-color: var(--radio-primary-color);
  background: var(--radio-primary-color);
}

/* Disabled styles */
.radio-item-disabled,
.radio-button-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 640px) {
  .radio-horizontal {
    flex-wrap: wrap;
  }
}
</style>
