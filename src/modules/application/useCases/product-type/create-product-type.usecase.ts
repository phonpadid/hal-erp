import type { CreateProductTypeDTO } from "@/modules/application/dtos/product-type.dto";
import type { ProductTypeRepository } from "@/modules/domain/repository/product-type.repository";
import type { ProductTypeEntity } from "@/modules/domain/entities/product-types.entity";

export class CreateProductTypeUseCase {
  constructor(private readonly productTypeRepository: ProductTypeRepository) {}

  async execute(productTypeData: CreateProductTypeDTO): Promise<ProductTypeEntity> {
    const existing = await this.productTypeRepository.findByName(productTypeData.name);
    if (existing) {
      throw new Error(`Product type name "${productTypeData.name}" already exists`);
    }
    // console.log('Proceeding to create product type:', productTypeData);
    return await this.productTypeRepository.create(productTypeData);
  }
}