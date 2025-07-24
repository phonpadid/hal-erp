import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";
import type { Bank } from "../entities/bank.entity";

export interface BankRepository {
  create(bank: Bank): Promise<Bank>
  findById(id: string): Promise<Bank | null>
  findByName(name: string): Promise<Bank | null>
  findAll(params: PaginationParams, includeDelete?: boolean): Promise<PaginatedResult<Bank>>
  update(bank: Bank): Promise<Bank>
  delete(id: string): Promise<boolean>
  restore(id: string): Promise<boolean>
}
