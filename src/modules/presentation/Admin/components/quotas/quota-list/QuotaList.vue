<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { QuotaEntity } from "@/modules/domain/entities/quotas/quota.entity";
import { useQuotaStore } from "@/modules/presentation/Admin/stores/quotas/quota.store";
import { useCompanyStore } from "@/modules/presentation/Admin/stores/company.store";
import { useProductStore } from "@/modules/presentation/Admin/stores/product.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import QuotaForm from "../quota-form/QuotaForm.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import { useVendorStore } from "../../../stores/vendors/vendor.store";

interface Props {
  companyId?: number;
  vendorId?: number;
  productId?: number;
}

const props = withDefaults(defineProps<Props>(), {});

const { t } = useI18n();
const quotaStore = useQuotaStore();
const companyStore = useCompanyStore();
const vendorStore = useVendorStore();
const productStore = useProductStore();
const { success, error } = useNotification();

// Search state
const searchKeyword = ref<string>("");

// Modal state
const modalVisible = ref(false);
const deleteModalVisible = ref(false);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectedQuota = ref<any | null>(null);
const isEditMode = ref(false);
const quotaFormRef = ref();

// Computed properties
const loading = computed(() => quotaStore.loading);
const quotas = computed(() => quotaStore.activeQuotas);

// Table columns
const columns = computed(() => [
  {
    title: t("quota.table.company"),
    dataIndex: "company_name",
    key: "company_name",
    width: "20%",
  },
  {
    title: t("quota.table.vendor"),
    dataIndex: "vendor_name",
    key: "vendor_name",
    width: "20%",
  },
  {
    title: t("quota.table.product"),
    dataIndex: "product_name",
    key: "product_name",
    width: "20%",
  },
  {
    title: t("quota.table.quantity"),
    dataIndex: "qty",
    key: "qty",
    width: "10%",
  },
  {
    title: t("quota.table.year"),
    dataIndex: "year",
    key: "year",
    width: "10%",
  },
  {
    title: t("quota.table.createdAt"),
    dataIndex: "created_at",
    key: "created_at",
    width: "10%",
  },
  {
    title: t("common.actions"),
    key: "actions",
    width: "10%",
    align: "center" as const,
  },
]);

// Table data source
const dataSource = computed(() =>
  quotas.value.map(quota => ({
    key: quota.getId(),
    id: quota.getId(),
    company_name: getCompanyName(quota.getCompanyId()),
    vendor_name: getVendorName(quota.getVendorId()),
    product_name: getProductName(quota.getProductId()),
    qty: quota.getQty(),
    year: quota.getYear(),
    created_at: new Date(quota.getCreatedAt()).toLocaleDateString(),
    quota: quota,
  }))
);

// Load quotas and related data on mount
onMounted(async () => {
  await loadQuotas();
  await loadRelatedData();
});

const loadQuotas = async () => {
  try {
    await quotaStore.fetchQuotas({
      page: quotaStore.pagination.page,
      limit: quotaStore.pagination.limit,
      search: searchKeyword.value,
      company_id: props.companyId,
      vendor_id: props.vendorId,
      product_id: props.productId,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("quota.error.loadFailed"), errorMessage);
  }
};

const handleSearch = async () => {
  try {
    await quotaStore.fetchQuotas({
      page: 1,
      limit: quotaStore.pagination.limit,
      search: searchKeyword.value,
      company_id: props.companyId,
      vendor_id: props.vendorId,
      product_id: props.productId,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("quota.error.loadFailed"), errorMessage);
  }
};

// Handle pagination and sorting
const handleTableChange = (pagination: TablePaginationType) => {
  quotaStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total || 0,
  });
  loadQuotas();
};

watch(searchKeyword, async(newVal: string) => {
  if(newVal === '') {
    quotaStore.setPagination({
      page: 1,
      limit: quotaStore.pagination.limit,
      total: quotaStore.pagination.total,
    });
    await loadQuotas();
  }
});

const loadRelatedData = async () => {
  try {
    await Promise.all([
      // companyStore.getCompanies(),
      vendorStore.fetchVendors({ page: 1, limit: 1000 }),
      productStore.fetchProducts({ page: 1, limit: 1000 }),
    ]);
  } catch (err: unknown) {
    console.error("Failed to load related data:", err);
  }
};

// Helper functions to get names by ID
const getCompanyName = (companyId: number): string => {
  const company = companyStore.companies.find(c => c.getId() === companyId.toString());
  return company ? company.getName() : `Company ${companyId}`;
};

const getVendorName = (vendorId: number): string => {
  const vendor = vendorStore.vendors.find(v => v.getId() === vendorId.toString());
  return vendor ? vendor.getname() : `Vendor ${vendorId}`;
};

const getProductName = (productId: number): string => {
  const product = productStore.activeProducts.find(p => p.getId() === productId.toString());
  return product ? product.getName() : `Product ${productId}`;
};

// Modal handlers
const showCreateModal = () => {
  selectedQuota.value = null;
  isEditMode.value = false;
  modalVisible.value = true;
};

const showEditModal = (quota: QuotaEntity) => {
  selectedQuota.value = {
    id: quota.getId(),
    company_id: quota.getCompanyId(),
    vendor_id: quota.getVendorId(),
    product_id: quota.getProductId(),
    qty: quota.getQty(),
    year: quota.getYear(),
    created_at: quota.getCreatedAt(),
    updated_at: quota.getUpdatedAt(),
    deleted_at: quota.getDeletedAt(),
  };
  isEditMode.value = true;
  modalVisible.value = true;
};

const showDeleteModal = (quota: QuotaEntity) => {
  selectedQuota.value = {
    id: quota.getId(),
    company_id: quota.getCompanyId(),
    vendor_id: quota.getVendorId(),
    product_id: quota.getProductId(),
    qty: quota.getQty(),
    year: quota.getYear(),
    created_at: quota.getCreatedAt(),
    updated_at: quota.getUpdatedAt(),
    deleted_at: quota.getDeletedAt(),
  };
  deleteModalVisible.value = true;
};

const handleModalOk = () => {
  quotaFormRef.value?.submitForm();
};

const tablePagination = computed(() => ({
  current: quotaStore.pagination.page,
  pageSize: quotaStore.pagination.limit,
  total: quotaStore.pagination.total,
  showSizeChanger: true,
}));

const handleModalCancel = () => {
  modalVisible.value = false;
};

const handleFormSubmit = async (formData: {
  company_id: number;
  vendor_id: number;
  product_id: number;
  qty: number;
  year: string
}) => {
  try {
    if (isEditMode.value && selectedQuota.value) {
      await quotaStore.updateQuota(selectedQuota.value.id, {
        id: selectedQuota.value.id,
        ...formData
      });
      success(t("quota.success.title"), t("quota.success.updated"));
    } else {
      await quotaStore.createQuota(formData);
      success(t("quota.success.title"), t("quota.success.created"));
    }

    modalVisible.value = false;
    await loadQuotas();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Failed to save quota:', err);
    error(t("quota.error.saveFailed"), errorMessage);
  }
};

const handleDeleteConfirm = async () => {
  if (!selectedQuota.value) return;

  try {
    console.log('Deleting quota:', selectedQuota.value.id);
    await quotaStore.deleteQuota(selectedQuota.value.id);
    success(t("quota.success.title"), t("quota.success.deleted"));
    deleteModalVisible.value = false;
    await loadQuotas();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Failed to delete quota:', err);
    error(t("quota.error.deleteFailed"), errorMessage);
  }
};
</script>

<template>
  <div class="quota-list">
    <div class="flex justify-between items-center mb-4">
      <div class="flex-1"></div>
      <div class="flex items-center justify-end gap-2">
        <InputSearch
          v-model:value="searchKeyword"
          @keyup.enter="handleSearch"
          :placeholder="t('quota.placeholder.search')"
        />
        <UiButton
          type="primary"
          @click="showCreateModal"
          size="normall"
        >
          {{ t("quota.list.add") }}
        </UiButton>
      </div>
    </div>

    <!-- Quotas Table -->
    <Table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="tablePagination"
      :locale="{ emptyText: t('quota.list.noData') }"
      @change="handleTableChange"
    >
      <!-- Quantity Column -->
      <template #qty="{record}">
        <span class="font-medium">{{ record.qty }}</span>
      </template>

      <!-- Year Column -->
      <template #year="{record}">
        <span class="text-gray-900">{{ record.year }}</span>
      </template>

      <!-- Actions Column -->
      <template #actions="{record}">
        <div class="flex items-center justify-center gap-2">
          <UiButton
            size="small"
            @click="showEditModal(record.quota)"
            class="flex items-center justify-center text-orange-500 hover:text-orange-600 hover:bg-orange-50"
          > <EditOutlined /> </UiButton>
          <UiButton
            size="small"
            danger
            @click="showDeleteModal(record.quota)"
            class="flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50"
          ><DeleteOutlined/> </UiButton>
        </div>
      </template>
    </Table>

    <!-- Create/Edit Quota Modal -->
    <UiModal
      :title="isEditMode ? t('quota.modal.edit') : t('quota.modal.create')"
      :open="modalVisible"
      :visible="modalVisible"
      :confirm-loading="loading"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      @update:visible="modalVisible = $event"
      :ok-text="isEditMode ? t('button.save') : t('button.save')"
      :cancel-text="t('button.cancel')"
      width="500px"
    >
      <QuotaForm
        ref="quotaFormRef"
        :quota="selectedQuota"
        :is-edit-mode="isEditMode"
        :loading="loading"
        :company-id="props.companyId"
        :vendor-id="props.vendorId"
        :product-id="props.productId"
        @submit="handleFormSubmit"
        @cancel="handleModalCancel"
      />
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('quota.modal.delete')"
      :visible="deleteModalVisible"
      :confirm-loading="loading"
      @ok="handleDeleteConfirm"
      @cancel="deleteModalVisible = false"
      ok-text="ຢືນຢັນ"
      cancel-text="ຍົກເລີກ"
      ok-type="primary"
      :danger="true"
    >
      <p>{{ $t("quota.modal.deleteConfirm", {
        company: getCompanyName(selectedQuota?.company_id || 0),
        vendor: getVendorName(selectedQuota?.vendor_id || 0),
        product: getProductName(selectedQuota?.product_id || 0),
        year: selectedQuota?.year
      }) }}</p>
      <p class="text-red-500">{{ $t("quota.modal.deleteWarning") }}</p>
    </UiModal>
  </div>
</template>

<style scoped>
.quota-list {
  margin-top: 0.2rem;
  padding-top: 0.1rem;
}

/* Custom table styles */
:deep(.ant-table-thead > tr > th) {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f9fafb;
}

:deep(.ant-btn-text) {
  border: none;
  box-shadow: none;
}

:deep(.ant-btn-text:hover) {
  background-color: transparent;
}
</style>
