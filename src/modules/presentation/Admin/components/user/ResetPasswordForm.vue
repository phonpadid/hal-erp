<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import { ref, reactive } from "vue";
import { useI18n } from "vue-i18n";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInputPassword from "@/common/shared/components/Input/UiInputPassword.vue";

const { t } = useI18n();

const props = defineProps<{
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", data: { password: string }): void;
  (e: "cancel"): void;
}>();

const formRef = ref();
const formState = reactive({
  password: "",
  confirmPassword: "",
});

// Validation rules
const rules = {
  password: [
    { required: true, message: t("user.validation.passwordRequired") },
    { min: 6, message: t("user.validation.passwordMin") },
  ],
  confirmPassword: [
    { required: true, message: t("user.validation.confirmPasswordRequired") },
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validator: async (_rule: any, value: string) => {
        if (value !== formState.password) {
          throw new Error(t("user.validation.passwordMismatch"));
        }
      },
    },
  ],
};

const submitForm = async () => {
  try {
    await formRef.value.submitForm();
    emit("submit", { password: formState.password });
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
  <UiForm ref="formRef" :model="formState" :rules="rules">
    <UiFormItem :label="t('user.form.newPassword')" name="password" required>
      <UiInputPassword
        v-model="formState.password"
        :placeholder="t('user.form.newPasswordPlaceholder')"
        :disabled="loading"
      />
    </UiFormItem>

    <UiFormItem :label="t('user.form.confirmPassword')" name="confirmPassword" required>
      <UiInputPassword
        v-model="formState.confirmPassword"
        :placeholder="t('user.form.confirmPasswordPlaceholder')"
        :disabled="loading"
      />
    </UiFormItem>
  </UiForm>
</template>
