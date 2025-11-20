<script setup lang="ts" name="DeleteVendorProductModal.vue">
import { ref, computed, watch } from "vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import { useI18n } from "vue-i18n";
import { useVendorProductStore } from "@/modules/presentation/Admin/stores/vendor-products/vendor-product.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
import type { VendorProductEntity } from "@/modules/domain/entities/vendor-products/vendor-product.entity";

const { t } = useI18n();
const vendorProductStore = useVendorProductStore();
const { success, warning } = useNotification();

const props = defineProps<{
  visible: boolean;
  loading?: boolean;
  vendorProduct?: VendorProductEntity | null;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "success"): void;
}>();

const submitLoading = ref(false);

const vendorProductInfo = computed(() => {
  if (!props.vendorProduct) return null;

  return {
    id: props.vendorProduct.getId(),
    vendorId: props.vendorProduct.getVendorId(),
    productId: props.vendorProduct.getProductId(),
    productName: props.vendorProduct.getProductName(),
    vendorName: props.vendorProduct.getVendorName(),
  };
});

const handleCancel = () => {
  emit("update:visible", false);
};

const confirmDelete = async () => {
  try {
    submitLoading.value = true;

    if (!vendorProductInfo.value) {
      warning(t("vendor-products.error.title"), t("vendor-products.error.no_vendor_product"));
      return;
    }

    await vendorProductStore.deleteVendorProduct(vendorProductInfo.value.id);
    success(t("vendor-products.notify.deleted"));

    emit("update:visible", false);
    emit("success");
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("vendor-products.error.title"), errorMessage);
  } finally {
    submitLoading.value = false;
  }
};
</script>

<template>
  <UiModal
    :visible="visible"
    :title="t('vendor-products.title_delete')"
    width="500px"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="space-y-4">
      <div class="text-center">
        <div class="text-6xl mb-4">⚠️</div>
        <h3 class="text-lg font-semibold mb-2">
          {{ t('vendor-products.delete.confirm_title') }}
        </h3>
        <p class="text-gray-600 mb-4">
          {{ t('vendor-products.delete.confirm_message') }}
        </p>
      </div>

      <div v-if="vendorProductInfo" class="bg-gray-50 p-4 rounded-lg">
        <h4 class="font-medium mb-2">{{ t('vendor-products.delete.vendor_product_info') }}</h4>
        <div class="space-y-1 text-sm">
          <div>
            <span class="font-medium">{{ t('vendor-products.fields.vendor') }}:</span>
            {{ vendorProductInfo.vendorName || `ID: ${vendorProductInfo.vendorId}` }}
          </div>
          <div>
            <span class="font-medium">{{ t('vendor-products.fields.product') }}:</span>
            {{ vendorProductInfo.productName || `ID: ${vendorProductInfo.productId}` }}
          </div>
        </div>
      </div>

      <div class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
        <strong>{{ t('vendor-products.delete.warning') }}</strong>
        {{ t('vendor-products.delete.warning_message') }}
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UiButton @click="handleCancel">
          {{ t("button.cancel") }}
        </UiButton>
        <UiButton
          type="primary"
          danger
          :loading="submitLoading"
          @click="confirmDelete"
        >
          {{ t("button.delete") }}
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>