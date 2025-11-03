import type { CreateProductDTO } from "@/modules/application/dtos/product.dto";
import type { ProductRepository } from "@/modules/domain/repository/product.repository";
import type { ProductEntity } from "@/modules/domain/entities/product.entity";

export class CreateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(productData: CreateProductDTO): Promise<ProductEntity> {
    return await this.productRepository.create(productData);
  }
}