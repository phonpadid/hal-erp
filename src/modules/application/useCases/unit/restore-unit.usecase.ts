import type { UnitRepository } from "@/modules/domain/repository/unit.repository";

export class RestoreUnitUseCase {
  constructor(private readonly unitRepository: UnitRepository) {}

  async execute(id: string): Promise<boolean> {

    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      throw new Error(`Unit with id ${id} not found`);
    }


    if (!unit.isDeleted()) {
      throw new Error(`Unit with id ${id} is not deleted`);
    }


    return await this.unitRepository.restore(id);
  }
}
