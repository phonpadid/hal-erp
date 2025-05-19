<script setup lang="ts">
import { defineProps, defineEmits, computed } from "vue";

interface Option {
  label: string;
  value: string | number;
}

// ตรวจสอบว่ามีการส่ง props แบบไหนมา
const props = withDefaults(
  defineProps<{
    modelValue?: (string | number)[];
    options?: Option[];
    disabled?: boolean;
    // เพิ่ม props สำหรับ single checkbox
    checked?: boolean;
    // เพิ่ม prop label
    label?: string;
  }>(),
  {
    modelValue: () => [],
    options: () => [],
  }
);

const emit = defineEmits<{
  (event: "update:modelValue", value: (string | number)[]): void;
  (event: "update:checked", value: boolean): void;
}>();

// สำหรับ checkbox group
const selectedValues = computed({
  get: () => props.modelValue,
  set: (value: (string | number)[]) => {
    emit("update:modelValue", value);
  },
});

// สำหรับ single checkbox
const isChecked = computed({
  get: () => props.checked,
  set: (value: boolean) => {
    emit("update:checked", value);
  },
});

// เช็คว่าควรใช้โหมดไหน
const isSingleCheckbox = computed(() => "checked" in props);
</script>

<template>
  <!-- สำหรับ single checkbox -->
  <a-checkbox
    v-if="isSingleCheckbox"
    v-model:checked="isChecked"
    :disabled="disabled"
  >
    <template v-if="label">{{ label }}</template>
    <slot v-else></slot>
  </a-checkbox>

  <!-- สำหรับ checkbox group -->
  <a-checkbox-group
    v-else
    v-model:value="selectedValues"
    :options="options"
    :disabled="disabled"
  />
</template>
