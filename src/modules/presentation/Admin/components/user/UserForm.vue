<template>
  <UiForm ref="formRef" :model="formState" :rules="userRules">
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

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch } from "vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UiInputPassword from "@/common/shared/components/Input/UiInputPassword.vue";
import type { UserInterface } from "@/modules/interfaces/user.interface";
import { useI18n } from "vue-i18n";
import type { RuleObject } from "ant-design-vue/es/form";

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

// ตรวจสอบว่ารหัสผ่านตรงกันหรือไม่
const validateConfirmPassword = (_rule: RuleObject, value: string) => {
  if (formState.password && value !== formState.password) {
    return Promise.reject(t("user.validation.passwordMismatch"));
  }
  return Promise.resolve();
};

// กฎการตรวจสอบความถูกต้อง (validation rules)
const userRules = {
  username: [
    { required: true, message: t("user.validation.usernameRequired"), trigger: "blur" },
    { min: 3, message: t("user.validation.usernameLength"), trigger: "blur" },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: t("user.validation.usernamePattern"),
      trigger: "blur",
    },
  ],
  email: [
    { required: true, message: t("user.validation.emailRequired"), trigger: "blur" },
    { type: "email", message: t("user.validation.emailValid"), trigger: "blur" },
  ],
  password: [
    {
      required: !props.isEditMode,
      message: t("user.validation.passwordRequired"),
      trigger: "blur",
    },
    {
      validator: (_rule: RuleObject, value: string) => {
        if (props.isEditMode && !value) return Promise.resolve();
        if (value && value.length < 6) return Promise.reject(t("user.validation.passwordLength"));
        return Promise.resolve();
      },
      trigger: "blur",
    },
  ],
  confirmPassword: [
    {
      required: !props.isEditMode || (props.isEditMode && !!formState.password),
      message: t("user.validation.confirmPasswordRequired"),
      trigger: "blur",
    },
    { validator: validateConfirmPassword, trigger: "blur" },
  ],
  tel: [
    {
      pattern: /^[0-9]+$/,
      message: t("user.validation.telPattern"),
      trigger: "blur",
    },
  ],
};

// อัปเดตฟอร์มเมื่อมีการเปลี่ยนแปลงค่า user
watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      formState.username = newUser.username || "";
      formState.email = newUser.email || "";
      formState.password = ""; // ไม่ใส่รหัสผ่านเพื่อความปลอดภัย
      formState.confirmPassword = "";
      formState.tel = newUser.tel || "";
    } else {
      // รีเซ็ตฟอร์มเมื่อไม่มีข้อมูลผู้ใช้ (สำหรับโหมดเพิ่มใหม่)
      formState.username = "";
      formState.email = "";
      formState.password = "";
      formState.confirmPassword = "";
      formState.tel = "";
    }
  },
  { immediate: true }
);

// ส่งข้อมูลฟอร์ม
const submitForm = async () => {
  try {
    await formRef.value.submitForm();

    // เตรียมข้อมูลที่จะส่งไป
    const formData: { username: string; email: string; password?: string; tel?: string } = {
      username: formState.username,
      email: formState.email,
      tel: formState.tel || undefined,
    };

    // เพิ่มรหัสผ่านเฉพาะกรณีที่มีการกรอก (สำหรับการสร้างใหม่หรือการเปลี่ยนรหัสผ่าน)
    if (formState.password) {
      formData.password = formState.password;
    }

    emit("submit", formData);
  } catch (error) {
    console.error("Form validation failed:", error);
  }
};

// เปิดเผยเมธอดให้ parent component เรียกใช้ได้
defineExpose({
  submitForm,
  resetForm: () => formRef.value?.resetFields(),
});
</script>
