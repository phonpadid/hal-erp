<script setup lang="ts">
import { computed } from "vue";
import { RouterView } from "vue-router";
import BaseSidebar from "./BaseSidebar.vue";
import BaseTopbar from "./BaseTopbar.vue";
import { useToggleStore } from "@/modules/presentation/Admin/stores/storage.store";
import { storeToRefs } from "pinia";

// Use the store toggle directly instead of creating a separate ref
const toggleStore = useToggleStore();
const { toggle } = storeToRefs(toggleStore);

// Compute dynamic classes based on store toggle
const topbarStyle = computed(() => {
  return toggle.value
    ? "left-64 w-[calc(100%-16rem)]" // 16rem = 256px = sidebar width
    : "left-0 w-full";
});

// Handle toggle function
const handleToggle = () => {
  toggle.value = !toggle.value;
};
</script>

<template>
  <div class="flex scroll-smooth">
    <a-config-provider
      :theme="{
        token: {
          colorPrimary: 'red',
        },
      }"
    ></a-config-provider>
    <BaseSidebar :toggle="toggle" />
    <div
      class="flex flex-col w-full overflow-hidden transition-all"
      :class="{ 'md:ml-64': toggle }"
    >
      <div
        class="fixed top-0 z-50 h-16 bg-white shadow-sm transition-all duration-150"
        :class="topbarStyle"
      >
        <BaseTopbar @toggle="handleToggle" />
      </div>
      <main class="flex justify-center min-h-screen px-4 mt-14">
        <div class="2xl:max-w-[1280px] w-full overflow-hidden">
          <RouterView />
        </div>
      </main>
    </div>
    <div
      class="fixed top-0 left-0 z-40 w-full h-full transition-opacity duration-150 ease-in-out bg-black md:hidden bg-opacity-40"
      :class="{ 'opacity-100': toggle, 'hidden opacity-0': !toggle }"
      @click="handleToggle"
    />
  </div>
</template>

<style scoped></style>
