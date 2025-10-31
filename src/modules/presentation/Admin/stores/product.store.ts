import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import { ProductServiceImpl } from "@/modules/application/services/product.service";
import { ApiProductRepository } from "@/modules/infrastructure/api-product.repository";
import type { ProductEntity } from "@/modules/domain/entities/product.entity";
import type { CreateProductDTO, UpdateProductDTO } from "@/modules/application/dtos/product.dto";
import type { PaginationParams } from "@/modules/shared/pagination";
import type { ProductInterface } from "@/modules/interfaces/product.interface";

const createProductService = () => {
  const productRepository = new ApiProductRepository();
  return new ProductServiceImpl(productRepository);
};

export const useProductStore = defineStore("product", () => {
  // service
  const productService = createProductService();

  // State
  const products: Ref<ProductEntity[]> = ref([]);
  const currentProduct: Ref<ProductEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Getters
  const activeProducts = computed(() =>
    products.value.filter((p) => !p.isDeleted())
  );
  const inactiveProducts = computed(() =>
    products.value.filter((p) => p.isDeleted())
  );
  const totalActiveProducts = computed(() => activeProducts.value.length);
  const totalInactiveProducts = computed(() => inactiveProducts.value.length);

  // Convert Entity to Interface
  const ProductEntityToInterface = (product: ProductEntity): ProductInterface => ({
    id: parseInt(product.getId()),
    name: product.getName(),
    description: product.getDescription(),
    product_type_id: product.getProductTypeId(),
    status: product.getStatus(),
    created_at: product.getCreatedAt(),
    updated_at: product.getUpdatedAt(),
    deleted_at: product.getDeletedAt(),
  });

  // Get All Products
  const fetchProducts = async (
    params: PaginationParams = { page: 1, limit: 10 }
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await productService.getAllProducts(params);
      products.value = result.data;
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

  // Get Product By ID
  const fetchProductById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const product = await productService.getProductById(id);
      currentProduct.value = product;
      return product ? ProductEntityToInterface(product) : null;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createProduct = async (productData: CreateProductDTO) => {
    loading.value = true;
    error.value = null;
    try {
      const product = await productService.createProduct(productData);
      products.value = [product, ...products.value];
      return ProductEntityToInterface(product);
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateProduct = async (id: string, productData: UpdateProductDTO) => {
    loading.value = true;
    error.value = null;
    try {
      const updatedProduct = await productService.updateProduct(id, productData);
      const index = products.value.findIndex((p) => p.getId() === id);
      if (index !== -1) {
        products.value[index] = updatedProduct;
      }
      // Update currentProduct if it's loaded
      if (currentProduct.value && currentProduct.value.getId() === id) {
        currentProduct.value = updatedProduct;
      }
      return ProductEntityToInterface(updatedProduct);
    } catch (err: unknown) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteProduct = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await productService.deleteProduct(id);
      if (result) {
        const index = products.value.findIndex((p) => p.getId() === id);
        if (index !== -1) {
          products.value[index].delete();
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

  const getProductsByProductTypeId = async (product_type_id: number) => {
    loading.value = true;
    error.value = null;
    try {
      const products = await productService.getProductsByProductTypeId(product_type_id);
      return products.map(ProductEntityToInterface);
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
    products.value = [];
    currentProduct.value = null;
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
    products,
    currentProduct,
    loading,
    error,
    pagination,

    // Getters
    activeProducts,
    inactiveProducts,
    totalActiveProducts,
    totalInactiveProducts,

    // Actions
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsByProductTypeId,
    resetState,
    setPagination,
  };
});