
import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";
import type { ExchangeRateEntity } from "../entities/exchange-rate.entities";

export interface ExchangeRateRepository {
  create(input: ExchangeRateEntity[]): Promise<ExchangeRateEntity[] | ExchangeRateEntity>;
  findById(id: string): Promise<ExchangeRateEntity | null>;
  findAll(query: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<ExchangeRateEntity>>;
  update(id: string, input: ExchangeRateEntity): Promise<ExchangeRateEntity>;
  delete(id: string): Promise<boolean>;
}
