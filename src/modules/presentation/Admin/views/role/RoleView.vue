<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useNotification } from "@/modules/shared/utils/useNotification";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import { useRoleStore } from "../../stores/role.store";
import { roleRules } from "./validation/role.validate";
import type { Role } from "@/modules/domain/entities/role.entities";
import { usePermissions } from "@/modules/shared/utils/usePermissions";

const { t } = useI18n();
const { success, error } = useNotification();

const { hasPermission } = usePermissions();

const roleStore = useRoleStore();
const roles = ref<Role[]>([]);
const loading = ref(false);

// Modal state
const createModalVisible = ref<boolean>(false);
const editModalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectedRole = ref<any>(null);
const formRef = ref();

// Form model
const formModel = reactive({
  name: "",
  permissions: [], // Default empty permissions for compatibility
});

// check button show 
const canCreateRole = computed(() => hasPermission("write-role"));
const canEditRole = computed(() => hasPermission("update-role"));
const canDeleteRole = computed(() => hasPermission("delete-role"));

// Table pagination
const tablePagination = computed(() => ({
  current: roleStore.pagination.page,
  pageSize: roleStore.pagination.limit,
  total: roleStore.pagination.total,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
}));

// Role table columns
const roleColumns = (t: (key: string) => string) => [
  {
    title: t("role.list.rolename"),
    dataIndex: "name",
    key: "name",
    width: 200,
    customRender: ({ record }: { record: Role }) => record.getName()
  },
  {
    title: t("role.list.createdAt"),
    dataIndex: "created_at",
    key: "created_at",
    width: 150,
  },
  {
    title: t("role.list.updatedAt"),
    dataIndex: "updated_at",
    key: "updated_at",
    width: 150,
  },
  {
    title: t("role.list.actions"),
    dataIndex: "actions",
    key: "actions",
    width: 100,
    align: "center"
  },
];

// Modal handlers
const showCreateModal = (): void => {
  formModel.name = "";
  createModalVisible.value = true;
};

const showEditModal = (record: Role): void => {
  selectedRole.value = record;
  formModel.name = record.getName() || "";
  editModalVisible.value = true;
};

const showDeleteModal = (record: Role): void => {
  selectedRole.value = record;
  deleteModalVisible.value = true;
};

// CRUD operations
const handleCreate = async (): Promise<void> => {
  try {
    loading.value = true;
    await formRef.value.validate();

    await roleStore.createRole({
      name: formModel.name,
    });

    success(t("role.success.created"));
    await loadRoles();
    createModalVisible.value = false;
    resetForm();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("role.error.createFailed"), errorMessage);
  } finally {
    loading.value = false;
  }
};

const handleEdit = async (): Promise<void> => {
  try {
    loading.value = true;
    await formRef.value.validate();

    if (selectedRole.value) {
      const id = selectedRole.value.id.toString();
      await roleStore.updateRole(id, {
        name: formModel.name,
      });
      success(t("role.success.updated"));
      await loadRoles();
    }

    editModalVisible.value = false;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("role.error.updateFailed"), errorMessage);
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (): Promise<void> => {
  try {
    loading.value = true;
    if (selectedRole.value) {
      await roleStore.deleteRole(selectedRole.value.id.toString());
      success(t("role.success.deleted"));
      await loadRoles();
    }
    deleteModalVisible.value = false;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("role.error.deleteFailed"), errorMessage);
  } finally {
    loading.value = false;
  }
};

// Helper functions
const resetForm = (): void => {
  formModel.name = "";
  formRef.value?.resetFields();
};

const loadRoles = async (): Promise<void> => {
  try {
    const result = await roleStore.fetchAllRoles({
      page: roleStore.pagination.page,
      limit: roleStore.pagination.limit,
    });
    roles.value = result.data;
  } catch (err) {
    error(t("role.error.loadFailed"), String(err));
    roles.value = [];
  }
};

// Handle pagination
const handleTableChange = async (pagination: TablePaginationType): Promise<void> => {
  const currentPage = pagination.current || 1;
  const pageSize = pagination.pageSize || 10;

  await roleStore.fetchAllRoles({
    page: currentPage,
    limit: pageSize,
  });

  await loadRoles();
};

onMounted(async () => {
  await loadRoles();
});
</script>

<template>
  <div class="role-list-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ t("role.list.title") }}</h1>
      </div>
      <UiButton
        v-if="canCreateRole"
        type="primary"
        icon="material-symbols:add"
        @click="showCreateModal"
        colorClass="flex items-center"
      >
        {{ t("button.add") }}
      </UiButton>
    </div>

    <Table
      :columns="roleColumns(t)"
      :dataSource="roles"
      :pagination="tablePagination"
      row-key="id"
      :loading="roleStore.loading"
      @change="handleTableChange"
    >
      <template #actions="{ record }">
        <div class="flex items-center justify-center gap-2">
          <UiButton
            v-if="canEditRole"
            type=""
            icon="ant-design:edit-outlined"
            size="small"
            shape="circle"
            @click="showEditModal(record)"
            colorClass="flex items-center justify-center text-orange-400"
          />
          <UiButton
            v-if="canDeleteRole"
            type=""
            icon="ant-design:delete-outlined"
            size="small"
            shape="circle"
            @click="showDeleteModal(record)"
            colorClass="flex items-center justify-center text-red-500"
          />
        </div>
      </template>
      <template #empty>
        <div class="text-center py-4">
          <p>{{ t("messages.noData") }}</p>
        </div>
      </template>
      <template #header>
        <h2 class="text-lg font-semibold">{{ t("role.list.tableTitle") }}</h2>
      </template>
    </Table>

    <!-- Create Modal -->
    <UiModal
      :title="t('role.form.create')"
      :visible="createModalVisible"
      :confirm-loading="loading"
      @update:visible="createModalVisible = $event"
      @ok="handleCreate"
      @cancel="createModalVisible = false"
      :okText="t('button.save')"
      :cancelText="t('button.cancel')"
    >
      <UiForm ref="formRef" :model="formModel" :rules="roleRules(t)">
        <UiFormItem :label="t('role.form.name')" name="name" required>
          <UiInput
            v-model="formModel.name"
            :placeholder="t('role.form.namePlaceholder')"
            required
          />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Edit Modal -->
    <UiModal
      :title="t('role.form.edit')"
      :visible="editModalVisible"
      :confirm-loading="loading"
      @update:visible="editModalVisible = $event"
      @ok="handleEdit"
      @cancel="editModalVisible = false"
      :okText="t('button.edit')"
      :cancelText="t('button.cancel')"
    >
      <UiForm ref="formRef" :model="formModel" :rules="roleRules(t)">
        <UiFormItem :label="t('role.form.name')" name="name" required>
          <UiInput
            v-model="formModel.name"
            :placeholder="t('role.form.namePlaceholder')"
            required
          />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('role.confirm.deleteTitle')"
      :visible="deleteModalVisible"
      :confirm-loading="loading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDelete"
      @cancel="deleteModalVisible = false"
      :okText="t('role.buttons.confirm')"
      :cancelText="t('role.buttons.cancel')"
      :ok-button-props="{ danger: true }"
    >
      <p>{{ t("role.confirm.deleteMessage") }}: "{{ selectedRole?.getName() }}"?</p>
      <!-- <p class="text-red-500">{{ t("role.confirm.deleteWarning") }}</p> -->
    </UiModal>
  </div>
</template>

<style scoped>
.role-list-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
