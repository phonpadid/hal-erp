<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch, computed, onMounted } from "vue";
import type { ProductInterface } from "@/modules/interfaces/product.interface";
import { useI18n } from "vue-i18n";
import { useProductTypeStore } from "@/modules/presentation/Admin/stores/product-type.store";
import { useUnitStore } from "@/modules/presentation/Admin/stores/unit.store";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UiInputSelect from "@/common/shared/components/Input/InputSelect.vue";
import { createProductValidation } from "../../views/product/validation/product.validation";
import Textarea from "@/common/shared/components/Input/Textarea.vue";

const { t } = useI18n();
const productTypeStore = useProductTypeStore();
const unitStore = useUnitStore();

const props = defineProps<{
  product?: ProductInterface | null;
  isEditMode: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", data: { name: string; description: string; product_type_id: number; unit_id?: number | null; }): void;
  (e: "cancel"): void;
}>();

const formRef = ref();
const formState = reactive({
  name: "",
  description: "",
  product_type_id: null as number | null,
  unit_id: null as number | null,
});

// Product type options for dropdown
const productTypeOptions = computed(() =>
  productTypeStore.activeProductTypes.map((productType) => ({
    label: productType.getName(),
    value: Number(productType.getId()),
  }))
);

// Unit options for dropdown
const unitOptions = computed(() =>
  unitStore.activeUnits.map((unit) => ({
    label: unit.getName() || "",
    value: unit.getId(),
  }))
);

const validationState = reactive({
  isEditMode: props.isEditMode,
});

watch(
  () => props.isEditMode,
  (newIsEditMode) => {
    validationState.isEditMode = newIsEditMode;
  }
);

const productRules = createProductValidation(t, validationState);

watch(
  () => props.product,
  (newProduct) => {
    if (newProduct) {
      formState.name = newProduct.name || "";
      formState.description = newProduct.description || "";
      formState.product_type_id = newProduct.product_type_id || null;
      formState.unit_id = newProduct.unit_id || null;
    } else {
      formState.name = "";
      formState.description = "";
      formState.product_type_id = null;
      formState.unit_id = null;
    }
  },
  { immediate: true }
);

const submitForm = async () => {
  try {
    await formRef.value.submitForm();
    const formData = {
      name: formState.name,
      description: formState.description,
      product_type_id: formState.product_type_id!,
      unit_id: formState.unit_id,
    };

    emit("submit", formData);
  } catch (error) {
    console.error("Form validation failed:", error);
  }
};

// Load product types and units on component mount
onMounted(async () => {
  await Promise.all([
    productTypeStore.fetchProductTypes({
      page: 1,
      limit: 100, // Get all product types for dropdown
      search: "",
    }),
    unitStore.fetchUnits({
      page: 1,
      limit: 100, // Get all units for dropdown
      search: "",
    }),
  ]);
});

defineExpose({
  submitForm,
  resetForm: () => formRef.value?.resetFields(),
});
</script>

<template>
  <UiForm ref="formRef" :model="formState" :rules="productRules">
    <UiFormItem :label="$t('products.form.name')" name="name" required>
      <UiInput
        v-model="formState.name"
        :placeholder="$t('products.form.namePlaceholder')"
        :disabled="loading"
      />
    </UiFormItem>

    <UiFormItem :label="$t('products.form.productType')" name="product_type_id" required>
      <UiInputSelect
        v-model:value="formState.product_type_id"
        :options="productTypeOptions"
        :placeholder="$t('products.form.productTypePlaceholder')"
        :loading="productTypeStore.loading"
        :disabled="loading"
      />
    </UiFormItem>
    <UiFormItem :label="$t('products.form.unit')" name="unit_id">
      <UiInputSelect
        v-model:value="formState.unit_id"
        :options="unitOptions"
        :placeholder="$t('products.form.unitPlaceholder')"
        :loading="unitStore.loading"
        :disabled="loading"
        allow-clear
      />
    </UiFormItem>
    <UiFormItem :label="$t('products.form.description')" name="description">
      <Textarea
        v-model="formState.description"
        :placeholder="$t('products.form.descriptionPlaceholder')"
        :disabled="loading"
        :rows="4"
      />
    </UiFormItem>
  </UiForm>
</template>
