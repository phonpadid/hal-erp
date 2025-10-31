import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import { ProductTypeServiceImpl } from "@/modules/application/services/product-type.service";
import { ApiProductTypeRepository } from "@/modules/infrastructure/api-product-type.repository";
import type { ProductTypeEntity } from "@/modules/domain/entities/product-types.entity";
import type { CreateProductTypeDTO, UpdateProductTypeDTO } from "@/modules/application/dtos/product-type.dto";
import type { PaginationParams } from "@/modules/shared/pagination";
import type { ProductTypeInterface } from "@/modules/interfaces/product-type.interface";

const createProductTypeService = () => {
  const productTypeRepository = new ApiProductTypeRepository();
  return new ProductTypeServiceImpl(productTypeRepository);
};

export const useProductTypeStore = defineStore("product-type", () => {
  // service
  const productTypeService = createProductTypeService();

  // State
  const productTypes: Ref<ProductTypeEntity[]> = ref([]);
  const currentProductType: Ref<ProductTypeEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Getters
  const activeProductTypes = computed(() =>
    productTypes.value.filter((pt) => !pt.isDeleted())
  );
  const inactiveProductTypes = computed(() =>
    productTypes.value.filter((pt) => pt.isDeleted())
  );
  const totalActiveProductTypes = computed(() => activeProductTypes.value.length);
  const totalInactiveProductTypes = computed(() => inactiveProductTypes.value.length);

  // Convert Entity to Interface
  const ProductTypeEntityToInterface = (productType: ProductTypeEntity): ProductTypeInterface => ({
    id: parseInt(productType.getId()),
    name: productType.getName(),
    category_id: productType.getCategoryId() ? parseInt(productType.getCategoryId()!) : null,
    created_at: productType.getCreatedAt(),
    updated_at: productType.getUpdatedAt(),
    deleted_at: productType.getDeletedAt(),
  });

  // Get All Product Types
  const fetchProductTypes = async (
    params: PaginationParams = { page: 1, limit: 10 }
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await productTypeService.getAllProductTypes(params);
      productTypes.value = result.data;
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

  // Get Product Type By ID
  const fetchProductTypeById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const productType = await productTypeService.getProductTypeById(id);
      currentProductType.value = productType;
      return productType ? ProductTypeEntityToInterface(productType) : null;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createProductType = async (productTypeData: CreateProductTypeDTO) => {
    loading.value = true;
    error.value = null;
    try {
      const productType = await productTypeService.createProductType(productTypeData);
      productTypes.value = [productType, ...productTypes.value];
      return ProductTypeEntityToInterface(productType);
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateProductType = async (id: string, productTypeData: UpdateProductTypeDTO) => {
    loading.value = true;
    error.value = null;
    try {
      const updatedProductType = await productTypeService.updateProductType(id, productTypeData);
      const index = productTypes.value.findIndex((pt) => pt.getId() === id);
      if (index !== -1) {
        productTypes.value[index] = updatedProductType;
      }
      // Update currentProductType if it's loaded
      if (currentProductType.value && currentProductType.value.getId() === id) {
        currentProductType.value = updatedProductType;
      }
      return ProductTypeEntityToInterface(updatedProductType);
    } catch (err: unknown) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteProductType = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await productTypeService.deleteProductType(id);
      if (result) {
        const index = productTypes.value.findIndex((pt) => pt.getId() === id);
        if (index !== -1) {
          productTypes.value[index].delete();
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

  const setPagination = (newPagination: { page: number; limit: number; total: number }) => {
    pagination.value.page = newPagination.page || 1;
    pagination.value.limit = newPagination.limit || 10;
    pagination.value.total = newPagination.total;
  };

  // Reset state
  const resetState = () => {
    productTypes.value = [];
    currentProductType.value = null;
    error.value = null;
    pagination.value = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    };
  };

  return {
    // State
    productTypes,
    currentProductType,
    loading,
    error,
    pagination,

    // Getters
    activeProductTypes,
    inactiveProductTypes,
    totalActiveProductTypes,
    totalInactiveProductTypes,

    // Actions
    fetchProductTypes,
    fetchProductTypeById,
    createProductType,
    updateProductType,
    deleteProductType,
    resetState,
    setPagination,
  };
});