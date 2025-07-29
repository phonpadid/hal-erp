<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { PositionInterface } from "@/modules/interfaces/position.interface";
import { usePositionStore } from "../../stores/position.store";
import { Columns } from "./column";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import PositionForm from "@/modules/presentation/Admin/components/position/FormPosition.vue";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";

const { t } = useI18n();

const positionStore = usePositionStore();
const { success, error, warning } = useNotification();

// State
const loading = ref<boolean>(false);
const searchKeyword = ref<string>("");

// Modal state
const modalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const submitLoading = ref<boolean>(false);
const selectedPosition = ref<PositionInterface | null>(null);
const isEditMode = ref<boolean>(false);
const positionFormRef = ref();

// Table pagination
const tablePagination = computed(() => ({
  current: positionStore.pagination.page,
  pageSize: positionStore.pagination.limit,
  total: positionStore.pagination.total,
  showSizeChanger: true,
}));

onMounted(async () => {
  await loadPositions();
});

const loadPositions = async () => {
  loading.value = true;

  try {
    await positionStore.fetchPositions({
      page: positionStore.pagination.page,
      limit: positionStore.pagination.limit,
      search: searchKeyword.value,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("position.error.loadFailed"), String(errorMessage));
  } finally {
    loading.value = false;
  }
};

// Handle pagination and sorting
const handleTableChange = (
  pagination: TablePaginationType
) => {
  positionStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total || 0,
  })
  loadPositions();
};

const handleSearch = async () => {
  await positionStore.fetchPositions({
    page: 1,
    limit: positionStore.pagination.limit,
    search: searchKeyword.value,
  });
};

watch(searchKeyword, async(newVal: string) => {
  if(newVal === '') {
    positionStore.setPagination({
      page: 1,
      limit: positionStore.pagination.limit,
      total: positionStore.pagination.total,
    })
    await loadPositions()
  }
})

// Modal handlers
const showCreateModal = () => {
  selectedPosition.value = null;
  isEditMode.value = false;
  modalVisible.value = true;
};

const showEditModal = (position: PositionInterface) => {
  selectedPosition.value = { ...position };
  isEditMode.value = true;
  modalVisible.value = true;
};

const showDeleteModal = (position: PositionInterface) => {
  selectedPosition.value = position;
  deleteModalVisible.value = true;
};

const handleModalOk = () => {
  positionFormRef.value?.submitForm();
};

const handleModalCancel = () => {
  modalVisible.value = false;
};

const handleFormSubmit = async (formData: { name: string }) => {
  try {
    submitLoading.value = true;

    if (isEditMode.value && selectedPosition.value) {
      await positionStore.updatePosition(selectedPosition.value.id.toString(), {
        ...formData,
      });
      success(t("positions.success.title"), t("positions.success.updated"));
    } else {
      await positionStore.createPosition(formData);
      success(t("positions.success.title"), t("positions.success.created"));
    }

    modalVisible.value = false;
    await loadPositions();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("positions.error.title"), String(errorMessage));
  } finally {
    submitLoading.value = false;
  }
};

const handleDeleteConfirm = async () => {
  if (!selectedPosition.value) return;

  try {
    submitLoading.value = true;
    await positionStore.deletePosition(selectedPosition.value.id.toString());
    success(t("positions.success.title"), t("positions.success.deleted"));

    deleteModalVisible.value = false;
    await loadPositions();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("positions.error.deleteFailed"), String(errorMessage));
  } finally {
    submitLoading.value = false;
  }
};
</script>

<template>
  <div class="position-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ t("positions.title") }}</h1>
      </div>

      <div class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit">
        <InputSearch
          v-model:value="searchKeyword"
          @keyup.enter="handleSearch"
          :placeholder="t('positions.placeholder.search')"
        />
        <UiButton
          type="primary"
          icon="ant-design:plus-outlined"
          @click="showCreateModal"
          colorClass="text-white flex items-center"
        >
          {{ t("positions.add") }}
        </UiButton>
      </div>
    </div>

    <!-- Positions Table -->
    <Table
      :columns="Columns(t)"
      :dataSource="positionStore.positions"
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

    <!-- Create/Edit Position Modal -->
    <UiModal
      :title="isEditMode ? t('positions.modal.edit') : t('positions.modal.create')"
      :visible="modalVisible"
      :confirm-loading="submitLoading"
      @update:visible="modalVisible = $event"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :okText="isEditMode ? t('button.edit') : t('button.save')"
      :cancelText="t('button.cancel')"
    >

      <PositionForm
        ref="positionFormRef"
        :position="selectedPosition"
        :is-edit-mode="isEditMode"
        :loading="submitLoading"
        @submit="handleFormSubmit"
      />
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('positions.modal.delete')"
      :visible="deleteModalVisible"
      :confirm-loading="submitLoading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDeleteConfirm"
      @cancel="deleteModalVisible = false"
      ok-text="ຢືນຢັນ"
      ok-type="primary"
      :danger="true"
    >
      <p>{{ $t("positions.modal.deleteConfirm", { name: selectedPosition?.name }) }}</p>
      <p class="text-red-500">{{ $t("positions.modal.deleteWarning") }}</p>
    </UiModal>
  </div>
</template>

<style scoped>
.position-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
