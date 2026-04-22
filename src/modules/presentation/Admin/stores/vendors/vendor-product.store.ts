import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import type { VendorProductInterface } from "@/modules/interfaces/vendors/vendor_product/vendor-product.interface";
import type { VendorProductEntity } from "@/modules/domain/entities/vendor-products/vendor-product.entity";
import type { PaginationParams } from "@/modules/shared/pagination";
import type { CreateVendorProductDTO, UpdateVendorProductDTO } from "@/modules/application/dtos/vendor-products/vendor-product.dto";
import { VendorProductServiceImpl } from "@/modules/application/services/vendor-products/vendor-product.service";
import { ApiVendorProductRepository } from "@/modules/infrastructure/vendor-products/api-vendor-product.repository";
// import { ApiVendorProductRepository } from "@/modules/infrastructure/vendors/api-vendor-product.repository";

// Create vendor-product service instance
const createVendorProductService = () => {
  // Using mock repository for now - switch to API repository when backend is ready
  // const vendorProductRepository = new MockVendorProductRepository();
  const vendorProductRepository = new ApiVendorProductRepository();
  // const vendorProductRepository = new ApiVendorProductRepository();
  return new VendorProductServiceImpl(vendorProductRepository);
};

export const useVendorProductStore = defineStore("vendorProduct", () => {
  // Service
  const vendorProductService = createVendorProductService();

  // State
  const vendorProducts: Ref<VendorProductEntity[]> = ref([]);
  const currentVendorProduct: Ref<VendorProductEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Getters
  const activeVendorProducts = computed(() => vendorProducts.value.filter((vp) => !vp.isDeleted()));
  const inactiveVendorProducts = computed(() => vendorProducts.value.filter((vp) => vp.isDeleted()));
  const totalActiveVendorProducts = computed(() => activeVendorProducts.value.length);
  const totalInactiveVendorProducts = computed(() => inactiveVendorProducts.value.length);

  // Actions
  const fetchVendorProducts = async (
    params: PaginationParams = { page: 1, limit: 10 },
    vendorId?: number,
    productId?: number
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await vendorProductService.getVendorProducts({
        page: params.page,
        limit: params.limit,
        search: params.search,
        vendor_id: vendorId,
        product_id: productId,
      });
      vendorProducts.value = result.vendor_products;
      pagination.value = {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: 0,
      };
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchVendorProductById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const vendorProduct = await vendorProductService.getVendorProductById(id);
      currentVendorProduct.value = vendorProduct;
      return vendorProduct ? vendorProductEntityToInterface(vendorProduct) : null;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchVendorProductsByVendorId = async (vendorId: number) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await vendorProductService.getVendorProductsByVendorId(vendorId);
      vendorProducts.value = result;
      return result.map(vp => vendorProductEntityToInterface(vp));
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createVendorProduct = async (vendorProductData: CreateVendorProductDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const vendorProduct = await vendorProductService.createVendorProduct(vendorProductData);
      vendorProducts.value = [vendorProduct, ...vendorProducts.value];
      return vendorProductEntityToInterface(vendorProduct);
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateVendorProduct = async (id: string, vendorProductData: UpdateVendorProductDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const updatedVendorProduct = await vendorProductService.updateVendorProduct(id, vendorProductData);
      const index = vendorProducts.value.findIndex((vp) => vp.getId() === id);
      if (index !== -1) {
        vendorProducts.value[index] = updatedVendorProduct;
      }
      if (currentVendorProduct.value && currentVendorProduct.value.getId() === id) {
        currentVendorProduct.value = updatedVendorProduct;
      }

      return vendorProductEntityToInterface(updatedVendorProduct);
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteVendorProduct = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      await vendorProductService.deleteVendorProduct(id);
      const index = vendorProducts.value.findIndex((vp) => vp.getId() === id);
      if (index !== -1) {
        const deletedProduct = vendorProducts.value[index].softDelete();
        vendorProducts.value[index] = deletedProduct;
      }
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const vendorProductEntityToInterface = (vendorProduct: VendorProductEntity): VendorProductInterface => {
    const currency = vendorProduct.getCurrency();
    return {
      id: vendorProduct.getId(),
      vendor_id: vendorProduct.getVendorId(),
      product_id: vendorProduct.getProductId(),
      price: vendorProduct.getPrice(),
      currency_id: vendorProduct.getCurrencyId(),
      currency: currency ? {
        id: currency.id,
        code: currency.code,
        name: currency.name,
      } : undefined,
      created_at: vendorProduct.getCreatedAt().toISOString(),
      updated_at: vendorProduct.getUpdatedAt().toISOString(),
      deleted_at: vendorProduct.getDeletedAt()?.toISOString(),
    };
  };

  // Reset state
  const resetState = () => {
    vendorProducts.value = [];
    currentVendorProduct.value = null;
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
    vendorProducts,
    currentVendorProduct,
    loading,
    error,
    pagination,
    setPagination,

    // Getters
    activeVendorProducts,
    inactiveVendorProducts,
    totalActiveVendorProducts,
    totalInactiveVendorProducts,

    // Actions
    fetchVendorProducts,
    fetchVendorProductById,
    fetchVendorProductsByVendorId,
    createVendorProduct,
    updateVendorProduct,
    deleteVendorProduct,
    resetState,
  };
});