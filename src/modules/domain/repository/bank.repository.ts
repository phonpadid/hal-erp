import type { BankEntity } from "../entities/bank.entity";
import type { BankCreate, BankUpdate } from "@/modules/interfaces/bank.interface";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface BankRepository {
  findAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<BankEntity>>;
  findById(id: string): Promise<BankEntity | null>;
  findByName(name: string): Promise<BankEntity | null>;
  findByShortName(short_name: string): Promise<BankEntity | null>;
  create(data: BankCreate): Promise<BankEntity>;
  update(id: string, data: BankUpdate): Promise<BankEntity>;
  delete(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
}
