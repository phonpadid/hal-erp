import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { ReceiptService } from "../ports/input/receipt.service";
import type { ReceiptRepository } from "@/modules/domain/repository/receipt.repository";
import { CreateReceiptUseCase } from "../useCases/receipts/create.use-case";
import { UpdateReceiptUseCase } from "../useCases/receipts/update.use-case";
import { DeleteReceiptUseCase } from "../useCases/receipts/delete.use-case";
import { GetOneReceiptUseCase } from "../useCases/receipts/get-one.usecase";
import { GetAllReceiptUseCase } from "../useCases/receipts/get-all.use-case";
import type { CreateReceiptDTO, IApprovalReceiptDto, ReciptQueryDto, UpdateReceiptDTO } from "../dtos/receipt.dto";
import type { ReceiptEntity } from "@/modules/domain/entities/receipts/receipt.entity";
import { ApprovalReceiptUseCase } from "../useCases/receipts/approval.use-case";

export class ReceiptServiceImpl implements ReceiptService {
  private readonly createUseCase: CreateReceiptUseCase;
  private readonly approvalUseCase: ApprovalReceiptUseCase;
  private readonly updateUseCase: UpdateReceiptUseCase
  private readonly deleteUseCase: DeleteReceiptUseCase;
  private readonly getOneUseCase: GetOneReceiptUseCase;
  private readonly getAllUseCase: GetAllReceiptUseCase;

  constructor(private readonly repo: ReceiptRepository) {
    this.createUseCase = new CreateReceiptUseCase(repo);
    this.approvalUseCase = new ApprovalReceiptUseCase(repo);
    this.updateUseCase = new UpdateReceiptUseCase(repo);
    this.deleteUseCase = new DeleteReceiptUseCase(repo);
    this.getOneUseCase = new GetOneReceiptUseCase(repo);
    this.getAllUseCase = new GetAllReceiptUseCase(repo);
  }
  async create(input: CreateReceiptDTO):Promise<ReceiptEntity> {
    return await this.createUseCase.execute(input);
  }
  async approval(id: number, input: IApprovalReceiptDto):Promise<IApprovalReceiptDto> {
    return await this.approvalUseCase.execute(id, input);
  }

  async getOne(id: string): Promise<ReciptQueryDto | null> {
    return await this.getOneUseCase.execute(id);
  }

  async getAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<ReciptQueryDto>> {
    return await this.getAllUseCase.execute(params, includeDeleted);
  }

  async update(id: string, input: UpdateReceiptDTO[]): Promise<ReceiptEntity> {
    return await this.updateUseCase.execute(id, input);
  }

  async delete(id: string): Promise<boolean> {
    return await this.deleteUseCase.execute(id);
  }

}
