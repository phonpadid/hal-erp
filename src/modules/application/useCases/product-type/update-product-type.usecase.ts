import type { UpdateProductTypeDTO } from "../../dtos/product-type.dto";
import type { ProductTypeRepository } from "@/modules/domain/repository/product-type.repository";
import type { ProductTypeEntity } from "../../../domain/entities/product-types.entity";

export class UpdateProductTypeUseCase {
  constructor(private readonly productTypeRepository: ProductTypeRepository) { }

  async execute(id: string, updateProductTypeDTO: UpdateProductTypeDTO): Promise<ProductTypeEntity> {
    const productType = await this.productTypeRepository.findById(id);
    if (!productType) {
      throw new Error(`Product type with id ${id} not found`);
    }
    if (productType.isDeleted()) {
      throw new Error(`Can not update, deleted product type with id ${id}`);
    }
    if (
      updateProductTypeDTO.name &&
      updateProductTypeDTO.name !== productType.getName()
    ) {
      const existingName = await this.productTypeRepository.findByName(updateProductTypeDTO.name);
      if (existingName && existingName.getId() !== id) {
        throw new Error(`Name "${updateProductTypeDTO.name}" already exists`);
      }
    }
    return await this.productTypeRepository.update(id, updateProductTypeDTO);
  }
}