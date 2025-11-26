<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { column } from "../column";
import { useQuotaStore } from "@/modules/presentation/Admin/stores/quotas/quota.store";
import { useVendorStore } from "@/modules/presentation/Admin/stores/vendors/vendor.store";
import type { QuotaApiModel } from "@/modules/interfaces/quotas/quota.interface";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { formatDates } from "@/modules/shared/formatdate";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import Table, { type TablePaginationType } from "@/common/shared/components/table/Table.vue";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import QuotaFormModal from "../../../components/quotas/quota-form/QuotaFormModal.vue";
import { Icon } from "@iconify/vue";

const { t } = useI18n();
const quotaStore = useQuotaStore();
const vendorStore = useVendorStore();
const { success, error } = useNotification();

// State
const loading = ref<boolean>(false);
const createModalVisible = ref<boolean>(false);
const editModalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const selectedQuota = ref<QuotaApiModel | any | null>(null);

// Search and filter state
const search = ref<string>("");
const year = ref<string>("");
const vendor_id = ref<number | undefined>(undefined);
const pageSize = ref<number>(10);
const sortBy = ref<string>("id");
const sortOrder = ref<string>("desc");

const tablePagination = computed(() => {
  const pagination = {
    current: quotaStore.pagination.page,
    pageSize: quotaStore.pagination.limit,
    total: quotaStore.pagination.total,
    showSizeChanger: true,
  };

  return pagination;
});

// Load data on component mount
onMounted(async () => {
  // Load vendors for filter dropdown
  await vendorStore.fetchVendors({ page: 1, limit: 1000 });
  await loadQuotas();
});

const loadQuotas = async (resetPage = false): Promise<void> => {
  try {
    loading.value = true;

    // Reset page to 1 if requested, otherwise use store page
    if (resetPage) {
      quotaStore.setPagination({
        page: 1,
        limit: quotaStore.pagination.limit,
        total: quotaStore.pagination.total,
      });
    }

    await quotaStore.fetchQuotas({
      page: quotaStore.pagination.page,
      limit: quotaStore.pagination.limit,
      search: search.value,
      year: year.value || undefined,
      vendor_id: vendor_id.value,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("quota.error.title"), String(errorMessage));
  } finally {
    loading.value = false;
  }
};

// Search and filter handlers
const handleSearch = async () => {
  await loadQuotas(true);
};

const handleFilterChange = async () => {
  await loadQuotas(true);
};

const handleSortChange = async () => {
  await loadQuotas(false);
};

// Watch for filter changes (with debounced search)
let searchTimeout: NodeJS.Timeout;
watch([search, year, vendor_id, pageSize], async () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    await loadQuotas(true);
  }, 300);
});

// Watch for sort changes
watch([sortBy, sortOrder], async () => {
  await handleSortChange();
});

// Pagination and table changes
const handleTableChange = (pagination: TablePaginationType, _filters?: unknown, sorter?: unknown): void => {
  // Update store pagination - UserList.vue pattern
  quotaStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total ?? 0,
  });

  // Update sort if changed
  if (sorter && typeof sorter === 'object' && sorter !== null && 'field' in sorter && 'order' in sorter) {
    const typedSorter = sorter as { field?: string; order?: "ascend" | "descend" | null };
    if (typedSorter.field) {
      sortBy.value = typedSorter.field;
      sortOrder.value = typedSorter.order === "ascend" ? "asc" : "desc";
    }
  }

  // Update local pageSize for UI consistency
  if (pagination.pageSize !== pageSize.value) {
    pageSize.value = pagination.pageSize || 10;
  }

  loadQuotas();
};

// CRUD operations
const showCreateModal = (): void => {
  createModalVisible.value = true;
};

const showEditModal = async (record: QuotaApiModel): Promise<void> => {
  try {
    loading.value = true;
    console.log('Opening edit modal for quota ID:', record.id);

    // Fetch complete quota data by ID
    const quotaDetails = await quotaStore.fetchQuotaById(record.id.toString());

    if (quotaDetails) {
      selectedQuota.value = quotaDetails;
      console.log('Fetched quota details:', quotaDetails);
      editModalVisible.value = true;
    } else {
      // Fallback to using record if fetch fails
      console.warn('Failed to fetch quota details, using record data');
      selectedQuota.value = record;
      editModalVisible.value = true;
    }
  } catch (err) {
    console.error('Error in showEditModal:', err);
    error(t("quota.error.title"), String(err));

    // Fallback to using record if fetch fails
    selectedQuota.value = record;
    editModalVisible.value = true;
  } finally {
    loading.value = false;
  }
};

const showDeleteModal = (record: QuotaApiModel): void => {
  selectedQuota.value = record;
  deleteModalVisible.value = true;
};

const handleCreate = async (): Promise<void> => {
  try {
    loading.value = true;
    await loadQuotas(); // Refresh the list
    createModalVisible.value = false;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("quota.error.title"), errorMessage);
  } finally {
    loading.value = false;
  }
};

const handleUpdate = async (): Promise<void> => {
  try {
    loading.value = true;
    await loadQuotas(); // Refresh the list
    editModalVisible.value = false;
    selectedQuota.value = null;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("quota.error.title"), errorMessage);
  } finally {
    loading.value = false;
  }
};

const handleCancel = (): void => {
  createModalVisible.value = false;
  editModalVisible.value = false;
  deleteModalVisible.value = false;
  selectedQuota.value = null;
};

const handleDelete = async (): Promise<void> => {
  try {
    if (!selectedQuota.value?.id) return;

    loading.value = true;
    await quotaStore.deleteQuota(selectedQuota.value.id.toString());

    success(t("quota.success.title"), t("quota.success.deleted"));
    await loadQuotas(); // Refresh the list
    deleteModalVisible.value = false;
    selectedQuota.value = null;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("quota.error.title"), errorMessage);
  } finally {
    loading.value = false;
  }
};

// Filter options
const vendorOptions = computed(() => {
  const options = [
    { label: "ທັງໝົດ", value: 0 }
  ];
  vendorStore.activeVendors.forEach((vendor) => {
    options.push({
      label: vendor.getname(),
      value: Number(vendor.getId()),
    });
  });
  return options;
});

const yearOptions = computed(() => {
  const options = [
    { label: "ທັງໝົດ", value: "" }
  ];
  const currentYear = new Date().getFullYear();
  // Include current year and 5 years ahead, plus 2 years behind
  for (let i = -2; i <= 5; i++) {
    const yearValue = (currentYear + i).toString();
    options.push({
      label: yearValue,
      value: yearValue,
    });
  }
  return options;
});


</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ t("quota.title") }}</h1>
        <p class="text-gray-600 mt-1">{{ t("quota.listQuota") }}</p>
      </div>
      <UiButton
        type="primary"
        @click="showCreateModal"
        class="flex items-center gap-2"
      >
        <span>{{ t("quota.list.add") }}</span>
      </UiButton>
    </div>

    <!-- Enhanced Filters -->
    <div class="bg-white p-6 rounded-lg shadow mb-6">
      <!-- First Row - Main Filters -->
      <div class="flex flex-wrap gap-4 items-end mb-4">
        <div class="flex-1 min-w-[250px]">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            ຄົ້ນຫາ (ຊື່ຮ້ານຄ້າ, ສິນຄ້າ, ID)
          </label>
          <InputSearch
            v-model:value="search"
            placeholder="ປ້ອນຄຳຄົ້ນຫາ..."
            @search="handleSearch"
            style="width: 100%"
            allow-clear
          />
        </div>
        <div class="w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            ຮ້ານຄ້າ
          </label>
          <InputSelect
            v-model:value="vendor_id"
            :options="vendorOptions"
            placeholder="ເລືອກຮ້ານຄ້າ"
            @change="handleFilterChange"
            allow-clear
            style="width: 100%"
          />
        </div>

        <div class="w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            ປີ
          </label>
          <InputSelect
            v-model:value="year"
            :options="yearOptions"
            placeholder="ເລືອກປີ"
            @change="handleFilterChange"
            allow-clear
            style="width: 100%"
          />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg shadow">
      <Table
        :columns="column(t)"
        :data-source="quotaStore.quotasWithDetails"
        :pagination="tablePagination"
        :loading="loading"
        row-key="id"
        @change="handleTableChange"
      >
      <template #created_at="{ record }">
        <span>{{ formatDates(record.created_at) }}</span>
      </template>
      <template #updated_at="{ record }">
        <span>{{ formatDates(record.updated_at) }}</span>
      </template>

      <template #actions="{ record }">
        <div class="flex items-center justify-center">
         <UiButton
                type="link"
                size="small"
                @click="showEditModal(record)"
                
              >
              <Icon icon="material-symbols:edit-square-outline-rounded" class="mr-1" />
              </UiButton>
              <UiButton
                type="link"
                size="small"
                danger
                @click="showDeleteModal(record)"
              >
                <Icon icon="material-symbols:delete-outline-rounded" class="mr-1" />
              </UiButton>
        </div>
      </template>
      </Table>
    </div>

    <!-- Create Modal -->
    <QuotaFormModal
      v-model:visible="createModalVisible"
      :is-edit-mode="false"
      :loading="loading"
      @success="handleCreate"
    />

    <!-- Edit Modal -->
    <QuotaFormModal
      v-model:visible="editModalVisible"
      :is-edit-mode="true"
      :quota="selectedQuota"
      :loading="loading"
      @success="handleUpdate"
    />

    <!-- Delete Confirmation Modal -->
    <a-modal
      v-model:open="deleteModalVisible"
      :title="t('quota.modal.delete')"
      :confirm-loading="loading"
      @ok="handleDelete"
      @cancel="handleCancel"
    >
      <p>{{ t('quota.modal.deleteConfirm') }}</p>
    
    </a-modal>
  </div>
</template>

<style scoped>
.ant-table-thead > tr > th {
  background-color: #fafafa;
}
</style>