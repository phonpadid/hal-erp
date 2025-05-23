import type { UnitRepository } from "@/modules/domain/repository/unit.repository";

export class DeleteUnitUseCase {
  constructor(private readonly unitRepository: UnitRepository) { }

  async execute(id: string): Promise<boolean> {
    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      throw new Error(`Unit with id ${id} not found`);
    }
    if (unit.isDeleted()) {
      throw new Error(`Unit with id ${id} is already deleted`);
    }


    return await this.unitRepository.delete(id);
  }
}
