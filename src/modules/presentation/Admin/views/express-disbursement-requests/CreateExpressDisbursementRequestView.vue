<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useExpressDisbursementRequestStore } from "@/modules/presentation/Admin/stores/express-disbursement-request/express-disbursement-request.store";
import ExpressDisbursementRequestForm from "@/modules/presentation/Admin/components/express-disbursement-request/ExpressDisbursementRequestForm.vue";

const { t } = useI18n();
const router = useRouter();
const { success, warning } = useNotification();
const store = useExpressDisbursementRequestStore();

const formRef = ref();

const handleSubmit = async () => {
  const valid = await formRef.value?.validate?.();
  if (!valid) return;

  const created = await store.create();
  if (created) {
    success(
      t("expressDisbursementRequest.notify.title"),
      t("expressDisbursementRequest.notify.created")
    );
    router.push({ name: "express_disbursement_request.index" });
  } else if (store.error) {
    warning(t("expressDisbursementRequest.notify.title"), store.error);
  }
};

const goBack = () => router.push({ name: "express_disbursement_request.index" });

onUnmounted(() => store.resetForm());
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">{{ t("expressDisbursementRequest.create_title") }}</h1>
      <UiButton type="" icon="ant-design:arrow-left-outlined" @click="goBack">
        {{ t("button.back") }}
      </UiButton>
    </div>

    <div class="bg-white rounded-lg p-6 shadow-sm">
      <ExpressDisbursementRequestForm ref="formRef" />

      <div class="flex justify-end gap-2 mt-4">
        <UiButton type="" @click="goBack">{{ t("button.cancel") }}</UiButton>
        <UiButton
          type="primary"
          colorClass="text-white"
          :loading="store.isCreating"
          @click="handleSubmit"
        >
          {{ t("button.save") }}
        </UiButton>
      </div>
    </div>
  </div>
</template>
