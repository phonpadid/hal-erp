import type {
  DocumentTypeCreate,
  DocumentTypeUpdate,
} from "./../../../interfaces/documenet-type.interface";
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import type { DocumentTypeEntity } from "@/modules/domain/entities/document-type.entities";
import type { PaginationParams } from "@/modules/shared/pagination";
import { DocumentTypeServiceImpl } from "@/modules/application/services/document-type.service";
import { ApiDocumentTypeRepository } from "@/modules/infrastructure/api-document-type.repository";
import type { DoucmentTypeInterface } from "./../../../interfaces/documenet-type.interface";

const createDocumentsTypeService = () => {
  const documentsTypeRepository = new ApiDocumentTypeRepository();
  return new DocumentTypeServiceImpl(documentsTypeRepository);
};

export const useDocumentTypeStore = defineStore("document-type", () => {
  // service
  const documentTypeService = createDocumentsTypeService();

  // State
  const documentType: Ref<DocumentTypeEntity[]> = ref([]);
  const currentDocumentType: Ref<DocumentTypeEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Getters
  const activedocumentType = computed(() => documentType.value.filter((user) => !user.isDeleted()));
  const inactivedocumentType = computed(() =>
    documentType.value.filter((user) => user.isDeleted())
  );
  const totalActivedocumentType = computed(() => activedocumentType.value.length);
  const totalInactivedocumentType = computed(() => inactivedocumentType.value.length);

  // Get All documentType
  const fetchdocumentType = async (
    params: PaginationParams = { page: 1, limit: 10 }
    // includeDeleted: boolean = false
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await documentTypeService.getAllDocumentTypes(params);
      documentType.value = result.data;
      pagination.value = {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      };
      return {
        data: result.data.map(DocumentTypeEntityToInterface),
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      };
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get User By ID
  const fetchUserById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const documentType = await documentTypeService.getDocumentTypeById(id);
      currentDocumentType.value = documentType;
      return documentType ? DocumentTypeEntityToInterface(documentType) : null;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createDocumentType = async (documentTypeData: DocumentTypeCreate) => {
    loading.value = true;
    error.value = null;

    try {
      const document = await documentTypeService.createDocumentType(documentTypeData);
      documentType.value = [document, ...documentType.value];
      return DocumentTypeEntityToInterface(document);
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };
  // Update
  const updateDocumentType = async (id: string, documentTypeData: DocumentTypeUpdate) => {
    loading.value = true;
    error.value = null;

    try {
      const updatedDocument = await documentTypeService.updateDocumentType(id, documentTypeData);
      const index = documentType.value.findIndex((u) => u.getId() === id);
      if (index !== -1) {
        documentType.value[index] = updatedDocument;
      }
      // Update current user if it's loaded
      if (currentDocumentType.value && currentDocumentType.value.getId() === id) {
        currentDocumentType.value = updatedDocument;
      }

      return DocumentTypeEntityToInterface(updatedDocument);
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Delete
  const deleteDocument = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await documentTypeService.deleteDocumentType(id);
      if (result) {
        const index = documentType.value.findIndex((u) => u.getId() === id);
        if (index !== -1) {
          documentType.value[index].delete();
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
  const DocumentTypeEntityToInterface = (
    documentType: DocumentTypeEntity
  ): DoucmentTypeInterface => {
    return {
      id: parseInt(documentType.getId()),
      name: documentType.getname(),
      code: documentType.getcode(),
      created_at: documentType.getCreatedAt(),
      updated_at: documentType.getUpdatedAt(),
      deleted_at: documentType.getDeletedAt(),
    };
  };

  // Reset state
  const resetState = () => {
    documentType.value = [];
    currentDocumentType.value = null;
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
    documentType,
    currentDocumentType,
    loading,
    error,
    pagination,

    // Getters
    activedocumentType,
    inactivedocumentType,
    totalActivedocumentType,
    totalInactivedocumentType,

    // Actions
    fetchdocumentType,
    fetchUserById,
    createDocumentType,
    updateDocumentType,
    deleteDocument,
    resetState,
  };
});
