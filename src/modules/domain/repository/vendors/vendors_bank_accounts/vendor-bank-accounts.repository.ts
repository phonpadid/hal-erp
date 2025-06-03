import type {
  CreateVendorBankAccountInterface,
  UpdateVendorBankAccountInterface,
} from "@/modules/interfaces/vendors/vendor_bank_accounts/vendor-bank-accounts.interface";
import type { VendorsBankAccountEntity } from "@/modules/domain/entities/vendors/vendor_bank_accounts/vendors-bank-accounts.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface VendorsBankAccountsRepository {
  findAll(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<VendorsBankAccountEntity>>;
  findById(id: string): Promise<VendorsBankAccountEntity | null>;
  create(
    vendorsBankAccountsData: CreateVendorBankAccountInterface
  ): Promise<VendorsBankAccountEntity>;
  update(
    id: string,
    vendorsBankAccountsData: UpdateVendorBankAccountInterface
  ): Promise<VendorsBankAccountEntity>;
  toggleIsSelected(id: string, isSelected: boolean): Promise<VendorsBankAccountEntity>;
  delete(id: string): Promise<boolean>;
}
