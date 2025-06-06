import type { UpdateDepartmentUserDTO } from "@/modules/application/dtos/departments/department-user.dto";
import { DepartmentUserEntity } from "@/modules/domain/entities/departments/department-user.entity";
import { UserEntity } from "@/modules/domain/entities/user.entities";
import type { DepartmentUserRepository } from "@/modules/domain/repository/departments/department-user.repository";

export class UpdateDepartmentUserUseCase {
  constructor(private readonly dpmUserRepository: DepartmentUserRepository) {}

  async execute(id: string, input: UpdateDepartmentUserDTO): Promise<DepartmentUserEntity> {
    const userEntity = new UserEntity(
      input.user.id,
      input.user.username,
      input.user.email,
      input.user.password,
      new Date().toISOString(), // updatedAt
      new Date().toISOString(), // Fallback createdAt
      "",
      input.user.tel,
    );

    const dpmUser = DepartmentUserEntity.create(
      input.position_id,
      userEntity,
      input.signature_file,
      input.departmentId,
      input.permissionIds,
      input.roleIds,

    );

    return await this.dpmUserRepository.update(id, dpmUser);
  }
}
