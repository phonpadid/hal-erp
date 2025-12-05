<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { VatInterface } from "@/modules/interfaces/vat.interface";
import { useVatStore } from "../../stores/vat.store";
import { VatColumns } from "./column";
import { useNotification } from "@/modules/shared/utils/useNotification";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import VatForm from "@/modules/presentation/Admin/components/vat/FormVat.vue";
import { usePermissions } from "@/modules/shared/utils/usePermissions";

const { t } = useI18n();
const { hasCompanyPermission, hasRole } = usePermissions();
const vatStore = useVatStore();
const { success, warning } = useNotification();

// Permission checks - Company-admin ไม่สามารถจัดการ VAT ได้
const canEditVat = !hasRole('company-admin') && hasCompanyPermission('update-vat');

const loading = ref(false);
const modalVisible = ref(false);
const submitLoading = ref(false);
const selectedVat = ref<VatInterface | null>(null);
const vatFormRef = ref();

onMounted(async () => {
  loading.value = true;
  try {
    await vatStore.fetchVat();
    selectedVat.value = vatStore.vat ? vatStore.vatEntityToInterface(vatStore.vat) : null;
  } finally {
    loading.value = false;
  }
});

const showEditModal = () => {
  if (vatStore.vat) {
    selectedVat.value = vatStore.vatEntityToInterface(vatStore.vat);
    modalVisible.value = true;
  }
};

const handleModalOk = () => {
  vatFormRef.value?.submitForm();
};

const handleModalCancel = () => {
  modalVisible.value = false;
};

const handleFormSubmit = async (formData: { amount: number }) => {
  try {
    submitLoading.value = true;
    if (selectedVat.value) {
      await vatStore.updateVat(selectedVat.value.id, { ...formData });
      success(t("vats.success.title"), t("vats.success.updated"));
    }
    modalVisible.value = false;
    await vatStore.fetchVat();
    selectedVat.value = vatStore.vat ? vatStore.vatEntityToInterface(vatStore.vat) : null;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("vats.error.title"), errorMessage);
  } finally {
    submitLoading.value = false;
  }
};
</script>

<template>
  <div class="vats-container p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-semibold">{{ t("vats.title") }}</h1>
    </div>
    <Table
      :columns="VatColumns(t)"
      :dataSource="selectedVat ? [selectedVat] : []"
      :loading="loading"
      row-key="id"
    >
      <template #actions="{ record }">
        <div class="flex items-center justify-center gap-2">
          <UiButton
            v-if="canEditVat"
            type=""
            icon="ant-design:edit-outlined"
            size="small"
            @click="showEditModal()"
            colorClass="flex items-center justify-center text-orange-400"
            :disabled="!!record.deleted_at"
          />
        </div>
      </template>
    </Table>
    <UiModal
      :title="t('vats.modal.edit')"
      :visible="modalVisible"
      :confirm-loading="submitLoading"
      @update:visible="modalVisible = $event"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :okText="t('button.edit')"
      :cancelText="t('button.cancel')"
    >
      <VatForm
        ref="vatFormRef"
        :vat="selectedVat"
        :loading="submitLoading"
        @submit="handleFormSubmit"
      />
    </UiModal>
  </div>
</template>

<style scoped>
.vat-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
