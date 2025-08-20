import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import type {
  BudgetAccountInterface,
  CreateBudgetAccountInterface,
  UpdateBudgetAccountInterface,
} from "@/modules/interfaces/budget/budget-account.interface";
import type { BudGetAccountsEntity } from "@/modules/domain/entities/budget/budget-accounts.entities";
import type { PaginationParams } from "@/modules/shared/pagination";
import { BudgetAccountServiceImpl } from "@/modules/application/services/budget/budget-accounts.service";
import { ApiBudgetAccountsRepository } from "@/modules/infrastructure/budget/api-budget-account.repository";

// Create budget account service instance
const createBudgetAccountService = () => {
  const budgetAccountRepository = new ApiBudgetAccountsRepository();
  return new BudgetAccountServiceImpl(budgetAccountRepository);
};

export const useBudgetAccountStore = defineStore("budgetAccount", () => {
  // Service
  const budgetAccountService = createBudgetAccountService();

  // State
  const budgetAccounts: Ref<BudGetAccountsEntity[]> = ref([]);
  const currentBudgetAccount: Ref<BudGetAccountsEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Getters
  const activeBudgetAccounts = computed(() =>
    budgetAccounts.value.filter((account) => !account.getDeletedAt())
  );

  // Actions
  const fetchBudgetAccounts = async (params: PaginationParams = { page: 1, limit: 10 }) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await budgetAccountService.getAllBudgetAccounts(params);
      budgetAccounts.value = result.data;
      pagination.value = {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      };
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchBudgetAccountById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const budgetAccount = await budgetAccountService.getBudgetAccountsById(id);
      currentBudgetAccount.value = budgetAccount;
      return budgetAccount ? budgetAccountEntityToInterface(budgetAccount) : null;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createBudgetAccount = async (budgetAccountData: CreateBudgetAccountInterface) => {
    loading.value = true;
    error.value = null;

    try {
      const budgetAccount = await budgetAccountService.createBudgetAccounts(budgetAccountData);
      budgetAccounts.value = [budgetAccount, ...budgetAccounts.value];
      return budgetAccountEntityToInterface(budgetAccount);
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateBudgetAccount = async (
    id: string,
    budgetAccountData: UpdateBudgetAccountInterface
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const updatedBudgetAccount = await budgetAccountService.updateBudgetAccounts(
        id,
        budgetAccountData
      );
      const index = budgetAccounts.value.findIndex((v) => v.getId() === id);
      if (index !== -1) {
        budgetAccounts.value[index] = updatedBudgetAccount;
      }
      if (currentBudgetAccount.value && currentBudgetAccount.value.getId() === id) {
        currentBudgetAccount.value = updatedBudgetAccount;
      }

      return budgetAccountEntityToInterface(updatedBudgetAccount);
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteBudgetAccount = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await budgetAccountService.deleteBudgetAccounts(id);
      if (result) {
        const index = budgetAccounts.value.findIndex((v) => v.getId() === id);
        if (index !== -1) {
          // Mark as deleted
          budgetAccounts.value[index].delete();
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

  // Convert entity to interface for UI use
  const budgetAccountEntityToInterface = (
    budgetAccount: BudGetAccountsEntity
  ): BudgetAccountInterface => {
    return {
      id: budgetAccount.getId() || "",
      code: budgetAccount.getCode() || "",
      name: budgetAccount.getName() || "",
      departmentId: String(budgetAccount.getDepartmentId()) || "",
      department_id: String(budgetAccount.getDepartmentId()) || "",
      fiscal_year: String(budgetAccount.getFiscalYear()) || "",
      allocated_amount: String(budgetAccount.getAllocatedAmount()) || "",
      type: budgetAccount.getType() || "",
      created_at: budgetAccount.getCreatedAt() || "",
      updated_at: budgetAccount.getUpdatedAt() || "",
      deleted_at: budgetAccount.getDeletedAt(),
    };
  };

  // Reset state
  const resetState = () => {
    budgetAccounts.value = [];
    currentBudgetAccount.value = null;
    error.value = null;
    pagination.value = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    };
  };

  const setPagination = (newPagination: { page: number; limit: number; total: number }) => {
    pagination.value.page = newPagination.page || 1;
    pagination.value.limit = newPagination.limit || 10;
    pagination.value.total = newPagination.total;
  };

  return {
    // State
    budgetAccounts,
    currentBudgetAccount,
    loading,
    error,
    pagination,
    setPagination,

    // Getters
    activeBudgetAccounts,

    // Actions
    fetchBudgetAccounts,
    fetchBudgetAccountById,
    createBudgetAccount,
    updateBudgetAccount,
    deleteBudgetAccount,
    resetState,
  };
});
