<script setup lang="ts">
import { computed, defineProps, defineEmits } from "vue";

interface UiInputNumberProps {
  modelValue: number | null;
  placeholder?: string;
  size?: "small" | "middle" | "large";
  disabled?: boolean;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  formatter?: (value: number | string) => string;
  parser?: (value: string) => number | string;
}

const props = defineProps<UiInputNumberProps>();
const emit = defineEmits<{
  "update:modelValue": [value: number | null];
  change: [value: number | null];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
}>();

const computedClass = computed(() => `w-full ${props.className || ""}`);

const handleChange = (value: number | null) => {
  emit("update:modelValue", value);
  emit("change", value);
};

const handleBlur = (e: FocusEvent) => {
  emit("blur", e);
};

const handleFocus = (e: FocusEvent) => {
  emit("focus", e);
};
</script>

<template>
  <a-input-number
    :value="modelValue"
    :placeholder="placeholder"
    :size="size"
    :disabled="disabled"
    :min="min"
    :max="max"
    :step="step"
    :formatter="formatter"
    :parser="parser"
    :class="computedClass"
    style="width: 100%"
    @change="handleChange"
    @blur="handleBlur"
    @focus="handleFocus"
  />
</template>
