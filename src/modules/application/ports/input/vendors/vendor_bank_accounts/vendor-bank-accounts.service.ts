import type {
  CreateVendorBankAccountDto,
  UpdateVendorBankAccountDto,
} from "@/modules/application/dtos/vendors/vendor_bank_accounts/vendor-bank-accounts";
import type { VendorsBankAccountEntity } from "@/modules/domain/entities/vendors/vendor_bank_accounts/vendors-bank-accounts.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface VendorBankAccountsService {
  createVendorsBankAccount(
    createVendorsBankAccountDTO: CreateVendorBankAccountDto
  ): Promise<VendorsBankAccountEntity>;
  getVendorsBankAccountById(id: string): Promise<VendorsBankAccountEntity | null>;
  getVendorsBankAccountByName(name: string): Promise<VendorsBankAccountEntity | null>;
  getAllVendorsBankAccount(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<VendorsBankAccountEntity>>;
  updateVendorsBankAccount(
    id: string,
    updateVendorsBankAccountDTO: UpdateVendorBankAccountDto
  ): Promise<VendorsBankAccountEntity>;
  deleteVendorsBankAccount(id: string): Promise<boolean>;
}
