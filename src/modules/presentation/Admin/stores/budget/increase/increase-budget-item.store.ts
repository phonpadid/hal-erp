import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import type { Ref } from "vue";
import type { PaginationParams } from "@/modules/shared/pagination";
import { ApiIncreaseBudgetItemRepository } from "@/modules/infrastructure/budget/increase-budget/api-increase-budget-item.repository";
import { IncreaseBudgetItemServiceImpl } from "@/modules/application/services/budget/increase-budget/budget-accounts-item.service";
import type { IcraseDetailEntity } from "@/modules/domain/entities/budget/increase/increase-detail.entity";
import type { IncreaseBudgetAccountDetailCreateDTO, IncreaseBudgetAccountDetailUpdateDTO } from "@/modules/application/dtos/budget/increase-budget/increase-detail.dto";

// Create budget account service instance
const createIncreaseBudgetItemService = () => {
  const increaseBudgetItemRepository = new ApiIncreaseBudgetItemRepository();
  return new IncreaseBudgetItemServiceImpl(increaseBudgetItemRepository);
};

export const useIncreaseBudgetItemStore = defineStore("increase-budget-item-store", () => {
  // Service
  const serice = createIncreaseBudgetItemService();

  // State
  const increase_budget_item: Ref<IcraseDetailEntity[]> = ref([]);
  const currentIncreaseItem: Ref<IcraseDetailEntity | null> = ref(null);
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
  const fetchAll = async (id: string, params: PaginationParams = { page: 1, limit: 10 }) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await serice.getAll(id, params);
      increase_budget_item.value = result.data;
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
      currentIncreaseItem.value = res;
      return res;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const created = async (id: number, input: IncreaseBudgetAccountDetailCreateDTO) => {

    loading.value = true;
    error.value = null;

    try {
      const res = await serice.create(id, input);
      increase_budget_item.value = [res, ...increase_budget_item.value];
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
    input: IncreaseBudgetAccountDetailUpdateDTO
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const res = await serice.update(
        id,
        input
      );
      const index = increase_budget_item.value.findIndex((v) => v.getId() === id);
      if (index !== -1) {
        increase_budget_item.value[index] = res;
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
        const index = increase_budget_item.value.findIndex((v) => v.getId() === id);
        if (index !== -1) {
          // Mark as deleted
          increase_budget_item.value[index].delete();
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
    increase_budget_item.value = [];
    currentIncreaseItem.value = null;
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
    increase_budget_item,
    currentIncreaseItem,
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

export const formState = reactive({
  budget_account_id: null as number | null,
  description: "",
  file_name: "" ,
  detail: [
    {
      budget_item_id: null as string | null,
      allocated_amount: 0,
    },
  ]
})

export const moreFunction = () => {
  formState.detail.push({
    budget_item_id: null as string | null,
    allocated_amount: 0,
  });
};
