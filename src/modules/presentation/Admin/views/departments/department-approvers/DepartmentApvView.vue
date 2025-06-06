<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { columns } from "./column";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";

import { useI18n } from "vue-i18n";
import { dpmRules } from "../departments/validation/department.validate";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import { dpmApproverRules } from "./validation/department.validate";
import { departmentApproverStore } from "../../../stores/departments/department-approver.store";
import type { DepartmentApproverApiModel } from "@/modules/interfaces/departments/department-approver.interface";
import { departmentStore } from "../../../stores/departments/department.store";
import { useUserStore } from "../../../stores/user.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
import type { DepartmentApproverEntity } from "@/modules/domain/entities/departments/department-approver.entity";
const { t } = useI18n();
// Initialize the unit store
// departments data that will be displayed (from API or mock)
const departmentApv = ref<DepartmentApproverApiModel[]>([]);
const dpmStore = departmentStore();
// Form related
const formRef = ref();
const createModalVisible = ref<boolean>(false);
const editModalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const loading = ref<boolean>(false);
const selectedDpm = ref<DepartmentApproverApiModel | null>(null);
const userStore = useUserStore();
const { success } = useNotification();
const userItem = computed(() =>
  userStore.users.map((item) => ({
    value: item.getId(),
    label: item.getUsername(),
  }))
);
// Form model
const store = departmentApproverStore();
const formModel = store.dpmApproverFormModel;

// Load data on component mount
onMounted(async () => {
  await loadDpm();
  await dpmStore.fetchDepartment();
  await userStore.fetchUsers();
});

const loadDpm = async (): Promise<void> => {
  // if (useRealApi.value) {
  try {
    loading.value = true;
    const result = await store.fetchDepartmentApprover({
      page: store.pagination.page,
      limit: store.pagination.limit,
    });

    departmentApv.value = result.data.map(
      (dpmApv: DepartmentApproverEntity) => {
        const dpm = dpmApv.getDepartment();
        const user = dpmApv.getUser();

        return {
          id: Number(dpmApv.getId()), // ensure number
          user_id: Number(dpmApv.getUser_id()), // ensure number
          department: dpm
            ? {
                id: Number(dpm.getId()),
                code: dpm.getCode(),
                name: dpm.getName(),
              }
            : undefined,
          user: user
            ? {
                id: Number(user.getId()),
                username: user.getUsername(),
                tel: user.getTel(),
                email: user.getEmail(),
              }
            : undefined,
          created_at: dpmApv.getCreatedAt()?.toString() || "",
          updated_at: dpmApv.getUpdatedAt()?.toString() || "",
        };
      }
    );
  } catch (error) {
    console.error("Failed to fetch department from API:", error);
  } finally {
    loading.value = false;
  }
  // } else {
  // department.value = [...dataDpmUser.value];
  // }
};

// CRUD operations
const showCreateModal = (): void => {
  formModel.user_id = "";
  createModalVisible.value = true;
};

const showEditModal = (record: DepartmentApproverApiModel): void => {
  const userId = record.user?.id;
  selectedDpm.value = record;
  formModel.user_id = String(userId);
  editModalVisible.value = true;
};

const showDeleteModal = (record: DepartmentApproverApiModel): void => {
  selectedDpm.value = record;
  deleteModalVisible.value = true;
};

const handleCreate = async (): Promise<void> => {
  try {
    loading.value = true;
    await formRef.value.submitForm();
    await store.createDepartmentApprover({
      user_id: Number(formModel.user_id),
    });
    success(t("departments.notify.created"));
    await loadDpm(); // Refresh the list

    createModalVisible.value = false;
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
      await store.updateDepartmentApprover({
        id,
        user_id: formModel.user_id,
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

  try {
      // Use API to delete
      const id = selectedDpm.value.id.toString();
      await store.deleteDepartmentApprover(id);
      await loadDpm(); // Refresh the list
    } catch (error) {
      console.error("Delete failed:", error);
    }

  deleteModalVisible.value = false;
  loading.value = false;
};
</script>

<template>
  <div class="unit-list-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">
          {{ $t("departments.dpm_approver.title") }}
        </h1>
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
    <Table
      :columns="columns(t)"
      :dataSource="departmentApv"
      :pagination="{ pageSize: 10 }"
      row-key="id"
      :loading="store.loading"
    >
      <!-- Named slot: signature_file -->
      <template #signature_file="{ record }">
        <a-image :src="record.signature_file" :width="60" />
      </template>

      <!-- Named slot: actions -->
      <template #actions="{ record }">
        <div class="flex items-center justify-center gap-2">
          <UiButton
            icon="ant-design:edit-outlined"
            size="small"
            @click="showEditModal(record)"
            colorClass="flex items-center justify-center text-orange-400"
          />
          <UiButton
            icon="ant-design:delete-outlined"
            size="small"
            danger
            @click="showDeleteModal(record)"
            colorClass="flex items-center justify-center text-red-700"
          />
        </div>
      </template>
    </Table>

    <!-- Create Modalfffdf -->
    <UiModal
      :title="t('departments.dpm.header_form.add')"
      :visible="createModalVisible"
      :confirm-loading="loading"
      @update:visible="createModalVisible = $event"
      @ok="handleCreate"
      @cancel="createModalVisible = false"
    >
      <UiForm ref="formRef" :model="formModel" :rules="dpmApproverRules(t)">
        <UiFormItem
          :label="t('departments.dpm_user.field.user')"
          name="user_id"
          required
        >
          <InputSelect
            v-model="formModel.user_id"
            :options="userItem"
            :placeholder="t('departments.dpm_user.placeholder.user')"
          />
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
    >
      <UiForm ref="formRef" :model="formModel" :rules="dpmRules(t)">
        <UiFormItem
          :label="t('departments.dpm_user.field.user')"
          name="user_id"
          required
        >
          <InputSelect
            v-model="formModel.user_id"
            :options="userItem"
            :placeholder="t('departments.dpm_user.placeholder.user')"
          />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Delete Confirmation Modal -->
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
      <p>ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບພະແພກ: "{{ selectedDpm?.user_id }}"?</p>
      <p class="text-red-500">
        ການດຳເນີນການນີ້ບໍ່ສາມາດຍົກເລີກໄດ້ ຫຼັງຈາກທ່ານຢືນຢັນສຳເລັດ.
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
