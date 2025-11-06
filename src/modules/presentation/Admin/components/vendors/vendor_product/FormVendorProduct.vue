<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import type {
  VendorProductInterface,
  VendorProductCreateInterface
} from "@/modules/interfaces/vendors/vendor_product/vendor-product.interface";
import type { ProductInterface } from "@/modules/interfaces/product.interface";
import { useProductStore } from "@/modules/presentation/Admin/stores/product.store";
import { createVendorProductValidation } from "../../../views/vendors/vendor_product/validations/vendor-product.validation";
import { formatPrice, parsePrice, NumberOnly } from "@/modules/shared/utils/format-price";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiSelect from "@/common/shared/components/Input/InputSelect.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";

interface Props {
  vendorProduct?: VendorProductInterface | null;
  isEditMode: boolean;
  vendorId: string;
  loading: boolean;
}

interface Emits {
  (e: "submit", data: VendorProductCreateInterface): void;
}

const props = withDefaults(defineProps<Props>(), {
  vendorProduct: null,
});
const emit = defineEmits<Emits>();

const { t } = useI18n();
const productStore = useProductStore();

// Form ref
const formRef = ref();

// Form state
const formState = reactive({
  product_id: undefined as string | undefined,
  price: 0,
});

// Formatted price for display
const formattedPrice = computed({
  get: () => formatPrice(formState.price),
  set: (value: string) => {
    formState.price = parsePrice(value) || 0;
  }
});

// Validation state
const validationState = reactive({
  isEditMode: props.isEditMode,
  formState: formState,
});

// Update validation state when edit mode changes
watch(
  () => props.isEditMode,
  (newIsEditMode) => {
    validationState.isEditMode = newIsEditMode;
  }
);

// Get vendor product rules
const vendorProductRules = computed(() => {
  const currentValidationState = {
    ...validationState,
    formState: formState
  };

  const rules = createVendorProductValidation(t, currentValidationState);
  return rules;
});

// Products for dropdown
const products = ref<ProductInterface[]>([]);
const productsLoading = ref(false);

// Load products for dropdown
const loadProducts = async () => {
  productsLoading.value = true;
  try {
    await productStore.fetchProducts({ page: 1, limit: 1000 });
    // Convert ProductEntity to ProductInterface
    products.value = productStore.activeProducts.map(product => ({
      id: parseInt(product.getId()),
      name: product.getName(),
      description: product.getDescription(),
      product_type_id: product.getProductTypeId(),
      status: product.getStatus(),
      created_at: product.getCreatedAt(),
      updated_at: product.getUpdatedAt(),
      deleted_at: product.getDeletedAt(),
    }));
  } catch (err) {
    console.error("Failed to load products:", err);
  } finally {
    productsLoading.value = false;
  }
};

// Reset form function - defined before watch
const resetForm = () => {
  formState.product_id = undefined as string | undefined;
  formState.price = 0;
};

// Initialize form when vendorProduct prop changes
watch(
  () => props.vendorProduct,
  (newVendorProduct) => {
    if (newVendorProduct) {
      formState.product_id = newVendorProduct.product_id;
      formState.price = newVendorProduct.price;
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

// Load products on mount
loadProducts();

const submitForm = async () => {
  try {
    await formRef.value.submitForm();
    
    const formData: VendorProductCreateInterface = {
      vendor_id: props.vendorId,
      product_id: formState.product_id!,
      price: formState.price,
    };
    emit("submit", formData);
  } catch (error) {
    console.error("Form validation failed:", error);
    throw error;
  }
};

// Public methods
defineExpose({
  submitForm,
  resetForm: () => formRef.value?.resetFields(),
});
</script>

<template>
  <div class="vendor-product-form">
    <UiForm ref="formRef" :model="formState" :rules="vendorProductRules">
      <div class="form-section">
        <div class="grid grid-cols-1 md:grid-cols-1 gap-0">
          <!-- Product Selection -->
          <UiFormItem
            :label="t('vendor-product.form.product')"
            name="product_id"
            required
          >
            <UiSelect
              v-model="formState.product_id"
              :placeholder="t('vendor-product.form.selectProduct')"
              :disabled="loading || productsLoading"
              :options="products.map(product => ({
                value: product.id.toString(),
                label: product.name,
              }))"
              :filter-option="(input: string, option: any) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              "
              show-search
            />
          </UiFormItem>

          <!-- Price -->
          <UiFormItem
            :label="t('vendor-product.form.price')"
            name="price"
            required
          >
            <UiInput
              v-model="formattedPrice"
              :placeholder="t('vendor-product.form.pricePlaceholder')"
              :disabled="loading"
              type="text"
              inputmode="numeric"
              @keydown="(e) => NumberOnly(e, formattedPrice)"
            />
          </UiFormItem>
        </div>
      </div>
    </UiForm>
  </div>
</template>

<style scoped>
.vendor-product-form {
  max-width: 500px;
}

.form-section {
  margin-bottom: 1rem;
}

.grid {
  display: grid;
  gap: 0rem;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.md\:grid-cols-2 {
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>