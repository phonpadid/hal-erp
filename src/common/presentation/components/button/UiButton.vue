<template>
  <a-button :type="type" :size="size" :block="block" :disabled="disabled" :class="customClass">
    <Icon v-if="icon" :icon="icon" class="mr-2" />
    <slot></slot>
    <Icon v-if="iconRight" :icon="iconRight" class="ml-2" />
  </a-button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";

const props = defineProps({
  type: {
    type: String,
    default: "default",
  },
  size: {
    type: String,
    default: "middle",
  },
  colorClass: {
    type: String,
    default: "",
  },
  block: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: "", // ใส่ชื่อไอคอนที่ต้องการ เช่น "ant-design:plus-outlined"
  },
  iconRight: {
    type: String,
    default: "", // Icon that will appear at the right side of the button
  },
});

const customClass = computed(() => props.colorClass);
</script>
