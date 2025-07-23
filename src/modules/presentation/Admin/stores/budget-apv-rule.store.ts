import { defineStore } from "pinia";
import { ref } from "vue";
import type { Ref } from "vue";
import type { PaginationParams } from "@/modules/shared/pagination";
import { BudgetApprovalRuleEntity } from "@/modules/domain/entities/budget-approval-rules/budget-approver-rules.entity";
import type { CreateBudgetApprovalRuleDTO, UpdateBudgetApprovalRuleDTO } from "@/modules/application/dtos/budget-approval-rules/budget-approval-rules.repository";
import { ApiBudgetApprovalRuleRepository } from "@/modules/infrastructure/budget-approval-rules/api-budget-approval-rules.repository";
import { BudgetApprovalRuleServiceImpl } from "@/modules/application/services/budget-approval-rules/budget-approval-rule.service";

const formState = ref({
  department_id: '',
  approver_id: '',
  min_amount: undefined as number | undefined,
  max_amount: undefined as number | undefined,
});
const budgetApvRuleService = () => {
  const budgetApvRepo = new ApiBudgetApprovalRuleRepository();
  return new BudgetApprovalRuleServiceImpl(budgetApvRepo);
};

export const budgetApprovalRuleStore = defineStore("budget-apv-rule-store", () => {
  const budgetApproviceRuleService = budgetApvRuleService();

  // State
  const budget_apv_rule: Ref<BudgetApprovalRuleEntity[]> = ref([]);
  const currentBudgetApvRule: Ref<BudgetApprovalRuleEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const setPagination = (newPagination: { page: number; limit: number , total: number }) => {
    pagination.value.page = newPagination.page || 1;
    pagination.value.limit = newPagination.limit || 10;
    pagination.value.total = newPagination.total;
  };

  // Actions
   const createBudgetApvRule = async (data: CreateBudgetApprovalRuleDTO) => {
      loading.value = true;
      error.value = null;

      try {
        const res = await budgetApproviceRuleService.create(data);
        budget_apv_rule.value = [res, ...budget_apv_rule.value];
        return res;
      } catch (err) {
        error.value = err as Error;
        throw error;
      } finally {
        loading.value = false;
      }
    };

  const fetchBudgetApvRules = async (
    params: PaginationParams = { page: 1, limit: 10 },
    includeDeleted = false
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await budgetApproviceRuleService.getAll(
        params,
        includeDeleted
      );
      budget_apv_rule.value = result.data;
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

  const fetchBudgetAplRuleById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await budgetApproviceRuleService.getById(id);
      currentBudgetApvRule.value = result;
      return result;
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateBudgetApvRule = async (id: string, input: UpdateBudgetApprovalRuleDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const res = await budgetApproviceRuleService.update(id, input);

      const index = budget_apv_rule.value.findIndex((u) => u.getId() === id);
      if (index !== -1) {
        budget_apv_rule.value[index] = res;
      }

      if (currentBudgetApvRule.value?.getId() === id) {
        currentBudgetApvRule.value = res;
      }

      return res;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteBudgetApvRule = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await budgetApproviceRuleService.delete(id);

      const index = budget_apv_rule.value.findIndex((u) => u.getId() === id);
      if (index !== -1) {
        const budgetApvRule = budget_apv_rule.value[index];
        budget_apv_rule.value[index] = new BudgetApprovalRuleEntity(
          budgetApvRule.getId(),
          budgetApvRule.getDepartment_id(),
          budgetApvRule.getApprover_id(),
          budgetApvRule.getMin_amount(),
          budgetApvRule.getMax_amount(),
          budgetApvRule.getDepartment(),
          budgetApvRule.getUser(),
          budgetApvRule.getCreatedAt(),
          new Date().toString(),
          new Date().toString()
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
    formState,
    budget_apv_rule,
    currentBudgetApvRule,
    loading,
    error,
    pagination,
    setPagination,
    // Actions
    createBudgetApvRule,
    fetchBudgetApvRules,
    fetchBudgetAplRuleById,
    updateBudgetApvRule,
    deleteBudgetApvRule,
  };
});
