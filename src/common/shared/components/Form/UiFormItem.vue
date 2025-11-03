<script setup lang="ts">
import { defineProps, computed } from "vue";
import type { RuleObject } from "ant-design-vue/es/form";

const props = defineProps<{
  label?: string;
  name?: string | string[];
  rules?: RuleObject | RuleObject[];
  required?: string | boolean;
}>();

// Convert dot notation name to array for nested form fields
const formItemName = computed(() => {
  if (!props.name) return undefined;

  // If name is already an array, return as is
  if (Array.isArray(props.name)) {
    return props.name;
  }

  // Convert dot notation string to array (e.g., "user.username" => ["user", "username"])
  if (typeof props.name === 'string' && props.name.includes('.')) {
    return props.name.split('.');
  }

  // Return name as is for simple fields
  return props.name;
});
</script>

<template>
  <a-form-item :label="label" :name="formItemName" :rules="rules" :required="required">
    <slot></slot>
  </a-form-item>
</template>
