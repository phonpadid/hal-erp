<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { CategoryInterface } from "@/modules/interfaces/category.interface";
import { useCategoryStore } from "../../stores/category.store";
import { Columns } from "./column";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import CategoryForm from "@/modules/presentation/Admin/components/category/FormCategory.vue";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";

const { t } = useI18n();

const categoryStore = useCategoryStore();
const { success, error, warning } = useNotification();

// State
const loading = ref<boolean>(false);
const searchKeyword = ref<string>("");

// Modal state
const modalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const submitLoading = ref<boolean>(false);
const selectedCategory = ref<CategoryInterface | null>(null);
const isEditMode = ref<boolean>(false);
const categoryFormRef = ref();

// Table pagination
const tablePagination = computed(() => ({
  current: categoryStore.pagination.page,
  pageSize: categoryStore.pagination.limit,
  total: categoryStore.pagination.total,
  showSizeChanger: true,
}));

onMounted(async () => {
  await loadCategories();
});

const loadCategories = async () => {
  loading.value = true;

  try {
    await categoryStore.fetchCategories({
      page: categoryStore.pagination.page,
      limit: categoryStore.pagination.limit,
      search: searchKeyword.value,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("categories.error.loadFailed"), String(errorMessage));
  } finally {
    loading.value = false;
  }
};

// Handle pagination and sorting
const handleTableChange = (
  pagination: TablePaginationType
) => {
  categoryStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total || 0,
  })
  loadCategories();
};

const handleSearch = async () => {
  await categoryStore.fetchCategories({
    page: 1,
    limit: categoryStore.pagination.limit,
    search: searchKeyword.value,
  });
};

watch(searchKeyword, async(newVal: string) => {
  if(newVal === '') {
    categoryStore.setPagination({
      page: 1,
      limit: categoryStore.pagination.limit,
      total: categoryStore.pagination.total,
    })
    await loadCategories()
  }
})

// Modal handlers
const showCreateModal = () => {
  selectedCategory.value = null;
  isEditMode.value = false;
  modalVisible.value = true;
};

const showEditModal = (category: CategoryInterface) => {
  selectedCategory.value = { ...category };
  isEditMode.value = true;
  modalVisible.value = true;
};

const showDeleteModal = (category: CategoryInterface) => {
  selectedCategory.value = category;
  deleteModalVisible.value = true;
};

const handleModalOk = () => {
  categoryFormRef.value?.submitForm();
};

const handleModalCancel = () => {
  modalVisible.value = false;
};

const handleFormSubmit = async (formData: { name: string }) => {
  try {
    submitLoading.value = true;

    if (isEditMode.value && selectedCategory.value) {
      await categoryStore.updateCategory(selectedCategory.value.id.toString(), {
        ...formData,
      });
      success(t("categories.success.title"), t("categories.success.updated"));
    } else {
      await categoryStore.createCategory(formData);
      success(t("categories.success.title"), t("categories.success.created"));
    }

    modalVisible.value = false;
    await loadCategories();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("categories.error.title"), String(errorMessage));
  } finally {
    submitLoading.value = false;
  }
};

const handleDeleteConfirm = async () => {
  if (!selectedCategory.value) return;

  try {
    submitLoading.value = true;
    await categoryStore.deleteCategory(selectedCategory.value.id.toString());
    success(t("categories.success.title"), t("categories.success.deleted"));

    deleteModalVisible.value = false;
    await loadCategories();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("categories.error.deleteFailed"), String(errorMessage));
  } finally {
    submitLoading.value = false;
  }
};
</script>

<template>
  <div class="category-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ t("categories.title") }}</h1>
      </div>

      <div class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit">
        <InputSearch
          v-model:value="searchKeyword"
          @keyup.enter="handleSearch"
          :placeholder="t('categories.placeholder.search')"
        />
        <UiButton
          type="primary"
          icon="ant-design:plus-outlined"
          @click="showCreateModal"
          colorClass="text-white flex items-center"
        >
          {{ t("categories.add") }}
        </UiButton>
      </div>
    </div>

    <!-- Categories Table -->
    <Table
      :columns="Columns(t)"
      :dataSource="categoryStore.categories"
      :pagination="tablePagination"
      :loading="loading"
      row-key="id"

      @change="handleTableChange"
    >

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

    <!-- Create/Edit Category Modal -->
    <UiModal
      :title="isEditMode ? t('categories.modal.edit') : t('categories.modal.create')"
      :visible="modalVisible"
      :confirm-loading="submitLoading"
      @update:visible="modalVisible = $event"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :okText="isEditMode ? t('button.edit') : t('button.save')"
      :cancelText="t('button.cancel')"
    >

      <CategoryForm
        ref="categoryFormRef"
        :category="selectedCategory"
        :is-edit-mode="isEditMode"
        :loading="submitLoading"
        @submit="handleFormSubmit"
      />
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('categories.modal.delete')"
      :visible="deleteModalVisible"
      :confirm-loading="submitLoading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDeleteConfirm"
      @cancel="deleteModalVisible = false"
      ok-text="ຢືນຢັນ"
      ok-type="primary"
      :danger="true"
    >
      <p>{{ $t("categories.modal.deleteConfirm", { name: selectedCategory?.name }) }}</p>
      <p class="text-red-500">{{ $t("categories.modal.deleteWarning") }}</p>
    </UiModal>
  </div>
</template>

<style scoped>
.category-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
