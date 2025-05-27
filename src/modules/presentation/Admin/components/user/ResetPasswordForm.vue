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
  (e: "submit", data: { old_password: string; new_password: string }): void;
}>();

const formRef = ref();
const formState = reactive({
  old_password: "",
  new_password: "",
  confirm_password: "",
});

const rules = {
  old_password: [
    { required: true, message: t("user.validation.currentPasswordRequired") },
  ],
  new_password: [
    { required: true, message: t("user.validation.newPasswordRequired") },
    { min: 6, message: t("user.validation.passwordMin") },
  ],
  confirm_password: [
    { required: true, message: t("user.validation.confirmPasswordRequired") },
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validator: async (_rule: any, value: string) => {
        if (value !== formState.new_password) {
          throw new Error(t("user.validation.passwordMismatch"));
        }
      },
    },
  ],
};

const submitForm = async () => {
  try {
    await formRef.value.submitForm();
    emit("submit", {
      old_password: formState.old_password,
      new_password: formState.new_password,
    });
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
    <UiFormItem :label="t('user.form.currentPassword')" name="old_password" required>
      <UiInputPassword
        v-model="formState.old_password"
        :placeholder="t('user.form.currentPasswordPlaceholder')"
        :disabled="loading"
      />
    </UiFormItem>

    <UiFormItem :label="t('user.form.newPassword')" name="new_password" required>
      <UiInputPassword
        v-model="formState.new_password"
        :placeholder="t('user.form.newPasswordPlaceholder')"
        :disabled="loading"
      />
    </UiFormItem>

    <UiFormItem :label="t('user.form.confirmPassword')" name="confirm_password" required>
      <UiInputPassword
        v-model="formState.confirm_password"
        :placeholder="t('user.form.confirmPasswordPlaceholder')"
        :disabled="loading"
      />
    </UiFormItem>
  </UiForm>
</template>
