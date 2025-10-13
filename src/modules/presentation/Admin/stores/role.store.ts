import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import { RoleServiceImpl } from "@/modules/application/services/role.service";
import { ApiRoleRepository } from "@/modules/infrastructure/api-role.repository";
import type { Role } from "@/modules/domain/entities/role.entities";
import type { PaginationParams } from "@/modules/shared/pagination";
import type { CreateRole, UpdateRole } from "@/modules/interfaces/role.interface";

interface RawRole {
  id: number | string;
  name: string;
  display_name?: string;
  department_id: number;
  permissions: number[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

//  role service
const createRoleService = () => {
  const roleRepository = new ApiRoleRepository();
  return new RoleServiceImpl(roleRepository);
};

export const useRoleStore = defineStore("roles", () => {
  const roleService = createRoleService();
  const roles: Ref<Role[]> = ref([]);
  const rawRoles: Ref<RawRole[]> = ref([]);
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
      rawRoles.value = JSON.parse(JSON.stringify(result.data));
      roles.value = result.data;
      pagination.value = {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      };
      return {
        ...result,
        raw_data: rawRoles.value,
      };
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const createRole = async (data: CreateRole): Promise<Role> => {
    loading.value = true;
    error.value = null;

    try {
      const role = await roleService.createRole(data);
      roles.value = [role, ...roles.value];
      rawRoles.value = [JSON.parse(JSON.stringify(role)), ...rawRoles.value];
      return role;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const updateRole = async (id: string, data: UpdateRole): Promise<Role> => {
    loading.value = true;
    error.value = null;

    try {
      const updatedRole = await roleService.updateRole(id, data);
      
      // Update roles array
      const index = roles.value.findIndex(role => role.getId() === id);
      if (index !== -1) {
        roles.value[index] = updatedRole;
        rawRoles.value[index] = JSON.parse(JSON.stringify(updatedRole));
      }

      // Update currentRole if it's the one being updated
      if (currentRole.value?.getId() === id) {
        currentRole.value = updatedRole;
      }

      return updatedRole;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };
  // Get Role by ID
  const fetchRoleById = async (id: string): Promise<Role | null> => {
    loading.value = true;
    error.value = null;

    try {
      const role = await roleService.getRoleById(id);
      currentRole.value = role;
      return role;
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Delete Role
  const deleteRole = async (id: string): Promise<boolean> => {
    loading.value = true;
    error.value = null;

    try {
      const success = await roleService.deleteRole(id);
      if (success) {
        const index = roles.value.findIndex(role => role.getId() === id);
        if (index !== -1) {
          roles.value.splice(index, 1);
          rawRoles.value.splice(index, 1);
        }
        if (currentRole.value?.getId() === id) {
          currentRole.value = null;
        }
      }
      return success;
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
    rawRoles.value = [];
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
    rawRoles, // เพิ่มการ export rawRoles
    fetchRoles,
    currentRole,
    loading,
    error,
    pagination,
    fetchRoleById,
    createRole,
    updateRole,
    deleteRole,

    // Getters
    activeRoles,
    deletedRoles,
    totalActiveRoles,
    totalDeletedRoles,
    resetState,
  };
});
