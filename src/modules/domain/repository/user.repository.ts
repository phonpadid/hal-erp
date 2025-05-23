import type { UserCreatePayload } from "./../../interfaces/user.interface";
import type { UserEntity } from "../entities/user.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface UserRepository {
  findAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<UserEntity>>;
  findById(id: string): Promise<UserEntity | null>;
  findByUsername(username: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(userData: UserCreatePayload): Promise<UserEntity>;
  update(
    id: string,
    userData: { username?: string; email?: string; password?: string; tel?: string }
  ): Promise<UserEntity>;
  delete(id: string): Promise<boolean>;
}
