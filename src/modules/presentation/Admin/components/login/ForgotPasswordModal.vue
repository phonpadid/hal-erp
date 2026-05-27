<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import { useAuthStore } from "@/modules/presentation/Admin/stores/authentication/auth.store";
import { useNotification } from "@/modules/shared/utils/useNotification";

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: "update:visible", visible: boolean): void;
}>();

const { t } = useI18n();
const { error: notifyError } = useNotification();
const authStore = useAuthStore();

const formRef = ref();
const submitting = ref(false);
const sent = ref(false);
const formState = reactive({
  email: "",
});

const resetState = () => {
  formState.email = "";
  sent.value = false;
  submitting.value = false;
  formRef.value?.resetFields?.();
};

watch(
  () => props.visible,
  (visible) => {
    if (!visible) resetState();
  }
);

const rules = {
  email: [
    { required: true, message: t("menu-sidebar.forgot_password.required") },
    { type: "email", message: t("menu-sidebar.forgot_password.invalid_email") },
  ],
};

const handleOk = async () => {
  if (sent.value) {
    emit("update:visible", false);
    return;
  }

  try {
    await formRef.value?.submitForm();
  } catch {
    return;
  }

  submitting.value = true;
  try {
    await authStore.forgotPassword({ email: formState.email });
    sent.value = true;
  } catch (err) {
    const e = err as { message?: string };
    notifyError(e?.message || t("menu-sidebar.forgot_password.failed"));
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
    :title="t('menu-sidebar.forgot_password.title')"
    title-icon="mdi:email-lock-outline"
    :confirm-loading="submitting"
    :ok-text="sent ? t('button.close') : t('menu-sidebar.forgot_password.submit')"
    :cancel-text="t('button.cancel')"
    :cancel-button-props="{ style: sent ? 'display: none' : '' }"
    @update:visible="handleCancel"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div v-if="sent" class="flex items-start gap-2 text-[14px] text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
      <span class="mt-0.5">✓</span>
      <span>{{ t("menu-sidebar.forgot_password.info") }}</span>
    </div>

    <template v-else>
      <p class="text-[14px] text-slate-600 mb-3">
        {{ t("menu-sidebar.forgot_password.description") }}
      </p>
      <UiForm ref="formRef" :model="formState" :rules="rules">
        <UiFormItem
          :label="t('menu-sidebar.forgot_password.email_label')"
          name="email"
          required
        >
          <UiInput
            v-model="formState.email"
            :placeholder="t('menu-sidebar.forgot_password.email_placeholder')"
            inputmode="email"
            allowClear
            size="large"
            :disabled="submitting"
          />
        </UiFormItem>
      </UiForm>
    </template>
  </UiModal>
</template>
