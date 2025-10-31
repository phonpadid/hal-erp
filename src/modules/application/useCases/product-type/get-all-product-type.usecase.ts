import type { ProductTypeEntity } from "@/modules/domain/entities/product-types.entity";
import type { ProductTypeRepository } from "@/modules/domain/repository/product-type.repository";
import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";

export class GetAllProductTypeUseCase {
  constructor(private readonly productTypeRepository: ProductTypeRepository) {}

  async execute(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<ProductTypeEntity>> {
    return await this.productTypeRepository.findAll(params, includeDeleted);
  }
}