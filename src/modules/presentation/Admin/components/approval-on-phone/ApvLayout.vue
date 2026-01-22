<script setup lang="ts">
interface Props {
  title?: string;
  showBackButton?: boolean;
}

 withDefaults(defineProps<Props>(), {
  title: "",
  showBackButton: true,
});
</script>

<template>
  <div class="approval-header">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <!-- <button
          v-if="showBackButton"
          @click="goBack"
          class="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <Icon icon="mdi:arrow-left" class="text-2xl" />
        </button> -->
        <h1 class="text-2xl font-bold">
          {{ title || $t("menu-sidebar.receipt_approved") }}
        </h1>
      </div>
    </div>
  </div>
</template>

<style scoped>
.approval-header {
  background: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
