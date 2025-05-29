import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import type {
  VendorVankAccountInterface,
  CreateVendorBankAccountInterface,
  UpdateVendorBankAccountInterface,
} from "@/modules/interfaces/vendors/vendor_bank_accounts/vendor-bank-accounts.interface";
import type { VendorsBankAccountEntity } from "@/modules/domain/entities/vendors/vendor_bank_accounts/vendors-bank-accounts.entities";
import type { PaginationParams } from "@/modules/shared/pagination";
import { VendorBankAccountsServiceImpl } from "@/modules/application/services/vendors/vendor_bank_accounts/vendor-bank-accounts.service";
import { ApiVendorsBankAccountsRepository } from "@/modules/infrastructure/vendors/api-vendor-bank-accounts.repository";
import { dataVendorBankAccounts } from "@/modules/shared/utils/data-vendors-bank-accounts";

const createVendorBankAccountService = () => {
  const bankAccountRepository = new ApiVendorsBankAccountsRepository();
  return new VendorBankAccountsServiceImpl(bankAccountRepository);
};

export const useVendorBankAccountStore = defineStore("vendor-bank-account", () => {
  // Service
  const bankAccountService = createVendorBankAccountService();

  // State
  const bankAccounts: Ref<VendorsBankAccountEntity[]> = ref([]);
  const currentBankAccount: Ref<VendorsBankAccountEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Getters
  const activeBankAccounts = computed(() =>
    bankAccounts.value.filter((account) => !account.isDeleted())
  );
  const inactiveBankAccounts = computed(() =>
    bankAccounts.value.filter((account) => account.isDeleted())
  );
  const totalActiveBankAccounts = computed(() => activeBankAccounts.value.length);
  const totalInactiveBankAccounts = computed(() => inactiveBankAccounts.value.length);

  // Actions
  const fetchBankAccounts = async (params: PaginationParams = { page: 1, limit: 10 }) => {
    loading.value = true;
    error.value = null;

    try {
      // In development, use mock data
      if (process.env.NODE_ENV === "development") {
        const startIndex = (params.page - 1) * params.limit;
        const endIndex = startIndex + params.limit;
        const filteredData = dataVendorBankAccounts.value.filter((account) => {
          if (!params.search) return true;
          return (
            account.bank_name.toLowerCase().includes(params.search.toLowerCase()) ||
            account.account_name.toLowerCase().includes(params.search.toLowerCase()) ||
            account.account_number.includes(params.search)
          );
        });

        const paginatedData = filteredData.slice(startIndex, endIndex);
        const total = filteredData.length;

        return {
          data: paginatedData,
          page: params.page,
          limit: params.limit,
          total,
          totalPages: Math.ceil(total / params.limit),
        };
      }

      // In production, use actual API
      const result = await bankAccountService.getAllVendorsBankAccount(params);
      bankAccounts.value = result.data;
      pagination.value = {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      };
      return {
        data: result.data.map(bankAccountEntityToInterface),
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

  const fetchBankAccountById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      if (process.env.NODE_ENV === "development") {
        const account = dataVendorBankAccounts.value.find((a) => a.id === id);
        return account || null;
      }

      const account = await bankAccountService.getVendorsBankAccount(id);
      currentBankAccount.value = account;
      return account ? bankAccountEntityToInterface(account) : null;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createBankAccount = async (accountData: CreateVendorBankAccountInterface) => {
    loading.value = true;
    error.value = null;

    try {
      if (process.env.NODE_ENV === "development") {
        const newAccount: VendorVankAccountInterface = {
          id: (dataVendorBankAccounts.value.length + 1).toString(),
          ...accountData,
          is_selected: accountData.is_selected ?? false,
          created_at: new Date().toISOString().replace("T", " ").split(".")[0],
          updated_at: new Date().toISOString().replace("T", " ").split(".")[0],
          deleted_at: null,
        };
        dataVendorBankAccounts.value.unshift(newAccount);
        return newAccount;
      }

      const account = await bankAccountService.createVendorsBankAccount(accountData);
      bankAccounts.value = [account, ...bankAccounts.value];
      return bankAccountEntityToInterface(account);
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateBankAccount = async (id: string, accountData: UpdateVendorBankAccountInterface) => {
    loading.value = true;
    error.value = null;

    try {
      if (process.env.NODE_ENV === "development") {
        const index = dataVendorBankAccounts.value.findIndex((a) => a.id === id);
        if (index !== -1) {
          dataVendorBankAccounts.value[index] = {
            ...dataVendorBankAccounts.value[index],
            ...accountData,
            updated_at: new Date().toISOString().replace("T", " ").split(".")[0],
          };
          return dataVendorBankAccounts.value[index];
        }
        throw new Error("Bank account not found");
      }

      const updatedAccount = await bankAccountService.updateVendorsBankAccount(id, accountData);
      const index = bankAccounts.value.findIndex((a) => a.getId() === id);
      if (index !== -1) {
        bankAccounts.value[index] = updatedAccount;
      }
      if (currentBankAccount.value && currentBankAccount.value.getId() === id) {
        currentBankAccount.value = updatedAccount;
      }

      return bankAccountEntityToInterface(updatedAccount);
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteBankAccount = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      if (process.env.NODE_ENV === "development") {
        const index = dataVendorBankAccounts.value.findIndex((a) => a.id === id);
        if (index !== -1) {
          dataVendorBankAccounts.value[index].deleted_at = new Date()
            .toISOString()
            .replace("T", " ")
            .split(".")[0];
          return true;
        }
        return false;
      }

      const result = await bankAccountService.deleteVendorsBankAccount(id);
      if (result) {
        const index = bankAccounts.value.findIndex((a) => a.getId() === id);
        if (index !== -1) {
          bankAccounts.value[index].delete();
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

  // Helper function to convert Entity to Interface
  const bankAccountEntityToInterface = (
    account: VendorsBankAccountEntity
  ): VendorVankAccountInterface => {
    return {
      id: account.getId(),
      vendor_id: account.getvendor_id(),
      currency_id: account.getcurrency_id(),
      bank_name: account.getBankName(),
      account_name: account.getAccountName(),
      account_number: account.getAccountNumber(),
      is_selected: account.getIsSelected(),
      created_at: account.getcreated_at(),
      updated_at: account.getupdated_at(),
      deleted_at: account.getdeleted_at(),
    };
  };

  // Reset state
  const resetState = () => {
    bankAccounts.value = [];
    currentBankAccount.value = null;
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
    bankAccounts,
    currentBankAccount,
    loading,
    error,
    pagination,

    // Getters
    activeBankAccounts,
    inactiveBankAccounts,
    totalActiveBankAccounts,
    totalInactiveBankAccounts,

    // Actions
    fetchBankAccounts,
    fetchBankAccountById,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount,
    resetState,
  };
});
