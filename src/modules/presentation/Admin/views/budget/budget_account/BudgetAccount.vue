<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed, onMounted, reactive } from "vue";
import { useI18n } from "vue-i18n";
import type { BudgetAccountInterface } from "@/modules/interfaces/budget/budget-account.interface";
import { formatDate } from "@/modules/shared/formatdate";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useBudgetAccountStore } from "@/modules/presentation/Admin/stores/budget/bud-get-account.store";
import { columns } from "./column";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import FormBudgetAccount from "@/modules/presentation/Admin/components/budget/FormBudgetAccount.vue";

const { t } = useI18n();
const budgetAccountStore = useBudgetAccountStore();
const { success, error } = useNotification();

// State
const budgetAccounts = ref<BudgetAccountInterface[]>([]);
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
const selectedBudgetAccount = ref<BudgetAccountInterface | null>(null);
const isEditMode = ref<boolean>(false);
const budgetAccountFormRef = ref();

// Table pagination
const tablePagination = computed(() => ({
  current: pagination.current,
  pageSize: pagination.pageSize,
  total: pagination.total,
  showSizeChanger: true,
}));

const loadBudgetAccounts = async (
  page: number = pagination.current,
  pageSize: number = pagination.pageSize,
  search: string = searchKeyword.value,
  sortBy?: string
) => {
  loading.value = true;

  try {
    const result = await budgetAccountStore.fetchBudgetAccounts({
      page,
      limit: pageSize,
      search,
      sortBy,
    });
    budgetAccounts.value = result.data;
    pagination.current = result.page;
    pagination.pageSize = result.limit;
    pagination.total = result.total;
    pagination.totalPages = result.totalPages;
  } catch (err) {
    console.error("Error loading budget accounts:", err);
    error(t("budget_accounts.error.loadFailed"));
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
    sortBy = `${sorter.field}${sorter.order === "ascend" ? "" : ":desc"}`;
  }

  loadBudgetAccounts(page, pageSize, searchKeyword.value, sortBy);
};

const handleSearch = () => {
  pagination.current = 1;
  loadBudgetAccounts(1, pagination.pageSize, searchKeyword.value);
};

// Modal handlers
const showCreateModal = () => {
  selectedBudgetAccount.value = null;
  isEditMode.value = false;
  modalVisible.value = true;
};

const showEditModal = (budgetAccount: BudgetAccountInterface) => {
  selectedBudgetAccount.value = { ...budgetAccount };
  isEditMode.value = true;
  modalVisible.value = true;
};

const showDeleteModal = (budgetAccount: BudgetAccountInterface) => {
  selectedBudgetAccount.value = budgetAccount;
  deleteModalVisible.value = true;
};

const handleModalOk = () => {
  budgetAccountFormRef.value?.submitForm();
};

const handleModalCancel = () => {
  modalVisible.value = false;
};

const handleFormSubmit = async (formData: {
  name: string;
  fiscal_year: number;
  allocated_amount: number;
  departmentId: number;
}) => {
  try {
    submitLoading.value = true;

    if (isEditMode.value && selectedBudgetAccount.value) {
      const updateData = {
        id: selectedBudgetAccount.value.id,
        name: formData.name,
        fiscal_year: formData.fiscal_year,
        allocated_amount: formData.allocated_amount,
        department_id: formData.departmentId,
      };
      await budgetAccountStore.updateBudgetAccount(
        String(selectedBudgetAccount.value.id),
        updateData
      );
      success(t("budget_accounts.success.title"), t("budget_accounts.success.updated"));
    } else {
      await budgetAccountStore.createBudgetAccount(formData);
      success(t("budget_accounts.success.title"), t("budget_accounts.success.created"));
    }

    modalVisible.value = false;
    await loadBudgetAccounts();
  } catch (err) {
    console.error("Error saving budget account:", err);
    error(t("budget_accounts.error.saveFailed"));
  } finally {
    submitLoading.value = false;
  }
};

const handleDeleteConfirm = async () => {
  if (!selectedBudgetAccount.value) return;

  try {
    submitLoading.value = true;
    await budgetAccountStore.deleteBudgetAccount(String(selectedBudgetAccount.value.id));
    success(t("budget_accounts.success.title"), t("budget_accounts.success.deleted"));
    deleteModalVisible.value = false;
    await loadBudgetAccounts();
  } catch (err) {
    console.error("Error deleting budget account:", err);
    error(t("budget_accounts.error.deleteFailed"));
  } finally {
    submitLoading.value = false;
  }
};

onMounted(async () => {
  await Promise.all([loadBudgetAccounts()]);
});
</script>

<template>
  <div class="budget-account-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ t("budget_accounts.list.title") }}</h1>
      </div>

      <div class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit">
        <UiInput
          v-model="searchKeyword"
          :placeholder="t('budget_accounts.list.search')"
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
          {{ t("budget_accounts.list.add") }}
        </UiButton>
      </div>
    </div>

    <!-- Budget Accounts Table -->
    <Table
      :columns="columns(t)"
      :dataSource="budgetAccounts"
      :pagination="tablePagination"
      :loading="loading"
      row-key="id"
      @change="handleTableChange"
    >
      <template #department="{ record }">
        <span v-if="record.department && record.department.name">
          {{ record.department.name }}
        </span>
        <span v-else-if="typeof record.getDepartment === 'function' && record.getDepartment()">
          {{ record.getDepartment().name }}
        </span>
        <span v-else>-</span>
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

    <!-- Create/Edit Budget Account Modal -->
    <UiModal
      :title="isEditMode ? t('budget_accounts.modal.editTitle') : t('budget_accounts.modal.title')"
      :visible="modalVisible"
      :confirm-loading="submitLoading"
      @update:visible="modalVisible = $event"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :okText="isEditMode ? t('button.edit') : t('button.save')"
      :cancelText="t('button.cancel')"
    >
      <FormBudgetAccount
        ref="budgetAccountFormRef"
        :budget-account="selectedBudgetAccount"
        :is-edit-mode="isEditMode"
        :loading="submitLoading"
        @submit="handleFormSubmit"
      />
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('budget_accounts.modal.deleteTitle')"
      :visible="deleteModalVisible"
      :confirm-loading="submitLoading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDeleteConfirm"
      @cancel="deleteModalVisible = false"
      ok-text="ຢືນຢັນ"
      ok-type="primary"
      :danger="true"
    >
      <p>{{ $t("budget_accounts.modal.deleteMessage", { name: selectedBudgetAccount?.name }) }}</p>
      <p class="text-red-500">{{ $t("budget_accounts.modal.deleteWarning") }}</p>
    </UiModal>
  </div>
</template>

<style scoped>
.budget-account-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
