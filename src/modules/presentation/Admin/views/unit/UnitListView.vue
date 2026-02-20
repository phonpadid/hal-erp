<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { UnitInterface } from "@/modules/interfaces/unit.interface";
import { useUnitStore } from "../../stores/unit.store";
import { Columns } from "./column";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { usePermissions } from "@/modules/shared/utils/usePermissions";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UnitForm from "@/modules/presentation/Admin/components/unit/FormUnit.vue";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";

const { t } = useI18n();

const unitStore = useUnitStore();
const { success, error, warning } = useNotification();
const { hasPermission } = usePermissions();

// State
const loading = ref<boolean>(false);
const searchKeyword = ref<string>("");

// Modal state
const modalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const submitLoading = ref<boolean>(false);
const selectedUnit = ref<UnitInterface | null>(null);
const isEditMode = ref<boolean>(false);
const unitFormRef = ref();

// check show buttons
const canCreateUnit = computed(() => hasPermission("create-unit"));
const canEditUnit = computed(() => hasPermission("update-unit"));
const canDeleteUnit = computed(() => hasPermission("delete-unit"));

// Table pagination
const tablePagination = computed(() => ({
  current: unitStore.pagination.page,
  pageSize: unitStore.pagination.limit,
  total: unitStore.pagination.total,
  showSizeChanger: true,
}));

onMounted(async () => {
  await loadUnits();
});

const loadUnits = async () => {
  loading.value = true;

  try {
    await unitStore.fetchUnits({
      page: unitStore.pagination.page,
      limit: unitStore.pagination.limit,
      search: searchKeyword.value,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("units.error.loadFailed"), String(errorMessage));
  } finally {
    loading.value = false;
  }
};

// Handle pagination and sorting
const handleTableChange = (
  pagination: TablePaginationType
) => {
  unitStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total || 0,
  })
  loadUnits();
};

const handleSearch = async () => {
  await unitStore.fetchUnits({
    page: 1,
    limit: unitStore.pagination.limit,
    search: searchKeyword.value,
  });
};

watch(searchKeyword, async(newVal: string) => {
  if(newVal === '') {
    unitStore.setPagination({
      page: 1,
      limit: unitStore.pagination.limit,
      total: unitStore.pagination.total,
    })
    await loadUnits()
  }
})

// Modal handlers
const showCreateModal = () => {
  selectedUnit.value = null;
  isEditMode.value = false;
  modalVisible.value = true;
};

const showEditModal = (unit: UnitInterface) => {
  selectedUnit.value = { ...unit };
  isEditMode.value = true;
  modalVisible.value = true;
};

const showDeleteModal = (unit: UnitInterface) => {
  selectedUnit.value = unit;
  deleteModalVisible.value = true;
};

const handleModalOk = () => {
  unitFormRef.value?.submitForm();
};

const handleModalCancel = () => {
  modalVisible.value = false;
};

const handleFormSubmit = async (formData: { name: string }) => {
  try {
    submitLoading.value = true;

    if (isEditMode.value && selectedUnit.value) {
      await unitStore.updateUnit(selectedUnit.value.id.toString(), {
        ...formData,
      });
      success(t("units.success.title"), t("units.success.updated"));
    } else {
      await unitStore.createUnit(formData);
      success(t("units.success.title"), t("units.success.created"));
    }

    modalVisible.value = false;
    await loadUnits();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("units.error.title"), String(errorMessage));
  } finally {
    submitLoading.value = false;
  }
};

const handleDeleteConfirm = async () => {
  if (!selectedUnit.value) return;

  try {
    submitLoading.value = true;
    await unitStore.deleteUnit(selectedUnit.value.id.toString());
    success(t("units.success.title"), t("units.success.deleted"));

    deleteModalVisible.value = false;
    await loadUnits();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("units.error.deleteFailed"), String(errorMessage));
  } finally {
    submitLoading.value = false;
  }
};
</script>

<template>
  <div class="unit-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ t("units.title") }}</h1>
      </div>

      <div class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit">
        <InputSearch
          v-model:value="searchKeyword"
          @keyup.enter="handleSearch"
          :placeholder="t('units.placeholder.search')"
        />
        <UiButton
          v-if="canCreateUnit"
          type="primary"
          icon="ant-design:plus-outlined"
          @click="showCreateModal"
          colorClass="text-white flex items-center"
        >
          {{ t("units.add") }}
        </UiButton>
      </div>
    </div>

    <!-- Units Table -->
    <Table
      :columns="Columns(t)"
      :dataSource="unitStore.units"
      :pagination="tablePagination"
      :loading="loading"
      row-key="id"

      @change="handleTableChange"
    >

      <!-- Actions column -->
      <template #actions="{ record }">
        <div class="flex items-center justify-center gap-2">
          <UiButton
            v-if="canEditUnit"
            type=""
            icon="ant-design:edit-outlined"
            shape="circle" 
            size="small"
            @click="showEditModal(record)"
            colorClass="flex items-center justify-center text-orange-400"
            :disabled="!!record.deleted_at"
          />

          <UiButton
            v-if="canDeleteUnit"
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

    <!-- Create/Edit Unit Modal -->
    <UiModal
      :title="isEditMode ? t('units.modal.edit') : t('units.modal.create')"
      :visible="modalVisible"
      :confirm-loading="submitLoading"
      @update:visible="modalVisible = $event"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :okText="isEditMode ? t('button.edit') : t('button.save')"
      :cancelText="t('button.cancel')"
    >

      <UnitForm
        ref="unitFormRef"
        :unit="selectedUnit"
        :is-edit-mode="isEditMode"
        :loading="submitLoading"
        @submit="handleFormSubmit"
      />
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('units.modal.delete')"
      :visible="deleteModalVisible"
      :confirm-loading="submitLoading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDeleteConfirm"
      @cancel="deleteModalVisible = false"
      ok-text="ຢືນຢັນ"
      ok-type="primary"
      :danger="true"
    >
      <p>{{ $t("units.modal.deleteConfirm", { name: selectedUnit?.name }) }}</p>
      <p class="text-red-500">{{ $t("units.modal.deleteWarning") }}</p>
    </UiModal>
  </div>
</template>

<style scoped>
.unit-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
