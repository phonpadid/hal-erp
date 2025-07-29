import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { CreateExchangeRateDTO, UpdateExchangeRateDTO } from "../../dtos/exchange-rate.dto";
import type { ExchangeRateEntity } from "@/modules/domain/entities/exchange-rate.entities";

export interface ExchangeRateService {
  create(input: CreateExchangeRateDTO[]): Promise<ExchangeRateEntity[] | ExchangeRateEntity>;
  getOne(id: string): Promise<ExchangeRateEntity | null>;
  getAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<ExchangeRateEntity>>;
  update(id: string, input: UpdateExchangeRateDTO): Promise<ExchangeRateEntity>;
  delete(id: string): Promise<boolean>;
}
