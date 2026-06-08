<script setup lang="ts">
import { Icon } from "@iconify/vue";

/**
 * Coloured section header used across dashboards for things like
 * "Pending proposals (45)", "Companies in budget (12)" etc.
 */
interface Props {
  title: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
}

withDefaults(defineProps<Props>(), {
  subtitle: "",
  icon: "",
  iconColor: "text-blue-600",
});
</script>

<template>
  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
    <h2 class="text-base sm:text-lg font-semibold flex items-center gap-2 flex-wrap text-gray-900">
      <Icon v-if="icon" :icon="icon" :class="iconColor" class="text-lg sm:text-xl" />
      <span class="break-words">{{ title }}</span>
      <slot name="badge" />
    </h2>
    <span v-if="subtitle || $slots.subtitle" class="text-xs sm:text-sm text-gray-500">
      <slot name="subtitle">{{ subtitle }}</slot>
    </span>
  </div>
</template>
