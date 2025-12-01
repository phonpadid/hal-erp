import { defineStore } from "pinia";
import { ref, computed, reactive } from "vue";
import type { Ref } from "vue";
import type { PaginationParams } from "@/modules/shared/pagination";
import { ApiDepartmentUserRepository } from "@/modules/infrastructure/departments/api-department-user.repository";
import { DepartmentUserEntity } from "@/modules/domain/entities/departments/department-user.entity";
import { DepartmentUserServiceImpl } from "@/modules/application/services/departments/department-user.service";
import type {
  CreateDepartmentUserDTO,
  UpdateDepartmentUserDTO,
} from "@/modules/application/dtos/departments/department-user.dto";

export const dpmUserFormModel = reactive({
  id: "",
  userId: "",
  username: "",
  email: "",
  password: "",
  tel: "",
  confirm_password: "",
  position_id: undefined as string | undefined,
  departmentId: undefined as string | undefined,
  roleIds: [] as number[],
  permissionIds: [] as number[],
  user_type: ["department"] as string[],
  signature_file: null as File | string | null,
});
// สร้าง unit service
const createDepartmentUserService = () => {
  const dpmUserRepository = new ApiDepartmentUserRepository();
  return new DepartmentUserServiceImpl(dpmUserRepository);
};

export const departmenUsertStore = defineStore("department-user", () => {
  const departmentUserService = createDepartmentUserService();

  // State
  const departmentUser: Ref<DepartmentUserEntity[]> = ref([]);
  const departmentUserByDpm: Ref<DepartmentUserEntity[]> = ref([]);
  const currentDpmUser: Ref<DepartmentUserEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const setPagination = (newPagination: { page: number; limit: number; total: number }) => {
    pagination.value.page = newPagination.page;
    pagination.value.limit = newPagination.limit;
    pagination.value.total = newPagination.total;
    // Calculate totalPages based on total and limit
    pagination.value.totalPages = Math.ceil(newPagination.total / newPagination.limit);
  };
  // Getters
  const activeDepartmentUser = computed(() =>
    departmentUser.value.filter((dpm) => !dpm.isDeleted())
  );
  const deletedDepartmentUser = computed(() =>
    departmentUser.value.filter((dpm) => dpm.isDeleted())
  );
  const totalActiveDepartmentUser = computed(() => activeDepartmentUser.value.length);
  const totalDeletedDepartmentUser = computed(() => deletedDepartmentUser.value.length);

  // Create Department User
  const createDepartmentUser = async (input: CreateDepartmentUserDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const dpm = await departmentUserService.createDepartmentUser(input);
      departmentUser.value = [dpm, ...departmentUser.value];
      return dpm;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get All Department Users
  const fetchDepartmentUser = async (
    params: PaginationParams = { page: 1, limit: 10 },
    includeDeleted: boolean = false
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await departmentUserService.getAllDepartmentUser(params, includeDeleted);
      departmentUser.value = result.data;
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

  // Get Unit By ID
  const fetchDepartmentUserById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      currentDpmUser.value = await departmentUserService.getDepartmentUserById(id);
      return currentDpmUser.value;
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      loading.value = false;
    }
  };
  const fetchDepartmentUserByDpm = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await departmentUserService.getAllDepartmentUserByDmp(id);
      departmentUserByDpm.value = result;
      return departmentUserByDpm.value;
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Update Unit
  const updateDepartmentUser = async (input: UpdateDepartmentUserDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const updatedDpm = await departmentUserService.updateDepartmentUser(input.id, input);
      // Update units list if it's loaded
      if (departmentUser.value.length > 0) {
        const index = departmentUser.value.findIndex((u) => u.getId() === input.id);
        if (index !== -1) {
          departmentUser.value[index] = updatedDpm;
        }
      }

      // Update current unit if it's loaded
      if (currentDpmUser.value && currentDpmUser.value.getId() === input.id) {
        currentDpmUser.value = updatedDpm;
      }
      return currentDpmUser.value;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Delete Unit
  const deleteDepartmentUser = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await departmentUserService.deleteDepartmentUser(id);

      // Update units list if it's loaded
      if (departmentUser.value.length > 0) {
        const index = departmentUser.value.findIndex((u) => u.getId() === id);
        if (index !== -1) {
          // Mark as deleted in the local array
          const deletedDpmUser = departmentUser.value[index];
          const user = deletedDpmUser.getUser();
          if (!user) return;
          // Here we're simulating a soft delete by manually updating the unit status
          departmentUser.value[index] = new DepartmentUserEntity(
            deletedDpmUser.getId(),
            deletedDpmUser.getPosition_id(),
            deletedDpmUser.getSignature_file(),
            "",
            deletedDpmUser.getDepartmentId(),
            deletedDpmUser.getPermissionIds(),
            deletedDpmUser.getRoleIds(),
            deletedDpmUser.getUserType(),

            deletedDpmUser.getDepartment(),
            deletedDpmUser.getPostion(),
            user,
            deletedDpmUser.getRoles(),
            deletedDpmUser.getPermissions(),
            deletedDpmUser.getCreatedAt() || "",
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
  const resetState = () => {
    departmentUser.value = [];
    currentDpmUser.value = null;
    error.value = null;
    pagination.value = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    };
  };
  // In your department-user.store.ts
  const resetForm = () => {
    dpmUserFormModel.userId = "";
    dpmUserFormModel.username = "";
    dpmUserFormModel.email = "";
    dpmUserFormModel.tel = "";
    dpmUserFormModel.password = "";
    dpmUserFormModel.confirm_password = "";
    dpmUserFormModel.position_id = "";
    dpmUserFormModel.departmentId = "";
    dpmUserFormModel.signature_file = null;
    dpmUserFormModel.permissionIds = [];
    dpmUserFormModel.roleIds = [];
    dpmUserFormModel.user_type = ["department"];
  };
  return {
    // State
    departmentUser,
    currentDpmUser,
    departmentUserByDpm,
    loading,
    error,
    pagination,
    setPagination,
    // Getters
    activeDepartmentUser,
    deletedDepartmentUser,
    totalActiveDepartmentUser,
    totalDeletedDepartmentUser,

    // Actions
    createDepartmentUser,
    fetchDepartmentUser,
    fetchDepartmentUserById,
    updateDepartmentUser,
    deleteDepartmentUser,
    resetState,
    resetForm,
    fetchDepartmentUserByDpm
  };
});
