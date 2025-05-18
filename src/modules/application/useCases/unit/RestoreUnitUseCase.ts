import type { UnitRepository } from "@/modules/domain/repository/UnitRepository";

export class RestoreUnitUseCase {
  constructor(private readonly unitRepository: UnitRepository) {}

  async execute(id: string): Promise<boolean> {
    // ตรวจสอบว่า unit มีอยู่จริงหรือไม่
    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      throw new Error(`Unit with id ${id} not found`);
    }

    // ตรวจสอบว่า unit ถูกลบไปแล้วหรือไม่
    if (!unit.isDeleted()) {
      throw new Error(`Unit with id ${id} is not deleted`);
    }

    // ดำเนินการกู้คืน
    return await this.unitRepository.restore(id);
  }
}
