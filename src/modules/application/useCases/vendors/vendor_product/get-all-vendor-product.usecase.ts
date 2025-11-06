import type { VendorProductEntity } from "@/modules/domain/entities/vendors/vendor_product/vendor-product.entity";
import type { VendorProductRepository } from "@/modules/domain/repository/vendors/vendor_product/vendor-product.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class GetAllVendorProductUseCase {
  constructor(private vendorProductRepository: VendorProductRepository) {}

  async execute(
    params?: PaginationParams,
    vendorId?: string,
    productId?: string,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<VendorProductEntity>> {
    return await this.vendorProductRepository.findAll(params, vendorId, productId, includeDeleted);
  }
}