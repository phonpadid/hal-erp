import type { VendorCreateInteface } from "@/modules/interfaces/vendors/vendor/vendor.interfacce";
import type { VendorsRepository } from "@/modules/domain/repository/vendors/vendor/vendor.repisitory";
import type { VendorsEntity } from "@/modules/domain/entities/vendors/vendor/vendors.entities";

export class CreateVendorsUseCase {
  constructor(private readonly vendorRepository: VendorsRepository) {}

  async execute(vendorData: VendorCreateInteface): Promise<VendorsEntity> {
    return await this.vendorRepository.create(vendorData);
  }
}
