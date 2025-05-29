
import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";
import type { CurrencyEntity } from "../entities/currency.entity";

export interface CurrencyRepository {
  create(input: CurrencyEntity[]): Promise<CurrencyEntity[] | CurrencyEntity>;
  findById(id: string): Promise<CurrencyEntity | null>;
  findAll(query: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<CurrencyEntity>>;
  update(id: string, input: CurrencyEntity): Promise<CurrencyEntity>;
  delete(id: string): Promise<boolean>;
}
