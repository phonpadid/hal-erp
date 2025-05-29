import type {
  CreateVendorBankAccountInterface,
  UpdateVendorBankAccountInterface,
} from "@/modules/interfaces/vendors/vendor_bank_accounts/vendor-bank-accounts.interface";
import type { VendorsBankAccountsRepository } from "@/modules/domain/repository/vendors/vendors_bank_accounts/vendor-bank-accounts.repository";
import type { VendorsBankAccountEntity } from "@/modules/domain/entities/vendors/vendor_bank_accounts/vendors-bank-accounts.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface VendorBankAccountServices {
  getAllVendorsBankAccount(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<VendorsBankAccountEntity>>;
  getVendorsBankAccount(id: string): Promise<VendorsBankAccountEntity | null>;

  createVendorsBankAccount(vendorData: CreateVendorBankAccountInterface): Promise<VendorsBankAccountEntity>;
  updateVendorsBankAccount(
    id: string,
    vendorData: UpdateVendorBankAccountInterface
  ): Promise<VendorsBankAccountEntity>;

  deleteVendorsBankAccount(id: string): Promise<boolean>;
}

export class VendorBankAccountsServiceImpl implements VendorBankAccountServices {
  constructor(private readonly vendorsBankAccountRepository: VendorsBankAccountsRepository) {}

  async getAllVendorsBankAccount(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<VendorsBankAccountEntity>> {
    return await this.vendorsBankAccountRepository.findAll(params, includeDeleted);
  }

  async getVendorsBankAccount(id: string): Promise<VendorsBankAccountEntity | null> {
    return await this.vendorsBankAccountRepository.findById(id);
  }

  async createVendorsBankAccount(
    vendorData: CreateVendorBankAccountInterface
  ): Promise<VendorsBankAccountEntity> {
    return await this.vendorsBankAccountRepository.create(vendorData);
  }

  async updateVendorsBankAccount(
    id: string,
    vendorData: UpdateVendorBankAccountInterface
  ): Promise<VendorsBankAccountEntity> {
    const vendors = await this.vendorsBankAccountRepository.findById(id);
    if (!vendors) {
      throw new Error(`Vendors with id ${id} not found`);
    }
    return await this.vendorsBankAccountRepository.update(id, vendorData);
  }

  async deleteVendorsBankAccount(id: string): Promise<boolean> {
    const Vendors = await this.vendorsBankAccountRepository.findById(id);
    if (!Vendors) {
      throw new Error(`Vendors with id ${id} not found`);
    }
    if (Vendors.isDeleted()) {
      throw new Error(`Vendors with id ${id} is already deleted`);
    }

    return await this.vendorsBankAccountRepository.delete(id);
  }
}
