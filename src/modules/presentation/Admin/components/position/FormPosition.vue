<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch } from "vue";
import type { PositionInterface } from "@/modules/interfaces/position.interface";
import { useI18n } from "vue-i18n";
import { createPositionValidation } from "@/modules/presentation/Admin/views/position/validation/position.validate";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";

const { t } = useI18n();
const props = defineProps<{
  position?: PositionInterface | null;
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

const validationState = reactive({
  isEditMode: props.isEditMode,
});

watch(
  () => props.isEditMode,
  (newIsEditMode) => {
    validationState.isEditMode = newIsEditMode;
  }
);

const positionRules = createPositionValidation(t, validationState);

watch(
  () => props.position,
  (newPosition) => {
    if (newPosition) {
      formState.name = newPosition.name || "";
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
  <UiForm ref="formRef" :model="formState" :rules="positionRules">
    <UiFormItem :label="$t('positions.form.name')" name="name" required>
      <UiInput
        v-model="formState.name"
        :placeholder="$t('positions.form.namePlaceholder')"
        :disabled="loading"
      />
    </UiFormItem>
  </UiForm>
</template>
