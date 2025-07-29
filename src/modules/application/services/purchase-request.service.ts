import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { PurchaseRequestService } from "../ports/input/purchase-request.service";
import { CreatePurchaseRequestUseCase } from "../useCases/purchase-requests/create.use-case";
import { UpdatePurchaseRequestUseCase } from "../useCases/purchase-requests/update-department.use-case";
import { DeletePurchaseRequestUseCase } from "../useCases/purchase-requests/delete.usecase";
import { GetOnePurchaseRequestUseCase } from "../useCases/purchase-requests/get-one.usecase";
import { GetAllPurchaseRequestUseCase } from "../useCases/purchase-requests/get-all.use-case";
import type { PurchaseRequestRepository } from "@/modules/domain/repository/purchase-requests/purchase-request.repository";
import type {
  CreatePurchaseRequestDTO,
  UpdatePurchaseRequestDTO,
} from "../dtos/purchase-requests/purchase-request.dto";

import type { PurchaseRequestEntity } from "@/modules/domain/entities/purchase-requests/purchase-request.entity";

export class PurchaseRequestServiceImpl implements PurchaseRequestService {
  private readonly createUseCase: CreatePurchaseRequestUseCase;
  private readonly updateUseCase: UpdatePurchaseRequestUseCase;
  private readonly deleteUseCase: DeletePurchaseRequestUseCase;
  private readonly getOneUseCase: GetOnePurchaseRequestUseCase;
  private readonly getAllUseCase: GetAllPurchaseRequestUseCase;

  constructor(private readonly approvalFlowRepo: PurchaseRequestRepository) {
    this.createUseCase = new CreatePurchaseRequestUseCase(approvalFlowRepo);
    this.updateUseCase = new UpdatePurchaseRequestUseCase(approvalFlowRepo);
    this.deleteUseCase = new DeletePurchaseRequestUseCase(approvalFlowRepo);
    this.getOneUseCase = new GetOnePurchaseRequestUseCase(approvalFlowRepo);
    this.getAllUseCase = new GetAllPurchaseRequestUseCase(approvalFlowRepo);
  }
  async create(input: CreatePurchaseRequestDTO): Promise<PurchaseRequestEntity> {
    return await this.createUseCase.execute(input);
  }

  async getById(id: string): Promise<PurchaseRequestEntity | null> {
    return await this.getOneUseCase.execute(id);
  }

  async getAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<PurchaseRequestEntity>> {
    return await this.getAllUseCase.execute(params, includeDeleted);
  }

  async update(id: string, input: UpdatePurchaseRequestDTO): Promise<PurchaseRequestEntity> {
    return await this.updateUseCase.execute(id, input);
  }

  async delete(id: string): Promise<boolean> {
    return await this.deleteUseCase.execute(id);
  }
}
