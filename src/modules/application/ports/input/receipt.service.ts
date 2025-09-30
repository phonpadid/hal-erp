import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { CreateReceiptDTO, IApprovalReceiptDto, IReportReceiptCount, ReciptQueryDto, UpdateReceiptDTO } from "../../dtos/receipt.dto";
import type { ReceiptEntity } from "@/modules/domain/entities/receipts/receipt.entity";

export interface ReceiptService {
  create(input: CreateReceiptDTO): Promise<ReceiptEntity>;
  approval(id: number, input: IApprovalReceiptDto): Promise<IApprovalReceiptDto>;
  getOne(id: string): Promise<ReciptQueryDto | null>;
  getAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<ReciptQueryDto>>;
  update(id: string, input: UpdateReceiptDTO[]): Promise<ReceiptEntity>;
  reportMenu(type: string): Promise<IReportReceiptCount>;
  delete(id: string): Promise<boolean>;
}
