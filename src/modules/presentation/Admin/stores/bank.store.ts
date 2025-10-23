/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BankCreate, BankUpdate, BankInterface } from "@/modules/interfaces/bank.interface";
import { defineStore } from "pinia";
import { ref, computed, reactive } from "vue";
import type { Ref } from "vue";
import type { BankEntity } from "@/modules/domain/entities/bank.entity";
import type { PaginationParams } from "@/modules/shared/pagination";
import { BankServiceImpl } from "@/modules/application/services/bank.service";
import { ApiBankRepository } from "@/modules/infrastructure/api-bank.repository";

export const bankFormModel = reactive({
  name: "",
  short_name: "",
  logo: null as string | File | null,
  logoUrl: null as string | null,
});
const logoFile = ref<string | File | null>(null);

const createBankService = () => {
  const bankRepository = new ApiBankRepository();
  return new BankServiceImpl(bankRepository);
};

export const useBankStore = defineStore("bank", () => {
  const bankService = createBankService();
  const banks: Ref<BankEntity[]> = ref([]);
  const currentBank: Ref<BankEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // UI State for Bank List View
  const searchKeyword = ref("");
  const modalVisible = ref(false);
  const deleteModalVisible = ref(false);
  const submitLoading = ref(false);
  const isEditMode = ref(false);
  const selectedBankId = ref<string | null>(null);

  // Table pagination
  const tablePagination = computed(() => ({
    current: pagination.value.page,
    pageSize: pagination.value.limit,
    total: pagination.value.total,
    showSizeChanger: true,
  }));

  const mappedBanks = computed(() => banks.value);

  const activeBanks = computed(() => banks.value.filter((bank) => !bank.isDeleted()));
  const inactiveBanks = computed(() => banks.value.filter((bank) => bank.isDeleted()));
  const totalActiveBanks = computed(() => activeBanks.value.length);
  const totalInactiveBanks = computed(() => inactiveBanks.value.length);

  const fetchBanks = async (params: PaginationParams & { search?: string } = { page: 1, limit: 10 }) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await bankService.getAllBanks(params);

      banks.value = result.data;
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

  const fetchBankById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const bank = await bankService.getBankById(id);
      currentBank.value = bank;
      return bank ? BankEntityToInterface(bank) : null;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createBank = async (bankData: BankCreate) => {
    submitLoading.value = true;
    error.value = null;
    try {
      const bank = await bankService.createBank(bankData);
      banks.value = [bank, ...banks.value];
      return BankEntityToInterface(bank);
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      submitLoading.value = false;
    }
  };

  const updateBank = async (id: string, bankData: BankUpdate) => {
    submitLoading.value = true;
    error.value = null;
    try {
      const updatedBank = await bankService.updateBank(id, bankData);
      const index = banks.value.findIndex((b) => b.getId() === id);
      if (index !== -1) {
        banks.value[index] = updatedBank;
      }
      if (currentBank.value && currentBank.value.getId() === id) {
        currentBank.value = updatedBank;
      }
      return BankEntityToInterface(updatedBank);
    } catch (err: unknown) {
      error.value = err as Error;
      throw err;
    } finally {
      submitLoading.value = false;
    }
  };

  const deleteBank = async (id: string) => {
    submitLoading.value = true;
    error.value = null;
    try {
      const result = await bankService.deleteBank(id);
      if (result) {
        const index = banks.value.findIndex((b) => b.getId() === id);
        if (index !== -1) {
          banks.value[index].delete();
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

  const BankEntityToInterface = (bank: BankEntity): BankInterface => {
    return {
      id: parseInt(bank.getId()),
      name: bank.getName(),
      short_name: bank.getShortName(),
      logo: bank.getLogo(),
      created_at: bank.getCreatedAt(),
      updated_at: bank.getUpdatedAt(),
      deleted_at: bank.getDeletedAt(),
    };
  };

  // Pagination setter
  const setPagination = (newPagination: { page: number; limit: number; total: number }) => {
    pagination.value.page = newPagination.page || 1;
    pagination.value.limit = newPagination.limit || 10;
    pagination.value.total = newPagination.total;
  };

  // UI State Actions
  const resetState = () => {
    banks.value = [];
    currentBank.value = null;
    error.value = null;
    pagination.value = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    };
    searchKeyword.value = "";
    modalVisible.value = false;
    deleteModalVisible.value = false;
    submitLoading.value = false;
    isEditMode.value = false;
    selectedBankId.value = null;
    resetForm();
  };

  const resetForm = () => {
    bankFormModel.name = "";
    bankFormModel.logo = null;
    bankFormModel.logoUrl = null;
    bankFormModel.short_name = "";
    logoFile.value = null;
  };

  // -- logoFile state/mutation --
  const setLogoFile = (file: string | File | null) => {
    logoFile.value = file;
    bankFormModel.logo = file;
  };
  const resetLogoFile = () => {
    logoFile.value = null;
  };

  // Modal Actions
  const showCreateModal = () => {
    resetForm();
    isEditMode.value = false;
    selectedBankId.value = null;
    modalVisible.value = true;
  };

  const showEditModal = (bank: any) => {
    bankFormModel.name = bank.name ?? "";
    bankFormModel.short_name = bank.short_name ?? bank.shortName ?? "";
    bankFormModel.logo = null;
    bankFormModel.logoUrl = bank.logoUrl ?? bank.logo ?? null;
    logoFile.value = bank.logoUrl ?? bank.logo ?? null; // Important: set to URL for editing
    isEditMode.value = true;
    selectedBankId.value = bank.id;
    modalVisible.value = true;
  };

  const showDeleteModal = (bank: any) => {
    selectedBankId.value = bank.id;
    bankFormModel.name = bank.name;
    bankFormModel.short_name = bank.short_name ?? bank.shortName ?? "";
    bankFormModel.logo = bank.logo ?? "";
    deleteModalVisible.value = true;
  };

  // Modal handlers for ok/cancel
  const handleModalOk = (bankFormRef: any) => {
    bankFormRef?.submitForm();
  };

  const handleModalCancel = () => {
    modalVisible.value = false;
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBankId.value) return;
    try {
      submitLoading.value = true;
      await deleteBank(selectedBankId.value);
      deleteModalVisible.value = false;
      await fetchBanks({ page: pagination.value.page, limit: pagination.value.limit, search: searchKeyword.value });
    } catch (err) {
      console.error("Error deleting bank:", err);
    } finally {
      submitLoading.value = false;
    }
  };

  return {
    // data
    banks,
    currentBank,
    loading,
    error,
    pagination,
    activeBanks,
    inactiveBanks,
    totalActiveBanks,
    totalInactiveBanks,
    bankFormModel,
    logoFile,
    setLogoFile,
    resetLogoFile,
    searchKeyword,
    modalVisible,
    deleteModalVisible,
    submitLoading,
    isEditMode,
    selectedBankId,
    tablePagination,
    mappedBanks,

    // actions
    fetchBanks,
    fetchBankById,
    createBank,
    updateBank,
    deleteBank,
    resetState,
    setPagination,
    resetForm,

    // modal actions
    showCreateModal,
    showEditModal,
    showDeleteModal,
    handleModalOk,
    handleModalCancel,
    handleDeleteConfirm,
  };
});
