<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import type { RoleResponse, Roleinterface } from "@/modules/interfaces/role.interface";
import { column } from "./column";
import { useRoleStore } from "../../stores/role.store";
import { formatDate } from "@/modules/shared/formatdate";
import { useRouter } from "vue-router";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { Modal } from "ant-design-vue";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";

const { t } = useI18n();

const rolesStore = useRoleStore();
const roles = ref<RoleResponse[]>([]);
const router = useRouter();
const { success } = useNotification();

const addRole = (): void => {
  router.push({ name: "roleCreate" });
};

const editRole = (role: Roleinterface): void => {
  router.push({ name: "roleEdit", params: { id: role.id.toString() } });
};
const deleteRole = async (role: Roleinterface): Promise<void> => {
Modal.confirm({
    title: t("role.confirm.deleteTitle"),
    content: t("role.confirm.deleteMessage"),
    okText: t("role.buttons.confirm"),
    okType: "danger",
    cancelText: t("role.buttons.cancel"),
    async onOk() {
      await rolesStore.deleteRole(role.id);
      success(("ລົບຂໍ້ມູນສຳເລັດ"));
      await loadRoles();
    },
  });
};

// Table pagination
const tablePagination = computed(() => ({
  current: rolesStore.pagination.page,
  pageSize: rolesStore.pagination.limit,
  total: rolesStore.pagination.total,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
}));

// Handle pagination and sorting
const handleTableChange = async (pagination: TablePaginationType): Promise<void> => {
  
  rolesStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: rolesStore.pagination.total,
  });

  await loadRoles();
};

const loadRoles = async (): Promise<void> => {
  try {
    const result = await rolesStore.fetchAllRoles({
      page: rolesStore.pagination.page,
      limit: rolesStore.pagination.limit,
      department_id: undefined,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    roles.value = result.data.map((role: any) => {
      if (typeof role.getId === "function") {
        return {
          id: role.getId(),
          name: role.getName(),
          created_at: formatDate(role.getCreatedAt()),
          updated_at: formatDate(role.getUpdatedAt()),
        };
      } else {
        return {
          id: role.id,
          name: role.name,
          created_at: formatDate(role.created_at),
          updated_at: formatDate(role.updated_at),
        };
      }
    });
  } catch (error) {
    console.error(t("role.error.loadFailed"), error);
    roles.value = [];
  }
};

onMounted(async () => {
  await loadRoles();
});
</script>

<template>
  <div class="unit-list-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ t("role.list.title") }}</h1>
      </div>
      <UiButton
        type="primary"
        icon="material-symbols:add"
        @click="addRole"
        colorClass="flex items-center"
      >
        {{ t("role.list.btn") }}
      </UiButton>
    </div>
    
    <Table
      :columns="column(t)"
      :dataSource="roles"
      :pagination="tablePagination"
      row-key="id"
      :loading="rolesStore.loading"
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
            @click="deleteRole(record)"
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
  </div>
</template>

<style scoped>
.unit-list-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>