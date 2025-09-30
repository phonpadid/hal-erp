<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { BudgetItemInterface } from "@/modules/interfaces/budget/budget-item.interface";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useBudgetItemStore } from "../../../stores/budget/budget-item.store";
import { columns } from "./column";
import { formatPrice } from "@/modules/shared/utils/format-price";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import FormBudgetItem from "@/modules/presentation/Admin/components/budget/FormBudgetItem.vue";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import type { PaginationParams } from "@/modules/shared/pagination";

const { t } = useI18n();
const budgetItemStore = useBudgetItemStore();
const { success, error } = useNotification();
// const router = useRouter();

// Props for filtered view
const props = defineProps<{
  budgetAccountId?: string;
}>();

// State
const budgetAccounts = ref<Map<string, string>>(new Map());
const loading = ref<boolean>(false);
const searchKeyword = ref<string>("");
// Modal state
const modalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const submitLoading = ref<boolean>(false);
const selectedBudgetItem = ref<BudgetItemInterface | null>(null);
const isEditMode = ref<boolean>(false);
const budgetItemFormRef = ref();

// Table pagination
const tablePagination = computed(() => ({
  current: budgetItemStore.pagination.page,
  pageSize: budgetItemStore.pagination.limit,
  total: budgetItemStore.pagination.total,
  showSizeChanger: true,
}));

// Title based on whether we're filtering by account
const pageTitle = computed(() => {
  if (props.budgetAccountId) {
    const accountName = budgetAccounts.value.get(props.budgetAccountId) || "";
    return `${t("budget_items.list.titleForAccount")} - ${accountName}`;
  }
  return t("budget_items.list.title");
});

onMounted(async () => {
  await loadBudgetItems();
});

const loadBudgetItems = async () => {
  loading.value = true;

  try {
    const params: PaginationParams = {
      page: budgetItemStore.pagination.page,
      limit: budgetItemStore.pagination.limit,
    };
    if (searchKeyword.value && searchKeyword.value.trim() !== "") {
      params.search = searchKeyword.value.trim();
    }
    if (props.budgetAccountId) {
      const budget_account_id =
        typeof props.budgetAccountId === "string"
          ? Number(props.budgetAccountId)
          : props.budgetAccountId;

      await budgetItemStore.fetchBudgetItems(params, budget_account_id);
    } else {
      await budgetItemStore.fetchBudgetItems(params);
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("budget_items.error.loadFailed"), errorMessage);
  } finally {
    loading.value = false;
  }
};

// Handle pagination and sorting
const handleTableChange = (pagination: TablePaginationType) => {
  budgetItemStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total ?? 0,
  });

  loadBudgetItems();
};

const handleSearch = async () => {
  await budgetItemStore.fetchBudgetItems({
    page: 1,
    limit: budgetItemStore.pagination.limit,
    search: searchKeyword.value,
  });
};

watch(searchKeyword, async (newVal: string) => {
  if (newVal === "") {
    budgetItemStore.setPagination({
      page: 1,
      limit: budgetItemStore.pagination.limit,
      total: budgetItemStore.pagination.total,
    });
    await loadBudgetItems();
  }
});

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
  budget_accountId: number;
  name: string;
  description: string;
}) => {
  try {
    submitLoading.value = true;

    if (isEditMode.value && selectedBudgetItem.value) {
      const updateData = {
        id: selectedBudgetItem.value.id,
        ...formData,
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
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("budget_items.error.deleteFailed"), errorMessage);
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
          {{ t("budget_items.add") }}
        </UiButton>
      </div>
    </div>

    <!-- Budget Items Table -->
    <Table
      :columns="columns(t)"
      :dataSource="budgetItemStore.budgetItems"
      :pagination="tablePagination"
      :loading="loading"
      row-key="id"
      @change="handleTableChange"
    >
      <template #allocated_amount="{ record }">
        <span class="text-lime-500">{{ formatPrice(record.allocated_amount) }}</span>
      </template>
      <template #balance_amount="{ record }">
        <span class="text-blue-600">{{ formatPrice(record.balance_amount) }}</span>
      </template>
      <template #use_amount="{ record }">
        <span class="text-red-600">{{ formatPrice(record.use_amount) }}</span>
      </template>
      <!-- Actions column -->
      <template #actions="{ record }">
        <div class="flex items-center justify-center gap-2">
          <!-- <UiButton
            type=""
            icon="ic:baseline-remove-red-eye"
            size="small"
            @click="showDetails(record)"
            colorClass="flex items-center justify-center text-orange-400"
            :disabled="!!record.deleted_at"
          /> -->
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
