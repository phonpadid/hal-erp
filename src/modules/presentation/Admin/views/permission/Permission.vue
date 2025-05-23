<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { PermissionResponse } from "@/modules/interfaces/permission.interface";
import { columns } from "./column";
import { Permission } from "@/modules/domain/entities/permission.entities";
import { usePermissionStore } from "../../stores/permission.store";
import { useI18n } from "vue-i18n";
import { formatDate } from "@/modules/shared/formatdate";
import Table from "@/common/shared/components/table/Table.vue";

// Initialize the unit store
const { t } = useI18n();
const permissionStore = usePermissionStore();
const permission = ref<PermissionResponse[]>([]);
const loading = ref<boolean>(false);
// Function to load units from API or use mock data
const loadRoles = async (): Promise<void> => {
  try {
    loading.value = true;
    const result = await permissionStore.fetchPermission();
    permission.value = result.data.map((permission: Permission) => ({
      id: permission.getId(),
      name: permission.getName(),
      display_name: permission.getDisplayname(),
      created_at: formatDate(permission.getcreated_at()),
      updated_at: formatDate(permission.getupdated_at()),
    }));
  } catch (error) {
    console.error("Failed to fetch units from API:", error);
    // Fallback to mock data if API fails
  } finally {
    loading.value = false;
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
        <h1 class="text-2xl font-semibold">{{ t("permissions.list.title") }}</h1>
      </div>
    </div>
    <!-- Units Table -->
    <Table
      :columns="columns(t)"
      :dataSource="permission"
      :pagination="{ pageSize: 10 }"
      :loading="permissionStore.loading"
      row-key="id"
    >
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
