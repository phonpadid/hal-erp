<script setup lang="ts">
import { defineProps } from "vue";

defineProps({
  size: {
    type: String,
    default: "large", // "small" | "default" | "large"
  },
});
</script>

<template>
  <div class="flex justify-center items-center ">
    <a-spin :size="size" />
  </div>
</template>
