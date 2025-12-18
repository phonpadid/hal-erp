
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { DepartmentUserService } from "../../ports/input/departments/department-user.service";
import { CreateDepartmentUserUseCase } from "../../useCases/departments/department-user/create-department-user.usecase";
import { UpdateDepartmentUserUseCase } from "../../useCases/departments/department-user/update-department-user.usecase";
import type { DepartmentUserRepository } from "@/modules/domain/repository/departments/department-user.repository";
import type { CreateDepartmentUserDTO, UpdateDepartmentUserDTO } from "../../dtos/departments/department-user.dto";
import type { DepartmentUserEntity } from "@/modules/domain/entities/departments/department-user.entity";
import { GetDepartmentUserUseCase } from "../../useCases/departments/department-user/get-department-user.usecase";
import { DeleteDepartmentUserUseCase } from "../../useCases/departments/department-user/delete-department-user.usecase";
import { GetOneDepartmentUserUseCase } from "../../useCases/departments/department-user/get-one-department-user.usecase";
import { GetDepartmentUserByDpmUseCase } from "../../useCases/departments/department-user/get-all-by-department.usecase";
import { GetDepartmentUserApproversByDpmUseCase } from "../../useCases/departments/department-user/get-all-approvers-by-department.usecase";

export class DepartmentUserServiceImpl implements DepartmentUserService {
  private readonly createDpmUserUseCase: CreateDepartmentUserUseCase;
  private readonly updateDpmUserUseCase: UpdateDepartmentUserUseCase;
  private readonly getAllDpmUserUseCase: GetDepartmentUserUseCase;
  private readonly getAllDpmUserByDpmUseCase: GetDepartmentUserByDpmUseCase;
  private readonly getAllDpmUserApproversByDpmUseCase: GetDepartmentUserApproversByDpmUseCase;
  private readonly getOneDpmUserUseCase: GetOneDepartmentUserUseCase;
  private readonly deleteDpmUserUseCase: DeleteDepartmentUserUseCase;

  constructor(private readonly dpmUserRepository: DepartmentUserRepository) {
    this.createDpmUserUseCase = new CreateDepartmentUserUseCase(dpmUserRepository);
    this.updateDpmUserUseCase = new UpdateDepartmentUserUseCase(dpmUserRepository);
    this.getAllDpmUserUseCase = new GetDepartmentUserUseCase(dpmUserRepository);
    this.getAllDpmUserByDpmUseCase = new GetDepartmentUserByDpmUseCase(dpmUserRepository);
    this.getAllDpmUserApproversByDpmUseCase = new GetDepartmentUserApproversByDpmUseCase(dpmUserRepository);
    this.getOneDpmUserUseCase = new GetOneDepartmentUserUseCase(dpmUserRepository);
    this.deleteDpmUserUseCase = new DeleteDepartmentUserUseCase(dpmUserRepository);
  }
  async createDepartmentUser(input: CreateDepartmentUserDTO): Promise<DepartmentUserEntity> {
    return await this.createDpmUserUseCase.execute(input);
  }

  async getDepartmentUserById(id: string): Promise<DepartmentUserEntity | null> {
    return await this.getOneDpmUserUseCase.execute(id);
  }

  async getAllDepartmentUser(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<DepartmentUserEntity>> {
    return await this.getAllDpmUserUseCase.execute(params, includeDeleted);
  }
  async getAllDepartmentUserByDmp(
    id: string
  ): Promise<DepartmentUserEntity[]> {
    return await this.getAllDpmUserByDpmUseCase.execute(id);
  }

  async getAllDepartmentUserApproversByDmp(
    params: {
      page: number;
      limit: number;
      search?: string;
      department_id: string;
      sort_order?: 'ASC' | 'DESC';
    }
  ): Promise<DepartmentUserEntity[]> {
    return await this.getAllDpmUserApproversByDpmUseCase.execute(params);
  }

  async updateDepartmentUser(id: string, input: UpdateDepartmentUserDTO): Promise<DepartmentUserEntity> {
    return await this.updateDpmUserUseCase.execute(id, input);
  }

  async deleteDepartmentUser(id: string): Promise<boolean> {
    return await this.deleteDpmUserUseCase.execute(id);
  }
}
