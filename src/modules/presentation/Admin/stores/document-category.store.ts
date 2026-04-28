import { defineStore } from "pinia";
import { ref } from "vue";
import type { Ref } from "vue";
import type { DocumentCategoryEntity } from "@/modules/domain/entities/document-category.entity";
import { createDocumentCategoryService } from "@/modules/application/services/document-category.service";
import type { DocumentCategoryInterface } from "./../../../interfaces/document-category.interface";

export const useDocumentCategoryStore = defineStore("document-category", () => {
  // service
  const documentCategoryService = createDocumentCategoryService();

  // State
  const documentCategories: Ref<DocumentCategoryEntity[]> = ref([]);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);

  // Get All document categories
  const fetchDocumentCategories = async () => {
    loading.value = true;
    error.value = null;

    try {
      const result = await documentCategoryService.getAllDocumentCategories();
      documentCategories.value = result;
      return result.map((category) => DocumentCategoryEntityToInterface(category));
    } catch (err) {
      console.error("🏪 Error in fetchDocumentCategories:", err);
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const DocumentCategoryEntityToInterface = (
    category: DocumentCategoryEntity
  ): DocumentCategoryInterface => {
    return {
      id: parseInt(category.getId()),
      name: category.getName(),
      code: category.getCode(),
      created_at: category.getCreatedAt(),
      updated_at: category.getUpdatedAt(),
      deleted_at: category.getDeletedAt(),
    };
  };

  // Get active categories
  const activeCategories = () => {
    return documentCategories.value.filter((category) => !category.isDeleted());
  };

  // Reset state
  const resetState = () => {
    documentCategories.value = [];
    error.value = null;
  };

  return {
    // State
    documentCategories,
    loading,
    error,

    // Actions
    fetchDocumentCategories,
    activeCategories,
    resetState,
  };
});
