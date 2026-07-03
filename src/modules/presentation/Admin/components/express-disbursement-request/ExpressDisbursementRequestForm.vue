<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import { useExpressDisbursementRequestStore } from "@/modules/presentation/Admin/stores/express-disbursement-request/express-disbursement-request.store";
import { useUnitStore } from "@/modules/presentation/Admin/stores/unit.store";
import { uploadFile } from "@/modules/application/services/upload.service";

const { t } = useI18n();
const store = useExpressDisbursementRequestStore();
const unitStore = useUnitStore();

const formRef = ref();

const unitOptions = ref<Array<{ value: string; label: string }>>([]);

onMounted(async () => {
  await unitStore.fetchUnits({ page: 1, limit: 100 });
  unitOptions.value = (unitStore.units as any[]).map((u: any) => ({
    value: String(u.getId ? u.getId() : u.id),
    label: u.getName ? u.getName() : u.name,
  }));
});

const rules = {
  purpose: [{ required: true, message: t("expressDisbursementRequest.validation.purpose") }],
};

const onUploadChange = async (index: number, e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  try {
    const formData = new FormData();
    formData.append("file", file);
    const { fileName } = await uploadFile(formData);
    store.formModel.items[index].file_name = fileName;
    store.formModel.items[index].file_name_url = URL.createObjectURL(file);
    store.formModel.items[index].fileType = file.type.includes("pdf") ? "pdf" : "image";
  } catch (err: any) {
    message.error(err?.message || "upload failed");
  }
};

/** Validate the whole form (purpose + at least one complete line item). */
async function validate(): Promise<boolean> {
  try {
    await formRef.value?.validate?.();
  } catch {
    return false;
  }
  const items = store.formModel.items;
  if (!items.length) return false;
  for (const it of items) {
    if (!it.title || !it.unit_id || !it.quantity || !it.price || !it.remark) {
      message.error(t("expressDisbursementRequest.validation.items"));
      return false;
    }
  }
  return true;
}

defineExpose({ validate });
</script>

<template>
  <a-form ref="formRef" :model="store.formModel" :rules="rules" layout="vertical">
    <a-form-item :label="t('expressDisbursementRequest.form.purpose')" name="purpose">
      <a-textarea
        v-model:value="store.formModel.purpose"
        :rows="2"
        :placeholder="t('expressDisbursementRequest.form.purpose_placeholder')"
      />
    </a-form-item>

    <div class="flex items-center justify-between mb-2">
      <h3 class="font-semibold">{{ t("expressDisbursementRequest.form.items") }}</h3>
      <a-button type="dashed" @click="store.addItem()">
        + {{ t("expressDisbursementRequest.form.add_item") }}
      </a-button>
    </div>

    <div
      v-for="(item, index) in store.formModel.items"
      :key="index"
      class="rounded-lg border p-4 mb-3"
    >
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm text-gray-500">#{{ index + 1 }}</span>
        <a-button
          v-if="store.formModel.items.length > 1"
          type="text"
          danger
          @click="store.removeItem(index)"
        >
          {{ t("expressDisbursementRequest.form.remove_item") }}
        </a-button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a-form-item :label="t('expressDisbursementRequest.form.item_title')">
          <a-input v-model:value="item.title" />
        </a-form-item>
        <a-form-item :label="t('expressDisbursementRequest.form.unit')">
          <a-select v-model:value="item.unit_id" :options="unitOptions" />
        </a-form-item>
        <a-form-item :label="t('expressDisbursementRequest.form.quantity')">
          <a-input-number v-model:value="item.quantity" :min="1" class="w-full" />
        </a-form-item>
        <a-form-item :label="t('expressDisbursementRequest.form.price')">
          <a-input-number v-model:value="item.price" :min="0" class="w-full" />
        </a-form-item>
        <a-form-item :label="t('expressDisbursementRequest.form.remark')" class="sm:col-span-2">
          <a-input v-model:value="item.remark" />
        </a-form-item>
        <a-form-item :label="t('expressDisbursementRequest.form.attachment')" class="sm:col-span-2">
          <input type="file" accept="image/*,application/pdf" @change="(e) => onUploadChange(index, e)" />
          <span v-if="item.file_name" class="text-green-600 text-sm ml-2">✓ {{ item.file_name }}</span>
        </a-form-item>
      </div>
    </div>

    <div class="text-right font-semibold">
      {{ t("expressDisbursementRequest.form.total") }}: {{ store.totalAmount.toLocaleString() }}
    </div>
  </a-form>
</template>
