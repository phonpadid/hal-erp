import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { ReceiptEntity } from "../entities/receipts/receipt.entity";
import type { CreateReceiptDTO, IApprovalReceiptDto, IReportReceiptCount, ReciptQueryDto, UpdateReceiptDTO } from "@/modules/application/dtos/receipt.dto";

export interface ReceiptRepository {
  findAll(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<ReciptQueryDto>>;
  findById(id: string): Promise<ReciptQueryDto | null>;
  create(data: CreateReceiptDTO): Promise<ReceiptEntity>;
  approval(id: number, data: IApprovalReceiptDto): Promise<IApprovalReceiptDto>;
  update(id: string, data: UpdateReceiptDTO[]): Promise<ReceiptEntity>;
  reportMenu(type: string): Promise<IReportReceiptCount>;
  exportExcel(id: string): Promise<Blob>;
  delete(id: string): Promise<boolean>;
}
