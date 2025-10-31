import type { ProductRepository } from "@/modules/domain/repository/product.repository";
import type { ProductEntity } from "@/modules/domain/entities/product.entity";

export class GetProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string): Promise<ProductEntity | null> {
    return await this.productRepository.findById(id);
  }
}