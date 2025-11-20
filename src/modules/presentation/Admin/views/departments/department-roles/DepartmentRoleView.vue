<template>
  <div class="unit-list-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ t("department-role.list.title") }}</h1>
      </div>
      <div class="flex items-center gap-4">
        <InputSelect
          v-model="selectedDepartmentId"
          :options="departmentOptions"
          :placeholder="t('department-role.filter.search')"
          :loading="departmentStore.loading"
          style="width: 250px;"
          @change="handleDepartmentFilterChange"
        />
        <UiButton
          type="primary"
          icon="material-symbols:add"
          @click="addDepartmentRole"
          colorClass="flex items-center"
        >
          {{ t("button.add") }}
        </UiButton>
      </div>
    </div>

    <Table
      :columns="departmentRoleColumn(t)"
      :dataSource="departmentRoles"
      :pagination="tablePagination"
      row-key="id"
      :loading="departmentRoleStore.loading"
      @change="handleTableChange"
    >
      <template #actions="{ record }">
        <div class="flex items-center justify-center">
          <UiButton
            type=""
            icon="ant-design:edit-outlined"
            size="small"
            shape="circle"
            @click="editRole(record)"
            colorClass="flex items-center justify-center text-orange-400"
            :disabled="!!record.deleted_at"
          />
          <UiButton
            type=""
            icon="ant-design:delete-outlined"
            size="small"
            shape="circle"
            @click="deleteRole(record.id)"
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
        <h2 class="text-lg font-semibold">{{ t("departmentRole.list.tableTitle") }}</h2>
      </template>
    </Table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { formatDate } from "@/modules/shared/formatdate";
import { useRouter } from "vue-router";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { Modal } from "ant-design-vue";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import type { DepartmentRoleWithDetailsDTO } from "@/modules/application/dtos/departments/department-role.dto";
import { useDepartmentRoleStore } from "../../../stores/departments/department-role.store";
import { departmentStore as useDepartmentStore } from "../../../stores/departments/department.store";
import { departmentRoleColumn } from "./column"; // Fixed import for department role table columns
import type { DepartmentEntity } from "@/modules/domain/entities/departments/department.entity";

const { t } = useI18n();

const departmentRoleStore = useDepartmentRoleStore();
const departmentStore = useDepartmentStore();
const departmentRoles = ref<DepartmentRoleWithDetailsDTO[]>([]);
const router = useRouter();
const { success } = useNotification();

// Department filter state
const selectedDepartmentId = ref<string | number | null>(null);

// Department options for select
const departmentOptions = computed(() => {
  return [
    { label: t("department-role.filter.allDepartments"), value: '' },
    ...departmentStore.departments.map((dept: DepartmentEntity) => ({
      label: dept?.getName(),
      value: Number(dept?.getId())
    }))
  ];
});

// Handle department filter change
const handleDepartmentFilterChange = async (value: string | number | null) => {
  selectedDepartmentId.value = value;
  await loadDepartmentRoles();
};

const addDepartmentRole = (): void => {
  router.push({ name: "department_role.create" });
};

const editRole = (role: DepartmentRoleWithDetailsDTO): void => {
  router.push({ name: "department_role.edit", params: { id: role.id.toString() } });
};

const deleteRole = async (id: string): Promise<void> => {
  Modal.confirm({
    title: t("department-role.confirm.deleteTitle"),
    content: t("department-role.confirm.deleteMessage"),
    okText: t("department-role.buttons.confirm"),
    okType: "danger",
    cancelText: t("department-role.buttons.cancel"),
    async onOk() {
      await departmentRoleStore.deleteDepartmentRole(id);
      success(t("department-role.messages.deleteSuccess"));
      await loadDepartmentRoles();
    },
  });
};

// Table pagination
const tablePagination = computed(() => ({
  current: departmentRoleStore.pagination.page,
  pageSize: departmentRoleStore.pagination.limit,
  total: departmentRoleStore.pagination.total,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
}));

// Handle pagination and sorting
const handleTableChange = async (pagination: TablePaginationType): Promise<void> => {
  const currentPage = pagination.current || 1;
  const pageSize = pagination.pageSize || 10;
  await departmentRoleStore.getDepartmentRolesWithDetails({
    page: currentPage,
    limit: pageSize,
  });

  // Reload the data to reflect the new page
  await loadDepartmentRoles();
};

const loadDepartmentRoles = async (): Promise<void> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = {
      page: departmentRoleStore.pagination.page,
      limit: departmentRoleStore.pagination.limit,
    };

    // Add department filter if selected
    if (selectedDepartmentId.value) {
      params.department_id = selectedDepartmentId.value;
    }

    const result = await departmentRoleStore.getDepartmentRolesWithDetails(params);
    departmentRoles.value = result.data.map((role) => ({
      id: role.id,
      role_id: role.role_id,
      role_display_name: role.role_display_name || '',
      department_id: role.department_id,
      department_name: role.department_name || '',
      name: role.name || `${role.role_display_name || 'Role'} - ${role.department_name || 'Department'}`,
      permissions: role.permissions,
      created_at: formatDate(role.created_at),
      updated_at: formatDate(role.updated_at),
      deletedAt: role.deletedAt ? formatDate(role.deletedAt) : null,
    }));
  } catch (error) {
    console.error(t("department-role.error.loadFailed"), error);
    departmentRoles.value = [];
  }
};

onMounted(async () => {
  // Load departments for filter
  await departmentStore.fetchDepartment({ page: 1, limit: 100 }); // Load all departments
  // Load department roles
  await loadDepartmentRoles();
});
</script>

<style scoped>
.unit-list-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
