import type { UnitRepository } from "@/modules/domain/repository/unit.repository";
import type { UnitEntity } from "../../../domain/entities/unit.entity";

export class GetUnitUseCase {
  constructor(private readonly unitRepository: UnitRepository) {}

  async execute(id: string): Promise<UnitEntity> {
    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      throw new Error(`Unit with id ${id} not found`);
    }
    return unit;
  }
}
