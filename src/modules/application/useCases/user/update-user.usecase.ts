import type { UserRepository } from "@/modules/domain/repository/user.repository";
import type { UserEntity } from "@/modules/domain/entities/user.entities";

export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    id: string,
    userData: {
      username?: string;
      email?: string;
      password?: string;
      tel?: string;
    }
  ): Promise<UserEntity> {
    // Check if user exists
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    // Check if user is deleted
    if (user.isDeleted()) {
      throw new Error(`Cannot update deleted user with id ${id}`);
    }

    // Check if username is being changed and already exists
    if (userData.username && userData.username !== user.getUsername()) {
      const existingUsername = await this.userRepository.findByUsername(userData.username);
      if (existingUsername && existingUsername.getId() !== id) {
        throw new Error(`Username ${userData.username} already exists`);
      }
    }

    // Check if email is being changed and already exists
    if (userData.email && userData.email !== user.getEmail()) {
      const existingEmail = await this.userRepository.findByEmail(userData.email);
      if (existingEmail && existingEmail.getId() !== id) {
        throw new Error(`Email ${userData.email} already exists`);
      }
    }

    // Update user
    return await this.userRepository.update(id, userData);
  }
}
