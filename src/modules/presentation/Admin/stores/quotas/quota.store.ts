import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import type { PaginationParams } from "@/modules/shared/pagination";
// import { ApiQuotaRepository } from "@/modules/infrastructure/quotas/api-quota.repository";
import { QuotaServiceImpl } from "@/modules/application/services/quotas/quota.service";
import { QuotaEntity } from "@/modules/domain/entities/quotas/quota.entity";
import type {
  CreateQuotaDTO,
  UpdateQuotaDTO,
} from "@/modules/application/dtos/quotas/quota.dto";
import { MockQuotaRepository } from "@/modules/infrastructure/quotas/mock-quota.repository";

// Create the quota service instance
const createQuotaService = () => {
  const quotaRepository = new MockQuotaRepository();
  // const quotaRepository = new ApiQuotaRepository();
  return new QuotaServiceImpl(quotaRepository);
};

export const useQuotaStore = defineStore("quota", () => {
  const quotaService = createQuotaService();

  // State
  const quotas: Ref<QuotaEntity[]> = ref([]);
  const currentQuota: Ref<QuotaEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const setPagination = (newPagination: { page: number; limit: number; total: number }) => {
    pagination.value.page = newPagination.page || 1;
    pagination.value.limit = newPagination.limit || 10;
    pagination.value.total = newPagination.total;
  };

  // Getters
  const activeQuotas = computed(() => quotas.value.filter(quota => !quota.isDeleted()));

  // Actions
  const createQuota = async (data: CreateQuotaDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const quota = await quotaService.createQuota(data);
      quotas.value = [quota, ...quotas.value];
      return quota;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchQuotas = async (
    params: PaginationParams & {
      company_id?: number;
      vendor_id?: number;
      product_id?: number;
      year?: string;
    } = { page: 1, limit: 10 }
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await quotaService.getQuotas(params);
      quotas.value = result.quotas;
      pagination.value = {
        page: result.page ?? 1,
        limit: result.limit ?? 10,
        total: result.total ?? 0,
        totalPages: Math.ceil((result.total ?? 0) / (result.limit ?? 10)),
      };
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchQuotaById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await quotaService.getQuotaById(id);
      currentQuota.value = result;
      return result;
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateQuota = async (id: string, data: UpdateQuotaDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const updatedQuota = await quotaService.updateQuota(data);

      const index = quotas.value.findIndex((q) => q.getId() === id);
      if (index !== -1) {
        quotas.value[index] = updatedQuota;
      }

      if (currentQuota.value?.getId() === id) {
        currentQuota.value = updatedQuota;
      }

      return updatedQuota;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteQuota = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      await quotaService.deleteQuota(id);

      const index = quotas.value.findIndex((q) => q.getId() === id);
      if (index !== -1) {
        const quota = quotas.value[index];
        quotas.value[index] = QuotaEntity.restore({
          id: quota.getId(),
          company_id: quota.getCompanyId(),
          vendor_id: quota.getVendorId(),
          product_id: quota.getProductId(),
          qty: quota.getQty(),
          year: quota.getYear(),
          created_at: quota.getCreatedAt(),
          updated_at: new Date(),
          deleted_at: new Date(),
        });
      }

      if (currentQuota.value?.getId() === id) {
        currentQuota.value = null;
      }
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const searchQuotas = async (
    searchParams: {
      search?: string;
      company_id?: number;
      vendor_id?: number;
      product_id?: number;
      year?: string;
    },
    params: PaginationParams = { page: 1, limit: 10 }
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await quotaService.getQuotas({
        ...params,
        ...searchParams,
      });

      quotas.value = result.quotas;
      pagination.value = {
        page: result.page ?? 1,
        limit: result.limit ?? 10,
        total: result.total ?? 0,
        totalPages: Math.ceil((result.total ?? 0) / (result.limit ?? 10)),
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
    quotas,
    currentQuota,
    loading,
    error,
    pagination,
    setPagination,

    // Getters
    activeQuotas,

    // Actions
    createQuota,
    fetchQuotas,
    fetchQuotaById,
    updateQuota,
    deleteQuota,
    searchQuotas,
  };
});
