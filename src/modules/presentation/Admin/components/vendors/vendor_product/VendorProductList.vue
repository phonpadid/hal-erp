<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { VendorProductInterface } from "@/modules/interfaces/vendors/vendor_product/vendor-product.interface";
import type { VendorProductEntity } from "@/modules/domain/entities/vendor-products/vendor-product.entity";
import { useVendorProductStore } from "@/modules/presentation/Admin/stores/vendors/vendor-product.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useProductStore } from "@/modules/presentation/Admin/stores/product.store";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import { formatPrice } from "@/modules/shared/utils/format-price";
import FormVendorProduct from "./FormVendorProduct.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";

interface Props {
  vendorId: number;
}

const props = defineProps<Props>();

const { t } = useI18n();
const vendorProductStore = useVendorProductStore();
const productStore = useProductStore();
const { success, error } = useNotification();

// Search state
const searchKeyword = ref<string>("");

// Modal state
const modalVisible = ref(false);
const deleteModalVisible = ref(false);
const selectedVendorProduct = ref<VendorProductInterface | null>(null);
const isEditMode = ref(false);
const vendorProductFormRef = ref();

// Computed properties
const loading = computed(() => vendorProductStore.loading);
const vendorProducts = computed(() => vendorProductStore.activeVendorProducts);

// Table columns
const columns = computed(() => [
  {
    title: t("vendor-product.table.product"),
    dataIndex: "product_name",
    key: "product_name",
    width: "20%",
  },
  {
    title: t("vendor-product.table.price"),
    dataIndex: "price",
    key: "price",
    width: "20%",
  },
  {
    title: t("vendor-product.table.currency"),
    dataIndex: "currency",
    key: "currency",
    width: "20%",
  },
  {
    title: t("vendor-product.table.createdAt"),
    dataIndex: "created_at",
    key: "created_at",
    width: "20%",
  },
  {
    title: t("vendors.table.updated_at"),
    dataIndex: "updated_at",
    key: "updated_at",
    width: "20%",
  },
  {
    title: t("common.actions"),
    key: "actions",
    width: "15%",
    align: "center" as const,
  },
]);

// Helper function to format date for display
const formatDate = (date: Date | null | undefined): string => {
  if (!date) return '-';
  try {
    return isNaN(date.getTime()) ? '-' : date.toISOString().split('T')[0];
  } catch {
    return '-';
  }
};

// Table data source
const dataSource = computed(() =>
  vendorProducts.value.map(vendorProduct => {
    const currency = vendorProduct.getCurrency();
    return {
      key: vendorProduct.getId(),
      id: vendorProduct.getId(),
      product_name: getProductName(vendorProduct.getProductId()),
      price: vendorProduct.getPrice(),
      currency_id: vendorProduct.getCurrencyId(),
      currency: currency,
      created_at: formatDate(vendorProduct.getCreatedAt()),
      updated_at: formatDate(vendorProduct.getUpdatedAt()),
      vendorProduct: vendorProduct,
    };
  })
);

// Load vendor products and products on mount
onMounted(async () => {
  await loadVendorProducts();
  await loadProducts();
});

const loadVendorProducts = async () => {
  try {
    await vendorProductStore.fetchVendorProducts({
      page: vendorProductStore.pagination.page,
      limit: vendorProductStore.pagination.limit,
      search: searchKeyword.value,
    }, props.vendorId);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("vendorProduct.error.loadFailed"), errorMessage);
  }
};

const handleSearch = async () => {
  try {
    await vendorProductStore.fetchVendorProducts({
      page: 1,
      limit: vendorProductStore.pagination.limit,
      search: searchKeyword.value,
    }, props.vendorId);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("vendorProduct.error.loadFailed"), errorMessage);
  }
};

// Handle pagination and sorting
const handleTableChange = (pagination: TablePaginationType) => {
  vendorProductStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total || 0,
  })
  loadVendorProducts();
};

watch(searchKeyword, async(newVal: string) => {
  if(newVal === '') {
    vendorProductStore.setPagination({
      page: 1,
      limit: vendorProductStore.pagination.limit,
      total: vendorProductStore.pagination.total,
    });
    await loadVendorProducts();
  }
});

const loadProducts = async () => {
  try {
    await productStore.fetchProducts({ page: 1, limit: 1000 });
  } catch (err: unknown) {
    console.error("Failed to load products:", err);
  }
};

// Helper function to get product name by ID
const getProductName = (productId: number): string => {
  const product = productStore.activeProducts.find(p => parseInt(p.getId()) === productId);
  return product ? product.getName() : `Product ${productId}`;
};

// Helper function to safely convert Date to ISO string
const toSafeISOString = (date: Date | null | undefined): string => {
  if (!date) return '';
  try {
    return isNaN(date.getTime()) ? '' : date.toISOString();
  } catch {
    return '';
  }
};

// Modal handlers
const showCreateModal = () => {
  selectedVendorProduct.value = null;
  isEditMode.value = false;
  modalVisible.value = true;
};

const showEditModal = (vendorProduct: VendorProductEntity) => {
  selectedVendorProduct.value = {
    id: vendorProduct.getId(),
    vendor_id: vendorProduct.getVendorId(),
    product_id: vendorProduct.getProductId(),
    price: vendorProduct.getPrice(),
    currency_id: vendorProduct.getCurrencyId(),
    currency: vendorProduct.getCurrency() || undefined,
    created_at: toSafeISOString(vendorProduct.getCreatedAt()),
    updated_at: toSafeISOString(vendorProduct.getUpdatedAt()),
    deleted_at: toSafeISOString(vendorProduct.getDeletedAt()),
  };
  isEditMode.value = true;
  modalVisible.value = true;
};

const showDeleteModal = (vendorProduct: VendorProductEntity) => {
  selectedVendorProduct.value = {
    id: vendorProduct.getId(),
    vendor_id: vendorProduct.getVendorId(),
    product_id: vendorProduct.getProductId(),
    price: vendorProduct.getPrice(),
    currency_id: vendorProduct.getCurrencyId(),
    currency: vendorProduct.getCurrency() || undefined,
    created_at: toSafeISOString(vendorProduct.getCreatedAt()),
    updated_at: toSafeISOString(vendorProduct.getUpdatedAt()),
    deleted_at: toSafeISOString(vendorProduct.getDeletedAt()),
  };
  deleteModalVisible.value = true;
};

const handleModalOk = () => {
  vendorProductFormRef.value?.submitForm();
};
const tablePagination = computed(() => ({
  current: vendorProductStore.pagination.page,
  pageSize: vendorProductStore.pagination.limit,
  total: vendorProductStore.pagination.total,
  showSizeChanger: true,
}));
const handleModalCancel = () => {
  modalVisible.value = false;
};

const handleFormSubmit = async (formData: { vendor_id: number; product_id: number; price: number; currency_id?: number }) => {
  try {
    if (isEditMode.value && selectedVendorProduct.value) {
      await vendorProductStore.updateVendorProduct(selectedVendorProduct.value.id, formData);
      success(t("vendor-product.success.title"), t("vendor-product.success.updated"));
    } else {
      await vendorProductStore.createVendorProduct(formData);
      success(t("vendor-product.success.title"), t("vendor-product.success.created"));
    }

    modalVisible.value = false;
    await loadVendorProducts();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Failed to save vendor product:', err);
    error(t("vendor-product.error.saveFailed"), errorMessage);
  }
};

const handleDeleteConfirm = async () => {
  if (!selectedVendorProduct.value) return;

  try {
    console.log('Deleting vendor product:', selectedVendorProduct.value.id);
    await vendorProductStore.deleteVendorProduct(selectedVendorProduct.value.id);
    success(t("vendor-product.success.title"), t("vendor-product.success.deleted"));
    deleteModalVisible.value = false;
    await loadVendorProducts();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Failed to delete vendor product:', err);
    error(t("vendor-product.error.deleteFailed"), errorMessage);
  }
};
</script>

<template>
  <div class="vendor-product-list">
    <div class="flex justify-between items-center mb-4">
      <div class="flex-1"></div>
      <div class="flex items-center justify-end gap-2">
        <InputSearch
          v-model:value="searchKeyword"
          @keyup.enter="handleSearch"
          :placeholder="t('vendor-product.placeholder.search')"
        />
        <UiButton
          type="primary"
          @click="showCreateModal"
          size="normall"
        >
          {{ t("vendor-product.list.add") }}
        </UiButton>
      </div>
    </div>

    <!-- Vendor Products Table -->
    <Table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="tablePagination"
      :locale="{ emptyText: t('vendor-product.list.noData') }"
      @change="handleTableChange"
    >
      <!-- Product Name Column -->
      <!-- <template #bodyCell="{ column, record }"> -->
        <template #product_name="{record}">
          <span class="font-medium">{{ record.product_name }}</span>
        </template>

        <!-- Price Column -->
        <template #price="{record}">
          <span class="text-gray-900">{{ formatPrice(record.price) }}</span>
        </template>

          <!-- Currency Column -->
        <template #currency="{record}">
          <span class="text-gray-900">
            {{ record.currency?.name && record.currency?.code ? `${record.currency.name} (${record.currency.code})` : record.currency_id || '-' }}
          </span>
        </template>

        <!-- Created At Column -->
        <template #created_at="{record}">
          <span class="text-gray-600">{{ record.created_at }}</span>
        </template>

        <!-- Updated At Column -->
        <template #updated_at="{record}">
          <span class="text-gray-600">{{ record.updated_at }}</span>
        </template>

        <!-- Actions Column -->
        <template #actions="{record}">
          <div class="flex items-center justify-center gap-2">
            <UiButton
              icon="material-symbols-light:edit-square-sharp"
              @click="showEditModal(record.vendorProduct)"
              size="small"
              shape="circle"
              class="flex items-center justify-center text-blue-500 hover:!text-blue-900 hover:!bg-blue-50"
            />
            <UiButton
              icon="material-symbols-light:delete-outline-sharp"
              danger
              @click="showDeleteModal(record.vendorProduct)"
              size="small"
              shape="circle"
              class="flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50"

            ></UiButton>
          </div>
        </template>
      <!-- </template> -->
    </Table>

    <!-- Create/Edit Vendor Product Modal -->
    <UiModal
      :title="isEditMode ? t('vendor-product.modal.edit') : t('vendor-product.modal.create')"
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
      <FormVendorProduct
        ref="vendorProductFormRef"
        :vendor-product="selectedVendorProduct"
        :is-edit-mode="isEditMode"
        :loading="loading"
        :vendor-id="props.vendorId"
        @submit="handleFormSubmit"
      />
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('vendor-product.modal.delete')"
      :visible="deleteModalVisible"
      :confirm-loading="loading"
      @ok="handleDeleteConfirm"
      @cancel="deleteModalVisible = false"
      ok-text="ຢືນຢັນ"
      cancel-text="ຍົກເລີກ"
      ok-type="primary"
      :danger="true"
    >
      <p>{{ $t("vendor-product.modal.deleteConfirm", { name: getProductName(selectedVendorProduct?.product_id || 0) }) }}</p>
      <p class="text-red-500">{{ $t("vendor-product.modal.deleteWarning") }}</p>
    </UiModal>
  </div>
</template>

<style scoped>
.vendor-product-list {
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
