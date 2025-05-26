import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import { PermissionServiceImpl } from "@/modules/application/services/permission.service";
import { ApiPermissionRepository } from "@/modules/infrastructure/api-permission.repository";
import type { Permission } from "@/modules/domain/entities/permission.entities";
import type { PaginationParams } from "@/modules/shared/pagination";

//  role service
const createPermissionService = () => {
  const permissionRepository = new ApiPermissionRepository();
  return new PermissionServiceImpl(permissionRepository);
};

export const usePermissionStore = defineStore("permission", () => {
  // create service
  const permissionService = createPermissionService();
  // State
  const permission: Ref<Permission[]> = ref([]);
  const currentPermission: Ref<Permission | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Getters
  const activeRoles = computed(() =>
    permission.value.filter((permission) => !permission.isDeleted())
  );
  const deletedRoles = computed(() =>
    permission.value.filter((permission) => permission.isDeleted())
  );
  const totalActivePermission = computed(() => activeRoles.value.length);
  const totalDeletedPermission = computed(() => deletedRoles.value.length);

  // Get All Roles
  const fetchPermission = async (
    // fetchRoles
    params: PaginationParams = { page: 1, limit: 10 },
    includeDeleted: boolean = false
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await permissionService.getAllPermission(params, includeDeleted);
      permission.value = result.data;
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
    permission.value = [];
    currentPermission.value = null;
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
    permission,
    fetchPermission,
    currentPermission,
    loading,
    error,
    pagination,

    // Getters
    activeRoles,
    deletedRoles,
    totalActivePermission,
    totalDeletedPermission,
    resetState,
  };
});
