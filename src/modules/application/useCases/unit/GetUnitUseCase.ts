import type { UnitRepository } from "@/modules/domain/repository/UnitRepository";
import type { Unit } from "../../../domain/entities/Unit";

export class GetUnitUseCase {
  constructor(private readonly unitRepository: UnitRepository) {}

  async execute(id: string): Promise<Unit | null> {
    return await this.unitRepository.findById(id);
  }
}
