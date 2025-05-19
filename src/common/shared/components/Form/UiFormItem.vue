<script setup lang="ts">
import { defineProps } from "vue";
import type { RuleObject } from "ant-design-vue/es/form";

defineProps<{
  label?: string;
  name?: string | string[];
  rules?: RuleObject | RuleObject[];
  required?: boolean;
}>();
</script>

<template>
  <a-form-item :label="label" :name="name" :rules="rules" :required="required">
    <slot></slot>
  </a-form-item>
</template>
