<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import type {
  PermissionResponse,
} from "@/modules/interfaces/permission.interface";
import { columns } from "./column";
import { dataPermission } from "@/modules/shared/utils/data.permission";
import { Permission } from "@/modules/domain/entities/permission.entities";
import { usePermissionStore } from "../../stores/permission.store";
import Table from "@/common/shared/components/table/Table.vue";

// Initialize the unit store
const permissionStore = usePermissionStore();
const permission = ref<PermissionResponse[]>([]);
const useRealApi = ref<boolean>(false);
const loading = ref<boolean>(false);
// Function to load units from API or use mock data
const loadRoles = async (): Promise<void> => {
  if (useRealApi.value) {
    try {
      loading.value = true;
      const result = await permissionStore.fetchPermission();
      permission.value = result.data.map((permission: Permission) => ({
        id: permission.getId(),
        name: permission.getName(),
        display_name: permission.getDisplayname(),
        created_at: permission.getCreatedAt().toString(),
        updated_at: permission.getUpdatedAt().toString()
      }));
    } catch (error) {
      console.error("Failed to fetch units from API:", error);
      // Fallback to mock data if API fails
      permission.value = dataPermission.value.map(p => ({ ...p, id: p.id.toString() }));
    } finally {
      loading.value = false;
    }
  } else {
    // Use mock data
    permission.value = dataPermission.value.map(p => ({ ...p, id: p.id.toString() }));
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
        <h1 class="text-2xl font-semibold">ລາຍການ Permission</h1>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="permissionStore.loading || loading" class="text-center py-4">
      <p>ກຳລັງໂຫຼດ...</p>
    </div>
    <!-- Units Table -->
    <Table :columns="columns" :dataSource="permission" :pagination="{ pageSize: 10 }" row-key="id">
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
