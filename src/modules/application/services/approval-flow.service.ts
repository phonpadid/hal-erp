
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { ApprovalWorkflowService } from "../ports/input/approval-workflow.service";
import { CreateApprovalWorkflowUseCase } from "../useCases/approval-flows/create.use-case";
import { DeleteApprovalWorkflowUseCase } from "../useCases/approval-flows/delete.usecase";
import { GetOneApprovalWorkflowUseCase } from "../useCases/approval-flows/get-one.usecase";
import { GetAllApprovalWorkflowUseCase } from "../useCases/approval-flows/get-all.use-case";
import { UpdateApprovalWorkflowUseCase } from "../useCases/approval-flows/update-department.use-case";
import type { ApprovalWorkflowRepository } from "@/modules/domain/repository/approval-workflow.repository";
import type { CreateApprovalWorkflowDTO, UpdateApprovalWorkflowDTO } from "../dtos/approval-workflow.dto";
import type { ApprovalWorkflowEntity } from "@/modules/domain/entities/approval-workflows.entity";

export class ApprovalWorkflowServiceImpl implements ApprovalWorkflowService {
  private readonly createApprovalWorkflowUseCase: CreateApprovalWorkflowUseCase;
  private readonly updateApprovalWorkflowUseCase: UpdateApprovalWorkflowUseCase;
  private readonly deleteApprovalWorkflowUseCase: DeleteApprovalWorkflowUseCase;
  private readonly getOneApprovalWorkflowUseCase: GetOneApprovalWorkflowUseCase;
  private readonly getAllApprovalWorkflowUseCase: GetAllApprovalWorkflowUseCase;

  constructor(private readonly approvalFlowRepo: ApprovalWorkflowRepository) {
    this.createApprovalWorkflowUseCase = new CreateApprovalWorkflowUseCase(approvalFlowRepo);
    this.updateApprovalWorkflowUseCase = new UpdateApprovalWorkflowUseCase(approvalFlowRepo);
    this.deleteApprovalWorkflowUseCase = new DeleteApprovalWorkflowUseCase(approvalFlowRepo);
    this.getOneApprovalWorkflowUseCase = new GetOneApprovalWorkflowUseCase(approvalFlowRepo);
    this.getAllApprovalWorkflowUseCase = new GetAllApprovalWorkflowUseCase(approvalFlowRepo);
  }
  async create(input: CreateApprovalWorkflowDTO): Promise<ApprovalWorkflowEntity> {
    return await this.createApprovalWorkflowUseCase.execute(input);
  }

  async getOne(id: string): Promise<ApprovalWorkflowEntity | null> {
    return await this.getOneApprovalWorkflowUseCase.execute(id);
  }

  async getAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<ApprovalWorkflowEntity>> {
    return await this.getAllApprovalWorkflowUseCase.execute(params, includeDeleted);
  }

  async update(id: string, input: UpdateApprovalWorkflowDTO): Promise<ApprovalWorkflowEntity> {
    return await this.updateApprovalWorkflowUseCase.execute(id, input);
  }

  async delete(id: string): Promise<boolean> {
    return await this.deleteApprovalWorkflowUseCase.execute(id);
  }

}
