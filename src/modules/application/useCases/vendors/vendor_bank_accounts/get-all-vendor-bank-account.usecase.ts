import type { VendorsBankAccountsRepository } from "@/modules/domain/repository/vendors/vendors_bank_accounts/vendor-bank-accounts.repository";
import type { VendorsBankAccountEntity } from "@/modules/domain/entities/vendors/vendor_bank_accounts/vendors-bank-accounts.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class GetAllVendorAccountsUseCase {
  constructor(private readonly vendorAccountsRepository: VendorsBankAccountsRepository) {}

  async execute(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<VendorsBankAccountEntity>> {
    return await this.vendorAccountsRepository.findAll(params, includeDeleted);
  }
}
