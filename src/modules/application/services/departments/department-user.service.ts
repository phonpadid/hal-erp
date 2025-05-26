
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

export class DepartmentUserServiceImpl implements DepartmentUserService {
  private readonly createDpmUserUseCase: CreateDepartmentUserUseCase;
  private readonly updateDpmUserUseCase: UpdateDepartmentUserUseCase;
  private readonly getAllDpmUserUseCase: GetDepartmentUserUseCase;
  private readonly getOneDpmUserUseCase: GetOneDepartmentUserUseCase;
  private readonly deleteDpmUserUseCase: DeleteDepartmentUserUseCase;

  constructor(private readonly dpmUserRepository: DepartmentUserRepository) {
    this.createDpmUserUseCase = new CreateDepartmentUserUseCase(dpmUserRepository);
    this.updateDpmUserUseCase = new UpdateDepartmentUserUseCase(dpmUserRepository);
    this.getAllDpmUserUseCase = new GetDepartmentUserUseCase(dpmUserRepository);
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

  async updateDepartmentUser(id: string, input: UpdateDepartmentUserDTO): Promise<DepartmentUserEntity> {
    return await this.updateDpmUserUseCase.execute(id, input);
  }

  async deleteDepartmentUser(id: string): Promise<boolean> {
    return await this.deleteDpmUserUseCase.execute(id);
  }
}
