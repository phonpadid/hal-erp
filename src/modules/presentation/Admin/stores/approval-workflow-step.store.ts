import { defineStore } from "pinia";
import { ref } from "vue";
import type { Ref } from "vue";
import type { PaginationParams } from "@/modules/shared/pagination";
import { ApiApprovalWorkflowStepRepository } from "@/modules/infrastructure/api-approval-workflow-step.repository";
import { ApprovalWorkflowStepServiceImpl } from "@/modules/application/services/approval-workflow-step.service";
import { ApprovalWorkflowStepEntity } from "@/modules/domain/entities/approval-workflows-step.entity";
import type { CreateApprovalWorkflowStepDTO, UpdateApprovalWorkflowStepDTO } from "@/modules/application/dtos/approval-workflow-step.dto";

const createApprovalWorkflowStepService = () => {
  const approvalWorkflowStepRepo = new ApiApprovalWorkflowStepRepository();
  return new ApprovalWorkflowStepServiceImpl(approvalWorkflowStepRepo);
};

export const approvalWorkflowStepStore = defineStore("approval-workflow-step", () => {
  const apvWorkflowStepService = createApprovalWorkflowStepService();

  // State
  const approval_workflow_steps: Ref<ApprovalWorkflowStepEntity[]> = ref([]);
  const currentApvWorkflowStep: Ref<ApprovalWorkflowStepEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const setPagination = (newPagination: { page: number; limit: number, total: number }) => {
    pagination.value.page = newPagination.page;
    pagination.value.limit = newPagination.limit;
    pagination.value.total = newPagination.total;
  };

  // Getters
  // Actions
  const create = async (data: CreateApprovalWorkflowStepDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const res = await apvWorkflowStepService.create(data);
      approval_workflow_steps.value = [res, ...approval_workflow_steps.value];
      return res;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchApprovalWorkflowSteps = async (id: string,
    params: PaginationParams = { page: 1, limit: 10 },
    includeDeleted = false
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await apvWorkflowStepService.getAll(id,
        params,
        includeDeleted
      );
      approval_workflow_steps.value = result.data;
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

  const fetchById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await apvWorkflowStepService.getOne(id);
      currentApvWorkflowStep.value = result;
      return result;
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const update = async (id: string, data: UpdateApprovalWorkflowStepDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const res = await apvWorkflowStepService.update(id, data);

      const index = approval_workflow_steps.value.findIndex((u) => u.getId() === id);
      if (index !== -1) {
        approval_workflow_steps.value[index] = res;
      }

      if (currentApvWorkflowStep.value?.getId() === id) {
        currentApvWorkflowStep.value = res;
      }

      return res;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const remove = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await apvWorkflowStepService.delete(id);

      const index = approval_workflow_steps.value.findIndex((u) => u.getId() === id);
      if (index !== -1) {
        const remove = approval_workflow_steps.value[index];
        approval_workflow_steps.value[index] = new ApprovalWorkflowStepEntity(
          remove.getId(),
          remove.getApprovalWorkflowId(),
          remove.getDepartemntId(),
          remove.getStepName(),
          remove.getStepNumber(),
          remove.getApprovalWorkflow(),
          remove.getDepartment(),
          remove.getCreatedAt(),
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

  return {
    // State
    approval_workflow_steps,
    currentApvWorkflowStep,
    loading,
    error,
    pagination,
    setPagination,
    // Actions
    create,
    fetchApprovalWorkflowSteps,
    fetchById,
    update,
    remove
  };
});
