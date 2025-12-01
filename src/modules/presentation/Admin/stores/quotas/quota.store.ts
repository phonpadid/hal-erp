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
import { ApiQuotaRepository } from "@/modules/infrastructure/quotas/api-quota.repository";

// Create the quota service instance
const createQuotaService = () => {
  // const quotaRepository = new MockQuotaRepository();
  const quotaRepository = new ApiQuotaRepository();
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

  // Transform quotas for table display with additional info
  const quotasWithDetails = computed(() => {
    // Use real data from API
   
    return quotas.value.map(quota => {
      const createdAt = quota.getCreatedAt();
      const updatedAt = quota.getUpdatedAt();
      const deletedAt = quota.getDeletedAt();

      // Get vendor and product info from the entity if available
      const entity = quota as any;
      const vendorProduct = entity.vendor_product;
      const product = entity.product;
      const Product = entity.Product; // Add access to uppercase Product from JSON

      // Extract product from vendorProduct if available (this should have product_type and unit)
      const vendorProductData = vendorProduct?.product || {};

     
      const result = {
        id: quota.getId(),
        vendor_product_id: quota.getVendorProductId(),
        vendor_id: quota.getVendorId(),
        product_id: quota.getProductId(),
        company_id: quota.getCompanyId(),
        qty: quota.getQty(),
        year: quota.getYear(),
        created_at: createdAt && !isNaN(createdAt.getTime()) ? createdAt.toISOString() : new Date().toISOString(),
        updated_at: updatedAt && !isNaN(updatedAt.getTime()) ? updatedAt.toISOString() : new Date().toISOString(),
        deleted_at: deletedAt && !isNaN(deletedAt.getTime()) ? deletedAt.toISOString() : null,

        // Pass the full objects for template access - prioritize Product object from JSON
        vendor: entity.vendor || vendorProduct?.vendor || null,
        product: Product || vendorProductData || product || vendorProduct?.product || null,
        Product: Product || vendorProductData || product || vendorProduct?.product || null, // For backward compatibility

        // Keep computed fields for direct access - prioritize Product object
        product_name: Product?.name || vendorProductData?.name || product?.name || vendorProduct?.product?.name || `ສິນຄ້າ #${quota.getVendorProductId()}`,
        vendor_name: entity.vendor?.name || `ຮ້ານຄ້າ #${vendorProduct?.vendor_id || quota.getVendorId() || 'N/A'}`,
        vendor_id_display: vendorProduct?.vendor_id || quota.getVendorId(),
        price: vendorProduct?.price || null,
        product_type: Product?.product_type?.name || vendorProductData?.product_type?.name || product?.product_type?.name || null,
        unit: Product?.unit?.name || vendorProductData?.unit?.name || product?.unit?.name || null, // Get unit name directly
      };
      return result;
    });
  });

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
      vendor_product_id?: number;
      year?: string;
    } = { page: 1, limit: 10 }
  ) => {
    loading.value = true;
    error.value = null;

    

    try {
      const result = await quotaService.getQuotas(params);

      quotas.value = result.quotas;

      const newPagination = {
        page: result.page ?? 1,
        limit: result.limit ?? 10,
        total: result.total ?? 0,
        totalPages: Math.ceil((result.total ?? 0) / (result.limit ?? 10)),
      };

    
      pagination.value = newPagination;

    

    } catch (err) {
      console.error("Quota Store: Error fetching quotas:", err);
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
      // Create UpdateQuotaDTO with id from parameter
      // Remove any existing id from data to avoid conflicts
      const { id: existingId, ...dataWithoutId } = data;
      const updateData: UpdateQuotaDTO = {
        id: id,
        ...dataWithoutId
      };

      console.log('🔄 Store - Creating update data:', {
        originalId: existingId,
        newId: id,
        hasExistingId: !!existingId,
        updateData
      });

      const updatedQuota = await quotaService.updateQuota(updateData);

      const index = quotas.value.findIndex((q) => q.getId() === id);
      if (index !== -1) {
        quotas.value[index] = updatedQuota;
      }

      if (currentQuota.value?.getId() === id) {
        currentQuota.value = updatedQuota;
      }

      return updatedQuota;
    } catch (err) {
      console.error('🔥 Quota store update error:', err);
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
        quotas.value[index] = quota.softDelete();
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
    quotasWithDetails,

    // Actions
    createQuota,
    fetchQuotas,
    fetchQuotaById,
    updateQuota,
    deleteQuota,
    searchQuotas,
  };
});
