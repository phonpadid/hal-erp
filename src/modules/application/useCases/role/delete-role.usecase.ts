import type { RoleRepository } from "@/modules/domain/repository/role.repository";

export class DeleteRoleUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(id: string): Promise<boolean> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new Error(`Role with id ${id} not found`);
    }
    if (role.isDeleted()) {
      throw new Error(`Role with id ${id} is already deleted`);
    }
    return await this.roleRepository.delete(id);
  }
}
