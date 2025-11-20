<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { ProductInterface } from "@/modules/interfaces/product.interface";
import { useProductStore } from "../../stores/product.store";
import { useProductTypeStore } from "../../stores/product-type.store";
import { useUnitStore } from "../../stores/unit.store";
import { Columns } from "./column";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import ProductForm from "@/modules/presentation/Admin/components/product/FormProduct.vue";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import type { CreateProductDTO } from "@/modules/application/dtos/product.dto";

const { t } = useI18n();

const productStore = useProductStore();
const productTypeStore = useProductTypeStore();
const unitStore = useUnitStore();
const { success, error, warning } = useNotification();

// State
const loading = ref<boolean>(false);
const searchKeyword = ref<string>("");

// Modal state
const modalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const submitLoading = ref<boolean>(false);
const selectedProduct = ref<ProductInterface | null>(null);
const isEditMode = ref<boolean>(false);
const productFormRef = ref();

// Table pagination
const tablePagination = computed(() => ({
  current: productStore.pagination.page,
  pageSize: productStore.pagination.limit,
  total: productStore.pagination.total,
  showSizeChanger: true,
}));

onMounted(async () => {
  await loadProducts();
  await loadProductTypes();
  await loadUnits();
});

// Load product types for dropdown display
const loadProductTypes = async () => {
  try {
    await productTypeStore.fetchProductTypes({
      page: 1,
      limit: 100, // Get all product types
      search: "",
    });
  } catch (err) {
    console.error("Failed to load product types:", err);
  }
};

// Load units for dropdown display
const loadUnits = async () => {
  try {
    await unitStore.fetchUnits({
      page: 1,
      limit: 100, // Get all units
      search: "",
    });
  } catch (err) {
    console.error("Failed to load units:", err);
  }
};

// Get product type name by ID
const getProductTypeName = (productTypeId: number): string => {
  const productType = productTypeStore.activeProductTypes.find(
    (pt) => parseInt(pt.getId()) === productTypeId
  );
  return productType ? productType.getName() : "-";
};

const loadProducts = async () => {
  loading.value = true;

  try {
    await productStore.fetchProducts({
      page: productStore.pagination.page,
      limit: productStore.pagination.limit,
      search: searchKeyword.value,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("products.error.loadFailed"), String(errorMessage));
  } finally {
    loading.value = false;
  }
};

// Handle pagination and sorting
const handleTableChange = (pagination: TablePaginationType) => {
  productStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total || 0,
  });
  loadProducts();
};

const handleSearch = async () => {
  await productStore.fetchProducts({
    page: 1,
    limit: productStore.pagination.limit,
    search: searchKeyword.value,
  });
};

watch(searchKeyword, async (newVal: string) => {
  if (newVal === '') {
    productStore.setPagination({
      page: 1,
      limit: productStore.pagination.limit,
      total: productStore.pagination.total,
    });
    await loadProducts();
  }
});

// Modal handlers
const showCreateModal = () => {
  selectedProduct.value = null;
  isEditMode.value = false;
  modalVisible.value = true;
};

const showEditModal = (product: ProductInterface) => {
  selectedProduct.value = { ...product };
  isEditMode.value = true;
  modalVisible.value = true;
};

const showDeleteModal = (product: ProductInterface) => {
  selectedProduct.value = product;
  deleteModalVisible.value = true;
};

const handleModalOk = () => {
  productFormRef.value?.submitForm();
};

const handleModalCancel = () => {
  modalVisible.value = false;
};

const handleFormSubmit = async (formData: { name: string; description: string; product_type_id: number }) => {
  try {
    submitLoading.value = true;

    if (isEditMode.value && selectedProduct.value) {
      await productStore.updateProduct(selectedProduct.value.id.toString(), {
        ...formData,
      });
      success(t("products.success.title"), t("products.success.updated"));
    } else {
      await productStore.createProduct(formData as CreateProductDTO);
      success(t("products.success.title"), t("products.success.created"));
    }

    modalVisible.value = false;
    await loadProducts();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("products.error.title"), String(errorMessage));
  } finally {
    submitLoading.value = false;
  }
};

const handleDeleteConfirm = async () => {
  if (!selectedProduct.value) return;

  try {
    submitLoading.value = true;
    await productStore.deleteProduct(selectedProduct.value.id.toString());
    success(t("products.success.title"), t("products.success.deleted"));

    deleteModalVisible.value = false;
    await loadProducts();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("products.error.deleteFailed"), String(errorMessage));
  } finally {
    submitLoading.value = false;
  }
};
</script>

<template>
  <div class="product-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ t("products.title") }}</h1>
      </div>

      <div class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit">
        <InputSearch
          v-model:value="searchKeyword"
          @keyup.enter="handleSearch"
          :placeholder="t('products.placeholder.search')"
        />
        <UiButton
          type="primary"
          icon="ant-design:plus-outlined"
          @click="showCreateModal"
          colorClass="text-white flex items-center"
        >
          {{ t("products.add") }}
        </UiButton>
      </div>
    </div>

    <!-- Products Table -->
    <Table
      :columns="Columns(t)"
      :dataSource="productStore.products"
      :pagination="tablePagination"
      :loading="loading"
      row-key="id"
      @change="handleTableChange"
    >
      <!-- Product Type column -->
      <template #product_type_id="{ record }">
        <span>{{ getProductTypeName(record.product_type_id) }}</span>
      </template>

      <!-- Unit column -->
      <template #unit_id="{ record }">
        <span>{{ record.unit?.name }}</span>
      </template>

      <!-- Status column -->
      <template #status="{ record }">
        <span :class="{
          'text-green-600': record.status === 'active',
          'text-red-600': record.status === 'inactive',
          'text-gray-600': record.status === 'draft'
        }">
          {{ t(`products.status.${record.status}`) }}
        </span>
      </template>

      <!-- Actions column -->
      <template #actions="{ record }">
        <div class="flex items-center justify-center gap-2">
          <UiButton
            type=""
            icon="ant-design:edit-outlined"
            shape="circle"
            size="small"
            @click="showEditModal(record)"
            colorClass="flex items-center justify-center text-orange-400"
            :disabled="!!record.deleted_at"
          />

          <UiButton
            type=""
            danger
            icon="ant-design:delete-outlined"
            shape="circle"
            colorClass="flex items-center justify-center text-red-700"
            size="small"
            @click="showDeleteModal(record)"
          />
        </div>
      </template>
    </Table>

    <!-- Create/Edit Modal -->
    <UiModal
      v-model:open="modalVisible"
      :title="isEditMode ? t('products.edit.title') : t('products.modal.create')"
      :visible="modalVisible"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :confirmLoading="submitLoading"
      width="600px"
    >
      <ProductForm
        ref="productFormRef"
        :product="selectedProduct"
        :isEditMode="isEditMode"
        :loading="submitLoading"
        @submit="handleFormSubmit"
        @cancel="handleModalCancel"
      />
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      v-model:open="deleteModalVisible"
      :visible="modalVisible"
      :title="t('products.delete.title')"
      @ok="handleDeleteConfirm"
      @cancel="deleteModalVisible = false"
      :confirmLoading="submitLoading"
    >
      <p>
        {{ t("products.delete.confirmation", { name: selectedProduct?.name }) }}
      </p>
    </UiModal>
  </div>
</template>
