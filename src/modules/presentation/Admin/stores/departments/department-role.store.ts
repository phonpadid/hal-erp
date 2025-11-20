import { defineStore } from "pinia";
import { ref } from "vue";
import { DepartmentRoleServiceImpl } from "@/modules/application/services/departments/department-role.service";
import { ApiDepartmentRoleRepository } from "@/modules/infrastructure/departments/api-department-role.repository";
import type { CreateDepartmentRoleDTO, UpdateDepartmentRoleDTO, DepartmentRoleWithDetailsDTO } from "@/modules/application/dtos/departments/department-role.dto";
import type { DepartmentRole } from "@/modules/domain/entities/departments/department-role.entity";
import type { PaginationParams } from "@/modules/shared/pagination";

const createDepartmentRoleService = () => {
  const departmentRoleRepository = new ApiDepartmentRoleRepository();
  return new DepartmentRoleServiceImpl(departmentRoleRepository);
};

export const useDepartmentRoleStore = defineStore("departmentRole", () => {
  const departmentRoleService = createDepartmentRoleService();

  // State
  const departmentRoles = ref<DepartmentRole[]>([]);
  const departmentRolesWithDetails = ref<DepartmentRoleWithDetailsDTO[]>([]);
  const currentDepartmentRole = ref<DepartmentRole | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // Actions
  const createDepartmentRole = async (data: CreateDepartmentRoleDTO) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await departmentRoleService.createDepartmentRole(data);
      departmentRoles.value.push(result);
      return result;
    } catch (err) {
      error.value = (err as Error).message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getDepartmentRoleById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await departmentRoleService.getDepartmentRoleById(id);
      currentDepartmentRole.value = result;
      return result;
    } catch (err) {
      error.value = (err as Error).message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getAllDepartmentRoles = async (params: PaginationParams, includeDeleted = false) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await departmentRoleService.getAllDepartmentRoles(params, includeDeleted);
      departmentRoles.value = result.data;
      pagination.value = {
        total: result.total || 0,
        page: result.page || 1,
        limit: result.limit || 10,
        totalPages: result.totalPages || 0,
      };
      return result;
    } catch (err) {
      error.value = (err as Error).message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getDepartmentRolesWithDetails = async (params: PaginationParams, includeDeleted = false) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await departmentRoleService.getDepartmentRolesWithDetails(params, includeDeleted);
      departmentRolesWithDetails.value = result.data;
      pagination.value = {
        total: result.total || 0,
        page: result.page || 1,
        limit: result.limit || 10,
        totalPages: result.totalPages || 0,
      };
      return result;
    } catch (err) {
      error.value = (err as Error).message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getDepartmentRolesByDepartment = async (departmentId: number) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await departmentRoleService.getDepartmentRolesByDepartment(departmentId);
      return result;
    } catch (err) {
      error.value = (err as Error).message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getDepartmentRolesByRole = async (roleId: number) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await departmentRoleService.getDepartmentRolesByRole(roleId);
      return result;
    } catch (err) {
      error.value = (err as Error).message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateDepartmentRole = async (id: string, data: UpdateDepartmentRoleDTO) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await departmentRoleService.updateDepartmentRole(id, data);
      const index = departmentRoles.value.findIndex(item => item.getId() === id);
      if (index !== -1) {
        departmentRoles.value[index] = result;
      }
      if (currentDepartmentRole.value?.getId() === id) {
        currentDepartmentRole.value = result;
      }
      return result;
    } catch (err) {
      error.value = (err as Error).message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteDepartmentRole = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      await departmentRoleService.deleteDepartmentRole(id);
      departmentRoles.value = departmentRoles.value.filter(item => item.getId() !== id);
      if (currentDepartmentRole.value?.getId() === id) {
        currentDepartmentRole.value = null;
      }
      return true;
    } catch (err) {
      error.value = (err as Error).message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const restoreDepartmentRole = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await departmentRoleService.restoreDepartmentRole(id);
      const index = departmentRoles.value.findIndex(item => item.getId() === id);
      if (index !== -1) {
        departmentRoles.value[index] = result;
      }
      if (currentDepartmentRole.value?.getId() === id) {
        currentDepartmentRole.value = result;
      }
      return result;
    } catch (err) {
      error.value = (err as Error).message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const clearCurrentDepartmentRole = () => {
    currentDepartmentRole.value = null;
  };

  return {
    // State
    departmentRoles,
    departmentRolesWithDetails,
    currentDepartmentRole,
    loading,
    error,
    pagination,

    // Actions
    createDepartmentRole,
    getDepartmentRoleById,
    getAllDepartmentRoles,
    getDepartmentRolesWithDetails,
    getDepartmentRolesByDepartment,
    getDepartmentRolesByRole,
    updateDepartmentRole,
    deleteDepartmentRole,
    restoreDepartmentRole,
    clearError,
    clearCurrentDepartmentRole,
  };
});
