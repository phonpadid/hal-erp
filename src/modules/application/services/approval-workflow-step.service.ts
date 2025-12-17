
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { CreateApprovalWorkflowStepUseCase } from "../useCases/approval-flows-step/create.use-case";
import type { ApprovalWorkflowStepRepository } from "@/modules/domain/repository/approval-workflow-step.repository";
import { UpdateApprovalWorkflowStepUseCase } from "../useCases/approval-flows-step/update-department.use-case";
import { DeleteApprovalWorkflowStepUseCase } from "../useCases/approval-flows-step/delete.usecase";
import { GetOneApprovalWorkflowStepUseCase } from "../useCases/approval-flows-step/get-one.usecase";
import { GetAllApprovalWorkflowStepUseCase } from "../useCases/approval-flows-step/get-all.use-case";
import type { CreateApprovalWorkflowStepDTO, UpdateApprovalWorkflowStepDTO } from "../dtos/approval-workflow-step.dto";
import type { ApprovalWorkflowStepEntity } from "@/modules/domain/entities/approval-workflows-step.entity";
import type { ApprovalWorkflowStepService } from "../ports/input/approval-workflow-step.service";

export class ApprovalWorkflowStepServiceImpl implements ApprovalWorkflowStepService {
  private readonly createApprovalWorkflowStepUseCase: CreateApprovalWorkflowStepUseCase;
  private readonly updateApprovalWorkflowStepUseCase: UpdateApprovalWorkflowStepUseCase;
  private readonly deleteApprovalWorkflowStepUseCase: DeleteApprovalWorkflowStepUseCase;
  private readonly getOneApprovalWorkflowStepUseCase: GetOneApprovalWorkflowStepUseCase;
  private readonly getAllApprovalWorkflowStepUseCase: GetAllApprovalWorkflowStepUseCase;

  constructor(private readonly approvalFlowStepRepo: ApprovalWorkflowStepRepository) {
    this.createApprovalWorkflowStepUseCase = new CreateApprovalWorkflowStepUseCase(approvalFlowStepRepo);
    this.updateApprovalWorkflowStepUseCase = new UpdateApprovalWorkflowStepUseCase(approvalFlowStepRepo);
    this.deleteApprovalWorkflowStepUseCase = new DeleteApprovalWorkflowStepUseCase(approvalFlowStepRepo);
    this.getOneApprovalWorkflowStepUseCase = new GetOneApprovalWorkflowStepUseCase(approvalFlowStepRepo);
    this.getAllApprovalWorkflowStepUseCase = new GetAllApprovalWorkflowStepUseCase(approvalFlowStepRepo);
  }
  async create(id: number, input: CreateApprovalWorkflowStepDTO): Promise<ApprovalWorkflowStepEntity> {
    return await this.createApprovalWorkflowStepUseCase.execute(id, input);
  }

  async getOne(id: string): Promise<ApprovalWorkflowStepEntity | null> {
    return await this.getOneApprovalWorkflowStepUseCase.execute(id);
  }

  async getAll(
    id: string,
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<ApprovalWorkflowStepEntity>> {
    return await this.getAllApprovalWorkflowStepUseCase.execute(id,params, includeDeleted);
  }

  async update(id: string, input: UpdateApprovalWorkflowStepDTO): Promise<ApprovalWorkflowStepEntity> {
    return await this.updateApprovalWorkflowStepUseCase.execute(id, input);
  }

  async delete(id: string): Promise<boolean> {
    return await this.deleteApprovalWorkflowStepUseCase.execute(id);
  }

  async reorder(workflowId: string, ids: number[]): Promise<boolean> {
    return await this.approvalFlowStepRepo.reorder(workflowId, ids);
  }

}
