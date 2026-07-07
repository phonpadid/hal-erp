<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useExpressDisbursementRequestStore } from "@/modules/presentation/Admin/stores/express-disbursement-request/express-disbursement-request.store";
import ExpressDisbursementRequestForm from "@/modules/presentation/Admin/components/express-disbursement-request/ExpressDisbursementRequestForm.vue";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { success, warning } = useNotification();
const store = useExpressDisbursementRequestStore();

const formRef = ref();
const saving = ref(false);
const id = String(route.params.id);

onMounted(async () => {
  const entity = await store.fetchById(id);
  if (entity) {
    store.formModel = {
      purpose: entity.getPurpose(),
      items: entity.getItems().map((it) => ({
        title: it.getTitle(),
        quantity: it.getQuantity(),
        unit_id: it.getUnitId(),
        price: it.getPrice(),
        remark: it.getRemark(),
        file_name: it.getFileName(),
        file_name_url: it.getFileNameUrl(),
        fileType: "",
      })),
    };
  }
});

const handleSubmit = async () => {
  const valid = await formRef.value?.validate?.();
  if (!valid) return;
  saving.value = true;
  try {
    const updated = await store.update(id, {
      purpose: store.formModel.purpose,
      total: store.totalAmount,
      express_disbursement_request_items: store.formModel.items.map((it) => ({
        title: it.title,
        file_name: it.file_name,
        file_name_url: it.file_name_url,
        quantity: Number(it.quantity),
        unit_id: it.unit_id,
        price: Number(it.price),
        total_price: Number(it.price) * Number(it.quantity),
        remark: it.remark || "",
      })),
    });
    if (updated) {
      success(t("expressDisbursementRequest.notify.title"), t("expressDisbursementRequest.notify.updated"));
      router.push({ name: "express_disbursement_request.index" });
    } else if (store.error) {
      warning(t("expressDisbursementRequest.notify.title"), store.error);
    }
  } finally {
    saving.value = false;
  }
};

const goBack = () => router.push({ name: "express_disbursement_request.index" });
onUnmounted(() => store.resetForm());
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">{{ t("expressDisbursementRequest.edit_title") }}</h1>
      <UiButton type="" icon="ant-design:arrow-left-outlined" @click="goBack">
        {{ t("button.back") }}
      </UiButton>
    </div>
    <div class="bg-white rounded-lg p-6 shadow-sm">
      <ExpressDisbursementRequestForm ref="formRef" />
      <div class="flex justify-end gap-2 mt-4">
        <UiButton type="" @click="goBack">{{ t("button.cancel") }}</UiButton>
        <UiButton type="primary" colorClass="text-white" :loading="saving" @click="handleSubmit">
          {{ t("button.edit") }}
        </UiButton>
      </div>
    </div>
  </div>
</template>
