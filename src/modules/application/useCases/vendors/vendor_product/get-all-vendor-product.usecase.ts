import type { VendorProductEntity } from "@/modules/domain/entities/vendor-products/vendor-product.entity";
import type { VendorProductRepository } from "@/modules/domain/repository/vendor-products/vendor-product.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class GetAllVendorProductUseCase {
  constructor(private vendorProductRepository: VendorProductRepository) {}

  async execute(
    params?: PaginationParams,
    vendorId?: number,
    productId?: number,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<VendorProductEntity>> {
    return await this.vendorProductRepository.findAll(params, vendorId, productId, includeDeleted);
  }
}