import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { ReceiptEntity } from "../entities/receipts/receipt.entity";
import type { CreateReceiptDTO, UpdateReceiptDTO } from "@/modules/application/dtos/receipt.dto";

export interface ReceiptRepository {
  findAll(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<ReceiptEntity>>;
  findById(id: string): Promise<ReceiptEntity | null>;
  create(data: CreateReceiptDTO): Promise<ReceiptEntity>;
  update(id: string, data: UpdateReceiptDTO[]): Promise<ReceiptEntity>;
  delete(id: string): Promise<boolean>;
}
