import type { UnitRepository } from "@/modules/domain/repository/unit.repository";
import type { Unit } from "../../../domain/entities/unit.entity";

export class GetUnitUseCase {
  constructor(private readonly unitRepository: UnitRepository) {}

  async execute(id: string): Promise<Unit | null> {
    return await this.unitRepository.findById(id);
  }
}
