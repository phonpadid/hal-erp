<script setup lang="ts">
import { ref } from "vue";
import { RouterView } from "vue-router";
import BaseSidebar from "./BaseSidebar.vue";
import BaseTopbar from "./BaseTopbar.vue";

const toggle = ref<boolean>(true);
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
      <BaseTopbar @toggle="() => (toggle = !toggle)" />
      <main class="flex justify-center min-h-screen px-4 mt-10">
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
