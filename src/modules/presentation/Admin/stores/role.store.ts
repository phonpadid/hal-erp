import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import { RoleServiceImpl } from "@/modules/application/services/role.service";
import { ApiRoleRepository } from "@/modules/infrastructure/api-role.repository";
import type { Role } from "@/modules/domain/entities/role.entities";
import type { PaginationParams } from "@/modules/shared/pagination";

//  role service
const createRoleService = () => {
  const roleRepository = new ApiRoleRepository();
  return new RoleServiceImpl(roleRepository);
};

export const useRoleStore = defineStore("roles", () => {
  // create service
  const roleService = createRoleService();
  // State
  const roles: Ref<Role[]> = ref([]);
  const currentRole: Ref<Role | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Getters
  const activeRoles = computed(() => roles.value.filter((role) => !role.isDeleted()));
  const deletedRoles = computed(() => roles.value.filter((role) => role.isDeleted()));
  const totalActiveRoles = computed(() => activeRoles.value.length);
  const totalDeletedRoles = computed(() => deletedRoles.value.length);

  // Get All Roles
  const fetchRoles = async (
    // fetchRoles
    params: PaginationParams = { page: 1, limit: 10 },
    includeDeleted: boolean = false
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await roleService.getAllRoles(params, includeDeleted);
      roles.value = result.data;
      pagination.value = {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      };
      return result;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Reset state
  const resetState = () => {
    roles.value = [];
    currentRole.value = null;
    error.value = null;
    pagination.value = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    };
  };

  return {
    // State
    roles,
    fetchRoles,
    currentRole,
    loading,
    error,
    pagination,

    // Getters
    activeRoles,
    deletedRoles,
    totalActiveRoles,
    totalDeletedRoles,
    resetState,
  };
});
