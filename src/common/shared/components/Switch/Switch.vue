<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

defineProps<{
  modelValue: boolean;
  label?: string;
}>();
const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
}>();

const handleChange = (value: boolean) => {
  emit("update:modelValue", value);
};
</script>

<template>
  <div class="flex items-center gap-2">
    <a-switch :checked="modelValue" @change="handleChange" />
    <span v-if="label">{{ label }}</span>
  </div>
</template>

<style scoped></style>
