import type { ProductTypeRepository } from "@/modules/domain/repository/product-type.repository";

export class DeleteProductTypeUseCase {
  constructor(private readonly productTypeRepository: ProductTypeRepository) {}

  async execute(id: string): Promise<boolean> {
    const productType = await this.productTypeRepository.findById(id);
    if (!productType) {
      throw new Error(`Product type with id ${id} not found`);
    }
    if (productType.isDeleted()) {
      throw new Error(`Product type with id ${id} is already deleted`);
    }
    return await this.productTypeRepository.delete(id);
  }
}