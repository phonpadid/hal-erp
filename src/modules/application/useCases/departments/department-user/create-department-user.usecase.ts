import type { CreateDepartmentUserDTO } from "@/modules/application/dtos/departments/department-user.dto";
import { DepartmentUserEntity } from "@/modules/domain/entities/departments/department-user.entity";
import type { DepartmentUserRepository } from "@/modules/domain/repository/departments/department-user.repository";
import { v4 as uuidv4 } from "uuid";
export class CreateDepartmentUserUseCase {
  constructor(private readonly dpmUserRepository: DepartmentUserRepository) { }

  async execute(dpmUsertDTO: CreateDepartmentUserDTO): Promise<DepartmentUserEntity> {
    // สร้าง instance ของ Unit entity จาก DTO ที่รับเข้ามา
    const dpmUser = DepartmentUserEntity.create(uuidv4(), dpmUsertDTO.department_id ?? '', dpmUsertDTO.position_id ?? '', dpmUsertDTO.user_id ?? '', dpmUsertDTO.signature_file ?? '');

    // บันทึกข้อมูล unit ลงฐานข้อมูลโดยตรงไม่ต้องตรวจสอบก่อน
    return await this.dpmUserRepository.create(dpmUser);
  }
}
