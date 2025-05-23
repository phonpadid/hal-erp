import type { UserEntity } from "../../../domain/entities/user.entities";
import type { CreateUserDTO, UpdateUserDTO } from "../../dtos/user.dto";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface UserService {
  createUser(createUnitDTO: CreateUserDTO): Promise<UserEntity>;
  getUserById(id: string): Promise<UserEntity | null>;
  getUserByName(username: string): Promise<UserEntity | null>;
  getAllUser(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<UserEntity>>;
  updateUser(id: string, updateUnitDTO: UpdateUserDTO): Promise<UserEntity>;
  deleteUser(id: string): Promise<boolean>;
}
