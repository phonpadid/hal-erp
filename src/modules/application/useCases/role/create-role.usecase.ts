import { Role } from "@/modules/domain/entities/role.entities";
import type { RoleRepository } from "@/modules/domain/repository/role.repository";

export class CreateRoleUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(data: { name: string; display_name: string }): Promise<Role> {
    const existingRole = await this.roleRepository.findByName(data.name);
    if (existingRole) {
      throw new Error(`Role with name ${data.name} already exists`);
    }
    return await this.roleRepository.create(data);
  }
}
