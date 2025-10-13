import { defineStore } from "pinia";
import { ref, computed, reactive } from "vue";
import type { Ref } from "vue";
import type { PaginationParams } from "@/modules/shared/pagination";
import { ApiDepartmentApproverRepository } from "@/modules/infrastructure/departments/api-department-approver.repository";
import { DepartmentApporverServiceImpl } from "@/modules/application/services/departments/department-approver.service";
import { DepartmentApproverEntity } from "@/modules/domain/entities/departments/department-approver.entity";
import type {
  CreateDepartmentApproverDTO,
  UpdateDepartmentApproverDTO,
} from "@/modules/application/dtos/departments/department-approver.dto";
export const dpmApproverFormModel = reactive({
  user_id: [] as string[] ,
  department_id: null as string | null,
});
// สร้าง unit service
const createDepartmentApproverService = () => {
  const dpmApproverRepository = new ApiDepartmentApproverRepository();
  return new DepartmentApporverServiceImpl(dpmApproverRepository);
};

export const departmentApproverStore = defineStore("department-Approver", () => {
  // สร้าง service
  const departmentApproverService = createDepartmentApproverService();

  // State
  const departmentApprover: Ref<DepartmentApproverEntity[]> = ref([]);
  const currentDpmApprover: Ref<DepartmentApproverEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Getters
  const activeDepartmentApprover = computed(() =>
    departmentApprover.value.filter((dpm) => !dpm.isDeleted())
  );
  const deletedDepartmentApprover = computed(() =>
    departmentApprover.value.filter((dpm) => dpm.isDeleted())
  );
  const totalActiveDepartmentApprover = computed(() => activeDepartmentApprover.value.length);
  const totalDeletedDepartmentApprover = computed(() => deletedDepartmentApprover.value.length);

  // Actions
  const createDepartmentApprover = async (input: CreateDepartmentApproverDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const dpm = await departmentApproverService.created(input);
      departmentApprover.value = [dpm, ...departmentApprover.value];
      return dpm;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const createDepartmentApproverByAdmin = async (input: CreateDepartmentApproverDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const dpm = await departmentApproverService.createdByAdmin(input);
      departmentApprover.value = [dpm, ...departmentApprover.value];
      return dpm;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get All
  const fetchDepartmentApprover = async (
    params: PaginationParams = { page: 1, limit: 10 },
    includeDeleted: boolean = false
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await departmentApproverService.getAll(params, includeDeleted);
      departmentApprover.value = result.data;
      // Update pagination state
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
  const fetchDepartmentApproverById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      currentDpmApprover.value = await departmentApproverService.getOne(id);
      return currentDpmApprover.value;
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Update Unit
  const updateDepartmentApprover = async (input: UpdateDepartmentApproverDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const updatedDpm = await departmentApproverService.updated(input.id, input);

      // Update  list if it's loaded
      if (departmentApprover.value.length > 0) {
        const index = departmentApprover.value.findIndex((u) => u.getId() === input.id);
        if (index !== -1) {
          departmentApprover.value[index] = updatedDpm;
        }
      }

      if (currentDpmApprover.value && currentDpmApprover.value.getId() === input.id) {
        currentDpmApprover.value = updatedDpm;
      }

      return currentDpmApprover;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const updateDepartmentApproverByAdmin = async (input: UpdateDepartmentApproverDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const updatedDpm = await departmentApproverService.updatedByAdmin(input.id, input);

      // Update  list if it's loaded
      if (departmentApprover.value.length > 0) {
        const index = departmentApprover.value.findIndex((u) => u.getId() === input.id);
        if (index !== -1) {
          departmentApprover.value[index] = updatedDpm;
        }
      }

      if (currentDpmApprover.value && currentDpmApprover.value.getId() === input.id) {
        currentDpmApprover.value = updatedDpm;
      }

      return currentDpmApprover;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteDepartmentApprover = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await departmentApproverService.deleted(id);

      // Update  list if it's loaded
      if (departmentApprover.value.length > 0) {
        const index = departmentApprover.value.findIndex((u) => u.getId() === id);
        if (index !== -1) {
          // Mark as deleted in the local array
          const deletedDpmApprover = departmentApprover.value[index];
          // Here we're simulating a soft delete by manually updating the unit status
          departmentApprover.value[index] = new DepartmentApproverEntity(
            deletedDpmApprover.getId(),
            deletedDpmApprover.getUser_id(),
            deletedDpmApprover.getDepartmentId(),
            deletedDpmApprover.getUser(),
            deletedDpmApprover.getDepartment(),
            deletedDpmApprover.getCreatedAt(),
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

  // Reset state
  const resetForm = () => {
    dpmApproverFormModel.user_id = [];
    dpmApproverFormModel.department_id = "";
  };

  const setPagination = (newPagination: { page: number; limit: number; total: number }) => {
    pagination.value.page = newPagination.page;
    pagination.value.limit = newPagination.limit;
    pagination.value.total = newPagination.total;
  };

  return {
    // State
    dpmApproverFormModel,
    departmentApprover,
    currentDpmApprover,
    loading,
    error,
    pagination,
    setPagination,

    // Getters
    activeDepartmentApprover,
    deletedDepartmentApprover,
    totalActiveDepartmentApprover,
    totalDeletedDepartmentApprover,

    // Actions
    createDepartmentApprover,
    fetchDepartmentApprover,
    fetchDepartmentApproverById,
    updateDepartmentApprover,
    deleteDepartmentApprover,
    resetForm,
    updateDepartmentApproverByAdmin,
    createDepartmentApproverByAdmin,
  };
});
