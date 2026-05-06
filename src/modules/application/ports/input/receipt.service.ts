import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { CreateReceiptDTO, IApprovalReceiptDto, IReportReceiptCount, ReciptQueryDto, UpdateReceiptDTO } from "../../dtos/receipt.dto";
import type { ReceiptEntity } from "@/modules/domain/entities/receipts/receipt.entity";

export interface ReceiptService {
  create(input: CreateReceiptDTO): Promise<ReceiptEntity>;
  approval(id: number, input: IApprovalReceiptDto): Promise<IApprovalReceiptDto>;
  approvalhal(input: IApprovalReceiptDto): Promise<IApprovalReceiptDto>;
  getOne(id: string): Promise<ReciptQueryDto | null>;
  getAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<ReciptQueryDto>>;
  update(id: string, input: UpdateReceiptDTO[]): Promise<ReceiptEntity>;
  reportMenu(type: string): Promise<IReportReceiptCount>;
  exportExcel(id: string): Promise<Blob>;
  exportExcelAll(startDate?: string, endDate?: string): Promise<Blob>;
  print(id: string, type: "about_receipt" | "all_document"): Promise<unknown>;
  delete(id: string): Promise<boolean>;
}
