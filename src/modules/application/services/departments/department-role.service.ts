import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { DepartmentRoleService } from "../../ports/input/departments/department-role.service";
import { CreateDepartmentRoleUseCase } from "../../useCases/departments/department-roles/create-department-role.use-case";
import type { CreateDepartmentRoleDTO, UpdateDepartmentRoleDTO, DepartmentRoleWithDetailsDTO } from "../../dtos/departments/department-role.dto";
import type { DepartmentRole } from "@/modules/domain/entities/departments/department-role.entity";
import type { DepartmentRoleRepository } from "@/modules/domain/repository/departments/department-role.repository";
import { UpdateDepartmentRoleUseCase } from "../../useCases/departments/department-roles/update-department-role.use-case";
import { DeleteDepartmentRoleUseCase } from "../../useCases/departments/department-roles/delete-department-role.use-case";
import { GetOneDepartmentRoleUseCase } from "../../useCases/departments/department-roles/get-one-department-role.use-case";
import { GetAllDepartmentRoleUseCase } from "../../useCases/departments/department-roles/get-all-department-roles.use-case";
import { GetDepartmentRolesByDepartmentUseCase } from "../../useCases/departments/department-roles/get-department-roles-by-department.use-case";
import { GetDepartmentRolesByRoleUseCase } from "../../useCases/departments/department-roles/get-department-roles-by-role.use-case";
import { RestoreDepartmentRoleUseCase } from "../../useCases/departments/department-roles/restore-department-role.use-case";
import { GetDepartmentRolesWithDetailsUseCase } from "../../useCases/departments/department-roles/get-department-roles-with-details.use-case";

export class DepartmentRoleServiceImpl implements DepartmentRoleService {
  private readonly createDepartmentRoleUseCase: CreateDepartmentRoleUseCase;
  private readonly updateDepartmentRoleUseCase: UpdateDepartmentRoleUseCase;
  private readonly deleteDepartmentRoleUseCase: DeleteDepartmentRoleUseCase;
  private readonly restoreDepartmentRoleUseCase: RestoreDepartmentRoleUseCase;
  private readonly getOneDepartmentRoleUseCase: GetOneDepartmentRoleUseCase;
  private readonly getAllDepartmentRoleUseCase: GetAllDepartmentRoleUseCase;
  private readonly getDepartmentRolesByDepartmentUseCase: GetDepartmentRolesByDepartmentUseCase;
  private readonly getDepartmentRolesByRoleUseCase: GetDepartmentRolesByRoleUseCase;
  private readonly getDepartmentRolesWithDetailsUseCase: GetDepartmentRolesWithDetailsUseCase;

  constructor(private readonly departmentRoleRepository: DepartmentRoleRepository) {
    this.createDepartmentRoleUseCase = new CreateDepartmentRoleUseCase(departmentRoleRepository);
    this.updateDepartmentRoleUseCase = new UpdateDepartmentRoleUseCase(departmentRoleRepository);
    this.deleteDepartmentRoleUseCase = new DeleteDepartmentRoleUseCase(departmentRoleRepository);
    this.restoreDepartmentRoleUseCase = new RestoreDepartmentRoleUseCase(departmentRoleRepository);
    this.getOneDepartmentRoleUseCase = new GetOneDepartmentRoleUseCase(departmentRoleRepository);
    this.getAllDepartmentRoleUseCase = new GetAllDepartmentRoleUseCase(departmentRoleRepository);
    this.getDepartmentRolesByDepartmentUseCase = new GetDepartmentRolesByDepartmentUseCase(departmentRoleRepository);
    this.getDepartmentRolesByRoleUseCase = new GetDepartmentRolesByRoleUseCase(departmentRoleRepository);
    this.getDepartmentRolesWithDetailsUseCase = new GetDepartmentRolesWithDetailsUseCase(departmentRoleRepository);
  }

  async createDepartmentRole(input: CreateDepartmentRoleDTO): Promise<DepartmentRole> {
    return await this.createDepartmentRoleUseCase.execute(input);
  }

  async getDepartmentRoleById(id: string): Promise<DepartmentRole | null> {
    return await this.getOneDepartmentRoleUseCase.execute(id);
  }

  async getAllDepartmentRoles(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<DepartmentRole>> {
    return await this.getAllDepartmentRoleUseCase.execute(params, includeDeleted);
  }

  async getDepartmentRolesWithDetails(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<DepartmentRoleWithDetailsDTO>> {
    return await this.getDepartmentRolesWithDetailsUseCase.execute(params, includeDeleted);
  }

  async getDepartmentRolesByDepartment(departmentId: number): Promise<DepartmentRole[]> {
    return await this.getDepartmentRolesByDepartmentUseCase.execute(departmentId);
  }

  async getDepartmentRolesByRole(roleId: number): Promise<DepartmentRole[]> {
    return await this.getDepartmentRolesByRoleUseCase.execute(roleId);
  }

  async updateDepartmentRole(id: string, input: UpdateDepartmentRoleDTO): Promise<DepartmentRole> {
    return await this.updateDepartmentRoleUseCase.execute(id, input);
  }

  async deleteDepartmentRole(id: string): Promise<boolean> {
    return await this.deleteDepartmentRoleUseCase.execute(id);
  }

  async restoreDepartmentRole(id: string): Promise<DepartmentRole> {
    return await this.restoreDepartmentRoleUseCase.execute(id);
  }
}