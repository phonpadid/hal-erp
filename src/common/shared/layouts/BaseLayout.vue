<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { RouterView } from "vue-router";
import BaseSidebar from "./BaseSidebar.vue";
import BaseTopbar from "./BaseTopbar.vue";
import { useToggleStore } from "@/modules/presentation/Admin/stores/storage.store";
import { storeToRefs } from "pinia";

const toggleStore = useToggleStore();
const { toggle } = storeToRefs(toggleStore);

const isDesktop = computed(() => {
  if (typeof window === "undefined") return true;
  return window.innerWidth >= 768;
});

const topbarStyle = computed(() => {
  if (!isDesktop.value) {
    return "left-0 w-full";
  }
  return toggle.value
    ? "md:left-64 md:w-[calc(100%-16rem)]"
    : "left-0 w-full";
});

const handleToggle = () => {
  toggle.value = !toggle.value;
};

const syncToggleWithViewport = () => {
  if (typeof window === "undefined") return;
  if (window.innerWidth < 768 && toggle.value) {
    toggle.value = false;
  }
};

onMounted(() => {
  syncToggleWithViewport();
  window.addEventListener("resize", syncToggleWithViewport);
});

onUnmounted(() => {
  window.removeEventListener("resize", syncToggleWithViewport);
});
</script>

<template>
  <div class="flex scroll-smooth min-h-screen">
    <a-config-provider
      :theme="{
        token: {
          colorPrimary: 'red',
        },
      }"
    ></a-config-provider>
    <BaseSidebar :toggle="toggle" @close="toggle = false" />
    <div
      class="flex flex-col w-full overflow-hidden transition-all"
      :class="{ 'md:ml-64': toggle }"
    >
      <div
        class="fixed top-0 z-40 h-16 bg-white shadow-sm transition-all duration-150"
        :class="topbarStyle"
      >
        <BaseTopbar @toggle="handleToggle" />
      </div>
      <main
        class="flex justify-center min-h-screen mt-16 px-2 sm:px-4 lg:px-6 pb-4"
      >
        <div class="w-full max-w-full 2xl:max-w-[1536px]">
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
