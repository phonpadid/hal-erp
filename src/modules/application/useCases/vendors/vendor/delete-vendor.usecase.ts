import type { VendorsRepository } from "@/modules/domain/repository/vendors/vendor/vendor.repisitory";

export class DeleteVendorUseCase {
  constructor(private readonly vendorRepository: VendorsRepository) {}

  async execute(id: string): Promise<boolean> {
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) {
      throw new Error(`Vendor with id ${id} not found`);
    }
    if (vendor.isDeleted()) {
      throw new Error(`vendor with id ${id} is already deleted`);
    }
    return await this.vendorRepository.delete(id);
  }
}
