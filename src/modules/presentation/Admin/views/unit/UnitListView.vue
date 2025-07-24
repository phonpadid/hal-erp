<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import type { UnitApiModel } from "@/modules/interfaces/unit.interface";
import { useUnitStore } from "@/modules/presentation/Admin/stores/unit.store";
import { Unit } from "@/modules/domain/entities/unit.entity";
import { getColumns } from "./column";
import { rules } from "./validation/unit.validate";
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
const unitStore = useUnitStore();
const units = ref<UnitApiModel[]>([]);
const formRef = ref();
const createModalVisible = ref(false);
const editModalVisible = ref(false);
const deleteModalVisible = ref(false);
const loading = ref(false);
const selectedUnit = ref<UnitApiModel | null>(null);
const formModel = reactive({ name: "" });

const pageSizeOptions = ["10", "20", "50", "100"];

onMounted(async () => {
  await loadUnits();
});

watch(search, async (newValue) => {
  if (!newValue) {
    await loadUnits();
  }
});

const loadUnits = async (): Promise<void> => {
  loading.value = true;
  try {
    const result = await unitStore.fetchUnits({
      page: unitStore.pagination.page,
      limit: unitStore.pagination.limit,
    });
    units.value = result.data.map((unit: Unit) => ({
      id: parseInt(unit.getId()),
      name: unit.getName(),
      created_at: unit.getCreatedAt(),
      updated_at: unit.getUpdatedAt(),
    }));
  } catch (error) {
    console.log("error", error);
  } finally {
    loading.value = false;
  }
};

const handleTableChange = async (pagination: TablePaginationType) => {
  unitStore.setPagination({
    page: pagination.current ?? 1,
    limit: pagination.pageSize ?? 10,
    total: pagination.total ?? 0,
  });
  await loadUnits();
};

const showCreateModal = (): void => {
  formModel.name = "";
  createModalVisible.value = true;
};

const showEditModal = (record: UnitApiModel): void => {
  selectedUnit.value = record;
  formModel.name = record.name;
  editModalVisible.value = true;
};

const showDeleteModal = (record: UnitApiModel): void => {
  selectedUnit.value = record;
  deleteModalVisible.value = true;
};

const handleSearch = async () => {
  loading.value = true;
  try {
    const result = await unitStore.fetchUnits({
      page: 1,
      limit: unitStore.pagination.limit,
      search: search.value,
    });
    units.value = result.data.map((unit: Unit) => ({
      id: parseInt(unit.getId()),
      name: unit.getName(),
      created_at: unit.getCreatedAt(),
      updated_at: unit.getUpdatedAt(),
    }));
    unitStore.setPagination({
      page: 1,
      limit: unitStore.pagination.limit,
      total: result.total ?? 0,
    });
  } catch (error) {
    console.error("Search failed:", error);
  } finally {
    loading.value = false;
  }
};

const handleCreate = async (): Promise<void> => {
  loading.value = true;
  try {
    await formRef.value.submitForm();
    await unitStore.createUnit({ name: formModel.name });
    success(t("units.notify.created"));
    await loadUnits();
    createModalVisible.value = false;
    formModel.name = "";
  } catch (error) {
    console.error("Create form validation failed:", error);
  } finally {
    loading.value = false;
  }
};

const handleEdit = async (): Promise<void> => {
  loading.value = true;
  try {
    await formRef.value.submitForm();

    if (selectedUnit.value) {
      const id = selectedUnit.value.id.toString();
      await unitStore.updateUnit(id, { name: formModel.name });
      success(t("units.notify.updated"));
      await loadUnits();
    }
    editModalVisible.value = false;
  } catch (error) {
    console.error("Edit form validation failed:", error);
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (): Promise<void> => {
  if (!selectedUnit.value) return;
  loading.value = true;
  try {
    const id = selectedUnit.value.id.toString();
    await unitStore.deleteUnit(id);
    success(t("units.notify.deleted"));
    await loadUnits();
    deleteModalVisible.value = false;
  } catch (error) {
    console.error("Delete failed:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="unit-list-container p-6">
    <div class="mb-6 gap-4">
      <h1 class="text-2xl font-semibold">
        {{ t("units.title") }}
      </h1>
      <div class="flex justify-between gap-20">
        <div class="w-[20rem]">
          <InputSearch
            v-model:value="search"
            @keyup.enter="handleSearch"
            :placeholder="t('units.placeholder.search')"
          />
        </div>
        <UiButton
          type="primary"
          icon="ant-design:plus-outlined"
          @click="showCreateModal"
          colorClass="flex items-center"
        >
          {{ t("units.add") }}
        </UiButton>
      </div>
    </div>

    <!-- Table -->
    <Table
      :columns="columns"
      :dataSource="units"
      :pagination="{
        current: unitStore.pagination.page,
        pageSize: unitStore.pagination.limit,
        total: unitStore.pagination.total,
        showSizeChanger: true,
        pageSizeOptions,
      }"
      row-key="id"
      :loading="unitStore.loading"
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
      :title="t('units.header_form.add')"
      :visible="createModalVisible"
      :confirm-loading="loading"
      @update:visible="createModalVisible = $event"
      @ok="handleCreate"
      @cancel="createModalVisible = false"
      :cancelText="t('button.cancel')"
      :okText="t('button.confirm')"
    >
      <UiForm ref="formRef" :model="formModel" :rules="rules">
        <UiFormItem :label="t('units.field.name')" name="name" required>
          <UiInput v-model="formModel.name" :placeholder="t('units.placeholder.name')" />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Edit Modal -->
    <UiModal
      :title="t('units.header_form.edit')"
      :visible="editModalVisible"
      :confirm-loading="loading"
      @update:visible="editModalVisible = $event"
      @ok="handleEdit"
      @cancel="editModalVisible = false"
      :cancelText="t('button.cancel')"
      :okText="t('button.confirm')"
    >
      <UiForm ref="formRef" :model="formModel" :rules="rules">
        <UiFormItem :label="t('units.field.name')" name="name" required>
          <UiInput v-model="formModel.name" :placeholder="t('units.placeholder.name')" />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('units.header_form.delete.title')"
      :visible="deleteModalVisible"
      :confirm-loading="loading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDelete"
      :cancelText="t('button.cancel')"
      @cancel="deleteModalVisible = false"
      :okText="t('button.confirm')"
      okType="primary"
    >
      <p>{{ t("units.header_form.delete.content") }} "{{ selectedUnit?.name }}"?</p>
      <p class="text-red-500">{{ t("units.header_form.delete.description") }}</p>
    </UiModal>
  </div>
</template>

<style scoped>
.unit-list-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
