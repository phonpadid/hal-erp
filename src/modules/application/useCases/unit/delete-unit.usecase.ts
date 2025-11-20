import type { UnitRepository } from "@/modules/domain/repository/unit.repository";
import type { ProductRepository } from "@/modules/domain/repository/product.repository";

export class DeleteUnitUseCase {
  constructor(
    private readonly unitRepository: UnitRepository,
    private readonly productRepository: ProductRepository
  ) {}

  async execute(id: string): Promise<boolean> {
    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      throw new Error(`Unit with id ${id} not found`);
    }
    if (unit.isDeleted()) {
      throw new Error(`Unit with id ${id} is already deleted`);
    }

    // Check if any products are using this unit
    const productsUsingUnit = await this.productRepository.findByUnitId(id);
    if (productsUsingUnit.length > 0) {
      throw new Error(`Cannot delete unit because it is being used by ${productsUsingUnit.length} product(s)`);
    }

    return await this.unitRepository.delete(id);
  }
}
