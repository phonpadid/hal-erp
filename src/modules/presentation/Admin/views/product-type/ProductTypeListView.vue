<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { ProductTypeInterface } from "@/modules/interfaces/product-type.interface";
import { useProductTypeStore } from "../../stores/product-type.store";
import { useCategoryStore } from "../../stores/category.store";
import { Columns } from "./column";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import ProductTypeForm from "@/modules/presentation/Admin/components/product-type/FormProductType.vue";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";

const { t } = useI18n();

const productTypeStore = useProductTypeStore();
const categoryStore = useCategoryStore();
const { success, error, warning } = useNotification();

// State
const loading = ref<boolean>(false);
const searchKeyword = ref<string>("");

// Modal state
const modalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const submitLoading = ref<boolean>(false);
const selectedProductType = ref<ProductTypeInterface | null>(null);
const isEditMode = ref<boolean>(false);
const productTypeFormRef = ref();

// Table pagination
const tablePagination = computed(() => ({
  current: productTypeStore.pagination.page,
  pageSize: productTypeStore.pagination.limit,
  total: productTypeStore.pagination.total,
  showSizeChanger: true,
}));

onMounted(async () => {
  await loadProductTypes();
  await loadCategories();
});

// Load categories for dropdown display
const loadCategories = async () => {
  try {
    await categoryStore.fetchCategories({
      page: 1,
      limit: 100, // Get all categories
      search: "",
    });
  } catch (err) {
    console.error("Failed to load categories:", err);
  }
};

// Get category name by ID
const getCategoryName = (categoryId: number | null | undefined): string => {
  if (!categoryId) return "-";
  const category = categoryStore.activeCategories.find((cat) => parseInt(cat.getId()) === categoryId);
  return category ? category.getName() : "-";
};

const loadProductTypes = async () => {
  loading.value = true;

  try {
    await productTypeStore.fetchProductTypes({
      page: productTypeStore.pagination.page,
      limit: productTypeStore.pagination.limit,
      search: searchKeyword.value,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("product-types.error.loadFailed"), String(errorMessage));
  } finally {
    loading.value = false;
  }
};

// Handle pagination and sorting
const handleTableChange = (
  pagination: TablePaginationType
) => {
  productTypeStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total || 0,
  })
  loadProductTypes();
};

const handleSearch = async () => {
  await productTypeStore.fetchProductTypes({
    page: 1,
    limit: productTypeStore.pagination.limit,
    search: searchKeyword.value,
  });
};

watch(searchKeyword, async(newVal: string) => {
  if(newVal === '') {
    productTypeStore.setPagination({
      page: 1,
      limit: productTypeStore.pagination.limit,
      total: productTypeStore.pagination.total,
    })
    await loadProductTypes()
  }
})

// Modal handlers
const showCreateModal = () => {
  selectedProductType.value = null;
  isEditMode.value = false;
  modalVisible.value = true;
};

const showEditModal = (productType: ProductTypeInterface) => {
  selectedProductType.value = { ...productType };
  isEditMode.value = true;
  modalVisible.value = true;
};

const showDeleteModal = (productType: ProductTypeInterface) => {
  selectedProductType.value = productType;
  deleteModalVisible.value = true;
};

const handleModalOk = () => {
  productTypeFormRef.value?.submitForm();
};

const handleModalCancel = () => {
  modalVisible.value = false;
};

const handleFormSubmit = async (formData: { name: string; categoryId?: string | null }) => {
  try {
    submitLoading.value = true;

    if (isEditMode.value && selectedProductType.value) {
      await productTypeStore.updateProductType(selectedProductType.value.id.toString(), {
        ...formData,
      });
      success(t("product-types.success.title"), t("product-types.success.updated"));
    } else {
      await productTypeStore.createProductType(formData);
      success(t("product-types.success.title"), t("product-types.success.created"));
    }

    modalVisible.value = false;
    await loadProductTypes();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("product-types.error.title"), String(errorMessage));
  } finally {
    submitLoading.value = false;
  }
};

const handleDeleteConfirm = async () => {
  if (!selectedProductType.value) return;

  try {
    submitLoading.value = true;
    await productTypeStore.deleteProductType(selectedProductType.value.id.toString());
    success(t("product-types.success.title"), t("product-types.success.deleted"));

    deleteModalVisible.value = false;
    await loadProductTypes();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("product-types.error.deleteFailed"), String(errorMessage));
  } finally {
    submitLoading.value = false;
  }
};
</script>

<template>
  <div class="product-type-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ t("product-types.title") }}</h1>
      </div>

      <div class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit">
        <InputSearch
          v-model:value="searchKeyword"
          @keyup.enter="handleSearch"
          :placeholder="t('product-types.placeholder.search')"
        />
        <UiButton
          type="primary"
          icon="ant-design:plus-outlined"
          @click="showCreateModal"
          colorClass="text-white flex items-center"
        >
          {{ t("product-types.add") }}
        </UiButton>
      </div>
    </div>

    <!-- Product Types Table -->
    <Table
      :columns="Columns(t)"
      :dataSource="productTypeStore.productTypes"
      :pagination="tablePagination"
      :loading="loading"
      row-key="id"

      @change="handleTableChange"
    >

      <!-- Category column -->
      <template #categoryId="{ record }">
        <span>{{ getCategoryName(record.category_id) }}</span>
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

    <!-- Create/Edit Product Type Modal -->
    <UiModal
      :title="isEditMode ? t('product-types.modal.edit') : t('product-types.modal.create')"
      :visible="modalVisible"
      :confirm-loading="submitLoading"
      @update:visible="modalVisible = $event"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :okText="isEditMode ? t('button.edit') : t('button.save')"
      :cancelText="t('button.cancel')"
    >

      <ProductTypeForm
        ref="productTypeFormRef"
        :productType="selectedProductType"
        :is-edit-mode="isEditMode"
        :loading="submitLoading"
        @submit="handleFormSubmit"
      />
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('product-types.modal.delete')"
      :visible="deleteModalVisible"
      :confirm-loading="submitLoading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDeleteConfirm"
      @cancel="deleteModalVisible = false"
      ok-text="ຢືນຢັນ"
      ok-type="primary"
      :danger="true"
    >
      <p>{{ $t("product-types.modal.deleteConfirm", { name: selectedProductType?.name }) }}</p>
      <p class="text-red-500">{{ $t("product-types.modal.deleteWarning") }}</p>
    </UiModal>
  </div>
</template>

<style scoped>
.product-type-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>