import type {
  UserCreatePayload,
  UserUpdatePayload,
  UserChangePasswordPayload,
  UserChangeMyPasswordPayload,
} from "./../../interfaces/user.interface";
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
  updateUser(id: string, userData: UserUpdatePayload): Promise<UserEntity>;
  changePasswordUser(id: string, userData: UserChangePasswordPayload): Promise<UserEntity>;
  changeMyPassword(userData: UserChangeMyPasswordPayload): Promise<void>;
  deleteUser(id: string): Promise<boolean>;
}

export class UserServiceImpl implements UserServices {
  constructor(private readonly userRepository: UserRepository) {}
  async changePasswordUser(
    id: string,
    userData: UserChangePasswordPayload
  ): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    if (user.isDeleted()) {
      throw new Error(`Cannot change password for deleted user with id ${id}`);
    }
    await this.userRepository.changePassword(id, userData);
    return user;
  }

  async changeMyPassword(userData: UserChangeMyPasswordPayload): Promise<void> {
    await this.userRepository.changeMyPassword(userData);
  }

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

  async updateUser(id: string, userData: UserUpdatePayload): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
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
