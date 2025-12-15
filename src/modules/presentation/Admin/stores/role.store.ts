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
  department_name?: string;
  permissions: number[];
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  type?: string;
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
 const fetchAllRoles = async (
  params: PaginationParams = { page: 1, limit: 10 }
) => {
  loading.value = true;
  error.value = null;

  try {
    const result = await roleService.getAllRoles(params);
    
    // console.log('API Response from service:', result); 
    
    rawRoles.value = JSON.parse(JSON.stringify(result.data));
    roles.value = result.data;
    
    // แก้ไข: อ่านจาก result โดยตรง (ไม่ใช่ result.pagination)
    pagination.value = {
      page: result.page || params.page || 1,
      limit: result.limit || params.limit || 10,
      total: result.total || 0,
      totalPages: result.totalPages || Math.ceil((result.total || 0) / (result.limit || 10)),
    };
    
    // console.log('Store pagination updated:', pagination.value); 
    
    return {
      data: result.data,
      page: pagination.value.page,
      limit: pagination.value.limit,
      total: pagination.value.total,
      totalPages: pagination.value.totalPages,
    };
  } catch (err) {
    error.value = err as Error;
    throw err;
  } finally {
    loading.value = false;
  }
};

//  const fetchRoles = async (
//   params: PaginationParams = { page: 1, limit: 10, department_id: undefined },  
// ) => {
//   loading.value = true;
//   error.value = null;

//   try {
//     const result = await roleService.getAllRoles(params);
    
//     console.log('API Response:', result);
    
//     rawRoles.value = JSON.parse(JSON.stringify(result.data));
//     roles.value = result.data;
    
//     // แก้ไข: ดึงข้อมูล pagination จาก result.pagination
//     const paginationData = result.pagination || {};
//     pagination.value = {
//       page: paginationData.page || params.page || 1,
//       limit: paginationData.limit || params.limit || 10,
//       total: paginationData.total || 0,
//       totalPages: paginationData.total_pages || Math.ceil((paginationData.total || 0) / (paginationData.limit || 10)),
//     };
    
//     return {
//       data: result.data,
//       page: pagination.value.page,
//       limit: pagination.value.limit,
//       total: pagination.value.total,
//       totalPages: pagination.value.totalPages,
//       raw_data: rawRoles.value,
//     };
//   } catch (err) {
//     error.value = err as Error;
//     throw err;
//   } finally {
//     loading.value = false;
//   }
// };

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
  const deleteRole = async (id: string | number): Promise<boolean> => {
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

  // Clear current role only
  const clearCurrentRole = () => {
    currentRole.value = null;
  };
 const setPagination = (newPagination: { page: number; limit: number; total: number }) => {
  pagination.value.page = newPagination.page || 1;
  pagination.value.limit = newPagination.limit || 10;
  pagination.value.total = newPagination.total || 0;
  pagination.value.totalPages = Math.ceil((newPagination.total || 0) / (newPagination.limit || 10));
};

// Fetch company users roles
const fetchCompanyUsers = async (
  params: PaginationParams = { page: 1, limit: 50 }
) => {
  loading.value = true;
  error.value = null;

  try {
    console.log("Store - fetchCompanyUsers called with params:", params);
    const result = await roleService.getCompanyUsers(params);

    console.log("Store - API response from service:", result);

    // Update the same roles array with company users data
    rawRoles.value = JSON.parse(JSON.stringify(result.data));
    roles.value = result.data;

    // Update pagination
    pagination.value = {
      page: result.page || params.page || 1,
      limit: result.limit || params.limit || 50,
      total: result.total || 0,
      totalPages: result.totalPages || Math.ceil((result.total || 0) / (result.limit || 50)),
    };

    console.log("Store - pagination updated:", pagination.value);

    return {
      data: result.data,
      page: pagination.value.page,
      limit: pagination.value.limit,
      total: pagination.value.total,
      totalPages: pagination.value.totalPages,
    };
  } catch (err) {
    console.error("Store - Error fetching company users:", err);
    error.value = err as Error;
    throw err;
  } finally {
    loading.value = false;
  }
};

  return {
    // State
    roles,
    rawRoles, // เพิ่มการ export rawRoles
    // fetchRoles,
    currentRole,
    loading,
    error,
    pagination,
    fetchRoleById,
    createRole,
    updateRole,
    deleteRole,
    setPagination,
    fetchAllRoles,
    fetchCompanyUsers,

    // Getters
    activeRoles,
    deletedRoles,
    totalActiveRoles,
    totalDeletedRoles,
    resetState,
    clearCurrentRole,
  };
});
