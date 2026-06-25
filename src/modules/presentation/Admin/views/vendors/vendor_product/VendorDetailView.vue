<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { VendorInterface } from "@/modules/interfaces/vendors/vendor/vendor.interfacce";
import { useVendorStore } from "@/modules/presentation/Admin/stores/vendors/vendor.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import VendorProductList from "@/modules/presentation/Admin/components/vendors/vendor_product/VendorProductList.vue";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const vendorStore = useVendorStore();
const { error } = useNotification();

// State
const vendor = ref<VendorInterface | null>(null);
const loading = ref(false);

// Computed properties
const vendorId = computed(() => route.params.id as string);

onMounted(async () => {
  await loadVendor();
});

const loadVendor = async () => {
  if (!vendorId.value) return;

  loading.value = true;
  try {
    const vendorData = await vendorStore.fetchVendorById(vendorId.value);
    if (vendorData) {
      vendor.value = vendorData;
    } else {
      // Keep the user on the detail route and surface the error state with a
      // retry, instead of bouncing to the list (which forced a manual refresh).
      vendor.value = null;
      error(t("vendor-product.error.notFound"), t("vendor-product.error.notFoundMessage"));
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    vendor.value = null;
    error(t("vendors.error.loadFailed"), errorMessage);
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push({ name: "vendors.index" });
};
</script>

<template>
  <div class="vendor-detail-container p-6">
    <!-- Header -->
    <div class="flex items-center mb-0">
      <div class="flex gap-2">
        <h1 class="text-2xl font-semibold">{{ t("vendor-product.detail.title") }} </h1>
        <h1 class="text-2xl text-red-600 font-medium">({{ vendor?.name }})</h1>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-2">
      <p class="text-gray-500">{{ t("common.loading") }}</p>
    </div>

    <!-- Vendor Details -->
    <div v-else-if="vendor" class="space-y-0">
      <VendorProductList :vendor-id="parseInt(vendorId)" />
    </div>

    <!-- Error State -->
    <div v-else class="text-center py-8">
      <p class="text-red-500">{{ t("vendor-product.error.notFound") }}</p>
      <div class="flex items-center justify-center gap-2 mt-4">
        <UiButton
          type="primary"
          @click="loadVendor"
        >
          {{ t("common.retry") }}
        </UiButton>
        <UiButton @click="goBack">
          ກັບຄືນ
        </UiButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vendor-detail-container {
  background-color: white;
  min-height: 100vh;
}

.bg-white {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>