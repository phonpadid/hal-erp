import type { VendorsBankAccountsRepository } from "@/modules/domain/repository/vendors/vendors_bank_accounts/vendor-bank-accounts.repository";
import type { VendorsBankAccountEntity } from "@/modules/domain/entities/vendors/vendor_bank_accounts/vendors-bank-accounts.entities";
import type { UpdateVendorBankAccountInterface } from "@/modules/interfaces/vendors/vendor_bank_accounts/vendor-bank-accounts.interface";

export class UpdateVendorsUseCase {
  constructor(private readonly vendorAccountsRepository: VendorsBankAccountsRepository) {}

  async execute(
    id: string,
    vendorAccountsData: UpdateVendorBankAccountInterface
  ): Promise<VendorsBankAccountEntity> {
    const vendor = await this.vendorAccountsRepository.findById(id);
    if (!vendor) {
      throw new Error(`vendor with id ${id} not found`);
    }
    if (vendor.isDeleted()) {
      throw new Error(`Cannot update deleted vendor with id ${id}`);
    }

    return await this.vendorAccountsRepository.update(id, vendorAccountsData);
  }
}
