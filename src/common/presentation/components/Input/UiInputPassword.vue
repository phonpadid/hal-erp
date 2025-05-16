<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  modelValue: string;
  placeholder?: string;
  disabled?: boolean;
}>();

const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <a-input-password
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    @update:value="emit('update:modelValue', $event)"
  />
</template>
