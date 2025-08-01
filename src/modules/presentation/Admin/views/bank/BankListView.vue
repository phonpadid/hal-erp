<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed, onMounted, watch, ref, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import { useBankStore } from "@/modules/presentation/Admin/stores/bank.store";
import { getColumns } from "./column";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import FormBank from "@/modules/presentation/Admin/components/bank/FormBank.vue";

const { t } = useI18n();
const bankStore = useBankStore();
const { success, warning } = useNotification();
const bankFormRef = ref();
const formRef = ref();

onMounted(async () => {
  await loadBanks();
});

onUnmounted(() => {
  bankStore.resetState();
  formRef.value?.resetFields?.();
});

const loadBanks = async () => {
  await bankStore.fetchBanks({
    page: bankStore.pagination.page,
    limit: bankStore.pagination.limit,
    search: bankStore.searchKeyword,
  });
};

const handleTableChange = (pagination: TablePaginationType) => {
  bankStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total || 0,
  });
  loadBanks();
};

const handleSearch = async () => {
  await bankStore.fetchBanks({
    page: 1,
    limit: bankStore.pagination.limit,
    search: bankStore.searchKeyword,
  });
};

watch(
  () => bankStore.searchKeyword,
  async (newVal: string) => {
    if (newVal === "") {
      bankStore.setPagination({
        page: 1,
        limit: bankStore.pagination.limit,
        total: bankStore.pagination.total,
      });
      await loadBanks();
    }
  }
);

const handleFormSubmit = async (formData: {
  name: string;
  short_name: string;
  logo: string | File | null;
}) => {
  try {
    bankStore.submitLoading = true;
    if (bankStore.isEditMode && bankStore.selectedBankId) {
      await bankStore.updateBank(bankStore.selectedBankId, {
        ...formData,
        id: Number(bankStore.selectedBankId),
      });
      success(t("banks.success.title"), t("banks.success.updated"));
    } else {
      await bankStore.createBank(formData);
      success(t("banks.success.title"), t("banks.success.created"));
    }
    bankStore.modalVisible = false;
    await loadBanks();
  } catch (err: unknown) {
    warning(t("banks.error.title"), String(err instanceof Error ? err.message : err));
  } finally {
    bankStore.submitLoading = false;
  }
};
</script>

<template>
  <div class="bank-list-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ t("banks.title") }}</h1>
      </div>
      <div class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit">
        <InputSearch
          v-model:value="bankStore.searchKeyword"
          @keyup.enter="handleSearch"
          :placeholder="t('banks.placeholder.search')"
        />
        <UiButton
          type="primary"
          icon="ant-design:plus-outlined"
          @click="bankStore.showCreateModal"
          colorClass="text-white flex items-center"
        >
          {{ t("banks.add") }}
        </UiButton>
      </div>
    </div>

    <Table
      :columns="getColumns(t)"
      :dataSource="bankStore.mappedBanks"
      :pagination="bankStore.tablePagination"
      :loading="bankStore.loading"
      row-key="id"
      @change="handleTableChange"
    >
      <template #actions="{ record }">
        <div class="flex items-center justify-center gap-2">
          <UiButton
            type=""
            icon="ant-design:edit-outlined"
            size="small"
            @click="bankStore.showEditModal(record)"
            colorClass="flex items-center justify-center text-orange-400"
            :disabled="!!record.deleted_at"
          />
          <UiButton
            type=""
            danger
            icon="ant-design:delete-outlined"
            colorClass="flex items-center justify-center text-red-700"
            size="small"
            @click="bankStore.showDeleteModal(record)"
          />
        </div>
      </template>
      <template #logo="{ record }">
        <img
          v-if="record.logoUrl || record.logo"
          :src="record.logoUrl || record.logo"
          alt="Logo"
          class="w-16 h-16 object-contain border"
        />
        <span v-else>—</span>
      </template>
    </Table>

    <UiModal
      :title="bankStore.isEditMode ? t('banks.header_form.edit') : t('banks.header_form.add')"
      :visible="bankStore.modalVisible"
      :confirm-loading="bankStore.submitLoading"
      @update:visible="bankStore.modalVisible = $event"
      @ok="bankStore.handleModalOk(bankFormRef)"
      @cancel="bankStore.handleModalCancel"
      :okText="bankStore.isEditMode ? t('button.edit') : t('button.save')"
      :cancelText="t('button.cancel')"
    >
      <FormBank
        ref="bankFormRef"
        v-model="bankStore.bankFormModel"
        :loading="bankStore.submitLoading"
        :isEdit="bankStore.isEditMode"
        @submit="handleFormSubmit"
      />
    </UiModal>

    <UiModal
      :title="t('banks.header_form.delete.title')"
      :visible="bankStore.deleteModalVisible"
      :confirm-loading="bankStore.submitLoading"
      @update:visible="bankStore.deleteModalVisible = $event"
      @ok="bankStore.handleDeleteConfirm"
      @cancel="bankStore.deleteModalVisible = false"
      ok-text="ຢືນຢັນ"
      ok-type="primary"
      :danger="true"
    >
      <p>{{ t("banks.header_form.delete.content") }} "{{ bankStore.bankFormModel.name }}"?</p>
      <p class="text-red-500">{{ t("banks.header_form.delete.description") }}</p>
    </UiModal>
  </div>
</template>

<style scoped>
.bank-list-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
