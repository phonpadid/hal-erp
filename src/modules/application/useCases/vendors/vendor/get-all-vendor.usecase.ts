import type { VendorsRepository } from "@/modules/domain/repository/vendors/vendor/vendor.repisitory";
import type { VendorsEntity } from "@/modules/domain/entities/vendors/vendor/vendors.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class GetAllVendorUseCase {
  constructor(private readonly userRepository: VendorsRepository) {}

  async execute(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<VendorsEntity>> {
    return await this.userRepository.findAll(params, includeDeleted);
  }
}
