<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import { ref, computed, onMounted, reactive } from "vue";
import { useI18n } from "vue-i18n";
import type { BudgetItemDetailsInterface } from "@/modules/interfaces/budget/budget-item-details.interface";
import { formatDate } from "@/modules/shared/formatdate";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useBudgetItemDetailsStore } from "@/modules/presentation/Admin/stores/budget/budget-item-details.store";
import { columns } from "./column";
import { useRoute } from "vue-router";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import FormBudgetItemDetails from "@/modules/presentation/Admin/components/budget/FormBudgetItemDetails.vue";

const { t } = useI18n();
const budgetItemDetailsStore = useBudgetItemDetailsStore();
const { success, error } = useNotification();
const route = useRoute();

// Props for filtered view
const props = defineProps<{
  budgetItemId?: string; // Optional: when provided, only shows details for this budget item
}>();

// State
const budgetItemDetails = ref<BudgetItemDetailsInterface[]>([]);
const budgetItems = ref<Map<string, string>>(new Map());
const provinces = ref<Map<string, string>>(new Map());
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
const selectedBudgetItemDetail = ref<BudgetItemDetailsInterface | null>(null);
const isEditMode = ref<boolean>(false);
const budgetItemDetailFormRef = ref();

// Table pagination
const tablePagination = computed(() => ({
  current: pagination.current,
  pageSize: pagination.pageSize,
  total: pagination.total,
  showSizeChanger: true,
}));

// Title based on whether we're filtering by budget item
const pageTitle = computed(() => {
  if (props.budgetItemId) {
    const itemName = budgetItems.value.get(props.budgetItemId) || "";
    return `${t("budget_item_details.list.titleForItem")} - ${itemName}`;
  }
  return t("budget_item_details.list.title");
});

onMounted(async () => {
  await Promise.all([loadBudgetItemDetails()]);
});

const loadBudgetItemDetails = async (
  page: number = pagination.current,
  pageSize: number = pagination.pageSize,
  search: string = searchKeyword.value
) => {
  loading.value = true;

  try {
    let result;
    const budgetItemId = route.params.id as string;

    if (budgetItemId) {
      console.log("Fetching details for budget item ID:", budgetItemId);
      result = await budgetItemDetailsStore.fetchBudgetItemDetailsByItemId(budgetItemId, {
        page,
        limit: pageSize,
        search,
      });
    } else {
      result = await budgetItemDetailsStore.fetchBudgetItemDetails({
        page,
        limit: pageSize,
        search,
      });
    }

    // Log data for debugging
    console.log("Raw API response:", result);

    // Transform data if needed
    budgetItemDetails.value = result.data.map((item) => ({
      ...item,
      id: item.id.toString(),
      budget_item_id: item.budget_item_id.toString(),
      province_id: item.province_id.toString(),
      allocated_amount: item.allocated_amount.toString(),

      province: item.province,
    }));

    console.log("Transformed budget item details:", budgetItemDetails.value);

    pagination.current = result.page;
    pagination.pageSize = result.limit;
    pagination.total = result.total;
    pagination.totalPages = result.totalPages;
  } catch (err) {
    console.error("Error loading budget item details:", err);
    error(t("budget_item_details.error.loadFailed"));
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

  loadBudgetItemDetails(page, pageSize, searchKeyword.value);
};

const handleSearch = () => {
  pagination.current = 1;
  loadBudgetItemDetails(1, pagination.pageSize, searchKeyword.value);
};

// Modal handlers
const showCreateModal = () => {
  selectedBudgetItemDetail.value = null;
  isEditMode.value = false;
  modalVisible.value = true;
};

const showEditModal = (budgetItemDetail: BudgetItemDetailsInterface) => {
  selectedBudgetItemDetail.value = { ...budgetItemDetail };
  isEditMode.value = true;
  modalVisible.value = true;
};

const showDeleteModal = (budgetItemDetail: BudgetItemDetailsInterface) => {
  selectedBudgetItemDetail.value = budgetItemDetail;
  deleteModalVisible.value = true;
};

const handleModalOk = () => {
  budgetItemDetailFormRef.value?.submitForm();
};

const handleModalCancel = () => {
  modalVisible.value = false;
};

const handleFormSubmit = async (formData: {
  // budget_item_id: string;
  name: string;
  provinceId: number;
  description: string;
  allocated_amount: number;
}) => {
  try {
    submitLoading.value = true;

    if (isEditMode.value && selectedBudgetItemDetail.value) {
      const updateData = {
        id: selectedBudgetItemDetail.value.id,
        // budget_item_id: formData.budget_item_id,
        name: formData.name,
        province_id: formData.provinceId.toString(),
        description: formData.description,
        allocated_amount: formData.allocated_amount.toString(),
      };
      await budgetItemDetailsStore.updateBudgetItemDetail(
        selectedBudgetItemDetail.value.id,
        updateData
      );
      success(t("budget_item_details.success.title"), t("budget_item_details.success.updated"));
    } else {
      const createData = {
        // budget_item_id: formData.budget_item_id, 
        name: formData.name,
        province_id: formData.provinceId.toString(),
        description: formData.description,
        allocated_amount: formData.allocated_amount.toString(),
      };
      await budgetItemDetailsStore.createBudgetItemDetail(createData);
      success(t("budget_item_details.success.title"), t("budget_item_details.success.created"));
    }

    modalVisible.value = false;
    await loadBudgetItemDetails();
  } catch (err) {
    console.error("Error saving budget item detail:", err);
    error(t("budget_item_details.error.saveFailed"));
  } finally {
    submitLoading.value = false;
  }
};
const handleDeleteConfirm = async () => {
  if (!selectedBudgetItemDetail.value) return;

  try {
    submitLoading.value = true;
    await budgetItemDetailsStore.deleteBudgetItemDetail(selectedBudgetItemDetail.value.id);
    success(t("budget_item_details.success.title"), t("budget_item_details.success.deleted"));
    deleteModalVisible.value = false;
    await loadBudgetItemDetails();
  } catch (err) {
    console.error("Error deleting budget item detail:", err);
    error(t("budget_item_details.error.deleteFailed"));
  } finally {
    submitLoading.value = false;
  }
};
const getProvinceName = (record: BudgetItemDetailsInterface): string => {
  if (record.province && record.province.name) {
    return record.province.name;
  }
  return record.province_id.toString();
};
</script>

<template>
  <div class="budget-item-details-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ pageTitle }}</h1>
      </div>

      <div class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit">
        <UiInput
          v-model="searchKeyword"
          :placeholder="t('budget_item_details.placeholder.search')"
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
          {{ t("budget_item_details.add") }}
        </UiButton>
      </div>
    </div>

    <!-- Budget Item Details Table -->
    <Table
      :columns="columns(t)"
      :dataSource="budgetItemDetails"
      :pagination="tablePagination"
      :loading="loading"
      row-key="id"
      @change="handleTableChange"
    >
      <!-- Budget Item Column -->
      <template #budget_item="{ record }">
        {{ budgetItems.get(record.budget_item_id) || record.budget_item_id }}
      </template>

      <!-- Province Column -->

      <template #province="{ record }">
        {{ record.province?.name }}
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

    <!-- Create/Edit Budget Item Detail Modal -->
    <UiModal
      :title="
        isEditMode
          ? t('budget_item_details.header_form.edit')
          : t('budget_item_details.header_form.add')
      "
      :visible="modalVisible"
      :confirm-loading="submitLoading"
      @update:visible="modalVisible = $event"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :okText="isEditMode ? t('button.edit') : t('button.save')"
      :cancelText="t('button.cancel')"
    >
      <FormBudgetItemDetails
        ref="budgetItemDetailFormRef"
        :budget-item-details="selectedBudgetItemDetail"
        :is-edit-mode="isEditMode"
        :loading="submitLoading"
        :preselected-budget-item-id="props.budgetItemId"
        @submit="handleFormSubmit"
      />
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('budget_item_details.alert.confirm')"
      :visible="deleteModalVisible"
      :confirm-loading="submitLoading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDeleteConfirm"
      @cancel="deleteModalVisible = false"
      ok-text="ຢືນຢັນ"
      ok-type="primary"
      :danger="true"
    >
      <p>{{ $t("budget_item_details.alert.message") }} "{{ selectedBudgetItemDetail?.name }}"?</p>
      <p class="text-red-500">{{ $t("budget_item_details.alert.remark") }}</p>
    </UiModal>
  </div>
</template>

<style scoped>
.budget-item-details-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
