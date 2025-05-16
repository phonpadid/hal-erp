<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <a-textarea
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    :maxLength="maxLength"
    @update:value="onInput"
  />
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps({
  modelValue: { type: String, default: "" },
  placeholder: { type: String, default: "Please enter text..." },
  rows: { type: Number, default: 4 },
  maxLength: { type: Number, default: 500 },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const onInput = (value: string) => {
  emit("update:modelValue", value);
};
</script>
