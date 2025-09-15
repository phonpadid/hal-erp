/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import { PermissionServiceImpl } from "@/modules/application/services/permission.service";
import { ApiPermissionRepository } from "@/modules/infrastructure/api-permission.repository";
import { Permission } from "@/modules/domain/entities/permission.entities";
import type { PaginationParams } from "@/modules/shared/pagination";

// Create permission service
const createPermissionService = () => {
  const permissionRepository = new ApiPermissionRepository();
  return new PermissionServiceImpl(permissionRepository);
};

export const usePermissionStore = defineStore("permission", () => {
  // Create service
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
  const activePermissions = computed(() =>
    permission.value.filter((permission) => !permission.isDeleted())
  );

  const deletedPermissions = computed(() =>
    permission.value.filter((permission) => permission.isDeleted())
  );

  const totalActivePermission = computed(() => activePermissions.value.length);
  const totalDeletedPermission = computed(() => deletedPermissions.value.length);

  // Get All Permissions
  const fetchPermission = async (
    params: PaginationParams = { page: 1, limit: 1000 },
    includeDeleted: boolean = false
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await permissionService.getAllPermission(params, includeDeleted);

      // Map API data to Permission entity objects
      permission.value = result.data.map((item: any) => {
        return new Permission(
          item.id.toString(),
          item.name,
          item.display_name,
          item.type,
          item.permissions || [],
          item.created_at || new Date(),
          item.updated_at || new Date()
        );
      });

      pagination.value = {
        page: result?.page || 1,
        limit: result?.limit || 10,
        total: result?.total || 0,
        totalPages: result?.totalPages || 0,
      };

      return {
        data: permission.value,
        ...pagination.value,
      };
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
    activePermissions,
    deletedPermissions,
    totalActivePermission,
    totalDeletedPermission,
    resetState,
  };
});
