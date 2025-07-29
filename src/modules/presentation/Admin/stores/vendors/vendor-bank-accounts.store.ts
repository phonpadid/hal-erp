import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import type {
  VendorBankAccountInterface,
  CreateVendorBankAccountInterface,
  UpdateVendorBankAccountInterface,
} from "@/modules/interfaces/vendors/vendor_bank_accounts/vendor-bank-accounts.interface";
import type { VendorsBankAccountEntity } from "@/modules/domain/entities/vendors/vendor_bank_accounts/vendors-bank-accounts.entities";
import type { PaginationParams } from "@/modules/shared/pagination";
import { VendorBankAccountsServiceImpl } from "@/modules/application/services/vendors/vendor_bank_accounts/vendor-bank-accounts.service";
import { ApiVendorsBankAccountsRepository } from "@/modules/infrastructure/vendors/api-vendor-bank-accounts.repository";

// สร้าง service instance สำหรับจัดการข้อมูลบัญชีธนาคารของผู้ขาย
const createVendorBankAccountService = () => {
  const bankAccountRepository = new ApiVendorsBankAccountsRepository();
  return new VendorBankAccountsServiceImpl(bankAccountRepository);
};

export const useVendorBankAccountStore = defineStore("vendor-bank-account", () => {
  // สร้าง Service instance
  const bankAccountService = createVendorBankAccountService();

  // State หลัก
  const bankAccounts: Ref<VendorsBankAccountEntity[]> = ref([]); // รายการบัญชีธนาคารทั้งหมด
  const currentBankAccount: Ref<VendorsBankAccountEntity | null> = ref(null); // บัญชีที่กำลังทำงานอยู่
  const loading = ref(false); // สถานะการโหลดข้อมูล
  const error: Ref<Error | null> = ref(null); // ข้อผิดพลาดที่เกิดขึ้น
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Getters สำหรับกรองข้อมูล
  const activeBankAccounts = computed(() =>
    bankAccounts.value.filter((account) => !account.isDeleted())
  );
  const inactiveBankAccounts = computed(() =>
    bankAccounts.value.filter((account) => account.isDeleted())
  );
  const totalActiveBankAccounts = computed(() => activeBankAccounts.value.length);
  const totalInactiveBankAccounts = computed(() => inactiveBankAccounts.value.length);

  // ดึงรายการบัญชีธนาคารทั้งหมด
  const fetchBankAccounts = async (
    vendorId: number,
    params: PaginationParams = { page: 1, limit: 10 }
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await bankAccountService.getAllVendorsBankAccount(vendorId, params);
      bankAccounts.value = result.data;
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
  const fetchBankAccountById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
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
  const toggleBankAccountSelection = async (id: string, isSelected: boolean) => {
    loading.value = true;
    error.value = null;

    try {
      const updatedAccount = await bankAccountService.toggleVendorsBankAccountSelection(
        id,
        isSelected
      );
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

  // แปลงข้อมูลจาก Entity เป็น Interface
  const bankAccountEntityToInterface = (
    account: VendorsBankAccountEntity
  ): VendorBankAccountInterface => {
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

  const resetState = () => {
    bankAccounts.value = [];
    currentBankAccount.value = null;
    error.value = null;
    pagination.value = {
      page: 1,
      limit: 1,
      total: 0,
      totalPages: 0,
    };
  };

  const setPagination = (newPagination: { page: number; limit: number; total: number }) => {
    pagination.value.page = newPagination.page || 1;
    pagination.value.limit = newPagination.limit || 10;
    pagination.value.total = newPagination.total;
  };

  return {
    // State
    bankAccounts,
    currentBankAccount,
    loading,
    error,
    pagination,
    setPagination,

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
    toggleBankAccountSelection,
  };
});
