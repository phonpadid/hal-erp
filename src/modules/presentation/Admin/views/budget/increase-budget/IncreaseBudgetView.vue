<script setup lang="ts">
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiInputSelect from "@/common/shared/components/Input/InputSelect.vue";
import { columns } from "./columns";
import { useI18n } from "vue-i18n";
import Table, {
  type TablePaginationType,
} from "@/common/shared/components/table/Table.vue";
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  useIncreaseBudgetStore,
  yearOptions,
} from "../../../stores/budget/increase/increase-budget.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { formatPrice } from "@/modules/shared/utils/format-price";
import type { IncreaseBudgetAccountDTO } from "@/modules/application/dtos/budget/increase-budget/increase-budget.dto";
import UpdateModal from "../../../components/budget/increase/UpdateModal.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
const { t } = useI18n();
const { push } = useRouter();
const increaseStore = useIncreaseBudgetStore();
const { success, error } = useNotification();
// console.log('increaseStore', increaseStore.increase_budget);
const editModalVisible = ref<boolean>(false);
const selectedYear = ref<number>(new Date().getFullYear()); // Default to current year;
// State
const loading = ref<boolean>(false);
const searchKeyword = ref<string>("");
const selectedRecord = ref<IncreaseBudgetAccountDTO | null>(null);
// Modal state
const deleteModalVisible = ref<boolean>(false);
const submitLoading = ref<boolean>(false);
const selectedData = ref<string | null>(null);

const showEditModal = (record: IncreaseBudgetAccountDTO): void => {
  selectedRecord.value = record;
  editModalVisible.value = true;
};
const showDeleteModal = (id: number): void => {
  selectedData.value = id.toString();
  deleteModalVisible.value = true;
};
// Table pagination
const tablePagination = computed(() => ({
  current: increaseStore.pagination.page,
  pageSize: increaseStore.pagination.limit,
  total: increaseStore.pagination.total,
  showSizeChanger: true,
}));

const loadIncreaseBudget = async () => {
  loading.value = true;

  try {
    await increaseStore.fetchAll({
      page: increaseStore.pagination.page,
      limit: increaseStore.pagination.limit,
      search: searchKeyword.value,
      date: selectedYear.value.toString(),
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("budget_accounts.error.loadFailed"), String(errorMessage));
  } finally {
    loading.value = false;
  }
};
watch(selectedYear, async (newYear: number) => {
  if (newYear) {
    increaseStore.setPagination({
      page: 1,
      limit: increaseStore.pagination.limit,
      total: increaseStore.pagination.total,
    });
    await loadIncreaseBudget();
  }
});
// Handle pagination and sorting
const handleTableChange = (pagination: TablePaginationType) => {
  increaseStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total ?? 0,
  });

  loadIncreaseBudget();
};
const increaseBudgetView = (id: number) => {
  push({ name: "increase_budget_item", params: { id } });
};

watch(searchKeyword, async (newVal: string) => {
  if (newVal === "") {
    increaseStore.setPagination({
      page: 1,
      limit: increaseStore.pagination.limit,
      total: increaseStore.pagination.total,
    });
    await loadIncreaseBudget();
  }
});

const handleDeleteConfirm = async () => {
  try {
    submitLoading.value = true;
    await increaseStore.deleted(String(selectedData.value));
    success(
      t("budget_accounts.success.title"),
      t("budget_accounts.success.deleted")
    );
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
        <h1 class="text-2xl font-semibold">
          {{ $t("increase-budget.title") }}
        </h1>
      </div>

      <div
        class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit"
      >
        <!-- <InputSearch
          :placeholder="$t('currency.placeholder.search')"
        /> -->
        <UiInputSelect
          v-model="selectedYear"
          :options="yearOptions"
          :placeholder="$t('increase-budget.select.year')"
          class="min-w-[120px]"
        />
        <UiButton
          type="primary"
          icon="ant-design:plus-outlined"
          colorClass="text-white flex items-center"
          @click="push({ name: 'form_increase_budget' })"
        >
          {{ $t("budget_accounts.list.add") }}
        </UiButton>
      </div>
    </div>
    <Table
      :columns="columns(t)"
      :dataSource="increaseStore.increase_budget"
      :pagination="tablePagination"
      :loading="loading"
      row-key="id"
      @change="handleTableChange"
    >
      <template #allocated_amount="{ record }">
        {{ formatPrice(record.allocated_amount) }}
      </template>
      <template #actions="{ record }">
        <div class="flex items-center justify-center gap-2">
          <UiButton
            type=""
            icon="ant-design:info-circle-outlined"
            size="small"
            @click="increaseBudgetView(record.id)"
            colorClass="flex items-center justify-center text-red-400"
            :disabled="!!record.deleted_at"
          />
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
            @click="showDeleteModal(record.id)"
          />
        </div>
      </template>
    </Table>

    <!-- edit modal -->

    <!-- Edit Modal -->
    <UpdateModal
      v-model:visible="editModalVisible"
      :loading="loading"
      :isEdit="true"
      :editData="selectedRecord"
      @success="handleFormSuccess"
    />

    <UiModal
      :title="t('departments.alert.confirm')"
      :visible="deleteModalVisible"
      :confirm-loading="loading"
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
</style>
