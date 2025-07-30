import type { CreateUnitDTO } from "@/modules/application/dtos/unit.dto";
import type { UnitRepository } from "@/modules/domain/repository/unit.repository";
import type { UnitEntity } from "@/modules/domain/entities/unit.entity";

export class CreateUnitUseCase {
  constructor(private readonly unitRepository: UnitRepository) {}

  async execute(unitData: CreateUnitDTO): Promise<UnitEntity> {
    const existing = await this.unitRepository.findByName(unitData.name);
    if (existing) {
      throw new Error(`Unit name "${unitData.name}" already exists`);
    }
    console.log('Proceeding to create unit:', unitData);
    return await this.unitRepository.create(unitData);
  }
}
