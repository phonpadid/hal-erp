<script setup lang="ts">
import { Icon } from "@iconify/vue";

interface Props {
  icon?: string;
  title?: string;
  message?: string;
}

withDefaults(defineProps<Props>(), {
  icon: "solar:inbox-outline",
  title: "",
  message: "",
});
</script>

<template>
  <div class="p-8 text-center">
    <Icon :icon="icon" class="text-5xl mx-auto mb-3 text-gray-300" />
    <h4 v-if="title" class="text-gray-700 font-semibold mb-1">{{ title }}</h4>
    <p v-if="message" class="text-sm text-gray-500">{{ message }}</p>
    <div v-if="$slots.action" class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>
