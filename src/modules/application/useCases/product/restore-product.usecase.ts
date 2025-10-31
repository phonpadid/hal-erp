import type { ProductRepository } from "@/modules/domain/repository/product.repository";

export class RestoreProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string): Promise<boolean> {
    return await this.productRepository.restore(id);
  }
}