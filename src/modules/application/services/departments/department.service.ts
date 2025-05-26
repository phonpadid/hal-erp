
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { DepartmentService } from "../../ports/input/departments/department.service";
import { CreateDepartmentUseCase } from "../../useCases/departments/departments/create-department.use-case";
import type { CreateDepartmentDTO, UpdateDepartmentDTO } from "../../dtos/departments/department.dto";
import type { DepartmentEntity } from "@/modules/domain/entities/departments/department.entity";
import type { DepartmentRepository } from "@/modules/domain/repository/departments/department.repository";
import { UpdateDepartmentUseCase } from "../../useCases/departments/departments/update-department.use-case";
import { DeleteDepartmentUseCase } from "../../useCases/departments/departments/delete-department-user.usecase";
import { GetOneDepartmentUseCase } from "../../useCases/departments/departments/get-one-department.usecase";
import { GetAllDepartmentUseCase } from "../../useCases/departments/departments/get-department.use-case";

export class DepartmentServiceImpl implements DepartmentService {
  private readonly createDepartmentUseCase: CreateDepartmentUseCase;
  private readonly updateDepartmentUseCase: UpdateDepartmentUseCase
  private readonly deleteDepartmentUseCase: DeleteDepartmentUseCase;
  private readonly getOneDepartmentUseCase: GetOneDepartmentUseCase;
  private readonly getAllDepartmentUseCase: GetAllDepartmentUseCase;

  constructor(private readonly departmentRepository: DepartmentRepository) {
    this.createDepartmentUseCase = new CreateDepartmentUseCase(departmentRepository);
    this.updateDepartmentUseCase = new UpdateDepartmentUseCase(departmentRepository);
    this.deleteDepartmentUseCase = new DeleteDepartmentUseCase(departmentRepository);
    this.getOneDepartmentUseCase = new GetOneDepartmentUseCase(departmentRepository);
    this.getAllDepartmentUseCase = new GetAllDepartmentUseCase(departmentRepository);
  }
  async createDepartment(input: CreateDepartmentDTO): Promise<DepartmentEntity> {
    return await this.createDepartmentUseCase.execute(input);
  }

  async getDepartmentById(id: string): Promise<DepartmentEntity | null> {
    return await this.getOneDepartmentUseCase.execute(id);
  }

  async getAllDepartments(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<DepartmentEntity>> {
    return await this.getAllDepartmentUseCase.execute(params, includeDeleted);
  }

  async updateDepartment(id: string, input: UpdateDepartmentDTO): Promise<DepartmentEntity> {

    return await this.updateDepartmentUseCase.execute(id, input);
  }

  async deleteDepartment(id: string): Promise<boolean> {
    return await this.deleteDepartmentUseCase.execute(id);
  }

}
