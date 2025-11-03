import type { UpdateProductDTO } from "@/modules/application/dtos/product.dto";
import type { ProductRepository } from "@/modules/domain/repository/product.repository";
import type { ProductEntity } from "@/modules/domain/entities/product.entity";

export class UpdateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string, productData: UpdateProductDTO): Promise<ProductEntity> {
    return await this.productRepository.update(id, productData);
  }
}