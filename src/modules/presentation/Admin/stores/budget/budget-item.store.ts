import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import type {
  BudgetItemInterface,
  CreateBudgetItemInterface,
  UpdateBudgetItemInterface,
} from "@/modules/interfaces/budget/budget-item.interface";
import type { BudGetItemEntity } from "@/modules/domain/entities/budget/budget-items.entities";
import type { PaginationParams } from "@/modules/shared/pagination";
import { BudgetItemDetailsServiceImpl } from "@/modules/application/services/budget/budget-item.service";
import { ApiBudgetItemRepository } from "@/modules/infrastructure/budget/api-budget-item.repository";

// Create budget item service instance
const createBudgetItemService = () => {
  const budgetItemRepository = new ApiBudgetItemRepository();
  return new BudgetItemDetailsServiceImpl(budgetItemRepository);
};

export const useBudgetItemStore = defineStore("budgetItem", () => {
  // Service
  const budgetItemService = createBudgetItemService();

  // State
  const budgetItems: Ref<BudGetItemEntity[]> = ref([]);
  const currentBudgetItem: Ref<BudGetItemEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Getters
  const activeBudgetItems = computed(() =>
    budgetItems.value.filter((item) => !item.getDeletedAt())
  );

  // Actions
  const fetchBudgetItems = async (params: PaginationParams = { page: 1, limit: 10 }) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await budgetItemService.getAllBudgetItem(params);
      budgetItems.value = result.data;
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

  // Fetch budget items by budget account ID
  const fetchBudgetItemsByAccountId = async (
    accountId: string,
    params: PaginationParams = { page: 1, limit: 10 }
  ) => {
    loading.value = true;
    error.value = null;

    try {
      // เรียกใช้ service ที่แก้ไขแล้ว
      const result = await budgetItemService.getBudgetItemsByAccountId(accountId, params);
      budgetItems.value = result.data;
      pagination.value = {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      };
      return {
        data: result.data.map(budgetItemEntityToInterface),
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

  const fetchBudgetItemById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const budgetItem = await budgetItemService.getBudgetItemById(id);
      currentBudgetItem.value = budgetItem;
      return budgetItem ? budgetItemEntityToInterface(budgetItem) : null;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createBudgetItem = async (budgetItemData: CreateBudgetItemInterface) => {
    loading.value = true;
    error.value = null;

    try {
      const budgetItem = await budgetItemService.createBudgetItem(budgetItemData);
      budgetItems.value = [budgetItem, ...budgetItems.value];
      return budgetItemEntityToInterface(budgetItem);
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateBudgetItem = async (id: string, budgetItemData: UpdateBudgetItemInterface) => {
    loading.value = true;
    error.value = null;

    try {
      const updatedBudgetItem = await budgetItemService.updateBudgetItem(id, budgetItemData);
      const index = budgetItems.value.findIndex((v) => v.getId() === id);
      if (index !== -1) {
        budgetItems.value[index] = updatedBudgetItem;
      }
      if (currentBudgetItem.value && currentBudgetItem.value.getId() === id) {
        currentBudgetItem.value = updatedBudgetItem;
      }

      return budgetItemEntityToInterface(updatedBudgetItem);
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteBudgetItem = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await budgetItemService.deleteBudgetItem(id);
      if (result) {
        const index = budgetItems.value.findIndex((v) => v.getId() === id);
        if (index !== -1) {
          // Mark as deleted
          budgetItems.value[index].delete();
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
  const budgetItemEntityToInterface = (budgetItem: BudGetItemEntity): BudgetItemInterface => {
    return {
      id: budgetItem.getId() || "",
      name: budgetItem.getName() || "",
      budget_account_id: budgetItem.getBudgetAccountsId() || "",
      allocated_amount: String(budgetItem.getAllocatedAmount() || ""),
      description: budgetItem.getDescription() || "",
      created_at: budgetItem.getCreatedAt() || "",
      updated_at: budgetItem.getUpdatedAt() || "",
      deleted_at: budgetItem.getDeletedAt(),
    };
  };

  // Reset state
  const resetState = () => {
    budgetItems.value = [];
    currentBudgetItem.value = null;
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
    budgetItems,
    currentBudgetItem,
    loading,
    error,
    pagination,
    setPagination,

    // Getters
    activeBudgetItems,

    // Actions
    fetchBudgetItems,
    fetchBudgetItemById,
    createBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    fetchBudgetItemsByAccountId,
    resetState,
  };
});
