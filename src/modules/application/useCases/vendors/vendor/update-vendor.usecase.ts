import type { VendorsRepository } from "@/modules/domain/repository/vendors/vendor/vendor.repisitory";
import type { VendorsEntity } from "@/modules/domain/entities/vendors/vendor/vendors.entities";
import type { VendorUpdateIntrface } from "@/modules/interfaces/vendors/vendor/vendor.interfacce";

export class UpdateVendorsUseCase {
  constructor(private readonly vendorRepository: VendorsRepository) {}

  async execute(id: string, vendorData: VendorUpdateIntrface): Promise<VendorsEntity> {
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) {
      throw new Error(`vendor with id ${id} not found`);
    }
    if (vendor.isDeleted()) {
      throw new Error(`Cannot update deleted vendor with id ${id}`);
    }

    return await this.vendorRepository.update(id, vendorData);
  }
}
