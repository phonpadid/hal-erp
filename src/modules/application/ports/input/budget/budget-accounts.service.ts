import type { UserEntity } from "../../../domain/entities/user.entities";
import type { CreateUserDTO, UpdateUserDTO, ChangePasswordDTO } from "../../dtos/user.dto";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface UserService {
  createUser(createUnitDTO: CreateUserDTO): Promise<UserEntity>;
  getUserById(id: string): Promise<UserEntity | null>;
  changePasswordUser(id: string, changePasswordDTO: ChangePasswordDTO): Promise<UserEntity>;
  getUserByName(username: string): Promise<UserEntity | null>;
  getAllUser(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<UserEntity>>;
  updateUser(id: string, updateUnitDTO: UpdateUserDTO): Promise<UserEntity>;
  deleteUser(id: string): Promise<boolean>;
}
