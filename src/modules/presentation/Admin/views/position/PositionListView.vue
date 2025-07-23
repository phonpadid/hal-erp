<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import type { PositionApiModel } from "@/modules/interfaces/position.interface";
import { usePositionStore } from "@/modules/presentation/Admin/stores/position.store";
import { Position } from "@/modules/domain/entities/position.entities";
import { getColumns } from "./column";
import { rules } from "./validation/position.validate";
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
const positionStore = usePositionStore();
const positions = ref<PositionApiModel[]>([]);
const formRef = ref();
const createModalVisible = ref(false);
const editModalVisible = ref(false);
const deleteModalVisible = ref(false);
const loading = ref(false);
const selectedPosition = ref<PositionApiModel | null>(null);
const errorMessage = ref("");
const formModel = reactive({ name: "" });


const pageSizeOptions = ["10", "20", "50", "100"];

onMounted(async () => {
  await loadPositions();
});

watch(search, async (newValue) => {
  if (!newValue) {
    await loadPositions();
  }
})

const loadPositions = async (): Promise<void> => {
  loading.value = true;
  try {
    const result = await positionStore.fetchPositions({
      page: positionStore.pagination.page,
      limit: positionStore.pagination.limit,
    });
    positions.value = result.data.map((position: Position) => ({
      id: parseInt(position.getId()),
      name: position.getName(),
      created_at: position.getCreatedAt(),
      updated_at: position.getUpdatedAt(),
    }));
  } catch (error) {
    console.log("error", error);
  } finally {
    loading.value = false;
  }
};

const handleTableChange = async (pagination: TablePaginationType) => {
  positionStore.setPagination({
    page: pagination.current ?? 1,
    limit: pagination.pageSize ?? 10,
    total: pagination.total ?? 0,
  });
  await loadPositions();
};

const handleSearch = async () => {
  loading.value = true;
  try {
    const result = await positionStore.fetchPositions({
      page: 1,
      limit: positionStore.pagination.limit,
      search: search.value,
    });
    positions.value = result.data.map((position: Position) => ({
      id: parseInt(position.getId()),
      name: position.getName(),
      created_at: position.getCreatedAt(),
      updated_at: position.getUpdatedAt(),
    }));
    positionStore.setPagination({
      page: 1,
      limit: positionStore.pagination.limit,
      total: positionStore.pagination.total ?? 0,
    });
  } catch (error) {
    console.error("Search failed:", error);
  } finally {
    loading.value = false;
  }
}

const showCreateModal = (): void => {
  formModel.name = "";
  errorMessage.value = "";
  createModalVisible.value = true;
};

const showEditModal = (record: PositionApiModel): void => {
  selectedPosition.value = record;
  formModel.name = record.name;
  errorMessage.value = "";
  editModalVisible.value = true;
};

const showDeleteModal = (record: PositionApiModel): void => {
  selectedPosition.value = record;
  deleteModalVisible.value = true;
};

const handleCreate = async (): Promise<void> => {
  loading.value = true;
  errorMessage.value = "";
  try {
    await formRef.value.submitForm();
    await positionStore.createPosition({ name: formModel.name });
    success(t('positions.notify.created'));
    await loadPositions();
    createModalVisible.value = false;
    formModel.name = "";
  } catch (error: any) {
    if (error.message && error.message.includes("already exists")) {
      errorMessage.value = t(
        "positions.error.duplicateName",
        "A position with this name already exists."
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
    if (selectedPosition.value) {
      const id = selectedPosition.value.id.toString();
      await positionStore.updatePosition(id, { name: formModel.name });
      success(t('positions.notify.updated'));
      await loadPositions();
      editModalVisible.value = false;
    }
  } catch (error: any) {
    if (error.message && error.message.includes("already exists")) {
      errorMessage.value = t(
        "positions.error.duplicateName",
        "A position with this name already exists."
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
  if (!selectedPosition.value) return;
  loading.value = true;
  try {
    const id = selectedPosition.value.id.toString();
    await positionStore.deletePosition(id);
    success(t('positions.notify.deleted'));
    await loadPositions();
    deleteModalVisible.value = false;
  } catch (error) {
    console.error("Delete failed:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="position-list-container p-6">
    <div class="mb-6 gap-4">
      <h1 class="text-2xl font-semibold">
        {{ t("positions.title") }}
      </h1>
      <div class="flex justify-between gap-20">
        <div class="w-[20rem]">
          <InputSearch v-model:value="search" @keyup.enter="handleSearch"
            :placeholder="t('positions.placeholder.search')" />
        </div>
        <UiButton type="primary" icon="ant-design:plus-outlined" @click="showCreateModal"
          colorClass="flex items-center">
          {{ t("positions.add") }}
        </UiButton>
      </div>
    </div>

    <!-- Table -->
    <Table :columns="columns" :dataSource="positions" :pagination="{
      current: positionStore.pagination.page,
      pageSize: positionStore.pagination.limit,
      total: positionStore.pagination.total,
      showSizeChanger: true,
      pageSizeOptions
    }" row-key="id" :loading="positionStore.loading" @change="handleTableChange">
      <template #actions="{ record }">
        <div class="flex gap-2">
          <UiButton type="" icon="ant-design:edit-outlined" size="small" @click="showEditModal(record)"
            colorClass="flex items-center justify-center text-orange-400" />
          <UiButton type="" danger icon="ant-design:delete-outlined"
            colorClass="flex items-center justify-center text-red-700" size="small" @click="showDeleteModal(record)" />
        </div>
      </template>
    </Table>

    <!-- Create Modal -->
    <UiModal :title="t('positions.header_form.add')" :visible="createModalVisible" :confirm-loading="loading"
      @update:visible="createModalVisible = $event" @ok="handleCreate" @cancel="createModalVisible = false"
      :cancelText="t('button.cancel')" :okText="t('button.confirm')">
      <div v-if="errorMessage" class="text-red-500 mb-2">{{ errorMessage }}</div>
      <UiForm ref="formRef" :model="formModel" :rules="rules">
        <UiFormItem :label="t('positions.field.name')" name="name" required>
          <UiInput v-model="formModel.name" :placeholder="t('positions.placeholder.name')" />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Edit Modal -->
    <UiModal :title="t('positions.header_form.edit')" :visible="editModalVisible" :confirm-loading="loading"
      @update:visible="editModalVisible = $event" @ok="handleEdit" @cancel="editModalVisible = false"
      :cancelText="t('button.cancel')" :okText="t('button.confirm')">
      <div v-if="errorMessage" class="text-red-500 mb-2">{{ errorMessage }}</div>
      <UiForm ref="formRef" :model="formModel" :rules="rules">
        <UiFormItem :label="t('positions.field.name')" name="name" required>
          <UiInput v-model="formModel.name" :placeholder="t('positions.placeholder.name')" />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal :title="t('positions.header_form.delete.title')" :visible="deleteModalVisible" :confirm-loading="loading"
      @update:visible="deleteModalVisible = $event" @ok="handleDelete" :cancelText="t('button.cancel')"
      @cancel="deleteModalVisible = false" :okText="t('button.confirm')" okType="primary">
      <p>{{ t("positions.header_form.delete.content") }} "{{ selectedPosition?.name }}"?</p>
      <p class="text-red-500">{{ t("positions.header_form.delete.description") }}</p>
    </UiModal>
  </div>
</template>

<style scoped>
.position-list-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
