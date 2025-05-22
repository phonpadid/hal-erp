<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import type { CategoryApiModel } from "@/modules/interfaces/category.interface";
import { useCategoryStore } from "@/modules/presentation/Admin/stores/category.store";
import { Category } from "@/modules/domain/entities/categories.entities";
import { columns } from "./column";
import { dataCategories } from "@/modules/shared/utils/data.category";
import { rules } from "./validation/category.vallidate";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";

// Initialize the category store
const categoryStore = useCategoryStore();
const categories = ref<CategoryApiModel[]>([]);
const useRealApi = ref<boolean>(false);

// Form related
const formRef = ref();
const createModalVisible = ref<boolean>(false);
const editModalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const loading = ref<boolean>(false);
const selectedCategory = ref<CategoryApiModel | null>(null);

// Form model
const formModel = reactive({
  name: "",
});

onMounted(async () => {
  await loadCategories();
});

const loadCategories = async (): Promise<void> => {
  if (useRealApi.value) {
    try {
      loading.value = true;
      const result = await categoryStore.fetchCategories();

      categories.value = result.data.map((category: Category) => ({
        id: parseInt(category.getId()),
        name: category.getName(),
        created_at: category.getCreatedAt().toISOString().replace("T", " ").substring(0, 19),
        updated_at: category.getUpdatedAt().toISOString().replace("T", " ").substring(0, 19),
      }));
    } catch (error) {
      console.error("Failed to fetch categories from API:", error);
      categories.value = [...dataCategories.value];
    } finally {
      loading.value = false;
    }
  } else {
    categories.value = [...dataCategories.value];
  }
};

const toggleApiMode = (): void => {
  useRealApi.value = !useRealApi.value;
  loadCategories();
};

const showCreateModal = (): void => {
  formModel.name = "";
  createModalVisible.value = true;
};

const showEditModal = (record: CategoryApiModel): void => {
  selectedCategory.value = record;
  formModel.name = record.name;
  editModalVisible.value = true;
};

const showDeleteModal = (record: CategoryApiModel): void => {
  selectedCategory.value = record;
  deleteModalVisible.value = true;
};

const handleCreate = async (): Promise<void> => {
  try {
    loading.value = true;
    await formRef.value.submitForm();

    if (useRealApi.value) {
      await categoryStore.createCategory({ name: formModel.name });
      await loadCategories();
    } else {
      const now = new Date().toISOString().replace("T", " ").substring(0, 19);
      const newCategory: CategoryApiModel = {
        id: categories.value.length + 1,
        name: formModel.name,
        created_at: now,
        updated_at: now,
      };
      categories.value.push(newCategory);
      dataCategories.value.push(newCategory);
    }

    createModalVisible.value = false;
    formModel.name = "";
  } catch (error) {
    console.error("Create form validation failed:", error);
  } finally {
    loading.value = false;
  }
};

const handleEdit = async (): Promise<void> => {
  try {
    loading.value = true;
    await formRef.value.submitForm();

    if (selectedCategory.value) {
      if (useRealApi.value) {
        const id = selectedCategory.value.id.toString();
        await categoryStore.updateCategory(id, { name: formModel.name });
        await loadCategories();
      } else {
        const index = categories.value.findIndex((c) => c.id === selectedCategory.value!.id);
        if (index !== -1) {
          const now = new Date().toISOString().replace("T", " ").substring(0, 19);
          categories.value[index] = {
            ...categories.value[index],
            name: formModel.name,
            updated_at: now,
          };
          const mockIndex = dataCategories.value.findIndex((c) => c.id === selectedCategory.value!.id);
          if (mockIndex !== -1) {
            dataCategories.value[mockIndex] = { ...categories.value[index] };
          }
        }
      }
    }

    editModalVisible.value = false;
  } catch (error) {
    console.error("Edit form validation failed:", error);
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (): Promise<void> => {
  if (!selectedCategory.value) return;

  loading.value = true;

  if (useRealApi.value) {
    try {
      const id = selectedCategory.value.id.toString();
      await categoryStore.deleteCategory(id);
      await loadCategories();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  } else {
    categories.value = categories.value.filter((c) => c.id !== selectedCategory.value!.id);
    dataCategories.value = dataCategories.value.filter((c) => c.id !== selectedCategory.value!.id);
  }

  deleteModalVisible.value = false;
  loading.value = false;
};
</script>

<template>
  <div class="category-list-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">ລາຍການໝວດໝູ່</h1>
        <div class="flex items-center mt-2">
          <span class="mr-2 text-sm">ໂໝດ: {{ useRealApi ? "API ແທ້" : "Mock Data" }}</span>
          <button
            @click="toggleApiMode"
            class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
          >
            ສະລັບໂໝດ
          </button>
        </div>
      </div>

      <UiButton
        type="primary"
        icon="ant-design:plus-outlined"
        @click="showCreateModal"
        colorClass="flex items-center"
      >
        ເພີ່ມໝວດໝູ່ໃໝ່
      </UiButton>
    </div>

    <div v-if="categoryStore.loading || loading" class="text-center py-4">
      <p>ກຳລັງໂຫຼດ...</p>
    </div>

    <Table :columns="columns" :dataSource="categories" :pagination="{ pageSize: 10 }" row-key="id">
      <template #actions="{ record }">
        <div class="flex gap-2">
          <UiButton
            type="primary"
            icon="ant-design:edit-outlined"
            size="small"
            @click="showEditModal(record)"
            colorClass="flex items-center"
          >
            ແກ້ໄຂ
          </UiButton>
          <UiButton
            type="primary"
            danger
            icon="ant-design:delete-outlined"
            size="small"
            colorClass="flex items-center"
            @click="showDeleteModal(record)"
          >
            ລຶບ
          </UiButton>
        </div>
      </template>
    </Table>

    <!-- Create Modal -->
    <UiModal
      title="ເພີ່ມໝວດໝູ່ໃໝ່"
      :visible="createModalVisible"
      :confirm-loading="loading"
      @update:visible="createModalVisible = $event"
      @ok="handleCreate"
      @cancel="createModalVisible = false"
    >
      <UiForm ref="formRef" :model="formModel" :rules="rules">
        <UiFormItem label="ຊື່ໝວດໝູ່" name="name" required>
          <UiInput v-model="formModel.name" placeholder="ກະລຸນາປ້ອນຊື່ໝວດໝູ່" />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Edit Modal -->
    <UiModal
      title="ແກ້ໄຂໝວດໝູ່"
      :visible="editModalVisible"
      :confirm-loading="loading"
      @update:visible="editModalVisible = $event"
      @ok="handleEdit"
      @cancel="editModalVisible = false"
    >
      <UiForm ref="formRef" :model="formModel" :rules="rules">
        <UiFormItem label="ຊື່ໝວດໝູ່" name="name" required>
          <UiInput v-model="formModel.name" placeholder="ກະລຸນາປ້ອນຊື່ໝວດໝູ່" />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Delete Modal -->
    <UiModal
      title="ຢືນຢັນການລຶບ"
      :visible="deleteModalVisible"
      :confirm-loading="loading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDelete"
      @cancel="deleteModalVisible = false"
      okText="ຢືນຢັນ"
      okType="primary"
    >
      <p>ທ່ານແນ່ໃຈບໍ່ວ່າຈະລຶບ "{{ selectedCategory?.name }}"?</p>
      <p class="text-red-500">ການລຶບນີ້ບໍ່ສາມາດຍົກເລີກໄດ້.</p>
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
