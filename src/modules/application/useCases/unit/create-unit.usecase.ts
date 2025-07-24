import { v4 as uuidv4 } from "uuid";
import { Unit } from "../../../domain/entities/unit.entity";
import type { UnitRepository } from "@/modules/domain/repository/unit.repository";
import type { CreateUnitDTO } from "../../dtos/unit.dto";
export class CreateUnitUseCase {
  constructor(private readonly unitRepository: UnitRepository) {}

  async execute(createUnitDTO: CreateUnitDTO): Promise<Unit> {
    const unit = Unit.create(uuidv4(), createUnitDTO.name);
    return await this.unitRepository.create(unit);
  }
}
