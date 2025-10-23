import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import type {
  BudgetItemDetailsInterface,
  CreateBudgetItemDetailsInterface,
  UpdateBudgetItemDetailsInterface,
} from "@/modules/interfaces/budget/budget-item-details.interface";
import type { BudGetItemDetailsEntity } from "@/modules/domain/entities/budget/budget-item-details.entities";
import type { PaginationParams } from "@/modules/shared/pagination";
import { BudgetItemDetailsServiceImpl } from "@/modules/application/services/budget/budget-item-details.service";
import { ApiBudgetItemDetailsRepository } from "@/modules/infrastructure/budget/api-budget-item-details.repository";
import type {
  CreateBudgetItemDetailsDTO,
  UpdateBudgetItemDetailsDTO,
} from "@/modules/application/dtos/budget/budget-item-details.dto";

// Create budget item details service instance
const createBudgetItemDetailsService = () => {
  const budgetItemDetailsRepository = new ApiBudgetItemDetailsRepository();
  return new BudgetItemDetailsServiceImpl(budgetItemDetailsRepository);
};

export const useBudgetItemDetailsStore = defineStore("budgetItemDetails", () => {
  // Service
  const budgetItemDetailsService = createBudgetItemDetailsService();

  // State
  const budgetItemDetails: Ref<BudGetItemDetailsEntity[]> = ref([]);
  const currentBudgetItemDetail: Ref<BudGetItemDetailsEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Getters
  const activeBudgetItemDetails = computed(() =>
    budgetItemDetails.value.filter((item) => !item.getDeletedAt())
  );

  // Actions
  const fetchBudgetItemDetails = async (params: PaginationParams = { page: 1, limit: 10 }) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await budgetItemDetailsService.getAllBudgetItemDetails(params);
      budgetItemDetails.value = result.data;
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
  const fetchBudgetItemDetailsByItemId = async (
    itemId: string,
    params: PaginationParams = { page: 1, limit: 10 }
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await budgetItemDetailsService.getBudgetItemDetailsByItemId(itemId, params);
      budgetItemDetails.value = result.data;
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

  const fetchBudgetItemDetailById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const budgetItemDetail = await budgetItemDetailsService.getBudgetItemDetailsById(id);
      currentBudgetItemDetail.value = budgetItemDetail;
      return budgetItemDetail ? budgetItemDetailsEntityToInterface(budgetItemDetail) : null;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createBudgetItemDetail = async (budgetItemDetailData: CreateBudgetItemDetailsInterface) => {
    loading.value = true;
    error.value = null;

    try {
      const createDTO: CreateBudgetItemDetailsDTO = {
        budget_item_id: budgetItemDetailData.budget_item_id || "",
        name: budgetItemDetailData.name || "",
        province_id: budgetItemDetailData.province_id || "",
        description: budgetItemDetailData.description || "",
        allocated_amount: budgetItemDetailData.allocated_amount || "",
      };
      const budgetItemDetail = await budgetItemDetailsService.createBudgetItemDetails(createDTO);
      budgetItemDetails.value = [budgetItemDetail, ...budgetItemDetails.value];
      return budgetItemDetailsEntityToInterface(budgetItemDetail);
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateBudgetItemDetail = async (
    id: string,
    budgetItemDetailData: UpdateBudgetItemDetailsInterface
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const updateDTO: UpdateBudgetItemDetailsDTO = {
        id,
        name: budgetItemDetailData.name || "",
        province_id: budgetItemDetailData.province_id || "",
        description: budgetItemDetailData.description || "",
        allocated_amount: budgetItemDetailData.allocated_amount || "",
      };
      const updatedBudgetItemDetail = await budgetItemDetailsService.updateBudgetItemDetails(
        id,
        updateDTO
      );
      const index = budgetItemDetails.value.findIndex((v) => v.getId() === id);
      if (index !== -1) {
        budgetItemDetails.value[index] = updatedBudgetItemDetail;
      }
      if (currentBudgetItemDetail.value && currentBudgetItemDetail.value.getId() === id) {
        currentBudgetItemDetail.value = updatedBudgetItemDetail;
      }

      return budgetItemDetailsEntityToInterface(updatedBudgetItemDetail);
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteBudgetItemDetail = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await budgetItemDetailsService.deleteBudgetItemDetails(id);
      if (result) {
        const index = budgetItemDetails.value.findIndex((v) => v.getId() === id);
        if (index !== -1) {
          budgetItemDetails.value[index].delete();
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
  const budgetItemDetailsEntityToInterface = (
    budgetItemDetail: BudGetItemDetailsEntity
  ): BudgetItemDetailsInterface => {
    return {
      id: budgetItemDetail.getId() || "",
      budget_item_id: budgetItemDetail.getBudgetItemId() || "",
      name: budgetItemDetail.getName() || "",
      province_id: budgetItemDetail.getProvinceId() || "",
      description: budgetItemDetail.getDescription() || "",
      allocated_amount: budgetItemDetail.getAllocatedAmount() || "",
      created_at: budgetItemDetail.getCreatedAt() || "",
      updated_at: budgetItemDetail.getUpdatedAt() || "",
      deleted_at: budgetItemDetail.getDeletedAt(),
    };
  };

  // Reset state
  const resetState = () => {
    budgetItemDetails.value = [];
    currentBudgetItemDetail.value = null;
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
    budgetItemDetails,
    currentBudgetItemDetail,
    loading,
    error,
    pagination,
    setPagination,

    // Getters
    activeBudgetItemDetails,

    // Actions
    fetchBudgetItemDetails,
    fetchBudgetItemDetailsByItemId,
    fetchBudgetItemDetailById,
    createBudgetItemDetail,
    updateBudgetItemDetail,
    deleteBudgetItemDetail,
    resetState,
  };
});
