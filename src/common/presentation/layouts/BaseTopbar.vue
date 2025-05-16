<script setup lang="ts">
import { Icon } from "@iconify/vue";

const emit = defineEmits<{ toggle: [] }>();
</script>
<template>
  <header class="fixed top-0 z-10 flex items-center w-full h-16 px-4 bg-white">
    <Icon
      icon="lucide-align-justify"
      width="24"
      height="24"
      class="cursor-pointer"
      @click="emit('toggle')"
    />
  </header>
</template>

<style scoped></style>
