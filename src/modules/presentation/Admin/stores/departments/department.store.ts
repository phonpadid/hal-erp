import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import type { PaginationParams } from "@/modules/shared/pagination";
import { ApiDepartmentRepository } from "@/modules/infrastructure/departments/api-department.repository";
import { DepartmentServiceImpl } from "@/modules/application/services/departments/department.service";
import { DepartmentEntity } from "@/modules/domain/entities/departments/department.entity";
import type { CreateDepartmentDTO, UpdateDepartmentDTO } from "@/modules/application/dtos/departments/deparment.dto";

// สร้าง unit service
const createDepartmentService = () => {
  const departmentRepository = new ApiDepartmentRepository();
  return new DepartmentServiceImpl(departmentRepository);
};

export const departmentStore = defineStore("department", () => {
  // สร้าง service
  const departmentService = createDepartmentService();

  // State
  const department: Ref<DepartmentEntity[]> = ref([]);
  const currentDpm: Ref<DepartmentEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Getters
  const activeDepartment = computed(() => department.value.filter((dpm) => !dpm.isDeleted()));
  const deletedDepartment = computed(() => department.value.filter((dpm) => dpm.isDeleted()));
  const totalActiveDepartment = computed(() => activeDepartment.value.length);
  const totalDeletedDepartment = computed(() => deletedDepartment.value.length);

  // Actions
  // Create Unit
  const createDepartment = async (data: CreateDepartmentDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const dpm = await departmentService.createDepartment(data);
      department.value = [dpm, ...department.value];
      return dpm;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get All Units
  const fetchDepartment = async (
    params: PaginationParams = { page: 1, limit: 10 },
    includeDeleted: boolean = false
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await departmentService.getAllDepartments(params, includeDeleted);
      department.value = result.data;
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

  // Get Unit By ID
  const fetchDepartmentById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      currentDpm.value = await departmentService.getDepartmentById(id);
      return currentDpm.value;
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Get Unit By Name
  const getDepartmentByName = async (name: string) => {
    try {
      return await departmentService.getDepartmentByName(name);
    } catch (err) {
      console.error("Failed to check unit by name:", err);
      return null;
    }
  };

  // Update Unit
  const updateDepartment = async (id: string, data: UpdateDepartmentDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const updatedDpm = await departmentService.updateDepartment(id, data);

      // Update units list if it's loaded
      if (department.value.length > 0) {
        const index = department.value.findIndex((u) => u.getId() === id);
        if (index !== -1) {
          department.value[index] = updatedDpm;
        }
      }

      // Update current unit if it's loaded
      if (currentDpm.value && currentDpm.value.getId() === id) {
        currentDpm.value = updatedDpm;
      }

      return currentDpm;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Delete Unit
  const deleteDepartment = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await departmentService.deleteDepartment(id);

      // Update units list if it's loaded
      if (department.value.length > 0) {
        const index = department.value.findIndex((u) => u.getId() === id);
        if (index !== -1) {
          // Mark as deleted in the local array
          const deletedDpm = department.value[index];
          // Here we're simulating a soft delete by manually updating the unit status
          department.value[index] = new DepartmentEntity(
            deletedDpm.getId(),
            deletedDpm.getName(),
            deletedDpm.getCode(),
            deletedDpm.getCreatedAt(),
            new Date().toString(),
            new Date().toString()
          );
        }
      }

      return result;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Search Units
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

      department.value = result.data;
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
    department.value = [];
    currentDpm.value = null;
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
    department,
    currentDpm,
    loading,
    error,
    pagination,

    // Getters
    activeDepartment,
    deletedDepartment,
    totalActiveDepartment,
    totalDeletedDepartment,

    // Actions
    createDepartment,
    fetchDepartment,
    fetchDepartmentById,
    updateDepartment,
    deleteDepartment,
    searchDepartmentByName,
    getDepartmentByName,
    resetState,
  };
});
