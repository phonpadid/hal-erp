import { v4 as uuidv4 } from "uuid";
import { Unit } from "../../../domain/entities/unit.entities";
import type { UnitRepository } from "@/modules/domain/repository/unit.repository";
import type { CreateUnitDTO } from "../../dtos/unit.dto";

// export class CreateUnitUseCase {
//   constructor(private readonly unitRepository: UnitRepository) {}

//   async execute(createUnitDTO: CreateUnitDTO): Promise<Unit> {
//     const existingUnit = await this.unitRepository.findByName(createUnitDTO.name);
//     if (existingUnit) {
//       throw new Error(`Unit with name ${createUnitDTO.name} already exists`);
//     }
//     const unit = Unit.create(uuidv4(), createUnitDTO.name);
//     return await this.unitRepository.create(unit);
//   }
// }
export class CreateUnitUseCase {
  constructor(private readonly unitRepository: UnitRepository) {}

  async execute(createUnitDTO: CreateUnitDTO): Promise<Unit> {
    // สร้าง instance ของ Unit entity จาก DTO ที่รับเข้ามา
    const unit = Unit.create(uuidv4(), createUnitDTO.name);

    // บันทึกข้อมูล unit ลงฐานข้อมูลโดยตรงไม่ต้องตรวจสอบก่อน
    return await this.unitRepository.create(unit);
  }
}

// export class CreateUnitUseCase {
//   constructor(private readonly unitRepository: UnitRepository) {}

//   async execute(createUnitDTO: CreateUnitDTO): Promise<Unit> {
//     const existingUnit = await this.unitRepository.findByName(createUnitDTO.name);
//     if (existingUnit) {
//       throw new Error(`Unit with name ${createUnitDTO.name} already exists`);
//     }

//     // ส่ง DTO ไปให้ Repository จัดการโดยตรง
//     return await this.unitRepository.create(createUnitDTO);
//   }
// }
