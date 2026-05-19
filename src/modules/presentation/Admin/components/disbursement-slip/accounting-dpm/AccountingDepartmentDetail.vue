<script setup lang="ts">
import { useRouter } from "vue-router";
import UiButton from "@/common/shared/components/button/UiButton.vue";

const router = useRouter();
const goBack = () => router.back();
</script>
<template>
  <div>
    <div class="flex justify-end mb-2">
      <UiButton
        icon="mdi:arrow-left"
        size="small"
        class="flex items-center gap-2 text-white bg-blue-600 hover:!bg-blue-900 hover:!text-white"
        @click="goBack"
        >ກັບຄືນ</UiButton
      >
    </div>
    detail
  </div>
</template>
