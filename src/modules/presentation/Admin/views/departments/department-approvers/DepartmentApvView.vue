<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { columns } from "./column";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table, { type TablePaginationType } from "@/common/shared/components/table/Table.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import { useI18n } from "vue-i18n";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import { dpmApproverRules } from "./validation/department.validate";
import { departmentApproverStore } from "../../../stores/departments/department-approver.store";
import type { DepartmentApproverApiModel } from "@/modules/interfaces/departments/department-approver.interface";
import { departmentStore } from "../../../stores/departments/department.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { departmenUsertStore } from "../../../stores/departments/department-user.store";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import { canAccessAll } from "@/modules/shared/utils/check-user-type.util";
import { usePermissions } from "@/modules/shared/utils/usePermissions";

const { t } = useI18n();
const search = ref<string>("");
const departmentApv = ref<DepartmentApproverApiModel[]>([]);
const dpmStore = departmentStore();
const { hasPermission, isSuperAdmin, isAdmin } = usePermissions();

// check show or hide buttons based on permissions
// Super-admin and admin can only view (no edit buttons)
// Company-admin can create, edit, and delete
const canCreate = hasPermission("write-department-approver") && !isSuperAdmin.value && !isAdmin.value;
// const canEdit = hasPermission("update-department-approver") && !isSuperAdmin.value && !isAdmin.value;
const canDelete = hasPermission("delete-department-approver") && !isSuperAdmin.value && !isAdmin.value;

// Form related
const formRef = ref();
const modalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const loading = ref<boolean>(false);
const selectedDpm = ref<DepartmentApproverApiModel | null>(null);
const isEditMode = ref<boolean>(false); // Track if we're in edit mode
const userStore = departmenUsertStore();
const { success, warning } = useNotification();

const userItem = computed(() =>
  userStore.departmentUserByDpm.map((item) => {
    const user = item.getUser?.();
    return {
      value: user?.getId() ?? "", // convert to string
      label: user?.getUsername?.() ?? "",
    }
  })
);

const dpmOption = computed(() =>
  dpmStore.departments.map((item) => {
    return {
      value: item?.getId?.() ?? "", // convert to string
      label: item?.getName?.() ?? "",
    };
  })
);

// Form model
const store = departmentApproverStore();
const formModel = store.dpmApproverFormModel;

// Modal title computed property
const modalTitle = computed(() => {
  return isEditMode.value
    ? t("departments.dpm.header_form.edit")
    : t("departments.dpm.header_form.add");
});

// Modal OK button text computed property
const modalOkText = computed(() => {
  return isEditMode.value ? t("button.edit") : t("button.save");
});

watch(
  () => formModel.department_id,
  async (newDpmId) => {
    if (newDpmId) {
      userStore.departmentUserByDpm = [];
      await userStore.fetchDepartmentUserByDpm(newDpmId);
      if (!isEditMode.value) {
        formModel.user_id = [];
      }
    } else {
      userStore.departmentUserByDpm = [];
      formModel.user_id = [];
    }
  }
);

// Load data on component mount
onMounted(async () => {
  await dpmApproverList();
  await dpmStore.fetchDepartment({ limit: 1000, page: 1 });
  // await refreshUsers();
});

const dpmApproverList = async (): Promise<void> => {
  try {
    loading.value = true;
    await store.fetchDepartmentApprover({
      page: store.pagination.page,
      limit: store.pagination.limit,
      search: search.value,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    warning(t("messages.error.title"), errorMessage);
  } finally {
    loading.value = false;
  }
};

//search
const handleSearch = async () => {
  await store.fetchDepartmentApprover({
    page: 1,
    limit: store.pagination.limit,
    search: search.value,
  });
};

// CRUD operations
const showCreateModal = (): void => {
  isEditMode.value = false;
  selectedDpm.value = null;
  store.resetForm();
  // formModel.user_id = [];
  modalVisible.value = true;
};
// const showEditModal = async (record: DepartmentApproverApiModel): Promise<void> => {
//   isEditMode.value = true;
//   selectedDpm.value = record;
//   store.resetForm();
//   formModel.department_id = String(record.department_id);
//   if (record.user_id) {
//     if (Array.isArray(record.user_id)) {
//       formModel.user_id = record.user_id.map(String);
//     } else {
//       formModel.user_id = [String(record.user_id)];
//     }
//   } else {
//     formModel.user_id = [];
//   }
//   if (formModel.department_id) {
//     await userStore.fetchDepartmentUserByDpm(formModel.department_id);
//   }

//   modalVisible.value = true;
// };

const showDeleteModal = (record: DepartmentApproverApiModel): void => {
  selectedDpm.value = record;
  deleteModalVisible.value = true;
};

const handleModalOk = async (): Promise<void> => {
  if (isEditMode.value) {
    await handleEdit();
  } else {
    await handleCreate();
  }
};

const handleCreate = async (): Promise<void> => {
  try {
    loading.value = true;
    await formRef.value.submitForm();
    const payload = {
      user_id: formModel.user_id.map((id) => Number(id)),
      department_id: Number(formModel.department_id),
    };

    if (canAccessAll()) {
      await store.createDepartmentApproverByAdmin(payload);
    } else {
      await store.createDepartmentApprover(payload);
    }
    success(t("departments.notify.created"));
    await dpmApproverList();
    modalVisible.value = false;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    warning(t("messages.error.title"), errorMessage);
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
      const payload = {
        id: id,
        user_id: formModel.user_id.map((id) => Number(id)),
        department_id: formModel.department_id ? Number(formModel.department_id) : null,
      };

      if (canAccessAll()) {
        await store.updateDepartmentApproverByAdmin(payload);
      } else {
        await store.updateDepartmentApprover(payload);
      }

      success(t("departments.notify.update"));
      await dpmApproverList();
      modalVisible.value = false;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    warning(t("messages.error.title"), errorMessage);
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
    await store.deleteDepartmentApprover(id);
    await dpmApproverList();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    warning(t("messages.error.title"), errorMessage);
  }

  deleteModalVisible.value = false;
  loading.value = false;
};

const handleTableChange = async (pagination: TablePaginationType) => {
  store.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total ?? 0,
  });
  await dpmApproverList();
};

const handleModalCancel = async () => {
  modalVisible.value = false;
  formModel.user_id = [] as string[] ;
  formModel.department_id = null as string | null;
  userStore.departmentUserByDpm = [];
  selectedDpm.value = null;
};

/** Watch Search */
watch(search, async (newValue) => {
  if (newValue === "") {
    store.setPagination({
      page: 1,
      limit: store.pagination.limit,
      total: store.pagination.total,
    });
    await dpmApproverList();
  }
});
</script>

<template>
  <div class="list-container p-6">
    <div class="mb-6 gap-4">
      <h1 class="text-2xl font-semibold">
        {{ $t("departments.dpm_approver.title") }}
      </h1>

      <div class="flex justify-between gap-20">
        <div class="w-[20rem]">
          <InputSearch
            v-model:value="search"
            @keyup.enter="handleSearch"
            :placeholder="t('departments.dpm_user.placeholder.search')"
          />
        </div>
        <UiButton
          v-if="canCreate"
          type="primary"
          icon="ant-design:plus-outlined"
          @click="showCreateModal"
          colorClass="flex items-center"
        >
          {{ $t("departments.dpm_user.add") }}
        </UiButton>
      </div>
      <div class="mt-4 text-slate-700 space-y-2">
        <span
          :loading="store.loading"
          class="block text-lg font-semibold"
          v-if="departmentApv.length > 0 && departmentApv[0].department"
        >
          {{ departmentApv[0].department?.name }}
        </span>
      </div>
    </div>

    <Table
      :columns="columns(t)"
      :dataSource="store.departmentApprover"
      :pagination="{
        current: store.pagination.page,
        pageSize: store.pagination.limit,
        total: store.pagination.total,
      }"
      row-key="id"
      :loading="store.loading"
      @change="handleTableChange"
    >
      <!-- Named slot: signature_file -->
      <template #signature_file="{ record }">
        <a-image :src="record.signature_file" :width="60" />
      </template>

      <!-- Named slot: actions -->
      <template #actions="{ record }">
        <div class="flex items-center justify-center gap-2">
          <!-- <UiButton
            icon="ant-design:edit-outlined"
            size="small"
            @click="showEditModal(record)"
            colorClass="flex items-center justify-center text-orange-400"
          /> -->
          <UiButton
            v-if="canDelete"
            icon="ant-design:delete-outlined"
            size="small"
            danger
            @click="showDeleteModal(record)"
            colorClass="flex items-center justify-center text-red-700"
          />
        </div>
      </template>
    </Table>

    <!-- Single Modal for Create/Edit -->
    <UiModal
      :title="modalTitle"
      :visible="modalVisible"
      :confirm-loading="loading"
      @update:visible="modalVisible = $event"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :ok-text="modalOkText"
      :cancel-text="t('button.cancel')"
    >
      <UiForm ref="formRef" :model="formModel" :rules="dpmApproverRules(t)">
        <UiFormItem
          :label="t('departments.dpm_user.field.department')"
          name="department_id"
          required
          v-if="canAccessAll()"
        >
          <InputSelect
            v-model="formModel.department_id"
            :options="dpmOption"
            :placeholder="t('departments.dpm_user.placeholder.dpm')"
          />
        </UiFormItem>
        <UiFormItem :label="t('departments.dpm_user.field.user')" name="user_id" required>
          <InputSelect
            v-model="formModel.user_id"
            :options="userItem"
            mode="tags"
            :placeholder="t('departments.dpm_user.placeholder.user')"
          />
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
      :cancel-text="t('button.cancel')"
      okType="primary"
    >
      <p>{{ t("departments.alert.message") }}: "{{ selectedDpm?.user?.username }}"?</p>
      <p class="text-red-500">
        {{ t("departments.alert.remark") }}
      </p>
    </UiModal>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+Lao&display=swap");

.list-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.ant-tag {
  font-family: "Noto Sans Lao", sans-serif;
  font-size: 14px;
}
</style>
