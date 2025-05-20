
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { DepartmentService } from "../../ports/input/departments/department.service";
import { CreateDepartmentUseCase } from "../../useCases/departments/departments/create-department.use-case";
import type { CreateDepartmentDTO, UpdateDepartmentDTO } from "../../dtos/departments/deparment.dto";
import type { DepartmentEntity } from "@/modules/domain/entities/departments/department.entity";
import type { DepartmentRepository } from "@/modules/domain/repository/departments/department.repository";
import { UpdateDepartmentUseCase } from "../../useCases/departments/departments/update-department.use-case";

export class DepartmentServiceImpl implements DepartmentService {
  private readonly createDepartmentUseCase: CreateDepartmentUseCase;
  private readonly updateDepartmentUseCase: UpdateDepartmentUseCase

  constructor(private readonly departmentRepository: DepartmentRepository) {
    this.createDepartmentUseCase = new CreateDepartmentUseCase(departmentRepository);
    this.updateDepartmentUseCase = new UpdateDepartmentUseCase(departmentRepository);
  }
  restoreUnit(id: string): Promise<boolean> {
    console.log(id);

    throw new Error("Method not implemented.");
  }

  async createDepartment(createDepartmentDTO: CreateDepartmentDTO): Promise<DepartmentEntity> {
    return await this.createDepartmentUseCase.execute(createDepartmentDTO);
  }

  async getDepartmentById(id: string): Promise<DepartmentEntity | null> {
    // return await this.getDepartmentUseCase.execute(id);
    console.log(id);

  return null
  }

  async getDepartmentByName(name: string): Promise<DepartmentEntity | null> {
    return await this.departmentRepository.findByName(name);
  }

  async getAllDepartments(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<DepartmentEntity>> {
    return await this.departmentRepository.findAll(params, includeDeleted);
  }

  async updateDepartment(id: string, updateDepartmentDTO: UpdateDepartmentDTO): Promise<DepartmentEntity> {
    // console.log(id, updateDepartmentDTO);

    return await this.updateDepartmentUseCase.execute(id, updateDepartmentDTO);
  }

  async deleteDepartment(id: string): Promise<boolean> {
    // return await this.departmentRepository.execute(id);
    console.log(id);

    return false
  }

  async restoreDepartment(id: string): Promise<boolean> {
    // return await this.departmentRepository.execute(id);
    console.log(id);

    return false
  }
}
