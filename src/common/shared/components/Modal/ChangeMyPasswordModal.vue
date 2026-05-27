<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { useI18n } from "vue-i18n";
import UiModal from "./UiModal.vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInputPassword from "@/common/shared/components/Input/UiInputPassword.vue";
import { useUserStore } from "@/modules/presentation/Admin/stores/user.store";
import { useNotification } from "@/modules/shared/utils/useNotification";

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: "update:visible", visible: boolean): void;
  (e: "success"): void;
}>();

const { t } = useI18n();
const { success, error: notifyError } = useNotification();
const userStore = useUserStore();

const formRef = ref();
const submitting = ref(false);
const formState = reactive({
  old_password: "",
  new_password: "",
  confirm_password: "",
});

const resetForm = () => {
  formState.old_password = "";
  formState.new_password = "";
  formState.confirm_password = "";
  formRef.value?.resetFields?.();
};

watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      resetForm();
    }
  }
);

const rules = {
  old_password: [
    { required: true, message: t("menu-sidebar.change_password.required") },
  ],
  new_password: [
    { required: true, message: t("menu-sidebar.change_password.required") },
    { min: 6, message: t("menu-sidebar.change_password.min_length") },
    { max: 255, message: t("menu-sidebar.change_password.max_length") },
  ],
  confirm_password: [
    { required: true, message: t("menu-sidebar.change_password.required") },
    {
      validator: async (_rule: unknown, value: string) => {
        if (value !== formState.new_password) {
          throw new Error(t("menu-sidebar.change_password.mismatch"));
        }
      },
    },
  ],
};

const errorMessageFor = (err: unknown): string => {
  const e = err as { errorKey?: string; message?: string };
  const key = e?.errorKey;
  if (key === "errors.incorrect_password") {
    return t("menu-sidebar.change_password.incorrect_old");
  }
  if (key === "validation.PASSWORD_MISMATCH") {
    return t("menu-sidebar.change_password.mismatch");
  }
  if (key === "validation.PASSWORD_LENGTH") {
    return t("menu-sidebar.change_password.min_length");
  }
  return e?.message || t("menu-sidebar.change_password.failed");
};

const handleOk = async () => {
  try {
    await formRef.value?.submitForm();
  } catch {
    return;
  }

  submitting.value = true;
  try {
    await userStore.changeMyPassword({
      old_password: formState.old_password,
      new_password: formState.new_password,
      confirm_password: formState.confirm_password,
    });
    success(t("menu-sidebar.change_password.success"));
    emit("update:visible", false);
    emit("success");
  } catch (err) {
    notifyError(errorMessageFor(err));
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  emit("update:visible", false);
};
</script>

<template>
  <UiModal
    :visible="visible"
    :title="t('menu-sidebar.change_password.title')"
    title-icon="mdi:lock-reset"
    :confirm-loading="submitting"
    :ok-text="t('button.confirm')"
    :cancel-text="t('button.cancel')"
    @update:visible="handleCancel"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <UiForm ref="formRef" :model="formState" :rules="rules">
      <UiFormItem
        :label="t('menu-sidebar.change_password.old_password')"
        name="old_password"
        required
      >
        <UiInputPassword
          v-model="formState.old_password"
          :placeholder="t('menu-sidebar.change_password.placeholder_old')"
          :disabled="submitting"
        />
      </UiFormItem>

      <UiFormItem
        :label="t('menu-sidebar.change_password.new_password')"
        name="new_password"
        required
      >
        <UiInputPassword
          v-model="formState.new_password"
          :placeholder="t('menu-sidebar.change_password.placeholder_new')"
          :disabled="submitting"
        />
      </UiFormItem>

      <UiFormItem
        :label="t('menu-sidebar.change_password.confirm_password')"
        name="confirm_password"
        required
      >
        <UiInputPassword
          v-model="formState.confirm_password"
          :placeholder="t('menu-sidebar.change_password.placeholder_confirm')"
          :disabled="submitting"
        />
      </UiFormItem>
    </UiForm>
  </UiModal>
</template>
