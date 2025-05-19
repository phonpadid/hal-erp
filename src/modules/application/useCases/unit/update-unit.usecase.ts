import type { UnitRepository } from "@/modules/domain/repository/unit.repository";
import type { Unit } from "../../../domain/entities/unit.entities";
import type { UpdateUnitDTO } from "../../dtos/unit.dto";

export class UpdateUnitUseCase {
  constructor(private readonly unitRepository: UnitRepository) {}
  async execute(id: string, updateUnitDTO: UpdateUnitDTO): Promise<Unit> {
    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      throw new Error(`Unit with id ${id} not found`);
    }
    if (unit.getName() !== updateUnitDTO.name) {
      const existingUnit = await this.unitRepository.findByName(updateUnitDTO.name);
      if (existingUnit && existingUnit.getId() !== id) {
        throw new Error(`Unit with name ${updateUnitDTO.name} already exists`);
      }
    }
    unit.updateName(updateUnitDTO.name);
    return await this.unitRepository.update(unit);
  }
}
