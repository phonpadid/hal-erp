import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import { CategoryServiceImpl } from "@/modules/application/services/category.service";
import { ApiCategoryRepository } from "@/modules/infrastructure/api-category.repository";
import { Category } from "@/modules/domain/entities/categories.entities";
import type { CreateCategoryDTO, UpdateCategoryDTO } from "@/modules/application/dtos/category.dto";
import type { PaginationParams } from "@/modules/shared/pagination";

const createCategoryService = () => {
  const categoryRepository = new ApiCategoryRepository();
  return new CategoryServiceImpl(categoryRepository);
};

export const useCategoryStore = defineStore("category", () => {
  const categoryService = createCategoryService();

  const categories: Ref<Category[]> = ref([]);
  const currentCategory: Ref<Category | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const activeCategories = computed(() =>
    categories.value.filter((category) => !category.isDeleted())
  );
  const deletedCategories = computed(() =>
    categories.value.filter((category) => category.isDeleted())
  );
  const totalActiveCategories = computed(() => activeCategories.value.length);
  const totalDeletedCategories = computed(() => deletedCategories.value.length);

  const setPagination = (newPagination: { page: number; limit: number; total: number }) => {
    pagination.value.page = newPagination.page;
    pagination.value.limit = newPagination.limit;
    pagination.value.total = newPagination.total;
  };

  const createCategory = async (data: CreateCategoryDTO) => {
    loading.value = true;
    error.value = null;
    try {
      const category = await categoryService.createCategory(data);
      categories.value = [category, ...categories.value];
      return category;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchCategories = async (
    params: PaginationParams = { page: 1, limit: 10 },
    includeDeleted: boolean = false
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await categoryService.getAllCategories(params, includeDeleted);
      categories.value = result.data;
      pagination.value = {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      };
      return result;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchCategoryById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      currentCategory.value = await categoryService.getCategoryById(id);
      return currentCategory.value;
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const getCategoryByName = async (name: string) => {
    try {
      return await categoryService.getCategoryByName(name);
    } catch (err) {
      console.error("Failed to check category by name:", err);
      return null;
    }
  };

  const updateCategory = async (id: string, data: UpdateCategoryDTO) => {
    loading.value = true;
    error.value = null;
    try {
      const updatedCategory = await categoryService.updateCategory(id, data);
      const index = categories.value.findIndex((c) => c.getId() === id);
      if (index !== -1) {
        categories.value[index] = updatedCategory;
      }
      if (currentCategory.value?.getId() === id) {
        currentCategory.value = updatedCategory;
      }
      return updatedCategory;
    } catch (err) {
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
      const index = categories.value.findIndex((c) => c.getId() === id);
      if (index !== -1) {
        const deletedCategory = categories.value[index];
        categories.value[index] = new Category(
          deletedCategory.getId(),
          deletedCategory.getName(),
          deletedCategory.getCreatedAt(),
          new Date().toString(),
          new Date().toString()
        );
      }
      return result;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const restoreCategory = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await categoryService.restoreCategory(id);
      const index = categories.value.findIndex((c) => c.getId() === id);
      if (index !== -1) {
        const restoredCategory = categories.value[index];
        categories.value[index] = new Category(
          restoredCategory.getId(),
          restoredCategory.getName(),
          restoredCategory.getCreatedAt(),
          new Date().toString(),
          null
        );
      }
      return result;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const searchCategoriesByName = async (
    name: string,
    params: PaginationParams = { page: 1, limit: 10 }
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await categoryService.getAllCategories({
        ...params,
        search: name,
      });
      categories.value = result.data;
      pagination.value = {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      };
      return result;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

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
    categories,
    currentCategory,
    loading,
    error,
    pagination,

    activeCategories,
    deletedCategories,
    totalActiveCategories,
    totalDeletedCategories,

    createCategory,
    fetchCategories,
    fetchCategoryById,
    updateCategory,
    deleteCategory,
    restoreCategory,
    searchCategoriesByName,
    getCategoryByName,
    resetState,
    setPagination,
  };
});
