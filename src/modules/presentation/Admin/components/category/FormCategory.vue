<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch } from "vue";
import type { CategoryInterface } from "@/modules/interfaces/category.interface";
import { useI18n } from "vue-i18n";
import { createCategoryValidation } from "@/modules/presentation/Admin/views/category/validation/category.vallidate";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";

/********************************************************************************* */
const { t } = useI18n();
const props = defineProps<{
  category?: CategoryInterface | null;
  isEditMode: boolean;
  loading?: boolean;
}>();
const emit = defineEmits<{
  (e: "submit", data: { name: string }): void;
  (e: "cancel"): void;
}>();

const formRef = ref();
const formState = reactive({
  name: "",
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
const categoryRules = createCategoryValidation(t, validationState);

// Watch for category changes
watch(
  () => props.category,
  (newCategory) => {
    if (newCategory) {
      formState.name = newCategory.name || "";
    } else {
      formState.name = "";
    }
  },
  { immediate: true }
);

const submitForm = async () => {
  try {
    await formRef.value.submitForm();
    const formData = {
      name: formState.name,
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
  <UiForm ref="formRef" :model="formState" :rules="categoryRules">
    <UiFormItem :label="$t('category.form.name')" name="name" required>
      <UiInput
        v-model="formState.name"
        :placeholder="$t('category.form.namePlaceholder')"
        :disabled="loading"
      />
    </UiFormItem>
  </UiForm>
</template>
