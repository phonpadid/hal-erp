<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { columns } from "./column";
import type { DepartmentApiModel } from "@/modules/interfaces/departments/department.interface";
import type { DepartmentEntity } from "@/modules/domain/entities/departments/department.entity";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import { dataDpm } from "@/modules/shared/utils/data.department";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import { useI18n } from "vue-i18n";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import { dpmRules } from "./validation/department.validate";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { departmentStore } from "../../stores/departments/department.store";

const { t } = useI18n();
const dpmStore = departmentStore();
const department = ref<DepartmentApiModel[]>([]);
const useRealApi = ref<boolean>(true);
const { success, error } = useNotification();
const formRef = ref();
const createModalVisible = ref<boolean>(false);
const editModalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const loading = ref<boolean>(false);
const selectedDpm = ref<DepartmentApiModel | null>(null);

// Form model
const formModel = reactive({
  name: "",
  code: "",
});

// Load data on component mount
onMounted(async () => {
  await loadDpm();
});

const loadDpm = async (): Promise<void> => {
  if (useRealApi.value) {
    try {
      loading.value = true;
      const result = await dpmStore.fetchDepartment({
        page: dpmStore.pagination.page,
        limit: dpmStore.pagination.limit,
      });

      department.value = result.data.map((dpm: DepartmentEntity) => {
        return {
          id: Number(dpm.getId()),
          name: dpm.getName(),
          code: dpm.getCode(),
          createdAt: dpm.getCreatedAt(),
          updatedAt: dpm.getUpdatedAt(),
        };
      });

      console.log("Department data loaded:", department.value);
    } catch (error) {
      console.error("Failed to fetch department from API:", error);
      department.value = [...dataDpm.value];
    } finally {
      loading.value = false;
    }
  } else {
    department.value = [...dataDpm.value];
  }
};

// CRUD operations
const showCreateModal = (): void => {
  formModel.name = "";
  formModel.code = "";
  createModalVisible.value = true;
};

const showEditModal = (record: DepartmentApiModel): void => {
  selectedDpm.value = record;
  formModel.name = record.name;
  formModel.code = record.code || "";
  editModalVisible.value = true;
};

const showDeleteModal = (record: DepartmentApiModel): void => {
  selectedDpm.value = record;
  deleteModalVisible.value = true;
};

const handleCreate = async (): Promise<void> => {
  try {
    loading.value = true;
    await formRef.value.submitForm();

    await dpmStore.createDepartment({
      name: formModel.name,
      code: formModel.code,
    });
    success(t("departments.notify.created"));
    await loadDpm(); // Refresh the list
    createModalVisible.value = false;
    formModel.name = "";
    formModel.code = "";
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

    if (selectedDpm.value) {
      const id = selectedDpm.value.id.toString();
      await dpmStore.updateDepartment(id, {
        id,
        name: formModel.name,
        code: formModel.code,
      });
      success(t("departments.notify.update"));
      await loadDpm();
    }

    editModalVisible.value = false;
  } catch (error) {
    console.error("Edit form validation failed:", error);
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (): Promise<void> => {
  if (!selectedDpm.value) return;

  loading.value = true;
  try {
    // Use API to delete
    const id = selectedDpm.value.id.toString();
    await dpmStore.deleteDepartment(id);
    success(t("departments.notify.delete"));
    await loadDpm(); // Refresh the list
  } catch (error) {
    console.error("Delete failed:", error);
  }

  deleteModalVisible.value = false;
  loading.value = false;
};
const handleTableChange = async (pagination: any) => {
  dpmStore.setPagination({
    page: pagination.current,
    limit: pagination.pageSize,
  });
  await loadDpm();
};
</script>

<template>
  <div class="unit-list-container p-6">
    <div class="mb-6 gap-4">
      <h1 class="text-2xl font-semibold">
        {{ $t("departments.dpm.title") }}
      </h1>
      <div class="flex justify-between gap-20">
        <div class="w-[20rem]">
          <InputSearch :placeholder="t('departments.dpm.placeholder.search')" />
        </div>
        <UiButton
          type="primary"
          icon="ant-design:plus-outlined"
          @click="showCreateModal"
          colorClass="flex items-center"
        >
          {{ $t("departments.dpm.add") }}
        </UiButton>
      </div>
    </div>

    <!--  Table -->
    <Table
      :columns="columns(t)"
      :dataSource="department"
      :pagination="{
        current: dpmStore.pagination.page,
        pageSize: dpmStore.pagination.limit,
        total: dpmStore.pagination.total,
      }"
      row-key="id"
      :loading="dpmStore.loading"
      @change="handleTableChange"
    >
      <template #actions="{ record }">
        <div class="flex items-center justify-center gap-2">
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
      :title="t('departments.dpm.header_form.add')"
      :visible="createModalVisible"
      :confirm-loading="loading"
      @update:visible="createModalVisible = $event"
      @ok="handleCreate"
      @cancel="createModalVisible = false"
      :okText="t('button.save')"
      :cancelText="t('button.cancel')"
    >
      <UiForm ref="formRef" :model="formModel" :rules="dpmRules(t)">
        <UiFormItem :label="t('departments.dpm.field.code')" name="code" required>
          <UiInput v-model="formModel.code" :placeholder="t('departments.dpm.placeholder.code')" />
        </UiFormItem>
        <UiFormItem :label="t('departments.dpm.field.name')" name="name" required>
          <UiInput v-model="formModel.name" :placeholder="t('departments.dpm.placeholder.name')" />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Edit Modal -->
    <UiModal
      :title="t('departments.dpm.header_form.edit')"
      :visible="editModalVisible"
      :confirm-loading="loading"
      @update:visible="editModalVisible = $event"
      @ok="handleEdit"
      @cancel="editModalVisible = false"
      :okText="t('button.edit')"
      :cancelText="t('button.cancel')"
    >
      <UiForm ref="formRef" :model="formModel" :rules="dpmRules(t)">
        <UiFormItem :label="t('departments.dpm.field.code')" name="code" required>
          <UiInput v-model="formModel.code" :placeholder="t('departments.dpm.placeholder.code')" />
        </UiFormItem>
        <UiFormItem :label="t('departments.dpm.field.name')" name="name" required>
          <UiInput v-model="formModel.name" :placeholder="t('departments.dpm.placeholder.name')" />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('departments.alert.confirm')"
      :visible="deleteModalVisible"
      :confirm-loading="loading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDelete"
      @cancel="deleteModalVisible = false"
      :okText="t('button.ok')"
      :cancelText="t('button.cancel')"
      okType="primary"
    >
      <p>{{ $t("departments.alert.message") }}: "{{ selectedDpm?.name }}"?</p>
      <p class="text-red-500">
        {{ t("departments.alert.remark") }}
      </p>
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
