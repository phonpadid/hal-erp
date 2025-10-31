import type { ProductTypeRepository } from "@/modules/domain/repository/product-type.repository";

export class RestoreProductTypeUseCase {
  constructor(private readonly productTypeRepository: ProductTypeRepository) {}

  async execute(id: string): Promise<boolean> {
    const productType = await this.productTypeRepository.findById(id);
    if (!productType) {
      throw new Error(`Product type with id ${id} not found`);
    }
    if (!productType.isDeleted()) {
      throw new Error(`Product type with id ${id} is not deleted`);
    }
    return await this.productTypeRepository.restore(id);
  }
}