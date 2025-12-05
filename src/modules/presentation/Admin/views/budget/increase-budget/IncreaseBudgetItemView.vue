<script setup lang="ts">
import UiButton from '@/common/shared/components/button/UiButton.vue';
import { useI18n } from 'vue-i18n';
import Table, { type TablePaginationType } from '@/common/shared/components/table/Table.vue';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useNotification } from '@/modules/shared/utils/useNotification';
import { formatPrice } from '@/modules/shared/utils/format-price';
import UiModal from '@/common/shared/components/Modal/UiModal.vue';
import { useIncreaseBudgetItemStore } from '../../../stores/budget/increase/increase-budget-item.store';
import { itemColumns } from './item-column';
import CreateItemModal from '../../../components/budget/increase/CreateItemModal.vue';
import type { IncreaseBudgetAccountDetailCreateDTO, IncreaseBudgetAccountDetailUpdateDTO } from '@/modules/application/dtos/budget/increase-budget/increase-detail.dto';

const { t } = useI18n();
const increaseItemStore = useIncreaseBudgetItemStore();
const { params } = useRoute();
const id = params.id as string;

const { success, error } = useNotification();

// State
const loading = ref<boolean>(false);
const searchKeyword = ref<string>("");
const selectedRecord = ref<IncreaseBudgetAccountDetailCreateDTO | null>(null);

// Modal state
const createModalVisible = ref<boolean>(false); // Added create modal state
const editModalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const submitLoading = ref<boolean>(false);
const selectedData = ref<string | null>(null);

// Add openCreateModal function
const openCreateModal = (): void => {
  selectedRecord.value = null;
  selectedData.value = id;
  createModalVisible.value = true;
};

const showEditModal = (record: IncreaseBudgetAccountDetailUpdateDTO): void => {
  selectedRecord.value = record;
  selectedData.value = id
  editModalVisible.value = true;
};

const showDeleteModal = (id: number): void => {
  selectedData.value = id.toString();
  deleteModalVisible.value = true;
};

// Table pagination
const tablePagination = computed(() => ({
  current: increaseItemStore.pagination.page,
  pageSize: increaseItemStore.pagination.limit,
  total: increaseItemStore.pagination.total,
  showSizeChanger: true,
}));

const loadIncreaseBudget = async () => {
  loading.value = true;

  try {
    await increaseItemStore.fetchAll(id, {
      page: increaseItemStore.pagination.page,
      limit: increaseItemStore.pagination.limit,
      search: searchKeyword.value,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("budget_accounts.error.loadFailed"), String(errorMessage));
  } finally {
    loading.value = false;
  }
};

// Handle pagination and sorting
const handleTableChange = (pagination: TablePaginationType) => {
  increaseItemStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total ?? 0,
  });

  loadIncreaseBudget();
};

watch(searchKeyword, async (newVal: string) => {
  if (newVal === '') {
    increaseItemStore.setPagination({
      page: 1,
      limit: increaseItemStore.pagination.limit,
      total: increaseItemStore.pagination.total,
    });
    await loadIncreaseBudget();
  }
});

const handleDeleteConfirm = async () => {
  try {
    submitLoading.value = true;
    await increaseItemStore.deleted(String(selectedData.value));
    success(t("budget_accounts.success.title"), t("budget_accounts.success.deleted"));
    deleteModalVisible.value = false;
    await loadIncreaseBudget();
  } catch (err) {
    console.error("Error deleting budget account:", err);
    error(t("budget_accounts.error.deleteFailed"));
  } finally {
    submitLoading.value = false;
  }
};

const handleFormSuccess = async (): Promise<void> => {
  await loadIncreaseBudget();
  selectedRecord.value = null;
};

onMounted(async () => {
  await Promise.all([loadIncreaseBudget()]);
});
</script>

<template>
  <div class="container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ $t("increase-budget.title") }}</h1>
      </div>

      <div class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit">
        <!-- <UiButton
          type="primary"
          icon="ant-design:plus-outlined"
          colorClass="text-white flex items-center"
          @click="openCreateModal"
        >
          {{ $t("budget_accounts.list.add") }}
        </UiButton> -->
      </div>
    </div>

    <Table
      :columns="itemColumns(t)"
      :dataSource="increaseItemStore.increase_budget_item"
      :pagination="tablePagination"
      :loading="loading"
      row-key="id"
      @change="handleTableChange"
    >
      <template #id="{ index }">
        {{ index + 1 }}
      </template>
      <template #allocated_amount="{ record }">
        {{ formatPrice(record.allocated_amount) }}
      </template>
      <template #actions="{ record }">
        <div class="flex items-center justify-center gap-2">
          <!-- <UiButton
            type=""
            icon="ant-design:edit-outlined"
            size="small"
            @click="showEditModal(record)"
            colorClass="flex items-center justify-center text-orange-400"
            :disabled="!!record.deleted_at"
          /> -->
          <UiButton
            type=""
            danger
            icon="ant-design:delete-outlined"
            colorClass="flex items-center justify-center text-red-700"
            size="small"
            @click="showDeleteModal(record.id)"
          />
        </div>
      </template>
    </Table>

    <!-- Create/Edit Modal -->
    <CreateItemModal
      v-model:visible="createModalVisible"
      :loading="loading"
      :isEdit="false"
      :itemid="String(selectedData)"
      @success="handleFormSuccess"
    />

    <CreateItemModal
      v-model:visible="editModalVisible"
      :loading="loading"
      :isEdit="true"
      :editData="selectedRecord"
      :itemid="String(selectedData)"
      @success="handleFormSuccess"
    />

    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('departments.alert.confirm')"
      :visible="deleteModalVisible"
      :confirm-loading="submitLoading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDeleteConfirm"
      @cancel="deleteModalVisible = false"
      :okText="t('button.ok')"
      :cancelText="t('button.cancel')"
      okType="primary"
    >
      <p>{{ $t("departments.alert.message") }}: ""?</p>
      <p class="text-red-500">
        {{ t("departments.alert.remark") }}
      </p>
    </UiModal>
  </div>
</template>

<style scoped>
.container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.report {
  background: rgba(43, 41, 41, 0.031);
  padding: 20px;
  border-radius: 2px;
  margin-bottom: 4px;
  border: 1px solid #e0e6ed81;
}
</style>
