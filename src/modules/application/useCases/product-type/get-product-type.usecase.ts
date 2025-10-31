import type { ProductTypeRepository } from "@/modules/domain/repository/product-type.repository";
import type { ProductTypeEntity } from "../../../domain/entities/product-types.entity";

export class GetProductTypeUseCase {
  constructor(private readonly productTypeRepository: ProductTypeRepository) {}

  async execute(id: string): Promise<ProductTypeEntity> {
    const productType = await this.productTypeRepository.findById(id);
    if (!productType) {
      throw new Error(`Product type with id ${id} not found`);
    }
    return productType;
  }
}