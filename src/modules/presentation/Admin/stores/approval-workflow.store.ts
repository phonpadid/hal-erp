import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import type { Ref } from "vue";
import type { PaginationParams } from "@/modules/shared/pagination";
import { ApiApprovalWorkflowRepository } from "@/modules/infrastructure/api-approval-workflow.repository";
import { ApprovalWorkflowServiceImpl } from "@/modules/application/services/approval-flow.service";
import { ApprovalWorkflowEntity } from "@/modules/domain/entities/approval-workflows.entity";
import type {
  CreateApprovalWorkflowDTO,
  UpdateApprovalWorkflowDTO,
} from "@/modules/application/dtos/approval-workflow.dto";

const createApprovalWorkflowService = () => {
  const approvalWorkflowRepo = new ApiApprovalWorkflowRepository();
  return new ApprovalWorkflowServiceImpl(approvalWorkflowRepo);
};

export const approvalWorkflowStore = defineStore("approval-workflow", () => {
  const apvWorkflowService = createApprovalWorkflowService();

  // State
  const approval_workflows: Ref<ApprovalWorkflowEntity[]> = ref([]);
  const currentApvWorkflow: Ref<ApprovalWorkflowEntity | null> = ref(null);
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
  };

  // Getters
  // Actions
  const create = async (data: CreateApprovalWorkflowDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const res = await apvWorkflowService.create(data);
      approval_workflows.value = [res, ...approval_workflows.value];
      return res;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchApprovalWorkflows = async (
    params: PaginationParams = { page: 1, limit: 10 },
    includeDeleted = false
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await apvWorkflowService.getAll(params, includeDeleted);
      approval_workflows.value = result.data;
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
      const result = await apvWorkflowService.getOne(id);
      currentApvWorkflow.value = result;
      return result;
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const update = async (id: string, data: UpdateApprovalWorkflowDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const res = await apvWorkflowService.update(id, data);

      const index = approval_workflows.value.findIndex((u) => u.getId() === id);
      if (index !== -1) {
        approval_workflows.value[index] = res;
      }

      if (currentApvWorkflow.value?.getId() === id) {
        currentApvWorkflow.value = res;
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
      const result = await apvWorkflowService.delete(id);

      const index = approval_workflows.value.findIndex((u) => u.getId() === id);
      if (index !== -1) {
        const dpm = approval_workflows.value[index];
        approval_workflows.value[index] = new ApprovalWorkflowEntity(
          dpm.getId(),
          dpm.getName(),
          dpm.getDocumentTypeId(),
          dpm.getDocumentType(),
          dpm.getSteps(),
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

  return {
    // State
    approval_workflows,
    currentApvWorkflow,
    loading,
    error,
    pagination,
    setPagination,
    // Actions
    create,
    fetchApprovalWorkflows,
    fetchById,
    update,
    remove,
  };
}
);
export const formState = reactive({
  name: "",
  document_type_id: "",
  addMore: [
    {
      approval_workflow_id: "",
      department_id: "",
      step_name: "",
      step_number: 0 as number,
      type: "",
      user_id: "",
      requires_file: "false",
      is_otp: "false",
    },
  ],
});
//add
export const moreFunction = () => {
  formState.addMore.push({
    approval_workflow_id: "",
    department_id: "",
    step_name: "",
    step_number: 0 as number,
    type: "",
    user_id: "",
    requires_file: "false",
    is_otp: "false",
  });
};

export const resetForm = () => {
  formState.name = "";
  formState.document_type_id = "";
  formState.addMore = [
    {
      approval_workflow_id: "",
      department_id: "",
      step_name: "",
      step_number: 0,
      type: "",
      user_id: "",
      requires_file: "false",
      is_otp: "false",
    },
  ];
};

