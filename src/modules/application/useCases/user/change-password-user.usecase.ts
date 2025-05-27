import type { UserRepository } from "@/modules/domain/repository/user.repository";
import type { UserEntity } from "@/modules/domain/entities/user.entities";
import type { UserChangePasswordPayload } from "@/modules/interfaces/user.interface";

export class ChangePasswordUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string, userData: UserChangePasswordPayload): Promise<UserEntity> {
    // Check if user exists
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    // Check if user is deleted
    if (user.isDeleted()) {
      throw new Error(`Cannot changepassword deleted user with id ${id}`);
    }
    // Update user
    const updatedUser = await this.userRepository.changePassword(id, userData);
    if (!updatedUser) {
      throw new Error(`Failed to change password for user with id ${id}`);
    }
    return updatedUser;
  }
}
