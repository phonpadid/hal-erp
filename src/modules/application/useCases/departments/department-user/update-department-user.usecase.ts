import type { UpdateDepartmentUserDTO } from "@/modules/application/dtos/departments/department-user.dto";
import { DepartmentUserEntity } from "@/modules/domain/entities/departments/department-user.entity";
import { UserEntity } from "@/modules/domain/entities/user.entities";
import type { DepartmentUserRepository } from "@/modules/domain/repository/departments/department-user.repository";

export class UpdateDepartmentUserUseCase {
  constructor(private readonly dpmUserRepository: DepartmentUserRepository) {}

  async execute(id: string, updateDTO: UpdateDepartmentUserDTO): Promise<DepartmentUserEntity> {
    const userEntity = new UserEntity(
      updateDTO.user.id,
      updateDTO.user.username,
      updateDTO.user.email,
      updateDTO.user.password,
      new Date().toISOString(), // updatedAt
      new Date().toISOString(), // Fallback createdAt
      "",
      updateDTO.user.tel,
    );

    const dpmUser = DepartmentUserEntity.create(
      updateDTO.position_id,
      userEntity,
      updateDTO.signature_file
    );

    return await this.dpmUserRepository.update(id, dpmUser);
  }
}
