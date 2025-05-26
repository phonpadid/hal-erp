import type { UpdateDepartmentUserDTO } from "@/modules/application/dtos/departments/department-user.dto";
import type { DepartmentUserEntity } from "@/modules/domain/entities/departments/department-user.entity";
import type { DepartmentUserRepository } from "@/modules/domain/repository/departments/department-user.repository";
export class UpdateDepartmentUserUseCase {
  constructor(private readonly dpmUserRepository: DepartmentUserRepository) {}
  async execute(id: string, updateUnitDTO: UpdateDepartmentUserDTO): Promise<DepartmentUserEntity> {
    const dpmUser = await this.dpmUserRepository.findById(id);
    if (!dpmUser) {
      throw new Error(`Unit with id ${id} not found`);
    }
    dpmUser.updateDpmUser(updateUnitDTO.user_id, updateUnitDTO.department_id, updateUnitDTO.position_id, updateUnitDTO.signature_file);
    return await this.dpmUserRepository.update(id, dpmUser);
  }
}
