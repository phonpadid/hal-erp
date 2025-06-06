<<<<<<< HEAD
import type { BudGetAccountsEntity } from "@/modules/domain/entities/budget/budget-accounts.entities";
import type {
  CreateBudgetAccountDTO,
  UpdateBudgetAccountDTO,
} from "@/modules/application/dtos/budget/budget-accounts.dto";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface BudgetAccountsService {
  createBudgetAccounts(
    createBudgetAccountsDTO: CreateBudgetAccountDTO
  ): Promise<BudGetAccountsEntity>;
  getBudgetAccountsById(id: string): Promise<BudGetAccountsEntity | null>;
  getAllBudgetAccounts(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<BudGetAccountsEntity>>;
  updateBudgetAccounts(
    id: string,
    updateUnitDTO: UpdateBudgetAccountDTO
  ): Promise<BudGetAccountsEntity>;
  deleteBudgetAccounts(id: string): Promise<boolean>;
=======
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
>>>>>>> 4ced7fa30bcd864e4e7a5d88e9fd0abb6221f397
}
