import type { UserRepository } from "@/modules/domain/repository/user.repository";

export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<boolean> {
    // Check if user exists
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    // Check if user is already deleted
    if (user.isDeleted()) {
      throw new Error(`User with id ${id} is already deleted`);
    }

    // Delete user
    return await this.userRepository.delete(id);
  }
}
