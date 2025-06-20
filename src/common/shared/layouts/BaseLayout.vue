<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RouterView } from "vue-router";
import BaseSidebar from "./BaseSidebar.vue";
import BaseTopbar from "./BaseTopbar.vue";
import { useToggleStore } from "@/modules/presentation/Admin/stores/storage.store";
const setToggle = useToggleStore();
const toggle = ref<boolean>(true);
// Compute dynamic classes
const topbarStyle = computed(() => {
  return toggle.value
    ? "left-64 w-[calc(100%-16rem)]" // 16rem = 256px = sidebar width
    : "left-0 w-full";
});
watch(toggle, (d) => {
  if(d === false || d) {
    setToggle.toggle = !setToggle.toggle;
  }
})
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
    <BaseSidebar :toggle />
    <div
      class="flex flex-col w-full overflow-hidden transition-all"
      :class="{ 'md:ml-64': toggle }"
    >
      <div
        class="fixed top-0 z-50 h-16 bg-white shadow-sm transition-all duration-150"
        :class="topbarStyle"
      >
        <BaseTopbar @toggle="() => (toggle = !toggle)" />
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
      @click="() => (toggle = !toggle)"
    />
  </div>
</template>

<style scoped></style>
