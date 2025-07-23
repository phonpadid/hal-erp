import type { CreateVendorBankAccountInterface } from "@/modules/interfaces/vendors/vendor_bank_accounts/vendor-bank-accounts.interface";
import type { VendorsBankAccountsRepository } from "@/modules/domain/repository/vendors/vendors_bank_accounts/vendor-bank-accounts.repository";
import type { VendorsBankAccountEntity } from "@/modules/domain/entities/vendors/vendor_bank_accounts/vendors-bank-accounts.entities";

export class CreateVendorsBankAccountsUseCase {
  constructor(private readonly vendorBankAccpuntsRepository: VendorsBankAccountsRepository) {}

  async execute(vendorBankAccpunts: CreateVendorBankAccountInterface): Promise<VendorsBankAccountEntity> {
    return await this.vendorBankAccpuntsRepository.create(vendorBankAccpunts);
  }
}
