import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import { CategoryServiceImpl } from "@/modules/application/services/category.service";
import { ApiCategoryRepository } from "@/modules/infrastructure/api-category.repository";
import type { CategoryEntity } from "@/modules/domain/entities/categories.entity";
import type { CreateCategoryDTO, UpdateCategoryDTO } from "@/modules/application/dtos/category.dto";
import type { PaginationParams } from "@/modules/shared/pagination";
import type { CategoryInterface } from "@/modules/interfaces/category.interface";

const createCategoryService = () => {
  const categoryRepository = new ApiCategoryRepository();
  return new CategoryServiceImpl(categoryRepository);
};

export const useCategoryStore = defineStore("category", () => {
  // service
  const categoryService = createCategoryService();

  // State
  const categories: Ref<CategoryEntity[]> = ref([]);
  const currentCategory: Ref<CategoryEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Getters
  const activeCategories = computed(() =>
    categories.value.filter((c) => !c.isDeleted())
  );
  const inactiveCategories = computed(() =>
    categories.value.filter((c) => c.isDeleted())
  );
  const totalActiveCategories = computed(() => activeCategories.value.length);
  const totalInactiveCategories = computed(() => inactiveCategories.value.length);

  // Convert Entity to Interface
  const CategoryEntityToInterface = (category: CategoryEntity): CategoryInterface => ({
    id: parseInt(category.getId()),
    name: category.getName(),
    created_at: category.getCreatedAt(),
    updated_at: category.getUpdatedAt(),
    deleted_at: category.getDeletedAt(),
  });

  // Get All Categories
  const fetchCategories = async (
    params: PaginationParams = { page: 1, limit: 10 }
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await categoryService.getAllCategories(params);
      categories.value = result.data;
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

  // Get Category By ID
  const fetchCategoryById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const category = await categoryService.getCategoryById(id);
      currentCategory.value = category;
      return category ? CategoryEntityToInterface(category) : null;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createCategory = async (categoryData: CreateCategoryDTO) => {
    loading.value = true;
    error.value = null;
    try {
      const category = await categoryService.createCategory(categoryData);
      categories.value = [category, ...categories.value];
      return CategoryEntityToInterface(category);
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateCategory = async (id: string, categoryData: UpdateCategoryDTO) => {
    loading.value = true;
    error.value = null;
    try {
      const updatedCategory = await categoryService.updateCategory(id, categoryData);
      const index = categories.value.findIndex((c) => c.getId() === id);
      if (index !== -1) {
        categories.value[index] = updatedCategory;
      }
      // Update currentCategory if it's loaded
      if (currentCategory.value && currentCategory.value.getId() === id) {
        currentCategory.value = updatedCategory;
      }
      return CategoryEntityToInterface(updatedCategory);
    } catch (err: unknown) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCategory = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await categoryService.deleteCategory(id);
      if (result) {
        const index = categories.value.findIndex((c) => c.getId() === id);
        if (index !== -1) {
          categories.value[index].delete();
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
    categories.value = [];
    currentCategory.value = null;
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
    categories,
    currentCategory,
    loading,
    error,
    pagination,

    // Getters
    activeCategories,
    inactiveCategories,
    totalActiveCategories,
    totalInactiveCategories,

    // Actions
    fetchCategories,
    fetchCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    resetState,
    setPagination,
  };
});
