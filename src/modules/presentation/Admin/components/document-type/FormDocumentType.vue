<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch } from "vue";
import type { DoucmentTypeInterface } from "@/modules/interfaces/documenet-type.interface";
import { useI18n } from "vue-i18n";
import { createDocumentTypeValidation } from "@/modules/presentation/Admin/views/document-types/validation/document-type.validate";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";

/********************************************************************************* */
const { t } = useI18n();
const props = defineProps<{
  documentType?: DoucmentTypeInterface | null;
  isEditMode: boolean;
  loading?: boolean;
}>();
const emit = defineEmits<{
  (e: "submit", data: { name: string; code: string }): void;
  (e: "cancel"): void;
}>();

const formRef = ref();
const formState = reactive({
  name: "",
  code: "",
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
    } else {
      formState.name = "";
      formState.code = "";
    }
  },
  { immediate: true }
);

const submitForm = async () => {
  try {
    await formRef.value.submitForm();
    const formData = {
      name: formState.name,
      code: formState.code,
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
  </UiForm>
</template>
