import type { UnitRepository } from "@/modules/domain/repository/UnitRepository";
import type { Unit } from "../../../domain/entities/Unit";
import type { UpdateUnitDTO } from "../../dtos/UnitDTO";

export class UpdateUnitUseCase {
  constructor(private readonly unitRepository: UnitRepository) {}

  async execute(id: string, updateUnitDTO: UpdateUnitDTO): Promise<Unit> {
    // ค้นหา unit จาก id
    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      throw new Error(`Unit with id ${id} not found`);
    }

    // ตรวจสอบว่าชื่อใหม่ซ้ำกับชื่อเดิมหรือไม่
    if (unit.getName() !== updateUnitDTO.name) {
      const existingUnit = await this.unitRepository.findByName(updateUnitDTO.name);
      if (existingUnit && existingUnit.getId() !== id) {
        throw new Error(`Unit with name ${updateUnitDTO.name} already exists`);
      }
    }

    // อัปเดตข้อมูล
    unit.updateName(updateUnitDTO.name);

    // บันทึกการเปลี่ยนแปลง
    return await this.unitRepository.update(unit);
  }
}
