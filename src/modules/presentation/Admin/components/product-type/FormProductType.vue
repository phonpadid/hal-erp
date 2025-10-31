<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch, computed, onMounted } from "vue";
import type { ProductTypeInterface } from "@/modules/interfaces/product-type.interface";
import { useI18n } from "vue-i18n";
import { createProductTypeValidation } from "@/modules/presentation/Admin/views/product-type/validation/product-type.vallidate";
import { useCategoryStore } from "@/modules/presentation/Admin/stores/category.store";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UiInputSelect from "@/common/shared/components/Input/InputSelect.vue";


const { t } = useI18n();
const categoryStore = useCategoryStore();
const props = defineProps<{
  productType?: ProductTypeInterface | null;
  isEditMode: boolean;
  loading?: boolean;
}>();
const emit = defineEmits<{
  (e: "submit", data: { name: string; categoryId?: string | null }): void;
  (e: "cancel"): void;
}>();

const formRef = ref();
const formState = reactive({
  name: "",
  categoryId: null as string | null,
});

// Category options for dropdown
const categoryOptions = computed(() =>
  categoryStore.activeCategories.map((category) => ({
    label: category.getName(),
    value: Number(category.getId()),
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


const productTypeRules = createProductTypeValidation(t, validationState);


watch(
  () => props.productType,
  (newProductType) => {
    if (newProductType) {
      formState.name = newProductType.name || "";
      formState.categoryId = newProductType.category_id?.toString() || null;
    } else {
      formState.name = "";
      formState.categoryId = null;
    }
  },
  { immediate: true }
);

const submitForm = async () => {
  try {
    await formRef.value.submitForm();
    const formData = {
      name: formState.name,
      categoryId: formState.categoryId,
    };

    emit("submit", formData);
  } catch (error) {
    console.error("Form validation failed:", error);
  }
};

// Load categories on component mount
onMounted(async () => {
  await categoryStore.fetchCategories({
    page: 1,
    limit: 100, // Get all categories for dropdown
    search: "",
  });
});

defineExpose({
  submitForm,
  resetForm: () => formRef.value?.resetFields(),
});
</script>

<template>
  <UiForm ref="formRef" :model="formState" :rules="productTypeRules">
    <UiFormItem :label="$t('product-types.form.name')" name="name" required>
      <UiInput
        v-model="formState.name"
        :placeholder="$t('product-types.form.namePlaceholder')"
        :disabled="loading"
      />
    </UiFormItem>

    <UiFormItem :label="$t('product-types.form.category')" name="categoryId">
      <UiInputSelect
        v-model:value="formState.categoryId"
        :options="categoryOptions"
        :placeholder="$t('product-types.form.categoryPlaceholder')"
        :loading="categoryStore.loading"
        :disabled="loading"
        allow-clear
      />
    </UiFormItem>
  </UiForm>
</template>