import { v4 as uuidv4 } from "uuid";
import { Unit } from "../../../domain/entities/Unit";
import type { UnitRepository } from "@/modules/domain/repository/UnitRepository";
import type { CreateUnitDTO } from "../../dtos/UnitDTO";

export class CreateUnitUseCase {
  constructor(private readonly unitRepository: UnitRepository) {}

  async execute(createUnitDTO: CreateUnitDTO): Promise<Unit> {
    // ตรวจสอบว่ามี unit ชื่อนี้อยู่แล้วหรือไม่
    const existingUnit = await this.unitRepository.findByName(createUnitDTO.name);
    if (existingUnit) {
      throw new Error(`Unit with name ${createUnitDTO.name} already exists`);
    }

    // สร้าง Unit ใหม่
    const unit = Unit.create(uuidv4(), createUnitDTO.name);

    // บันทึกลงฐานข้อมูล
    return await this.unitRepository.create(unit);
  }
}
