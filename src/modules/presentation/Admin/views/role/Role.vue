<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { RoleResponse } from "@/modules/interfaces/role.interface";
import { columns } from "./column";
import { dataRoles } from "@/modules/shared/utils/data.role";
import { Role } from "@/modules/domain/entities/role.entities";
import { useRoleStore } from "../../stores/role.store";
import Table from "@/common/shared/components/table/Table.vue";

// Initialize the unit store
const rolesStore = useRoleStore();
const roles = ref<RoleResponse[]>([]);
const useRealApi = ref<boolean>(false);
const loading = ref<boolean>(false);
// Function to load units from API or use mock data
const loadRoles = async (): Promise<void> => {
  if (useRealApi.value) {
    try {
      loading.value = true;
      const result = await rolesStore.fetchRoles();
      roles.value = result.data.map((role: Role) => ({
        id: parseInt(role.getId()),
        name: role.getName(),
        display_name: role.getDisplayname(),
        created_at: role.getCreatedAt().toISOString().replace("T", " ").substring(0, 19),
        updated_at: role.getUpdatedAt().toISOString().replace("T", " ").substring(0, 19),
      }));
    } catch (error) {
      console.error("Failed to fetch units from API:", error);
      // Fallback to mock data if API fails
      roles.value = [...dataRoles.value];
    } finally {
      loading.value = false;
    }
  } else {
    // Use mock data
    roles.value = [...dataRoles.value];
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
        <h1 class="text-2xl font-semibold">ລາຍການ Role</h1>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="rolesStore.loading || loading" class="text-center py-4">
      <p>ກຳລັງໂຫຼດ...</p>
    </div>
    <!-- Units Table -->
    <Table :columns="columns" :dataSource="roles" :pagination="{ pageSize: 10 }" row-key="id">
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
