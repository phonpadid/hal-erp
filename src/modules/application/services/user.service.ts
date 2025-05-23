import type { UserCreatePayload } from "./../../interfaces/user.interface";
import type { UserRepository } from "@/modules/domain/repository/user.repository";
import type { UserEntity } from "@/modules/domain/entities/user.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface UserServices {
  getAllUsers(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<UserEntity>>;
  getUserById(id: string): Promise<UserEntity | null>;
  createUser(userData: UserCreatePayload): Promise<UserEntity>;
  updateUser(
    id: string,
    userData: { username?: string; email?: string; password?: string; tel?: string }
  ): Promise<UserEntity>;
  deleteUser(id: string): Promise<boolean>;
}

export class UserServiceImpl implements UserServices {
  constructor(private readonly userRepository: UserRepository) {}

  async getAllUsers(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<UserEntity>> {
    return await this.userRepository.findAll(params, includeDeleted);
  }

  async getUserById(id: string): Promise<UserEntity | null> {
    return await this.userRepository.findById(id);
  }

  async getUserByUsername(username: string): Promise<UserEntity | null> {
    return await this.userRepository.findByUsername(username);
  }
  async createUser(userData: UserCreatePayload): Promise<UserEntity> {
    return await this.userRepository.create(userData);
  }

  async updateUser(
    id: string,
    userData: { username?: string; email?: string; password?: string; tel?: string }
  ): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    if (userData.username && userData.username !== user.getUsername()) {
      const existingUsername = await this.userRepository.findByUsername(userData.username);
      if (existingUsername && existingUsername.getId() !== id) {
        throw new Error(`Username ${userData.username} already exists`);
      }
    }

    if (userData.email && userData.email !== user.getEmail()) {
      const existingEmail = await this.userRepository.findByEmail(userData.email);
      if (existingEmail && existingEmail.getId() !== id) {
        throw new Error(`Email ${userData.email} already exists`);
      }
    }

    return await this.userRepository.update(id, userData);
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    if (user.isDeleted()) {
      throw new Error(`User with id ${id} is already deleted`);
    }

    return await this.userRepository.delete(id);
  }
}
