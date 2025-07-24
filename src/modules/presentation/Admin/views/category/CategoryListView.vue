<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import type { CategoryApiModel } from "@/modules/interfaces/category.interface";
import { useCategoryStore } from "@/modules/presentation/Admin/stores/category.store";
import { Category } from "@/modules/domain/entities/categories.entity";
import { getColumns } from "./column";
import { rules } from "./validation/category.vallidate";
import { useNotification } from "@/modules/shared/utils/useNotification";
import Table, { type TablePaginationType } from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";

const { success } = useNotification();
const search = ref<string>("");
const { t } = useI18n();
const columns = computed(() => getColumns(t));
const categoryStore = useCategoryStore();
const categories = ref<CategoryApiModel[]>([]);
const formRef = ref();
const createModalVisible = ref(false);
const editModalVisible = ref(false);
const deleteModalVisible = ref(false);
const loading = ref(false);
const selectedCategory = ref<CategoryApiModel | null>(null);
const errorMessage = ref("");
const formModel = reactive({ name: "" });

const pageSizeOptions = ["10", "20", "50", "100"];

onMounted(async () => {
  await loadCategories();
});

watch(search, async (newValue) => {
  if (!newValue) {
    await loadCategories();
  }
});

const loadCategories = async (): Promise<void> => {
  loading.value = true;
  try {
    const result = await categoryStore.fetchCategories({
      page: categoryStore.pagination.page,
      limit: categoryStore.pagination.limit,
    });
    categories.value = result.data.map((category: Category) => ({
      id: parseInt(category.getId()),
      name: category.getName(),
      created_at: category.getCreatedAt(),
      updated_at: category.getUpdatedAt(),
    }));
  } catch (error) {
    console.log("error", error);
  } finally {
    loading.value = false;
  }
};

const handleTableChange = async (pagination: TablePaginationType) => {
  categoryStore.setPagination({
    page: pagination.current ?? 1,
    limit: pagination.pageSize ?? 10,
    total: pagination.total ?? 0,
  });
  await loadCategories();
};

const handleSearch = async () => {
  loading.value = true;
  try {
    const result = await categoryStore.fetchCategories({
      page: 1,
      limit: categoryStore.pagination.limit,
      search: search.value,
    });
    categories.value = result.data.map((category: Category) => ({
      id: parseInt(category.getId()),
      name: category.getName(),
      created_at: category.getCreatedAt(),
      updated_at: category.getUpdatedAt(),
    }));
    categoryStore.setPagination({
      page: 1,
      limit: categoryStore.pagination.limit,
      total: categoryStore.pagination.total,
    });
  } catch (error) {
    console.error("Search failed:", error);
  } finally {
    loading.value = false;
  }
};

const showCreateModal = (): void => {
  formModel.name = "";
  errorMessage.value = "";
  createModalVisible.value = true;
};

const showEditModal = (record: CategoryApiModel): void => {
  selectedCategory.value = record;
  formModel.name = record.name;
  errorMessage.value = "";
  editModalVisible.value = true;
};

const showDeleteModal = (record: CategoryApiModel): void => {
  selectedCategory.value = record;
  deleteModalVisible.value = true;
};

const handleCreate = async (): Promise<void> => {
  loading.value = true;
  errorMessage.value = "";
  try {
    await formRef.value.submitForm();

    await categoryStore.createCategory({ name: formModel.name });
    success(t("categories.notify.created"));
    await loadCategories();
    createModalVisible.value = false;
    formModel.name = "";
  } catch (error: any) {
    if (error.message && error.message.includes("already exists")) {
      errorMessage.value = t(
        "categories.error.duplicateName",
        "A category with this name already exists."
      );
    } else {
      errorMessage.value = error.message || "Create failed. Please try again.";
    }
    console.error("Create form validation failed:", error);
  } finally {
    loading.value = false;
  }
};

const handleEdit = async (): Promise<void> => {
  loading.value = true;
  errorMessage.value = "";
  try {
    await formRef.value.submitForm();
    if (selectedCategory.value) {
      const id = selectedCategory.value.id.toString();
      await categoryStore.updateCategory(id, { name: formModel.name });
      success(t("categories.notify.updated"));
      await loadCategories();
      editModalVisible.value = false;
    }
  } catch (error: any) {
    if (error.message && error.message.includes("already exists")) {
      errorMessage.value = t(
        "categories.error.duplicateName",
        "A category with this name already exists."
      );
    } else {
      errorMessage.value = error.message || "Edit failed. Please try again.";
    }
    console.error("Edit form validation failed:", error);
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (): Promise<void> => {
  if (!selectedCategory.value) return;
  loading.value = true;
  try {
    const id = selectedCategory.value.id.toString();
    await categoryStore.deleteCategory(id);
    success(t("categories.notify.deleted"));
    await loadCategories();
    deleteModalVisible.value = false;
  } catch (error) {
    console.error("Delete failed:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="category-list-container p-6">
    <div class="mb-6 gap-4">
      <h1 class="text-2xl font-semibold">
        {{ t("categories.title") }}
      </h1>
      <div class="flex justify-between gap-20">
        <div class="w-[20rem]">
          <InputSearch
            v-model:value="search"
            @keyup.enter="handleSearch"
            :placeholder="t('categories.placeholder.search')"
          />
        </div>
        <UiButton
          type="primary"
          icon="ant-design:plus-outlined"
          @click="showCreateModal"
          colorClass="flex items-center"
        >
          {{ t("categories.add") }}
        </UiButton>
      </div>
    </div>

    <Table
      :columns="columns"
      :dataSource="categories"
      :pagination="{
        current: categoryStore.pagination.page,
        pageSize: categoryStore.pagination.limit,
        total: categoryStore.pagination.total,
        showSizeChanger: true,
        pageSizeOptions,
      }"
      row-key="id"
      :loading="categoryStore.loading"
      @change="handleTableChange"
    >
      <template #actions="{ record }">
        <div class="flex gap-2">
          <UiButton
            type=""
            icon="ant-design:edit-outlined"
            size="small"
            @click="showEditModal(record)"
            colorClass="flex items-center justify-center text-orange-400"
          >
          </UiButton>
          <UiButton
            type=""
            danger
            icon="ant-design:delete-outlined"
            colorClass="flex items-center justify-center text-red-700"
            size="small"
            @click="showDeleteModal(record)"
          >
          </UiButton>
        </div>
      </template>
    </Table>

    <!-- Create Modal -->
    <UiModal
      :title="t('categories.header_form.add')"
      :visible="createModalVisible"
      :confirm-loading="loading"
      @update:visible="createModalVisible = $event"
      @ok="handleCreate"
      @cancel="createModalVisible = false"
      :cancelText="t('button.cancel')"
      :okText="t('button.confirm')"
    >
      <div v-if="errorMessage" class="text-red-500 mb-2">{{ errorMessage }}</div>
      <UiForm ref="formRef" :model="formModel" :rules="rules">
        <UiFormItem :label="t('categories.field.name')" name="name" required>
          <UiInput v-model="formModel.name" :placeholder="t('categories.placeholder.name')" />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Edit Modal -->
    <UiModal
      :title="t('categories.header_form.edit')"
      :visible="editModalVisible"
      :confirm-loading="loading"
      @update:visible="editModalVisible = $event"
      @ok="handleEdit"
      @cancel="editModalVisible = false"
      :cancelText="t('button.cancel')"
      :okText="t('button.confirm')"
    >
      <div v-if="errorMessage" class="text-red-500 mb-2">{{ errorMessage }}</div>
      <UiForm ref="formRef" :model="formModel" :rules="rules">
        <UiFormItem :label="t('categories.field.name')" name="name" required>
          <UiInput v-model="formModel.name" :placeholder="t('categories.placeholder.name')" />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('categories.header_form.delete.title')"
      :visible="deleteModalVisible"
      :confirm-loading="loading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDelete"
      :cancelText="t('button.cancel')"
      @cancel="deleteModalVisible = false"
      :okText="t('button.confirm')"
      okType="primary"
    >
      <p>{{ t("categories.header_form.delete.content") }} "{{ selectedCategory?.name }}"?</p>
      <p class="text-red-500">{{ t("categories.header_form.delete.description") }}</p>
    </UiModal>
  </div>
</template>

<style scoped>
.category-list-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
