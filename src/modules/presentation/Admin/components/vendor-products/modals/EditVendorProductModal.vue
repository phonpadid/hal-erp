<script setup lang="ts" name="EditVendorProductModal.vue">
import { ref, computed, watch, onMounted } from "vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import { useI18n } from "vue-i18n";
import { useVendorProductStore } from "@/modules/presentation/Admin/stores/vendor-products/vendor-product.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
import type { UpdateVendorProductDTO } from "@/modules/application/dtos/vendor-products/vendor-product.dto";
import { vendorProductUpdateRules } from "../validation/vendor-product.validation";

const { t } = useI18n();
const vendorProductStore = useVendorProductStore();
const { success, warning } = useNotification();

const formState = ref({
  vendor_id: null as number | null,
  product_id: null as number | null,
  product_name: "",
});

const props = defineProps<{
  visible: boolean;
  loading?: boolean;
  vendorProductId?: string;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "success"): void;
}>();

// Mock vendor and product data - replace with actual stores when available
const vendorOptions = ref([
  { value: 1, label: "Vendor A" },
  { value: 2, label: "Vendor B" },
  { value: 20, label: "Test Vendor" },
]);

const productOptions = ref([
  { value: 1, label: "Product A" },
  { value: 2, label: "Product B" },
  { value: 3, label: "Product C" },
]);

const formRef = ref();
const submitLoading = ref(false);

watch(
  [() => props.visible, () => props.vendorProductId],
  async ([newVisible, newVendorProductId]) => {
    if (newVisible && newVendorProductId) {
      await loadVendorProduct(newVendorProductId);
    }
  },
  { immediate: true }
);

const loadVendorProduct = async (id: string) => {
  try {
    const vendorProduct = await vendorProductStore.fetchVendorProductById(id);
    if (vendorProduct) {
      formState.value = {
        vendor_id: vendorProduct.getVendorId(),
        product_id: vendorProduct.getProductId(),
        product_name: vendorProduct.getProductName() || "",
      };
    }
  } catch (error) {
    console.error("Failed to load vendor product:", error);
    warning(t("vendor-products.error.title"), t("vendor-products.error.load_failed"));
  }
};

const resetForm = () => {
  formState.value = {
    vendor_id: null,
    product_id: null,
    product_name: "",
  };
  formRef.value?.resetFields();
};

const handleCancel = () => {
  emit("update:visible", false);
  resetForm();
};

const submitForm = async () => {
  try {
    submitLoading.value = true;
    const valid = await formRef.value?.validate();
    if (!valid) return;

    if (!formState.value.vendor_id || !formState.value.product_id) {
      warning(t("vendor-products.error.title"), t("vendor-products.error.required_fields"));
      return;
    }

    if (!props.vendorProductId) {
      warning(t("vendor-products.error.title"), t("vendor-products.error.no_id"));
      return;
    }

    const formData: UpdateVendorProductDTO = {
      id: props.vendorProductId,
      vendor_id: Number(formState.value.vendor_id),
      product_id: Number(formState.value.product_id),
      product_name: formState.value.product_name || undefined,
    };

    await vendorProductStore.updateVendorProduct(props.vendorProductId, formData);
    success(t("vendor-products.notify.updated"));

    resetForm();
    emit("update:visible", false);
    emit("success");
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("vendor-products.error.title"), errorMessage);
  } finally {
    submitLoading.value = false;
  }
};

onMounted(async () => {
  // Initialize any necessary data
});
</script>

<template>
  <UiModal
    :visible="visible"
    :title="t('vendor-products.title_edit')"
    width="600px"
    @update:visible="emit('update:visible', $event)"
  >
    <UiForm
      ref="formRef"
      :model="formState"
      :rules="vendorProductUpdateRules(t)"
    >
      <div class="space-y-4">
        <UiFormItem
          :label="t('vendor-products.fields.vendor')"
          name="vendor_id"
          required
        >
          <InputSelect
            v-model="formState.vendor_id"
            :options="vendorOptions"
            size="large"
            :placeholder="t('vendor-products.fields.select_vendor')"
          />
        </UiFormItem>

        <UiFormItem
          :label="t('vendor-products.fields.product')"
          name="product_id"
          required
        >
          <InputSelect
            v-model="formState.product_id"
            :options="productOptions"
            size="large"
            :placeholder="t('vendor-products.fields.select_product')"
          />
        </UiFormItem>

        <UiFormItem
          :label="t('vendor-products.fields.product_name')"
          name="product_name"
        >
          <UiInput
            v-model="formState.product_name"
            size="large"
            :placeholder="t('vendor-products.fields.product_name_placeholder')"
          />
        </UiFormItem>
      </div>
    </UiForm>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UiButton @click="handleCancel">
          {{ t("button.cancel") }}
        </UiButton>
        <UiButton type="primary" :loading="submitLoading" @click="submitForm">
          {{ t("button.save") }}
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>