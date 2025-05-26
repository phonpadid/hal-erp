import type { Role } from "@/modules/domain/entities/role.entities";
import type { RoleRepository } from "@/modules/domain/repository/role.repository";

export class GetRoleByIdUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(id: string): Promise<Role | null> {
    return await this.roleRepository.findById(id);
  }
}
