import { Role } from "@/modules/domain/entities/role.entities";
import type{ CreateRole } from "@/modules/interfaces/role.interface";
import type { RoleRepository } from "@/modules/domain/repository/role.repository";

export class CreateRoleUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(data: CreateRole): Promise<Role> {
    return await this.roleRepository.create(data);
  }
}
