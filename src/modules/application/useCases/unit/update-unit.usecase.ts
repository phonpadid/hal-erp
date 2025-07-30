import type { UpdateUnitDTO } from "../../dtos/unit.dto";
import type { UnitRepository } from "@/modules/domain/repository/unit.repository";
import type { UnitEntity } from "../../../domain/entities/unit.entity";

export class UpdateUnitUseCase {
  constructor(private readonly unitRepository: UnitRepository) { }

  async execute(id: string, updateUnitDTO: UpdateUnitDTO): Promise<UnitEntity> {
    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      throw new Error(`Unit with id ${id} not found`);
    }
    if (unit.isDeleted()) {
      throw new Error(`Can not update, deleted unit with id ${id}`);
    }
    if (
      updateUnitDTO.name &&
      updateUnitDTO.name !== unit.getName()
    ) {
      const existingName = await this.unitRepository.findByName(updateUnitDTO.name);
      if (existingName && existingName.getId() !== id) {
        throw new Error(`Name "${updateUnitDTO.name}" already exists`);
      }
    }
    return await this.unitRepository.update(id, updateUnitDTO);
  }
}
