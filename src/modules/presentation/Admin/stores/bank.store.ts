import type { BankCreate, BankUpdate, BankInterface } from "@/modules/interfaces/bank.interface";
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import type { BankEntity } from "@/modules/domain/entities/bank.entity";
import type { PaginationParams } from "@/modules/shared/pagination";
import { BankServiceImpl } from "@/modules/application/services/bank.service";
import { ApiBankRepository } from "@/modules/infrastructure/api-bank.repository";

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

  const activeBanks = computed(() => banks.value.filter((bank) => !bank.isDeleted()));
  const inactiveBanks = computed(() => banks.value.filter((bank) => bank.isDeleted()));
  const totalActiveBanks = computed(() => activeBanks.value.length);
  const totalInactiveBanks = computed(() => inactiveBanks.value.length);

  const fetchBanks = async (params: PaginationParams = { page: 1, limit: 10 }) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await bankService.getAllBanks(params);

      banks.value = result.data;
      pagination.value = {
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
    loading.value = true;
    error.value = null;
    try {
      const bank = await bankService.createBank(bankData);
      banks.value = [bank, ...banks.value];
      return BankEntityToInterface(bank);
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateBank = async (id: string, bankData: BankUpdate) => {
    loading.value = true;
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
      loading.value = false;
    }
  };

  const deleteBank = async (id: string) => {
    loading.value = true;
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
      loading.value = false;
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

  const setPagination = (newPagination: { page: number; limit: number; total: number }) => {
    pagination.value.page = newPagination.page || 1;
    pagination.value.limit = newPagination.limit || 10;
    pagination.value.total = newPagination.total;
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
    banks,
    currentBank,
    loading,
    error,
    pagination,
    activeBanks,
    inactiveBanks,
    totalActiveBanks,
    totalInactiveBanks,
    fetchBanks,
    fetchBankById,
    createBank,
    updateBank,
    deleteBank,
    resetState,
    setPagination,
  };
});
