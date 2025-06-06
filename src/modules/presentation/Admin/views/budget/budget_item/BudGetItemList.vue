<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import { ref, computed, onMounted, reactive } from "vue";
import { useI18n } from "vue-i18n";
import type { BudgetItemInterface } from "@/modules/interfaces/budget/budget-item.interface";
import { formatDate } from "@/modules/shared/formatdate";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useBudgetItemStore } from "@/modules/presentation/Admin/stores/budget/budger-item.store";
import { useBudgetAccountStore } from "@/modules/presentation/Admin/stores/budget/bud-get-account.store";
import { columns } from "./column";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import FormBudgetItem from "@/modules/presentation/Admin/components/budget/FormBudgetItem.vue";

const { t } = useI18n();
const budgetItemStore = useBudgetItemStore();
const budgetAccountStore = useBudgetAccountStore();
const { success, error } = useNotification();

// Props for filtered view
const props = defineProps<{
  budgetAccountId?: string; // Optional: when provided, only shows items for this budget account
}>();

// State
const budgetItems = ref<BudgetItemInterface[]>([]);
const budgetAccounts = ref<Map<string, string>>(new Map());
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
const selectedBudgetItem = ref<BudgetItemInterface | null>(null);
const isEditMode = ref<boolean>(false);
const budgetItemFormRef = ref();

// Table pagination
const tablePagination = computed(() => ({
  current: pagination.current,
  pageSize: pagination.pageSize,
  total: pagination.total,
  showSizeChanger: true,
}));

// Title based on whether we're filtering by account
const pageTitle = computed(() => {
  if (props.budgetAccountId) {
    const accountName = budgetAccounts.value.get(props.budgetAccountId) || "";
    return `${t('budget_items.list.titleForAccount')} - ${accountName}`;
  }
  return t('budget_items.list.title');
});

onMounted(async () => {
  await Promise.all([loadBudgetAccounts(), loadBudgetItems()]);
});

const loadBudgetAccounts = async () => {
  try {
    const result = await budgetAccountStore.fetchBudgetAccounts({
      page: 1,
      limit: 100,
    });

    // Create a map of budget account IDs to names for quick lookup
    budgetAccounts.value = new Map(
      result.data.map(account => [
        account.id,
        `${account.code} - ${account.name}`
      ])
    );
  } catch (err) {
    console.error("Error loading budget accounts:", err);
    error(t("budget_items.error.loadBudgetAccountsFailed"));
  }
};

const loadBudgetItems = async (
  page: number = pagination.current,
  pageSize: number = pagination.pageSize,
  search: string = searchKeyword.value
) => {
  loading.value = true;

  try {
    let result;

    // If budgetAccountId is provided, only fetch items for that account
    if (props.budgetAccountId) {
      result = await budgetItemStore.fetchBudgetItemsByAccountId(
        props.budgetAccountId,
        { page, limit: pageSize, search }
      );
    } else {
      result = await budgetItemStore.fetchBudgetItems({
        page,
        limit: pageSize,
        search,
      });
    }

    budgetItems.value = result.data;
    pagination.current = result.page;
    pagination.pageSize = result.limit;
    pagination.total = result.total;
    pagination.totalPages = result.totalPages;
  } catch (err) {
    console.error("Error loading budget items:", err);
    error(t("budget_items.error.loadFailed"));
  } finally {
    loading.value = false;
  }
};

// Handle pagination and sorting
const handleTableChange = (
  paginationInfo: TablePaginationType,
  _filters: Record<string, string[]>,
  _sorter: any
) => {
  const page = paginationInfo.current || 1;
  const pageSize = paginationInfo.pageSize || 10;

  pagination.current = page;
  pagination.pageSize = pageSize;

  loadBudgetItems(page, pageSize, searchKeyword.value);
};

const handleSearch = () => {
  pagination.current = 1;
  loadBudgetItems(1, pagination.pageSize, searchKeyword.value);
};

// Modal handlers
const showCreateModal = () => {
  selectedBudgetItem.value = null;
  isEditMode.value = false;
  modalVisible.value = true;
};

const showEditModal = (budgetItem: BudgetItemInterface) => {
  selectedBudgetItem.value = { ...budgetItem };
  isEditMode.value = true;
  modalVisible.value = true;
};

const showDeleteModal = (budgetItem: BudgetItemInterface) => {
  selectedBudgetItem.value = budgetItem;
  deleteModalVisible.value = true;
};

const handleModalOk = () => {
  budgetItemFormRef.value?.submitForm();
};

const handleModalCancel = () => {
  modalVisible.value = false;
};

const handleFormSubmit = async (formData: {
  budget_account_id: string;
  name: string;
  allocated_amount: string;
}) => {
  try {
    submitLoading.value = true;

    if (isEditMode.value && selectedBudgetItem.value) {
      const updateData = {
        id: selectedBudgetItem.value.id,
        ...formData
      };
      await budgetItemStore.updateBudgetItem(selectedBudgetItem.value.id, updateData);
      success(t("budget_items.success.title"), t("budget_items.success.updated"));
    } else {
      await budgetItemStore.createBudgetItem(formData);
      success(t("budget_items.success.title"), t("budget_items.success.created"));
    }

    modalVisible.value = false;
    await loadBudgetItems();
  } catch (err) {
    console.error("Error saving budget item:", err);
    error(t("budget_items.error.saveFailed"));
  } finally {
    submitLoading.value = false;
  }
};

const handleDeleteConfirm = async () => {
  if (!selectedBudgetItem.value) return;

  try {
    submitLoading.value = true;
    await budgetItemStore.deleteBudgetItem(selectedBudgetItem.value.id);
    success(t("budget_items.success.title"), t("budget_items.success.deleted"));
    deleteModalVisible.value = false;
    await loadBudgetItems();
  } catch (err) {
    console.error("Error deleting budget item:", err);
    error(t("budget_items.error.deleteFailed"));
  } finally {
    submitLoading.value = false;
  }
};
</script>

<template>
  <div class="budget-item-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ pageTitle }}</h1>
      </div>

      <div class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit">
        <UiInput
          v-model="searchKeyword"
          :placeholder="t('budget_items.placeholder.search')"
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
          {{ t("budget_items.add") }}
        </UiButton>
      </div>
    </div>

    <!-- Budget Items Table -->
    <Table
      :columns="columns(t)"
      :dataSource="budgetItems"
      :pagination="tablePagination"
      :loading="loading"
      row-key="id"
      @change="handleTableChange"
    >
      <!-- Budget Account Column -->
      <template #budget_account="{ record }">
        {{ budgetAccounts.get(record.budget_account_id) || record.budget_account_id }}
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

    <!-- Create/Edit Budget Item Modal -->
    <UiModal
      :title="isEditMode ? t('budget_items.header_form.edit') : t('budget_items.header_form.add')"
      :visible="modalVisible"
      :confirm-loading="submitLoading"
      @update:visible="modalVisible = $event"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :okText="isEditMode ? t('button.edit') : t('button.save')"
      :cancelText="t('button.cancel')"
    >
      <FormBudgetItem
        ref="budgetItemFormRef"
        :budget-item="selectedBudgetItem"
        :is-edit-mode="isEditMode"
        :loading="submitLoading"
        :preselected-budget-account-id="props.budgetAccountId"
        @submit="handleFormSubmit"
      />
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('budget_items.alert.confirm')"
      :visible="deleteModalVisible"
      :confirm-loading="submitLoading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDeleteConfirm"
      @cancel="deleteModalVisible = false"
      ok-text="ຢືນຢັນ"
      ok-type="primary"
      :danger="true"
    >
      <p>{{ $t("budget_items.alert.message") }} "{{ selectedBudgetItem?.name }}"?</p>
      <p class="text-red-500">{{ $t("budget_items.alert.remark") }}</p>
    </UiModal>
  </div>
</template>

<style scoped>
.budget-item-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
