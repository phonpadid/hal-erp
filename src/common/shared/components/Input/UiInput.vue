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
  maxlength?: number; // เพิ่ม maxlength prop
}

const props = defineProps<UiInputProps>();
const emit = defineEmits<{
  "update:modelValue": [value: string | number];
  keydown: [event: KeyboardEvent]; // เพิ่ม keydown event
}>();

const computedClass = computed(() => `w-full ${props.className || ""}`);

// แก้ไข handleChange function
const handleChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const value = target.value;
  emit("update:modelValue", value);
};

// เพิ่ม handleKeydown function
const handleKeydown = (e: KeyboardEvent) => {
  emit("keydown", e);
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
    @input="handleChange"
    @change="handleChange"
    @keydown="handleKeydown"
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
