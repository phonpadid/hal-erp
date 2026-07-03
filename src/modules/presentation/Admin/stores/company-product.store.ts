/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import { ref, computed, reactive } from "vue";
import type { Ref } from "vue";
import type { CompanyProductEntity } from "@/modules/domain/entities/company-product.entity";
import type { CompanyProductCreate, CompanyProductUpdate } from "@/modules/interfaces/company-product.interface";
import type { PaginationParams } from "@/modules/shared/pagination";
import { CompanyProductServiceImpl } from "@/modules/application/services/company-product.service";
import { ApiCompanyProductRepository } from "@/modules/infrastructure/api-company-product.repository";

export const companyProductFormModel = reactive({
  product_ids: [] as number[],
  status: "active" as string,
  company_id: undefined as number | undefined,
});

const createCompanyProductService = () => {
  const repository = new ApiCompanyProductRepository();
  return new CompanyProductServiceImpl(repository);
};

export const useCompanyProductStore = defineStore("companyProduct", () => {
  const companyProductService = createCompanyProductService();
  const companyProducts: Ref<CompanyProductEntity[]> = ref([]);
  const currentCompanyProduct: Ref<CompanyProductEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // UI state
  const searchKeyword = ref("");
  const modalVisible = ref(false);
  const deleteModalVisible = ref(false);
  const submitLoading = ref(false);
  const isEditMode = ref(false);
  const selectedCompanyProductId = ref<string | null>(null);

  const tablePagination = computed(() => ({
    current: pagination.value.page,
    pageSize: pagination.value.limit,
    total: pagination.value.total,
    showSizeChanger: true,
  }));

  const mappedCompanyProducts = computed(() =>
    companyProducts.value.map((cp) => ({
      id: cp.getId(),
      company_id: cp.getCompanyId(),
      product_id: cp.getProductId(),
      product_name: cp.getProductName(),
      company_name: cp.getCompanyName(),
      status: cp.getStatus(),
      createdAt: cp.getCreatedAt(),
      updatedAt: cp.getUpdatedAt(),
      deleted_at: cp.getDeletedAt(),
    }))
  );

  const fetchCompanyProducts = async (
    params: PaginationParams = { page: 1, limit: 10 }
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await companyProductService.getAllCompanyProducts(params);
      companyProducts.value = result.data;
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

  const assignCompanyProducts = async (data: CompanyProductCreate) => {
    submitLoading.value = true;
    error.value = null;
    try {
      return await companyProductService.assignCompanyProducts(data);
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      submitLoading.value = false;
    }
  };

  const updateCompanyProduct = async (id: string, data: CompanyProductUpdate) => {
    submitLoading.value = true;
    error.value = null;
    try {
      const updated = await companyProductService.updateCompanyProduct(id, data);
      const index = companyProducts.value.findIndex((cp) => cp.getId() === id);
      if (index !== -1) {
        companyProducts.value[index] = updated;
      }
      return updated;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      submitLoading.value = false;
    }
  };

  const deleteCompanyProduct = async (id: string) => {
    submitLoading.value = true;
    error.value = null;
    try {
      const result = await companyProductService.deleteCompanyProduct(id);
      if (result) {
        const index = companyProducts.value.findIndex((cp) => cp.getId() === id);
        if (index !== -1) {
          companyProducts.value[index].delete();
        }
      }
      return result;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      submitLoading.value = false;
    }
  };

  const setPagination = (newPagination: { page: number; limit: number; total: number }) => {
    pagination.value.page = newPagination.page || 1;
    pagination.value.limit = newPagination.limit || 10;
    pagination.value.total = newPagination.total;
  };

  const resetForm = () => {
    companyProductFormModel.product_ids = [];
    companyProductFormModel.status = "active";
    companyProductFormModel.company_id = undefined;
  };

  const resetState = () => {
    companyProducts.value = [];
    currentCompanyProduct.value = null;
    error.value = null;
    pagination.value = { page: 1, limit: 10, total: 0, totalPages: 0 };
    searchKeyword.value = "";
    modalVisible.value = false;
    deleteModalVisible.value = false;
    submitLoading.value = false;
    isEditMode.value = false;
    selectedCompanyProductId.value = null;
    resetForm();
  };

  // Modal actions
  const showCreateModal = () => {
    resetForm();
    isEditMode.value = false;
    selectedCompanyProductId.value = null;
    modalVisible.value = true;
  };

  const showEditModal = (record: any) => {
    // Edit only changes status (product/company are fixed once assigned)
    companyProductFormModel.product_ids = record.product_id ? [Number(record.product_id)] : [];
    companyProductFormModel.status = record.status ?? "active";
    companyProductFormModel.company_id = record.company_id ? Number(record.company_id) : undefined;
    isEditMode.value = true;
    selectedCompanyProductId.value = record.id;
    modalVisible.value = true;
  };

  const showDeleteModal = (record: any) => {
    selectedCompanyProductId.value = record.id;
    companyProductFormModel.product_ids = record.product_id ? [Number(record.product_id)] : [];
    deleteModalVisible.value = true;
  };

  const handleModalOk = (formRef: any) => {
    formRef?.submitForm();
  };

  const handleModalCancel = () => {
    modalVisible.value = false;
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCompanyProductId.value) return;
    try {
      submitLoading.value = true;
      await deleteCompanyProduct(selectedCompanyProductId.value);
      deleteModalVisible.value = false;
      await fetchCompanyProducts({ page: pagination.value.page, limit: pagination.value.limit, search: searchKeyword.value });
    } catch (err) {
      console.error("Error unassigning company product:", err);
    } finally {
      submitLoading.value = false;
    }
  };

  return {
    // data
    companyProducts,
    currentCompanyProduct,
    loading,
    error,
    pagination,
    companyProductFormModel,
    searchKeyword,
    modalVisible,
    deleteModalVisible,
    submitLoading,
    isEditMode,
    selectedCompanyProductId,
    tablePagination,
    mappedCompanyProducts,

    // actions
    fetchCompanyProducts,
    assignCompanyProducts,
    updateCompanyProduct,
    deleteCompanyProduct,
    setPagination,
    resetForm,
    resetState,

    // modal actions
    showCreateModal,
    showEditModal,
    showDeleteModal,
    handleModalOk,
    handleModalCancel,
    handleDeleteConfirm,
  };
});
