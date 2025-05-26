import type { Role } from "@/modules/domain/entities/role.entities";
import type { RoleRepository } from "@/modules/domain/repository/role.repository";

export class UpdateRoleUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(id: string, data: { name?: string; display_name?: string }): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new Error(`Role with id ${id} not found`);
    }
    if (data.name && data.name !== role.getName()) {
      const existingRole = await this.roleRepository.findByName(data.name);
      if (existingRole && existingRole.getId() !== id) {
        throw new Error(`Role with name ${data.name} already exists`);
      }
      role.updateName(data.name);
    }
    if (data.display_name && data.display_name !== role.getDisplayname()) {
      role.updateDisplayName(data.display_name);
    }
    return await this.roleRepository.update(id, role);
  }
}
