import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import type { Ref } from "vue";
import type { PaginationParams } from "@/modules/shared/pagination";
import { ApiIncreaseBudgetRepository } from "@/modules/infrastructure/budget/increase-budget/api-increase-budget.repository";
import { IncreaseBudgetServiceImpl } from "@/modules/application/services/budget/increase-budget/budget-accounts.service";
import type { IncreaseBudGetAccountsEntity } from "@/modules/domain/entities/budget/increase/increase-budget.entity";
import type { IncreaseBudgetAccountCreateDTO, IncreaseBudgetAccountUpdateDTO } from "@/modules/application/dtos/budget/increase-budget/increase-budget.dto";

// Create budget account service instance
const createIncreaseBudgetService = () => {
  const increaseBudgetRepository = new ApiIncreaseBudgetRepository();
  return new IncreaseBudgetServiceImpl(increaseBudgetRepository);
};

export const useIncreaseBudgetStore = defineStore("increase-budget-store", () => {
  // Service
  const serice = createIncreaseBudgetService();

  // State
  const increase_budget: Ref<IncreaseBudGetAccountsEntity[]> = ref([]);
  const currentIncrease: Ref<IncreaseBudGetAccountsEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Getters
  // Actions
  const fetchAll = async (params: PaginationParams = { page: 1, limit: 10 }) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await serice.getAll(params);
      increase_budget.value = result.data;
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

  const fetchById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const res = await serice.getById(id);
      currentIncrease.value = res;
      return res;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const created = async (input: IncreaseBudgetAccountCreateDTO) => {

    loading.value = true;
    error.value = null;

    try {
      const res = await serice.create(input);
      increase_budget.value = [res, ...increase_budget.value];
      return res;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updated = async (
    id: string,
    input: IncreaseBudgetAccountUpdateDTO
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const res = await serice.update(
        id,
        input
      );
      const index = increase_budget.value.findIndex((v) => v.getId() === id);
      if (index !== -1) {
        increase_budget.value[index] = res;
      }

      return res;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleted = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await serice.delete(id);
      if (result) {
        const index = increase_budget.value.findIndex((v) => v.getId() === id);
        if (index !== -1) {
          // Mark as deleted
          increase_budget.value[index].delete();
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
    increase_budget.value = [];
    currentIncrease.value = null;
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
    increase_budget,
    currentIncrease,
    loading,
    error,
    pagination,
    setPagination,

    // Getters
    // Actions
    fetchAll,
    fetchById,
    created,
    updated,
    deleted,
    resetState,
  };
});

const initialFormState = () => ({
  budget_account_id: null as number | null,
  description: "",
  file_name: "",
  detail: [
    {
      budget_item_id: null as string | null,
      allocated_amount: 0 as number | undefined,
    },
  ],
})

export const formState = reactive(initialFormState())

export const resetForm = () => {
  Object.assign(formState, initialFormState())
}
export const moreFunction = () => {
  formState.detail.push({
    budget_item_id: null as string | null,
    allocated_amount: 0 as number | undefined,
  });
};
export const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear();
  const startYear = 2023;
  const options = [];

  for (let year = currentYear; year >= startYear; year--) {
    options.push({
      value: year,
      label: year.toString()
    });
  }

  return options;
});
