import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import type { DocumentStatusEntity } from "@/modules/domain/entities/document-status.entity";
import type { PaginationParams } from "@/modules/shared/pagination";
import { DocumentStatusServiceImpl } from "@/modules/application/services/document-status.service";
import { ApiDocumentStatusRepository } from "@/common/infrastructure/api-document-status.repository";

const createDocumentStatusService = () => {
  const documentStatusRepository = new ApiDocumentStatusRepository();
  return new DocumentStatusServiceImpl(documentStatusRepository);
};

export const useDocumentStatusStore = defineStore("document-status", () => {
  // service
  const documentStatusService = createDocumentStatusService();

  // State
  const document_Status: Ref<DocumentStatusEntity[]> = ref([]);
  const currentDocumentStatus: Ref<DocumentStatusEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Getters
  const activeDocumentStatus = computed(() => document_Status.value.filter((document_Status) => !document_Status.isDeleted()));
  const inactiveDocumentStatus = computed(() => document_Status.value.filter((document_Status) => document_Status.isDeleted()));
  const totalActiveDocumentStatus = computed(() => activeDocumentStatus.value.length);
  const totalInactiveDocumentStatus = computed(() => inactiveDocumentStatus.value.length);

  // Get All Units
  const fetctDocumentStatus = async (params: PaginationParams = { page: 1, limit: 10 }) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await documentStatusService.getAllDocumentStatus(params);
      document_Status.value = result.data;
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

  const setPagination = (newPagination: { page: number; limit: number; total: number }) => {
    pagination.value.page = newPagination.page || 1;
    pagination.value.limit = newPagination.limit || 10;
    pagination.value.total = newPagination.total;
  };

  // Reset state
  const resetState = () => {
    document_Status.value = [];
    currentDocumentStatus.value = null;
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
    document_Status,
    currentDocumentStatus,
    loading,
    error,
    pagination,

    // Getters
    activeDocumentStatus,
    inactiveDocumentStatus,
    totalActiveDocumentStatus,
    totalInactiveDocumentStatus,
    // Actions
    fetctDocumentStatus,
    resetState,
    setPagination,
  };
});
