import type { VendorsBankAccountsRepository } from "@/modules/domain/repository/vendors/vendors_bank_accounts/vendor-bank-accounts.repository";

export class DeleteVendorBankAccountsUseCase {
  constructor(private readonly vendorAccountsRepository: VendorsBankAccountsRepository) {}

  async execute(id: string): Promise<boolean> {
    const vendorAccounts = await this.vendorAccountsRepository.findById(id);
    if (!vendorAccounts) {
      throw new Error(`Vendor with id ${id} not found`);
    }
    if (vendorAccounts.isDeleted()) {
      throw new Error(`vendor with id ${id} is already deleted`);
    }
    return await this.vendorAccountsRepository.delete(id);
  }
}
