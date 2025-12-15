import type { RoleService } from "../ports/input/role.service";
import type { RoleRepository } from "../../domain/repository/role.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { Role } from "@/modules/domain/entities/role.entities";
import { GetAllRolesUseCase } from "../useCases/role/get-all-role.usecase";
import { GetRoleByIdUseCase } from "../useCases/role/get-role-by-id.usecase";
import { CreateRoleUseCase } from "../useCases/role/create-role.usecase";
import { UpdateRoleUseCase } from "../useCases/role/update-role.usecase";
import { DeleteRoleUseCase } from "../useCases/role/delete-role.usecase";
import { GetCompanyUsersUseCase } from "../useCases/role/get-company-users.usecase";
import type { CreateRole, UpdateRole } from "@/modules/interfaces/role.interface";

export class RoleUserServiceImpl implements RoleService {
  private readonly getAllRolesUseCase: GetAllRolesUseCase;
  private readonly getRoleByIdUseCase: GetRoleByIdUseCase;
  private readonly createRoleUseCase: CreateRoleUseCase;
  private readonly updateRoleUseCase: UpdateRoleUseCase;
  private readonly deleteRoleUseCase: DeleteRoleUseCase;
  private readonly getCompanyUsersUseCase: GetCompanyUsersUseCase;

  constructor(private readonly roleRepository: RoleRepository) {
    this.getAllRolesUseCase = new GetAllRolesUseCase(roleRepository);
    this.getRoleByIdUseCase = new GetRoleByIdUseCase(roleRepository);
    this.createRoleUseCase = new CreateRoleUseCase(roleRepository);
    this.updateRoleUseCase = new UpdateRoleUseCase(roleRepository);
    this.deleteRoleUseCase = new DeleteRoleUseCase(roleRepository);
    this.getCompanyUsersUseCase = new GetCompanyUsersUseCase(roleRepository);
  }

  async getAllRoles(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<Role>> {
    return await this.getAllRolesUseCase.execute(params, includeDeleted);
  }

  async getRoleById(id: string): Promise<Role | null> {
    return await this.getRoleByIdUseCase.execute(id);
  }

  async createRole(data: CreateRole): Promise<Role> {
    return await this.createRoleUseCase.execute(data);
  }

  async updateRole(id: string, data: UpdateRole): Promise<Role> {
    return await this.updateRoleUseCase.execute(id, data);
  }

  async deleteRole(id: string | number): Promise<boolean> {
    return await this.deleteRoleUseCase.execute(id);
  }

  async getCompanyUsers(params: PaginationParams): Promise<PaginatedResult<Role>> {
    return await this.getCompanyUsersUseCase.execute(params);
  }
}