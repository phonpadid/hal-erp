<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed, onMounted, reactive } from "vue";
import { useI18n } from "vue-i18n";
import type { VendorBankAccountInterface } from "@/modules/interfaces/vendors/vendor_bank_accounts/vendor-bank-accounts.interface";
import { columns } from "./column";
import { formatDate } from "@/modules/shared/formatdate";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useVendorBankAccountStore } from "@/modules/presentation/Admin/stores/vendors/vendor-bank-accounts.store";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import VendorBankAccountForm from "@/modules/presentation/Admin/components/vendors/vendor_bank_accounts/FormVendorBank.vue";

const { t } = useI18n();
const vendorBankAccountStore = useVendorBankAccountStore();
const { success, error } = useNotification();

// State
const bankAccounts = ref<VendorBankAccountInterface[]>([]);
const loading = ref<boolean>(false);
const searchKeyword = ref<string>("");
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
});

// Modal state
const modalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const submitLoading = ref<boolean>(false);
const selectedBankAccount = ref<VendorBankAccountInterface | null>(null);
const isEditMode = ref<boolean>(false);
const bankAccountFormRef = ref();

// Table pagination
const tablePagination = computed(() => ({
  current: pagination.current,
  pageSize: pagination.pageSize,
  total: pagination.total,
  showSizeChanger: true,
}));

onMounted(async () => {
  await loadBankAccounts();
});

const loadBankAccounts = async (
  page: number = pagination.current,
  pageSize: number = pagination.pageSize,
  search: string = searchKeyword.value,
  sortBy?: string
) => {
  loading.value = true;

  try {
    const result = await vendorBankAccountStore.fetchBankAccounts({
      page,
      limit: pageSize,
      search,
      sortBy,
    });
    bankAccounts.value = result.data;
    pagination.current = result.page;
    pagination.pageSize = result.limit;
    pagination.total = result.total;
    pagination.totalPages = result.totalPages;
  } catch (err) {
    console.error("Error loading bank accounts:", err);
    error(t("vendors_bank.error.loadFailed"));
  } finally {
    loading.value = false;
  }
};

// Handle pagination and sorting
const handleTableChange = (
  paginationInfo: TablePaginationType,
  _filters: Record<string, string[]>,
  sorter: any
) => {
  const page = paginationInfo.current || 1;
  const pageSize = paginationInfo.pageSize || 10;

  pagination.current = page;
  pagination.pageSize = pageSize;

  let sortBy;
  if (sorter && sorter.field) {
    sortBy = sorter.field;
  }
  loadBankAccounts(page, pageSize, searchKeyword.value, sortBy);
};

const handleSearch = () => {
  pagination.current = 1;
  loadBankAccounts(1, pagination.pageSize, searchKeyword.value);
};

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
    console.error("Error saving bank account:", err);
    error(t("vendors_bank.error.saveFailed"));
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
    console.error("Error deleting bank account:", err);
    error(t("vendors_bank.error.deleteFailed"));
  } finally {
    submitLoading.value = false;
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
        <UiInput
          v-model="searchKeyword"
          :placeholder="t('vendors_bank.list.search')"
          allowClear
          @update:modelvalue="handleSearch"
          class="w-64"
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
      :dataSource="bankAccounts"
      :pagination="tablePagination"
      :loading="loading"
      row-key="id"
      @change="handleTableChange"
    >
      <!-- <template #vendor="{ record }">
        {{ record.vendor }}
      </template>

      <template #currency_id="{ record }">
        {{ record.currency_id }}
      </template> -->

      <!-- Is Selected Column -->
      <template #is_selected="{ record }">
        <a-tag :color="record.is_selected ? 'green' : 'default'">
          <span>
            {{
              record.is_selected
                ? t("vendors_bank.status.active")
                : t("vendors_bank.status.inactive")
            }}</span
          >
        </a-tag>
      </template>

      <!-- Date columns -->
      <template #created_at="{ record }">
        {{ formatDate(record.created_at) }}
      </template>

      <template #updated_at="{ record }">
        {{ formatDate(record.updated_at) }}
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
