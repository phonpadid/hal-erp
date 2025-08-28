import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { CreateReceiptDTO, UpdateReceiptDTO } from "../../dtos/receipt.dto";
import type { ReceiptEntity } from "@/modules/domain/entities/receipts/receipt.entity";

export interface ReceiptService {
  create(input: CreateReceiptDTO): Promise<ReceiptEntity>;
  getOne(id: string): Promise<ReceiptEntity | null>;
  getAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<ReceiptEntity>>;
  update(id: string, input: UpdateReceiptDTO[]): Promise<ReceiptEntity>;
  delete(id: string): Promise<boolean>;
}
