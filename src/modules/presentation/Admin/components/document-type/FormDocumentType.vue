<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch, onMounted } from "vue";
import type { DoucmentTypeInterface } from "@/modules/interfaces/documenet-type.interface";
import type { DocumentCategoryInterface } from "@/modules/interfaces/document-category.interface";
import { useI18n } from "vue-i18n";
import { createDocumentTypeValidation } from "@/modules/presentation/Admin/views/document-types/validation/document-type.validate";
import { useDocumentCategoryStore } from "@/modules/presentation/Admin/stores/document-category.store";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UiSelect from "@/common/shared/components/Input/InputSelect.vue";

interface SelectOption {
  label: string;
  value: string | number;
}

/********************************************************************************* */
const { t } = useI18n();
const documentCategoryStore = useDocumentCategoryStore();

const props = defineProps<{
  documentType?: DoucmentTypeInterface | null;
  isEditMode: boolean;
  loading?: boolean;
}>();
const emit = defineEmits<{
  (e: "submit", data: { name: string; code: string; categoryId?: number }): void;
  (e: "cancel"): void;
}>();

const formRef = ref();
const formState = reactive({
  name: "",
  code: "",
  categoryId: undefined as string | undefined,
});

const documentCategories = ref<DocumentCategoryInterface[]>([]);
const categoryOptions = ref<SelectOption[]>([]);
const pendingCategoryId = ref<number | undefined>(undefined);

// Load document categories
const loadDocumentCategories = async () => {
  try {
    documentCategories.value = await documentCategoryStore.fetchDocumentCategories();
    console.log("📋 Document categories loaded:", documentCategories.value);
    categoryOptions.value = documentCategories.value.map((cat) => ({
      label: cat.name || `Category ${cat.id}`,
      value: cat.id.toString(), // Convert to string for Ant Design Vue
    }));
    console.log("🏷️ Category options:", categoryOptions.value);
  } catch (error) {
    console.error("Failed to load document categories:", error);
  }
};

// Load categories on mount
onMounted(() => {
  loadDocumentCategories();
});

// Create validation state
const validationState = reactive({
  isEditMode: props.isEditMode,
});

// Watch for isEditMode changes
watch(
  () => props.isEditMode,
  (newIsEditMode) => {
    validationState.isEditMode = newIsEditMode;
  }
);

// Get validation rules with validation state
const documentTypeRules = createDocumentTypeValidation(t, validationState);

// Watch for document type changes
watch(
  () => props.documentType,
  (newDocumentType) => {
    if (newDocumentType) {
      formState.name = newDocumentType.name || "";
      formState.code = newDocumentType.code || "";
      // Try to get categoryId from the document type
      const categoryId = "categoryId" in newDocumentType
        ? (newDocumentType as DoucmentTypeInterface & { categoryId?: number }).categoryId
        : undefined;

      // Only set categoryId if categories are loaded, otherwise it won't display
      if (categoryId && categoryOptions.value.length > 0) {
        formState.categoryId = categoryId.toString();
      } else if (categoryId) {
        // Save the categoryId to set it after categories are loaded
        pendingCategoryId.value = categoryId;
      }
    } else {
      formState.name = "";
      formState.code = "";
      formState.categoryId = undefined;
    }
  },
  { immediate: true }
);

// Watch for category options to be loaded and set pending categoryId
watch(
  () => categoryOptions.value.length,
  (newLength) => {
    if (newLength > 0 && pendingCategoryId.value) {
      formState.categoryId = pendingCategoryId.value.toString();
      pendingCategoryId.value = undefined;
    }
  }
);

const submitForm = async () => {
  try {
    await formRef.value.submitForm();
    const formData = {
      name: formState.name,
      code: formState.code,
      categoryId: formState.categoryId ? parseInt(formState.categoryId) : undefined,
    };

    emit("submit", formData);
  } catch (error) {
    console.error("Form validation failed:", error);
  }
};

defineExpose({
  submitForm,
  resetForm: () => formRef.value?.resetFields(),
});
</script>

<template>
  <UiForm ref="formRef" :model="formState" :rules="documentTypeRules">
    <UiFormItem :label="$t('documentType.form.name')" name="name" required>
      <UiInput
        v-model="formState.name"
        :placeholder="$t('documentType.form.namePlaceholder')"
        :disabled="loading"
      />
    </UiFormItem>

    <UiFormItem :label="$t('documentType.form.code')" name="code" required>
      <UiInput
        v-model="formState.code"
        :placeholder="$t('documentType.form.codePlaceholder')"
        :disabled="loading || isEditMode"
      />
    </UiFormItem>

    <UiFormItem :label="$t('documentType.form.category')" name="categoryId">
      <UiSelect
        v-model="formState.categoryId"
        :options="categoryOptions"
        :placeholder="$t('documentType.form.categoryPlaceholder')"
        :disabled="loading"
      />
    </UiFormItem>
  </UiForm>
</template>
