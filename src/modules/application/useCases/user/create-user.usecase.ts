import type { UserCreatePayload } from "./../../../interfaces/user.interface";
import type { UserRepository } from "@/modules/domain/repository/user.repository";
import type { UserEntity } from "@/modules/domain/entities/user.entities";

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userData: UserCreatePayload): Promise<UserEntity> {
    const existingUsername = await this.userRepository.findByUsername(userData.username);
    if (existingUsername) {
      throw new Error(`Username ${userData.username} already exists`);
    }
    const existingEmail = await this.userRepository.findByEmail(userData.email);
    if (existingEmail) {
      throw new Error(`Email ${userData.email} already exists`);
    }
    return await this.userRepository.create(userData);
  }
}
