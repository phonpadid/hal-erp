import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { VendorProductEntity } from "@/modules/domain/entities/vendor-products/vendor-product.entity";
import { VendorProductServiceImpl } from "@/modules/application/services/vendor-products/vendor-product.service";
import { ApiVendorProductRepository } from "@/modules/infrastructure/vendor-products/api-vendor-product.repository";
import type { CreateVendorProductDTO, UpdateVendorProductDTO, GetVendorProductsDTO } from "@/modules/application/dtos/vendor-products/vendor-product.dto";

export const useVendorProductStore = defineStore("vendorProduct", () => {
  // State
  const vendorProducts = ref<VendorProductEntity[]>([]);
  const selectedVendorProduct = ref<VendorProductEntity | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Pagination state
  const currentPage = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  const search = ref("");
  const selectedVendorId = ref<number | undefined>(undefined);
  const selectedProductId = ref<number | undefined>(undefined);

  // Repository and service
  const vendorProductRepository = new ApiVendorProductRepository();
  const vendorProductService = new VendorProductServiceImpl(vendorProductRepository);

  // Computed properties
  const vendorProductOptions = computed(() => {
    return vendorProducts.value.map((vp) => ({
      value: vp.getId(),
      label: `${vp.getProductName()} (Vendor: ${vp.getVendorId()})`,
      entity: vp,
    }));
  });

  const paginatedVendorProducts = computed(() => {
    return {
      data: vendorProducts.value,
      total: total.value,
      current: currentPage.value,
      pageSize: pageSize.value,
    };
  });

  const isLoading = computed(() => loading.value);

  const hasError = computed(() => error.value !== null);

  const errorMessage = computed(() => error.value);

  // Actions
  const setLoading = (state: boolean) => {
    loading.value = state;
  };

  const setError = (message: string | null) => {
    error.value = message;
  };

  const clearError = () => {
    error.value = null;
  };

  const fetchVendorProducts = async (params?: GetVendorProductsDTO) => {
    try {
      setLoading(true);
      clearError();

      const fetchParams = {
        page: params?.page || currentPage.value,
        limit: params?.limit || pageSize.value,
        search: params?.search || search.value,
        vendor_id: params?.vendor_id || selectedVendorId.value,
        product_id: params?.product_id || selectedProductId.value,
        year: params?.year,
      };

      const result = await vendorProductService.getVendorProducts(fetchParams);

      vendorProducts.value = result.vendor_products;
      total.value = result.total;
      currentPage.value = result.page;
      pageSize.value = result.limit;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch vendor products";
      setError(errorMessage);
      console.error("VendorProduct store fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorProductById = async (id: string) => {
    try {
      setLoading(true);
      clearError();

      const vendorProduct = await vendorProductService.getVendorProductById(id);
      if (vendorProduct) {
        selectedVendorProduct.value = vendorProduct;
        return vendorProduct;
      } else {
        setError("Vendor product not found");
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch vendor product";
      setError(errorMessage);
      console.error("VendorProduct store fetch by ID error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createVendorProduct = async (data: CreateVendorProductDTO) => {
    try {
      setLoading(true);
      clearError();

      const newVendorProduct = await vendorProductService.createVendorProduct(data);

      // Refresh the list to include the new item
      await fetchVendorProducts();

      return newVendorProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create vendor product";
      setError(errorMessage);
      console.error("VendorProduct store create error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateVendorProduct = async (id: string, data: UpdateVendorProductDTO) => {
    try {
      setLoading(true);
      clearError();

      const updatedVendorProduct = await vendorProductService.updateVendorProduct(id, data);

      // Update the vendor products list
      const index = vendorProducts.value.findIndex((vp) => vp.getId() === id);
      if (index !== -1) {
        vendorProducts.value[index] = updatedVendorProduct;
      }

      // Update selected vendor product if it's the one being updated
      if (selectedVendorProduct.value?.getId() === id) {
        selectedVendorProduct.value = updatedVendorProduct;
      }

      return updatedVendorProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update vendor product";
      setError(errorMessage);
      console.error("VendorProduct store update error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteVendorProduct = async (id: string) => {
    try {
      setLoading(true);
      clearError();

      await vendorProductService.deleteVendorProduct(id);

      // Remove from the vendor products list
      vendorProducts.value = vendorProducts.value.filter((vp) => vp.getId() !== id);

      // Clear selected vendor product if it's the one being deleted
      if (selectedVendorProduct.value?.getId() === id) {
        selectedVendorProduct.value = null;
      }

      // Update total count
      total.value = Math.max(0, total.value - 1);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete vendor product";
      setError(errorMessage);
      console.error("VendorProduct store delete error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const restoreVendorProduct = async (id: string) => {
    try {
      setLoading(true);
      clearError();

      const restoredVendorProduct = await vendorProductService.restoreVendorProduct(id);

      // Add back to the vendor products list
      const index = vendorProducts.value.findIndex((vp) => vp.getId() === id);
      if (index !== -1) {
        vendorProducts.value[index] = restoredVendorProduct;
      } else {
        vendorProducts.value.push(restoredVendorProduct);
      }

      // Update total count
      total.value = total.value + 1;

      return restoredVendorProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to restore vendor product";
      setError(errorMessage);
      console.error("VendorProduct store restore error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkVendorProductExists = async (vendorId: number, productId: number): Promise<boolean> => {
    try {
      return await vendorProductService.checkVendorProductExists(vendorId, productId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to check vendor product existence";
      setError(errorMessage);
      console.error("VendorProduct store exists check error:", err);
      return false;
    }
  };

  const fetchVendorProductsByVendorId = async (vendorId: number) => {
    try {
      setLoading(true);
      clearError();

      const vendorProductsList = await vendorProductService.getVendorProductsByVendorId(vendorId);
      return vendorProductsList;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch vendor products by vendor";
      setError(errorMessage);
      console.error("VendorProduct store fetch by vendor error:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorProductsByProductId = async (productId: number) => {
    try {
      setLoading(true);
      clearError();

      const vendorProductsList = await vendorProductService.getVendorProductsByProductId(productId);
      return vendorProductsList;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch vendor products by product";
      setError(errorMessage);
      console.error("VendorProduct store fetch by product error:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const setFilters = (filters: {
    search?: string;
    vendorId?: number;
    productId?: number;
    page?: number;
    pageSize?: number;
  }) => {
    if (filters.search !== undefined) search.value = filters.search;
    if (filters.vendorId !== undefined) selectedVendorId.value = filters.vendorId;
    if (filters.productId !== undefined) selectedProductId.value = filters.productId;
    if (filters.page !== undefined) currentPage.value = filters.page;
    if (filters.pageSize !== undefined) pageSize.value = filters.pageSize;
  };

  const clearFilters = () => {
    search.value = "";
    selectedVendorId.value = undefined;
    selectedProductId.value = undefined;
    currentPage.value = 1;
  };

  const clearSelectedVendorProduct = () => {
    selectedVendorProduct.value = null;
  };

  const setSelectedVendorProduct = (vendorProduct: VendorProductEntity | null) => {
    selectedVendorProduct.value = vendorProduct;
  };

  // Initial fetch
  const initialize = async () => {
    await fetchVendorProducts();
  };

  return {
    // State
    vendorProducts,
    selectedVendorProduct,
    loading: isLoading,
    error: hasError,
    errorMessage,

    // Pagination state
    currentPage,
    pageSize,
    total,
    search,
    selectedVendorId,
    selectedProductId,

    // Computed
    vendorProductOptions,
    paginatedVendorProducts,

    // Actions
    fetchVendorProducts,
    fetchVendorProductById,
    createVendorProduct,
    updateVendorProduct,
    deleteVendorProduct,
    restoreVendorProduct,
    checkVendorProductExists,
    fetchVendorProductsByVendorId,
    fetchVendorProductsByProductId,
    setFilters,
    clearFilters,
    clearError,
    clearSelectedVendorProduct,
    setSelectedVendorProduct,
    initialize,
  };
});

export type VendorProductStore = ReturnType<typeof useVendorProductStore>;