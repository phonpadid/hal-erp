<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { VendorBankAccountInterface } from "@/modules/interfaces/vendors/vendor_bank_accounts/vendor-bank-accounts.interface";
import { columns } from "./column";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useVendorBankAccountStore } from "@/modules/presentation/Admin/stores/vendors/vendor-bank-accounts.store";
import Switch from "@/common/shared/components/Switch/Switch.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import VendorBankAccountForm from "@/modules/presentation/Admin/components/vendors/vendor_bank_accounts/FormVendorBank.vue";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import { useRoute } from "vue-router";

const route = useRoute();
const { t } = useI18n();
const vendorBankAccountStore = useVendorBankAccountStore();
const { success, error, warning } = useNotification();

// State
const loading = ref<boolean>(false);
const searchKeyword = ref<string>("");

// Modal state
const modalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const submitLoading = ref<boolean>(false);
const selectedBankAccount = ref<VendorBankAccountInterface | null>(null);
const isEditMode = ref<boolean>(false);
const bankAccountFormRef = ref();

// Table pagination
const tablePagination = computed(() => ({
  current: vendorBankAccountStore.pagination.page,
  pageSize: vendorBankAccountStore.pagination.limit,
  total: vendorBankAccountStore.pagination.total,
  showSizeChanger: true,
}));

onMounted(async () => {
  await loadBankAccounts();
});

const loadBankAccounts = async () => {
  loading.value = true;
  const vendorId = Number(route.params.id);

  try {
    await vendorBankAccountStore.fetchBankAccounts(vendorId, {
      page: vendorBankAccountStore.pagination.page,
      limit: vendorBankAccountStore.pagination.limit,
      search: searchKeyword.value,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("messages.error.title"), errorMessage);
  } finally {
    loading.value = false;
  }
};

// Handle pagination and sorting
const handleTableChange = (
  paginationInfo: TablePaginationType
) => {
  const page = paginationInfo.current || 1;
  const pageSize = paginationInfo.pageSize || 10;

  vendorBankAccountStore.setPagination({
    page,
    limit: pageSize,
    total: vendorBankAccountStore.pagination.total,
  });

  loadBankAccounts();
};

const handleSearch = async () => {
  await vendorBankAccountStore.fetchBankAccounts({
    page: 1,
    limit: vendorBankAccountStore.pagination.limit,
    search: searchKeyword.value,
  });
};

watch(searchKeyword, async(newVal: string) => {
  if(newVal === '') {
    vendorBankAccountStore.setPagination({
      page: 1,
      limit: vendorBankAccountStore.pagination.limit,
      total: vendorBankAccountStore.pagination.total,
    })
    await loadBankAccounts()
  }
})

// Modal handlers
const showCreateModal = () => {
  selectedBankAccount.value = null;
  isEditMode.value = false;
  modalVisible.value = true;
};

const showEditModal = (bankAccount: VendorBankAccountInterface) => {
  selectedBankAccount.value = { ...bankAccount };
  isEditMode.value = true;
  modalVisible.value = true;
};

const showDeleteModal = (bankAccount: VendorBankAccountInterface) => {
  selectedBankAccount.value = bankAccount;
  deleteModalVisible.value = true;
};

const handleModalOk = () => {
  bankAccountFormRef.value?.submitForm();
};

const handleModalCancel = () => {
  modalVisible.value = false;
};

const handleFormSubmit = async (formData: {
  vendor_id: string | number;
  currency_id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  is_selected: boolean;
}) => {
  try {
    submitLoading.value = true;
    const processedData = {
      ...formData,
      vendor_id: Number(formData.vendor_id),
      currency_id: Number(formData.currency_id),
    };

    if (isEditMode.value && selectedBankAccount.value) {
      await vendorBankAccountStore.updateBankAccount(selectedBankAccount.value.id, processedData);
      success(t("vendors_bank.success.title"), t("vendors_bank.success.updated"));
    } else {
      await vendorBankAccountStore.createBankAccount(processedData);
      success(t("vendors_bank.success.title"), t("vendors_bank.success.created"));
    }

    modalVisible.value = false;
    await loadBankAccounts();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("vendors_bank.error.saveFailed"), errorMessage);
  } finally {
    submitLoading.value = false;
  }
};

const handleDeleteConfirm = async () => {
  if (!selectedBankAccount.value) return;

  try {
    submitLoading.value = true;
    await vendorBankAccountStore.deleteBankAccount(selectedBankAccount.value.id);
    success(t("vendors_bank.success.title"), t("vendors_bank.success.deleted"));
    deleteModalVisible.value = false;
    await loadBankAccounts();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("vendors_bank.error.deleteFailed"), errorMessage);
  } finally {
    submitLoading.value = false;
  }
};

const handleToggleIsSelected = async (record: VendorBankAccountInterface) => {
  try {
    const newSelectedState = !record.is_selected;
    await vendorBankAccountStore.toggleBankAccountSelection(record.id, newSelectedState);
    success(t("vendors_bank.success.title"), t("vendors_bank.success.updated"));
    await loadBankAccounts();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("vendors_bank.error.updateFailed"), errorMessage);
  }
};
</script>

<template>
  <div class="vendor-bank-account-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ t("vendors_bank.list.title") }}</h1>
      </div>

      <div class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit">
         <InputSearch
          v-model:value="searchKeyword"
          @keyup.enter="handleSearch"
          :placeholder="t('currency.placeholder.search')"
        />
        <UiButton
          type="primary"
          icon="ant-design:plus-outlined"
          @click="showCreateModal"
          colorClass="text-white flex items-center"
        >
          {{ t("vendors_bank.list.add") }}
        </UiButton>
      </div>
    </div>

    <!-- Bank Accounts Table -->
    <Table
      :columns="columns(t)"
      :dataSource="vendorBankAccountStore.bankAccounts"
      :pagination="tablePagination"
      :loading="loading"
      row-key="id"
      @change="handleTableChange"
    >
      <!-- Is Selected Column -->
      <template #is_selected="{ record }">
        <Switch
          :modelValue="record.is_selected"
          @update:modelValue="handleToggleIsSelected(record)"
        />
      </template>

      <!-- Actions column -->
      <template #actions="{ record }">
        <div class="flex items-center justify-center gap-2">
          <UiButton
            type=""
            icon="ant-design:edit-outlined"
            size="small"
            @click="showEditModal(record)"
            colorClass="flex items-center justify-center text-orange-400"
            :disabled="!!record.deleted_at"
          />

          <UiButton
            type=""
            danger
            icon="ant-design:delete-outlined"
            colorClass="flex items-center justify-center text-red-700"
            size="small"
            @click="showDeleteModal(record)"
          />
        </div>
      </template>
    </Table>

    <!-- Create/Edit Bank Account Modal -->
    <UiModal
      :title="isEditMode ? t('vendors_bank.modal.editTitle') : t('vendors_bank.modal.title')"
      :visible="modalVisible"
      :confirm-loading="submitLoading"
      @update:visible="modalVisible = $event"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :okText="isEditMode ? t('button.edit') : t('button.save')"
      :cancelText="t('button.cancel')"
    >
      <VendorBankAccountForm
        ref="bankAccountFormRef"
        :bank-account="selectedBankAccount"
        :is-edit-mode="isEditMode"
        :loading="submitLoading"
        @submit="handleFormSubmit"
      />
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('vendors_bank.modal.deleteMessage')"
      :visible="deleteModalVisible"
      :confirm-loading="submitLoading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDeleteConfirm"
      @cancel="deleteModalVisible = false"
      ok-text="ຢືນຢັນ"
      ok-type="primary"
      :danger="true"
    >
      <p>{{ $t("vendors_bank.modal.deleteMessage", { name: selectedBankAccount?.bank_name }) }}</p>
      <p class="text-red-500">{{ $t("vendors_bank.modal.deleteSuccess") }}</p>
    </UiModal>
  </div>
</template>

<style scoped>
.vendor-bank-account-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
