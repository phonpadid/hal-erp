<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { BudgetAccountInterface } from "@/modules/interfaces/budget/budget-account.interface";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useBudgetAccountStore } from "@/modules/presentation/Admin/stores/budget/bud-get-account.store";
import { columns } from "./column";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import FormBudgetAccount from "@/modules/presentation/Admin/components/budget/FormBudgetAccount.vue";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import { departmentStore } from "@/modules/presentation/Admin/stores/departments/department.store";
// import UiInputSelect from "@/common/shared/components/Input/InputSelect.vue";
import { useRouter, useRoute } from "vue-router";
import { formatPrice } from "@/modules/shared/utils/format-price";
import { usePermissions } from "@/modules/shared/utils/usePermissions";

const { hasPermission } = usePermissions();
const { push } = useRouter();
const route = useRoute();
const departStore = departmentStore();

// check show button permission
const canCreateBudgetAccount = computed(() => hasPermission('create-budget-account'));
const canEditBudgetAccount = computed(() => hasPermission('update-budget-account'));
const canDeleteBudgetAccount = computed(() => hasPermission('delete-budget-account'));

const { t } = useI18n();
const budgetAccountStore = useBudgetAccountStore();
const { success, error } = useNotification();

// State
const loading = ref<boolean>(false);
const searchKeyword = ref<string>("");

// Modal state
const modalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const submitLoading = ref<boolean>(false);
const selectedBudgetAccount = ref<BudgetAccountInterface | null>(null);
const isEditMode = ref<boolean>(false);
const budgetAccountFormRef = ref();

// Table pagination
const tablePagination = computed(() => ({
  current: budgetAccountStore.pagination.page,
  pageSize: budgetAccountStore.pagination.limit,
  total: budgetAccountStore.pagination.total,
  showSizeChanger: true,
}));

const loadBudgetAccounts = async () => {
  loading.value = true;

  // ดึงค่า ID จาก URL
  const budgetId = route.params.id ? Number(route.params.id) : undefined;

  try {
    await budgetAccountStore.fetchBudgetAccounts(
      {
        page: budgetAccountStore.pagination.page,
        limit: budgetAccountStore.pagination.limit,
        search: searchKeyword.value,
      },
      budgetId
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("budget_accounts.error.loadFailed"), String(errorMessage));
  } finally {
    loading.value = false;
  }
};

// Handle pagination and sorting
const handleTableChange = (pagination: TablePaginationType) => {
  budgetAccountStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total ?? 0,
  });

  loadBudgetAccounts();
};

const addBudgetItem = (record: any) => {
  // console.log("Viewing details for document:", record);
  push({ name: "budget-accounts-id-add", params: { id: record.id } });
};

const handleSearch = async () => {
  await budgetAccountStore.fetchBudgetAccounts({
    page: 1,
    limit: budgetAccountStore.pagination.limit,
    search: searchKeyword.value,
    // departmentId: departmentId.value,
  });
};

watch(searchKeyword, async (newVal: string) => {
  if (newVal === "") {
    budgetAccountStore.setPagination({
      page: 1,
      limit: budgetAccountStore.pagination.limit,
      total: budgetAccountStore.pagination.total,
    });
    await loadBudgetAccounts();
  }
});

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
  type: string
}) => {
  try {
    submitLoading.value = true;

    if (isEditMode.value&& selectedBudgetAccount.value) {
      const updateData = {
        id: selectedBudgetAccount.value.id,
        name: formData.name,
        fiscal_year: formData.fiscal_year,
        allocated_amount: formData.allocated_amount,
        departmentId: formData.departmentId,
        type: formData.type,
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

// const departmentId = ref<number | null>(null);
// const departmentOptions = computed(() =>
//   departStore.departments.map((dept: any) => ({
//     label: dept.name,
//     value: dept.id,
//   }))
// );

const loadDepartments = async () => {
  try {
    await departStore.fetchDepartment({
      page: 1,
      limit: 100,
    });
  } catch (err) {
    console.error("Failed to load departments:", err);
    throw err;
  }
};
const increaseBudgetView = () => {
  push({ name: "increase_budget", params: {} });
};
onMounted(async () => {
  await Promise.all([loadBudgetAccounts(), loadDepartments()]);
});
</script>

<template>
  <div class="budget-account-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ t("budget_accounts.list.title") }}</h1>
      </div>

      <div class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit">
        <InputSearch
          v-model:value="searchKeyword"
          @keyup.enter="handleSearch"
          :placeholder="t('budget_accounts.placeholder.search')"
        />
        <!-- <UiInputSelect
          v-model:modelValue="departmentId"
          :options="departmentOptions"
          :placeholder="$t('budget_accounts.form.departmentPlaceholder')"
          :disabled="loading"
          @change="handleSearch"
        /> -->
        <UiButton
          
          icon="ant-design:plus-outlined"
          @click="increaseBudgetView"
          colorClass="hover:text-white flex items-center"
        >
          {{ t("budget_accounts.button.add") }}
        </UiButton>
        <UiButton
          v-if="canCreateBudgetAccount"
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
      :dataSource="budgetAccountStore.budgetAccounts"
      :pagination="tablePagination"
      :loading="loading"
      row-key="id"
      @change="handleTableChange"
    >
      <template #department="{ record }">
        <span>{{ record.getDepartment()?.name }}</span>
      </template>
      <template #allocated_amount="{ record }">
        <span class="text-orange-600">{{ formatPrice(record?.allocated_amount) }}</span>
      </template>
      <template #balance_amount="{ record }">
        <span class="text-blue-600">{{ record.balance_amount }}</span>
      </template>
      <template #used_amount="{ record }">
        <span class="text-red-600">{{ record.used_amount }}</span>
      </template>
      <template #total_budget="{ record }">
        <span class="text-red-600">{{ record.total_budget }}</span>
      </template>
      <!-- Actions column -->
      <template #actions="{ record }">
  <div class="flex items-center justify-center gap-2">
    <UiButton
      v-if="canCreateBudgetAccount"
      icon="material-symbols:add-box-outline"
      size="small"
      shape="circle"
      @click="addBudgetItem(record)"
      colorClass="text-blue-600 flex items-center justify-center"
    />
    <UiButton
      v-if="canEditBudgetAccount"
      icon="ant-design:edit-outlined"
      size="small"
      shape="circle" 
      @click="showEditModal(record)"
      colorClass="text-orange-400 flex items-center justify-center"
    />
    <UiButton
      v-if="canDeleteBudgetAccount"
      danger
      icon="ant-design:delete-outlined"
      colorClass="text-red-700 flex items-center justify-center"
      size="small"
      shape="circle" 
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
