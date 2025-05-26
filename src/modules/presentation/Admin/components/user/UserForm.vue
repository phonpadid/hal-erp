<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch } from "vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UiInputPassword from "@/common/shared/components/Input/UiInputPassword.vue";
import type { UserInterface } from "@/modules/interfaces/user.interface";
import { useI18n } from "vue-i18n";
import { createUserValidation } from "../../views/user/validation/user.validate";

const { t } = useI18n();

const props = defineProps<{
  user?: UserInterface | null;
  isEditMode: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", data: { username: string; email: string; password?: string; tel?: string }): void;
  (e: "cancel"): void;
}>();

const formRef = ref();
const formState = reactive({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  tel: "",
});

// Create validation rules
const validationState = reactive({
  password: formState.password,
  isEditMode: props.isEditMode,
});

// Watch for password changes to update validation state
watch(
  () => formState.password,
  (newPassword) => {
    validationState.password = newPassword;
  }
);

// Watch for isEditMode changes
watch(
  () => props.isEditMode,
  (newIsEditMode) => {
    validationState.isEditMode = newIsEditMode;
  }
);

// Get validation rules
const userRules = createUserValidation(t, validationState);

// Watch for user changes
watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      formState.username = newUser.username || "";
      formState.email = newUser.email || "";
      formState.password = "";
      formState.confirmPassword = "";
      formState.tel = newUser.tel || "";
    } else {
      formState.username = "";
      formState.email = "";
      formState.password = "";
      formState.confirmPassword = "";
      formState.tel = "";
    }
  },
  { immediate: true }
);

const submitForm = async () => {
  try {
    await formRef.value.submitForm();
    const formData: { username: string; email: string; password?: string; tel?: string } = {
      username: formState.username,
      email: formState.email,
      tel: formState.tel || undefined,
    };
    if (formState.password) {
      formData.password = formState.password;
    }

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
  <UiForm ref="formRef" :model="formState" :rules="userRules">
    <!-- Form items remain the same -->
    <UiFormItem :label="$t('user.form.username')" name="username" required>
      <UiInput
        v-model="formState.username"
        :placeholder="$t('user.form.usernamePlaceholder')"
        :disabled="loading"
      />
    </UiFormItem>

    <UiFormItem :label="$t('user.form.email')" name="email" required>
      <UiInput
        v-model="formState.email"
        :placeholder="$t('user.form.emailPlaceholder')"
        type="email"
        :disabled="loading"
      />
    </UiFormItem>

    <UiFormItem :label="$t('user.form.password')" name="password" :required="!isEditMode">
      <UiInputPassword
        v-model="formState.password"
        :placeholder="
          isEditMode ? $t('user.form.passwordEditPlaceholder') : $t('user.form.passwordPlaceholder')
        "
        :disabled="loading"
      />
    </UiFormItem>

    <UiFormItem
      :label="$t('user.form.confirmPassword')"
      name="confirmPassword"
      :required="!isEditMode || formState.password"
    >
      <UiInputPassword
        v-model="formState.confirmPassword"
        :placeholder="$t('user.form.confirmPasswordPlaceholder')"
        :disabled="loading"
      />
    </UiFormItem>

    <UiFormItem :label="$t('user.form.tel')" name="tel">
      <UiInput
        v-model="formState.tel"
        :placeholder="$t('user.form.telPlaceholder')"
        :disabled="loading"
      />
    </UiFormItem>
  </UiForm>
</template>
