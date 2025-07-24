import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import { BankServiceImpl } from "@/modules/application/services/bank.service";
import { ApiBankRepository } from "@/modules/infrastructure/api-bank.repository";
import { Bank } from "@/modules/domain/entities/bank.entity";
import type { CreateBankDTO, UpdateBankDTO } from "@/modules/application/dtos/bank.dto";
import type { PaginationParams } from "@/modules/shared/pagination";

const createBankService = () => {
  const bankRepository = new ApiBankRepository();
  return new BankServiceImpl(bankRepository);
};

export const useBankStore = defineStore("bank", () => {
  const bankService = createBankService();
  const banks: Ref<Bank[]> = ref([]);
  const currentBank: Ref<Bank | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Getters
  const activeBanks = computed(() => banks.value.filter((bank) => !bank.isDeleted()));
  const deletedBanks = computed(() => banks.value.filter((bank) => bank.isDeleted()));
  const totalActiveBanks = computed(() => activeBanks.value.length);
  const totalDeletedBanks = computed(() => deletedBanks.value.length);

  const setPagination = (newPagination: { page: number; limit: number; total: number }) => {
    pagination.value.page = newPagination.page || 1;
    pagination.value.limit = newPagination.limit || 10;
    pagination.value.total = newPagination.total;
  };

  // Actions
  const createBank = async (data: CreateBankDTO) => {
    loading.value = true;
    error.value = null;
    try {
      const bank = await bankService.createBank(data);
      banks.value = [bank, ...banks.value];
      return bank;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchBanks = async (
    params: PaginationParams = { page: 1, limit: 10 },
    includeDeleted = false
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await bankService.getAllBanks(params, includeDeleted);
      banks.value = result.data;
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

  const fetchBankById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      currentBank.value = await bankService.getBankById(id);
      return currentBank.value;
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const getBankByName = async (name: string) => {
    try {
      return await bankService.getBankByName(name);
    } catch (err) {
      console.error("Failed to get bank by name:", err);
      return null;
    }
  };

  const updateBank = async (id: string, data: UpdateBankDTO) => {
    loading.value = true;
    error.value = null;
    try {
      const updatedBank = await bankService.updateBank(id, data);

      if (banks.value.length > 0) {
        const index = banks.value.findIndex((b) => b.getId() === id);
        if (index !== -1) {
          banks.value[index] = updatedBank;
        }
      }

      if (currentBank.value && currentBank.value.getId() === id) {
        currentBank.value = updatedBank;
      }

      return updatedBank;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteBank = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await bankService.deleteBank(id);

      if (banks.value.length > 0) {
        const index = banks.value.findIndex((b) => b.getId() === id);
        if (index !== -1) {
          const deletedBank = banks.value[index];
          banks.value[index] = new Bank(
            deletedBank.getId(),
            deletedBank.getName(),
            deletedBank.getShortName(),
            deletedBank.getLogo(),
            deletedBank.getCreatedAt(),
            new Date().toISOString(),
            new Date()
          );
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

  const restoreBank = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await bankService.restoreBank(id);

      if (banks.value.length > 0) {
        const index = banks.value.findIndex((b) => b.getId() === id);
        if (index !== -1) {
          const restoredBank = banks.value[index];
          banks.value[index] = new Bank(
            restoredBank.getId(),
            restoredBank.getName(),
            restoredBank.getShortName(),
            restoredBank.getLogo(),
            restoredBank.getCreatedAt(),
            new Date().toISOString(),
            null
          );
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

  const searchBanksByName = async (
    name: string,
    params: PaginationParams = { page: 1, limit: 10 }
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await bankService.getAllBanks({
        ...params,
        search: name,
      });
      banks.value = result.data;
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
    banks.value = [];
    currentBank.value = null;
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
    banks,
    currentBank,
    loading,
    error,
    pagination,

    // Getters
    activeBanks,
    deletedBanks,
    totalActiveBanks,
    totalDeletedBanks,

    // Actions
    createBank,
    fetchBanks,
    fetchBankById,
    updateBank,
    deleteBank,
    restoreBank,
    searchBanksByName,
    getBankByName,
    resetState,
    setPagination,
  };
});
