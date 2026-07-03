/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import { ref, computed, reactive } from "vue";
import type { Ref } from "vue";
import type { CompanyVendorEntity } from "@/modules/domain/entities/company-vendor.entity";
import type { CompanyVendorCreate, CompanyVendorUpdate } from "@/modules/interfaces/company-vendor.interface";
import type { PaginationParams } from "@/modules/shared/pagination";
import { CompanyVendorServiceImpl } from "@/modules/application/services/company-vendor.service";
import { ApiCompanyVendorRepository } from "@/modules/infrastructure/api-company-vendor.repository";

export const companyVendorFormModel = reactive({
  vendor_id: undefined as number | undefined,
  status: "active" as string,
  credit_term_days: 0 as number,
  credit_limit: 0 as number,
  payment_term: "" as string,
  company_id: undefined as number | undefined,
});

const createCompanyVendorService = () => {
  const repository = new ApiCompanyVendorRepository();
  return new CompanyVendorServiceImpl(repository);
};

export const useCompanyVendorStore = defineStore("companyVendor", () => {
  const companyVendorService = createCompanyVendorService();
  const companyVendors: Ref<CompanyVendorEntity[]> = ref([]);
  const currentCompanyVendor: Ref<CompanyVendorEntity | null> = ref(null);
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
  const selectedCompanyVendorId = ref<string | null>(null);

  const tablePagination = computed(() => ({
    current: pagination.value.page,
    pageSize: pagination.value.limit,
    total: pagination.value.total,
    showSizeChanger: true,
  }));

  const mappedCompanyVendors = computed(() =>
    companyVendors.value.map((cv) => ({
      id: cv.getId(),
      company_id: cv.getCompanyId(),
      vendor_id: cv.getVendorId(),
      vendor_name: cv.getVendorName(),
      company_name: cv.getCompanyName(),
      status: cv.getStatus(),
      credit_term_days: cv.getCreditTermDays(),
      credit_limit: cv.getCreditLimit(),
      payment_term: cv.getPaymentTerm(),
      createdAt: cv.getCreatedAt(),
      updatedAt: cv.getUpdatedAt(),
      deleted_at: cv.getDeletedAt(),
    }))
  );

  const fetchCompanyVendors = async (
    params: PaginationParams = { page: 1, limit: 10 }
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await companyVendorService.getAllCompanyVendors(params);
      companyVendors.value = result.data;
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

  const assignCompanyVendor = async (data: CompanyVendorCreate) => {
    submitLoading.value = true;
    error.value = null;
    try {
      const created = await companyVendorService.assignCompanyVendor(data);
      companyVendors.value = [created, ...companyVendors.value];
      return created;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      submitLoading.value = false;
    }
  };

  const updateCompanyVendor = async (id: string, data: CompanyVendorUpdate) => {
    submitLoading.value = true;
    error.value = null;
    try {
      const updated = await companyVendorService.updateCompanyVendor(id, data);
      const index = companyVendors.value.findIndex((cv) => cv.getId() === id);
      if (index !== -1) {
        companyVendors.value[index] = updated;
      }
      return updated;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      submitLoading.value = false;
    }
  };

  const deleteCompanyVendor = async (id: string) => {
    submitLoading.value = true;
    error.value = null;
    try {
      const result = await companyVendorService.deleteCompanyVendor(id);
      if (result) {
        const index = companyVendors.value.findIndex((cv) => cv.getId() === id);
        if (index !== -1) {
          companyVendors.value[index].delete();
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
    companyVendorFormModel.vendor_id = undefined;
    companyVendorFormModel.status = "active";
    companyVendorFormModel.credit_term_days = 0;
    companyVendorFormModel.credit_limit = 0;
    companyVendorFormModel.payment_term = "";
    companyVendorFormModel.company_id = undefined;
  };

  const resetState = () => {
    companyVendors.value = [];
    currentCompanyVendor.value = null;
    error.value = null;
    pagination.value = { page: 1, limit: 10, total: 0, totalPages: 0 };
    searchKeyword.value = "";
    modalVisible.value = false;
    deleteModalVisible.value = false;
    submitLoading.value = false;
    isEditMode.value = false;
    selectedCompanyVendorId.value = null;
    resetForm();
  };

  // Modal actions
  const showCreateModal = () => {
    resetForm();
    isEditMode.value = false;
    selectedCompanyVendorId.value = null;
    modalVisible.value = true;
  };

  const showEditModal = (record: any) => {
    companyVendorFormModel.vendor_id = record.vendor_id ? Number(record.vendor_id) : undefined;
    companyVendorFormModel.status = record.status ?? "active";
    companyVendorFormModel.credit_term_days = Number(record.credit_term_days ?? 0);
    companyVendorFormModel.credit_limit = Number(record.credit_limit ?? 0);
    companyVendorFormModel.payment_term = record.payment_term ?? "";
    companyVendorFormModel.company_id = record.company_id ? Number(record.company_id) : undefined;
    isEditMode.value = true;
    selectedCompanyVendorId.value = record.id;
    modalVisible.value = true;
  };

  const showDeleteModal = (record: any) => {
    selectedCompanyVendorId.value = record.id;
    companyVendorFormModel.vendor_id = record.vendor_id ? Number(record.vendor_id) : undefined;
    deleteModalVisible.value = true;
  };

  const handleModalOk = (formRef: any) => {
    formRef?.submitForm();
  };

  const handleModalCancel = () => {
    modalVisible.value = false;
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCompanyVendorId.value) return;
    try {
      submitLoading.value = true;
      await deleteCompanyVendor(selectedCompanyVendorId.value);
      deleteModalVisible.value = false;
      await fetchCompanyVendors({ page: pagination.value.page, limit: pagination.value.limit, search: searchKeyword.value });
    } catch (err) {
      console.error("Error unassigning company vendor:", err);
    } finally {
      submitLoading.value = false;
    }
  };

  return {
    // data
    companyVendors,
    currentCompanyVendor,
    loading,
    error,
    pagination,
    companyVendorFormModel,
    searchKeyword,
    modalVisible,
    deleteModalVisible,
    submitLoading,
    isEditMode,
    selectedCompanyVendorId,
    tablePagination,
    mappedCompanyVendors,

    // actions
    fetchCompanyVendors,
    assignCompanyVendor,
    updateCompanyVendor,
    deleteCompanyVendor,
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
