import { defineStore } from "pinia";
import { ref } from "vue";
import type { Ref } from "vue";
import type { PaginationParams } from "@/modules/shared/pagination";
import { ApiUserApprovaltRepository } from "@/modules/infrastructure/user-approvals/api-user-approval.repository";
import { UserApprovalServiceImpl } from "@/modules/application/services/user-approvals/department.service";
import { UserApprovalEntity } from "@/modules/domain/entities/user-approvals/user-approval.entity";
import type { CreateUserApprovalDTO, UpdateUserApprovalDTO } from "@/modules/application/dtos/user-approvals/user-approval.dto";


const createUserApprovalService = () => {
  const userApprovalRepo = new ApiUserApprovaltRepository();
  return new UserApprovalServiceImpl(userApprovalRepo);
};

export const userApprovalStore = defineStore("user-approval", () => {
  const userApprovalService = createUserApprovalService();

  // State
  const userApproval: Ref<UserApprovalEntity[]> = ref([]);
  const currentUserApproval: Ref<UserApprovalEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const setPagination = (newPagination: { page: number; limit: number }) => {
    pagination.value.page = newPagination.page;
    pagination.value.limit = newPagination.limit;
  };

  // Getters
  // Actions
  const createUserApproval = async (input: CreateUserApprovalDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const dpm = await userApprovalService.create(input);
      userApproval.value = [dpm, ...userApproval.value];
      return dpm;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchUserApproval = async (
    params: PaginationParams = { page: 1, limit: 10 },
    includeDeleted = false
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await userApprovalService.getAll(
        params,
        includeDeleted
      );
      userApproval.value = result.data;
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

  const fetchUserApprovalById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await userApprovalService.getById(id);
      currentUserApproval.value = result;
      return result;
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateUserApproval = async (id: string, input: UpdateUserApprovalDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const updatedDpm = await userApprovalService.update(id, input);

      const index = userApproval.value.findIndex((u) => u.getId() === id);
      if (index !== -1) {
        userApproval.value[index] = updatedDpm;
      }

      if (currentUserApproval.value?.getId() === id) {
        currentUserApproval.value = updatedDpm;
      }

      return updatedDpm;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteUserApproval = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await userApprovalService.delete(id);

      const index = userApproval.value.findIndex((u) => u.getId() === id);
      if (index !== -1) {
        const dpm = userApproval.value[index];
        userApproval.value[index] = new UserApprovalEntity(
          dpm.getId(),
          dpm.getApprovalId(),
          dpm.getStatusId(),
          dpm.getDocumentId(),
          dpm.getCreatedAt(),
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

  const searchByName = async (
    name: string,
    params: PaginationParams = { page: 1, limit: 10 }
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await userApprovalService.getAll({
        ...params,
        search: name,
      });

      userApproval.value = result.data;
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

  return {
    // State
    userApproval,
    currentUserApproval,
    loading,
    error,
    pagination,
    setPagination,
    // Actions
    createUserApproval,
    fetchUserApproval,
    fetchUserApprovalById,
    updateUserApproval,
    deleteUserApproval,
    searchByName,
  };
});
