
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { DepartmentApproverService } from "../../ports/input/departments/department-approver.service";
import { CreateDepartmentApproverUseCase } from "../../useCases/departments/department-approvers/create-department-approver.usecase";
import { UpdateDepartmentApproverUseCase } from "../../useCases/departments/department-approvers/update-department-user.usecase";
import { GetAllDepartmentApproverUseCase } from "../../useCases/departments/department-approvers/get-department-Approver.usecase";
import { GetOneDepartmentApproverUseCase } from "../../useCases/departments/department-approvers/get-one-department-approver.usecase";
import { DeleteDepartmentApproverUseCase } from "../../useCases/departments/department-approvers/delete-department-approver.usecase";
import type { DepartmentApproverRepository } from "@/modules/domain/repository/departments/department-approver.repository";
import type { DepartmentApproverEntity } from "@/modules/domain/entities/departments/department-approver.entity";
import type { CreateDepartmentApproverDTO, UpdateDepartmentApproverDTO } from "../../dtos/departments/department-approver.dto";

export class DepartmentApporverServiceImpl implements DepartmentApproverService {
  private readonly createUsecase: CreateDepartmentApproverUseCase;
  private readonly updateUsecase: UpdateDepartmentApproverUseCase;
  private readonly getAllUsecase: GetAllDepartmentApproverUseCase;
  private readonly getOneUsecase: GetOneDepartmentApproverUseCase;
  private readonly deleteUsecase: DeleteDepartmentApproverUseCase;

  constructor(private readonly dpmApproverRepository: DepartmentApproverRepository) {
    this.createUsecase = new CreateDepartmentApproverUseCase(dpmApproverRepository);
    this.updateUsecase = new UpdateDepartmentApproverUseCase(dpmApproverRepository);
    this.getAllUsecase = new GetAllDepartmentApproverUseCase(dpmApproverRepository);
    this.getOneUsecase = new GetOneDepartmentApproverUseCase(dpmApproverRepository);
    this.deleteUsecase = new DeleteDepartmentApproverUseCase(dpmApproverRepository);
  }
  async created(input: CreateDepartmentApproverDTO): Promise<DepartmentApproverEntity> {
    return await this.createUsecase.execute(input);
  }

  async getOne(id: string): Promise<DepartmentApproverEntity | null> {
    return await this.getOneUsecase.execute(id);
  }

  async getAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<DepartmentApproverEntity>> {
    return await this.getAllUsecase.execute(params, includeDeleted);
  }

  async updated(id: string, input: UpdateDepartmentApproverDTO): Promise<DepartmentApproverEntity> {
    return await this.updateUsecase.execute(id, input);
  }

  async deleted(id: string): Promise<boolean> {
    return await this.deleteUsecase.execute(id);
  }
}
