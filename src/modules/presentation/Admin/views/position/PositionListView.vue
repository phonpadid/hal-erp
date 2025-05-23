<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import type { PositionApiModel } from "@/modules/interfaces/position.interface";
import { usePositionStore } from "@/modules/presentation/Admin/stores/position.store";
import { Position } from "@/modules/domain/entities/position.entities";
import { getColumns } from "./column";
import {dataPositions} from "@/modules/shared/utils/data.position";
import { rules } from "./validation/position.validate";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";

// change the language in the system
const { t } = useI18n();
// Make columns reactive to language changes
const columns = computed(() => getColumns(t));

const positionStore = usePositionStore();
const positions = ref<PositionApiModel[]>([]);
const useRealApi = ref<boolean>(false);

// Form related
const formRef = ref();
const createModalVisible = ref<boolean>(false);
const editModalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const loading = ref<boolean>(false);
const selectedPosition = ref<PositionApiModel | null>(null);

// Form model
const formModel = reactive({
  name: "",
});

onMounted(async () => {
  await loadPositions();
});

const loadPositions = async (): Promise<void> => {
  if (useRealApi.value) {
    try {
      loading.value = true;
      const result = await positionStore.fetchPositions();

      positions.value = result.data.map((position: Position) => ({
        id: parseInt(position.getId()),
        name: position.getName(),
        created_at: position.getCreatedAt().toISOString().replace("T", " ").substring(0, 19),
        updated_at: position.getUpdatedAt().toISOString().replace("T", " ").substring(0, 19),
      }));
    } catch (error) {
      console.error("Failed to fetch positions from API:", error);
      positions.value = [...dataPositions.value];
    } finally {
      loading.value = false;
    }
  } else {
    positions.value = [...dataPositions.value];
  }
};

const toggleApiMode = (): void => {
  useRealApi.value = !useRealApi.value;
  loadPositions();
};

const showCreateModal = (): void => {
  formModel.name = "";
  createModalVisible.value = true;
};

const showEditModal = (record: PositionApiModel): void => {
  selectedPosition.value = record;
  formModel.name = record.name;
  editModalVisible.value = true;
};

const showDeleteModal = (record: PositionApiModel): void => {
  selectedPosition.value = record;
  deleteModalVisible.value = true;
};

const handleCreate = async (): Promise<void> => {
  try {
    loading.value = true;
    await formRef.value.submitForm();

    if (useRealApi.value) {
      await positionStore.createPosition({ name: formModel.name });
      await loadPositions();
    } else {
      const now = new Date().toISOString().replace("T", " ").substring(0, 19);
      const newPosition: PositionApiModel = {
        id: positions.value.length + 1,
        name: formModel.name,
        created_at: now,
        updated_at: now,
      };
      positions.value.push(newPosition);
      dataPositions.value.push(newPosition);
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

    if (selectedPosition.value) {
      if (useRealApi.value) {
        const id = selectedPosition.value.id.toString();
        await positionStore.updatePosition(id, { name: formModel.name });
        await loadPositions();
      } else {
        const index = positions.value.findIndex((p) => p.id === selectedPosition.value!.id);
        if (index !== -1) {
          const now = new Date().toISOString().replace("T", " ").substring(0, 19);
          positions.value[index] = {
            ...positions.value[index],
            name: formModel.name,
            updated_at: now,
          };
          const mockIndex = dataPositions.value.findIndex((p) => p.id === selectedPosition.value!.id);
          if (mockIndex !== -1) {
            dataPositions.value[mockIndex] = { ...positions.value[index] };
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
  if (!selectedPosition.value) return;

  loading.value = true;

  if (useRealApi.value) {
    try {
      const id = selectedPosition.value.id.toString();
      await positionStore.deletePosition(id);
      await loadPositions();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  } else {
    positions.value = positions.value.filter((p) => p.id !== selectedPosition.value!.id);
    dataPositions.value = dataPositions.value.filter((p) => p.id !== selectedPosition.value!.id);
  }

  deleteModalVisible.value = false;
  loading.value = false;
};
</script>

<template>
  <div class="position-list-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ t('positions.title') }}</h1>
        <div class="flex items-center mt-2">
          <span class="mr-2 text-sm">
            {{ t('button.mode') }}: {{ useRealApi ? t('positions.real_api', 'API ແທ້') : t('positions.mock_data', 'Mock Data') }}
          </span>
          <button
            @click="toggleApiMode"
            class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
          >
            {{ t('button.mode', 'ສະລັບໂໝດ') }}
          </button>
        </div>
      </div>

      <UiButton
        type="primary"
        icon="ant-design:plus-outlined"
        @click="showCreateModal"
        colorClass="flex items-center"
      >
        {{ t('positions.add') }}
      </UiButton>
    </div>

    <div v-if="positionStore.loading || loading" class="text-center py-4">
      <p>{{ t('messages.loading') }}</p>
    </div>

    <Table :columns="columns" :dataSource="positions" :pagination="{ pageSize: 10 }" row-key="id">
      <template #actions="{ record }">
        <div class="flex gap-2">
          <UiButton
            type="primary"
            icon="ant-design:edit-outlined"
            size="small"
            @click="showEditModal(record)"
            colorClass="flex items-center"
          >
            {{ t('button.edit') }}
          </UiButton>
          <UiButton
            type="primary"
            danger
            icon="ant-design:delete-outlined"
            size="small"
            colorClass="flex items-center"
            @click="showDeleteModal(record)"
          >
            {{ t('button.delete') }}
          </UiButton>
        </div>
      </template>
    </Table>

    <!-- Create Modal -->
    <UiModal
      :title="t('positions.header_form.add')"
      :visible="createModalVisible"
      :confirm-loading="loading"
      @update:visible="createModalVisible = $event"
      @ok="handleCreate"
      @cancel="createModalVisible = false"
      :cancelText="t('button.cancel')"
      :okText="t('button.confirm')"
    >
      <UiForm ref="formRef" :model="formModel" :rules="rules">
        <UiFormItem :label="t('positions.field.name')" name="name" required>
          <UiInput v-model="formModel.name" :placeholder="t('positions.placeholder.name')" />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Edit Modal -->
    <UiModal
      :title="t('positions.header_form.edit')"
      :visible="editModalVisible"
      :confirm-loading="loading"
      @update:visible="editModalVisible = $event"
      @ok="handleEdit"
      @cancel="editModalVisible = false"
      :cancelText="t('button.cancel')"
      :okText="t('button.confirm')"
    >
      <UiForm ref="formRef" :model="formModel" :rules="rules">
        <UiFormItem :label="t('positions.field.name')" name="name" required>
          <UiInput v-model="formModel.name" :placeholder="t('positions.placeholder.name')" />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Delete Modal -->
    <UiModal
      :title="t('positions.header_form.delete.title')"
      :visible="deleteModalVisible"
      :confirm-loading="loading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDelete"
      @cancel="deleteModalVisible = false"
      :okText="t('button.confirm')"
      :cancelText="t('button.cancel')"
      okType="primary"
    >
      <p>{{ t('positions.header_form.delete.content') }} "{{ selectedPosition?.name }}"?</p>
      <p class="text-red-500">{{ t('positions.header_form.delete.description') }}</p>
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
