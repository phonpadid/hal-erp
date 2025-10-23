import { defineStore } from "pinia";
import { ref } from "vue";
import type { Ref } from "vue";
import type { PaginationParams } from "@/modules/shared/pagination";
import { ApiDepartmentRepository } from "@/modules/infrastructure/departments/api-department.repository";
import { DepartmentServiceImpl } from "@/modules/application/services/departments/department.service";
import { DepartmentEntity } from "@/modules/domain/entities/departments/department.entity";
import type {
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
} from "@/modules/application/dtos/departments/department.dto";

// Create the department service instance
const createDepartmentService = () => {
  const departmentRepository = new ApiDepartmentRepository();
  return new DepartmentServiceImpl(departmentRepository);
};

export const departmentStore = defineStore("department", () => {
  const departmentService = createDepartmentService();

  // State
  const departments: Ref<DepartmentEntity[]> = ref([]);
  const currentDpm: Ref<DepartmentEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const setPagination = (newPagination: { page: number; limit: number; total: number }) => {
    pagination.value.page = newPagination.page || 1;
    pagination.value.limit = newPagination.limit || 10;
    pagination.value.total = newPagination.total;
  };

  // Getters
  // Actions
  const createDepartment = async (data: CreateDepartmentDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const dpm = await departmentService.createDepartment(data);
      departments.value = [dpm, ...departments.value];
      return dpm;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchDepartment = async (
    params: PaginationParams = { page: 1, limit: 10 },
    includeDeleted = false
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await departmentService.getAllDepartments(params, includeDeleted);
      departments.value = result.data;
      pagination.value = {
        page: result.page ?? 1,
        limit: result.limit ?? 10,
        total: result.total ?? 0,
        totalPages: result.totalPages ?? 0,
      };
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchDepartmentById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await departmentService.getDepartmentById(id);
      currentDpm.value = result;
      return result;
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateDepartment = async (id: string, data: UpdateDepartmentDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const updatedDpm = await departmentService.updateDepartment(id, data);

      const index = departments.value.findIndex((u) => u.getId() === id);
      if (index !== -1) {
        departments.value[index] = updatedDpm;
      }

      if (currentDpm.value?.getId() === id) {
        currentDpm.value = updatedDpm;
      }

      return updatedDpm;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteDepartment = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await departmentService.deleteDepartment(id);

      const index = departments.value.findIndex((u) => u.getId() === id);
      if (index !== -1) {
        const dpm = departments.value[index];
        departments.value[index] = new DepartmentEntity(
          dpm.getId(),
          dpm.getName(),
          dpm.getCode(),
          dpm.getCreatedAt(),
          dpm.getType(),
          new Date().toISOString(),
          new Date().toISOString()
        );
      }

      return result;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const searchDepartmentByName = async (
    name: string,
    params: PaginationParams = { page: 1, limit: 10 }
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await departmentService.getAllDepartments({
        ...params,
        search: name,
      });

      departments.value = result.data;
      pagination.value = {
        page: result.page ?? 1,
        limit: result.limit ?? 10,
        total: result.total ?? 0,
        totalPages: result.totalPages ?? 0,
      };

      return result;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    departments,
    currentDpm,
    loading,
    error,
    pagination,
    setPagination,
    // Actions
    createDepartment,
    fetchDepartment,
    fetchDepartmentById,
    updateDepartment,
    deleteDepartment,
    searchDepartmentByName,
  };
});
